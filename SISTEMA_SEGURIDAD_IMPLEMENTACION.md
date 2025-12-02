# 🛡️ SISTEMA DE SEGURIDAD - PLAN DE IMPLEMENTACIÓN
## Sistema Infranqueable, Innovador y Sencillo de Manejar

**Versión:** 1.0  
**Fecha:** Enero 2025

---

## 📋 TABLA DE CONTENIDOS

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Componentes de Seguridad](#componentes-de-seguridad)
3. [Implementación Técnica](#implementación-técnica)
4. [Configuración y Uso](#configuración-y-uso)
5. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Principios de Diseño

1. **Defensa en Profundidad:** Múltiples capas de seguridad
2. **Principio de Menor Privilegio:** Usuarios solo tienen permisos necesarios
3. **Seguridad por Defecto:** Configuración segura desde el inicio
4. **Transparencia:** Logs y auditoría completos
5. **Simplicidad:** Fácil de usar y mantener

### Capas de Seguridad

```
┌─────────────────────────────────────────┐
│   CAPA 1: Frontend (Cliente)            │
│   - Validación de inputs                 │
│   - Sanitización XSS                    │
│   - Rate limiting visual                 │
│   - Protección CSRF                     │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   CAPA 2: Autenticación                 │
│   - 2FA/MFA                             │
│   - JWT tokens                           │
│   - Session management                  │
│   - Device fingerprinting               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   CAPA 3: Autorización                  │
│   - Row Level Security (RLS)            │
│   - Role-Based Access Control (RBAC)     │
│   - Permisos granulares                 │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   CAPA 4: API Protection                │
│   - Rate limiting                       │
│   - Request validation                  │
│   - API key rotation                     │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   CAPA 5: Database                      │
│   - Encriptación en reposo              │
│   - Backups automáticos                 │
│   - Audit logs                          │
└─────────────────────────────────────────┘
```

---

## 🔧 COMPONENTES DE SEGURIDAD

### 1. Autenticación Multi-Factor (MFA)

#### 1.1 TOTP (Time-based One-Time Password)

**Tecnología:** `@otplib/preset-v11`

**Características:**
- Códigos de 6 dígitos
- Válidos por 30 segundos
- Compatible con Google Authenticator, Authy, etc.
- Backup codes para recuperación

**Flujo de Implementación:**

```typescript
// 1. Habilitar 2FA
async function enable2FA(userId: string) {
  // Generar secreto
  const secret = authenticator.generateSecret()
  
  // Guardar secreto encriptado en DB
  await supabase
    .from('user_secrets')
    .insert({
      user_id: userId,
      totp_secret: encrypt(secret),
      backup_codes: generateBackupCodes(),
      enabled: false // Hasta que se verifique
    })
  
  // Generar QR code
  const otpauth = authenticator.keyuri(
    userId,
    'Techno Experience',
    secret
  )
  
  return { secret, qrCode: generateQR(otpauth) }
}

// 2. Verificar código y activar
async function verifyAndEnable2FA(userId: string, code: string) {
  const { data: secret } = await supabase
    .from('user_secrets')
    .select('totp_secret')
    .eq('user_id', userId)
    .single()
  
  const isValid = authenticator.verify({
    token: code,
    secret: decrypt(secret.totp_secret)
  })
  
  if (isValid) {
    await supabase
      .from('user_secrets')
      .update({ enabled: true })
      .eq('user_id', userId)
  }
  
  return isValid
}

// 3. Verificar en login
async function verify2FA(userId: string, code: string) {
  const { data: secret } = await supabase
    .from('user_secrets')
    .select('totp_secret, backup_codes')
    .eq('user_id', userId)
    .eq('enabled', true)
    .single()
  
  // Verificar TOTP
  const isValidTOTP = authenticator.verify({
    token: code,
    secret: decrypt(secret.totp_secret)
  })
  
  // Verificar backup code
  const isValidBackup = secret.backup_codes.includes(code)
  
  if (isValidBackup) {
    // Remover backup code usado
    await supabase
      .from('user_secrets')
      .update({
        backup_codes: secret.backup_codes.filter(c => c !== code)
      })
      .eq('user_id', userId)
  }
  
  return isValidTOTP || isValidBackup
}
```

#### 1.2 Backup Codes

**Generación:**
- 10 códigos únicos de 8 caracteres
- Almacenados encriptados en DB
- Se eliminan al usarse
- Regenerables por el usuario

#### 1.3 SMS/Email como Alternativa (Opcional)

**Implementación:**
- Código de 6 dígitos enviado por SMS/Email
- Válido por 10 minutos
- Rate limited a 3 intentos por hora

---

### 2. Rate Limiting Inteligente

#### 2.1 Rate Limiting por IP

**Implementación en Supabase Edge Function:**

```typescript
// supabase/functions/rate-limit/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  key: string // IP o user_id
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(config: RateLimitConfig): boolean {
  const now = Date.now()
  const key = config.key
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetAt) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    })
    return true
  }
  
  if (record.count >= config.maxRequests) {
    return false // Rate limit exceeded
  }
  
  record.count++
  return true
}

serve(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const path = new URL(req.url).pathname
  
  // Configuración por endpoint
  const configs: Record<string, RateLimitConfig> = {
    "/auth/login": { maxRequests: 5, windowMs: 15 * 60 * 1000, key: ip },
    "/auth/signup": { maxRequests: 3, windowMs: 60 * 60 * 1000, key: ip },
    "/auth/password-reset": { maxRequests: 3, windowMs: 60 * 60 * 1000, key: ip },
  }
  
  const config = configs[path]
  if (!config) {
    return new Response(JSON.stringify({ allowed: true }), {
      headers: { "Content-Type": "application/json" },
    })
  }
  
  const allowed = checkRateLimit(config)
  
  return new Response(
    JSON.stringify({
      allowed,
      remaining: allowed ? config.maxRequests - (rateLimitStore.get(config.key)?.count || 0) : 0,
      resetAt: rateLimitStore.get(config.key)?.resetAt || Date.now() + config.windowMs
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  )
})
```

#### 2.2 Rate Limiting por Usuario

**Implementación en Database:**

```sql
-- Tabla para rate limiting por usuario
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 minute',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Función para verificar rate limit
CREATE OR REPLACE FUNCTION check_user_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener inicio de ventana actual
  v_window_start := date_trunc('minute', NOW());
  
  -- Obtener conteo actual
  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start >= v_window_start - (p_window_minutes || ' minutes')::INTERVAL
    AND window_start <= v_window_start;
  
  -- Si excede el límite, retornar false
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Incrementar contador
  INSERT INTO rate_limits (user_id, endpoint, window_start, window_end)
  VALUES (p_user_id, p_endpoint, v_window_start, v_window_start + (p_window_minutes || ' minutes')::INTERVAL)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2.3 Progressive Delays

**Implementación:**

```typescript
// Si se excede el rate limit, aumentar el delay progresivamente
function getProgressiveDelay(attempts: number): number {
  // 1 intento: 1 segundo
  // 2 intentos: 2 segundos
  // 3 intentos: 5 segundos
  // 4+ intentos: 15 segundos
  if (attempts === 1) return 1000
  if (attempts === 2) return 2000
  if (attempts === 3) return 5000
  return 15000
}
```

---

### 3. Detección de Amenazas

#### 3.1 Sistema de Scoring de Riesgo

**Implementación:**

```typescript
interface SecurityEvent {
  type: 'failed_login' | 'unusual_location' | 'password_change' | 'permission_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string
  ipAddress: string
  userAgent: string
  metadata: Record<string, any>
  timestamp: Date
}

class ThreatDetection {
  private riskScores = new Map<string, number>()
  
  async recordEvent(event: SecurityEvent) {
    // Calcular score de riesgo
    const score = this.calculateRiskScore(event)
    
    // Actualizar score del usuario
    const currentScore = this.riskScores.get(event.userId) || 0
    this.riskScores.set(event.userId, currentScore + score)
    
    // Guardar evento en DB
    await supabase.from('security_events').insert({
      user_id: event.userId,
      event_type: event.type,
      severity: event.severity,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      metadata: event.metadata,
      risk_score: score
    })
    
    // Si el score es alto, tomar acción
    if (currentScore + score > 100) {
      await this.takeAction(event.userId, 'high_risk')
    }
  }
  
  private calculateRiskScore(event: SecurityEvent): number {
    const baseScores = {
      failed_login: 10,
      unusual_location: 25,
      password_change: 5,
      permission_change: 30
    }
    
    let score = baseScores[event.type] || 0
    
    // Multiplicadores por severidad
    const multipliers = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3
    }
    
    score *= multipliers[event.severity]
    
    return score
  }
  
  private async takeAction(userId: string, reason: string) {
    // Bloquear cuenta temporalmente
    await supabase
      .from('profiles')
      .update({ is_active: false, blocked_until: new Date(Date.now() + 3600000) })
      .eq('id', userId)
    
    // Notificar al admin
    await this.notifyAdmin(userId, reason)
    
    // Registrar en audit log
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'account_blocked',
      resource_type: 'user',
      resource_id: userId,
      metadata: { reason }
    })
  }
}
```

#### 3.2 Detección de Ubicaciones Inusuales

**Implementación:**

```typescript
async function detectUnusualLocation(userId: string, ipAddress: string) {
  // Obtener ubicación de IP
  const location = await getLocationFromIP(ipAddress)
  
  // Obtener ubicaciones previas del usuario
  const { data: previousLocations } = await supabase
    .from('user_locations')
    .select('country, city')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Verificar si es una ubicación nueva
  const isNewLocation = !previousLocations?.some(
    loc => loc.country === location.country && loc.city === location.city
  )
  
  if (isNewLocation) {
    // Registrar evento de seguridad
    await threatDetection.recordEvent({
      type: 'unusual_location',
      severity: 'medium',
      userId,
      ipAddress,
      userAgent: navigator.userAgent,
      metadata: { location },
      timestamp: new Date()
    })
    
    // Si es muy inusual (país diferente), requerir verificación adicional
    if (previousLocations?.length > 0) {
      const previousCountry = previousLocations[0].country
      if (location.country !== previousCountry) {
        // Requerir 2FA adicional o email de verificación
        return { requiresVerification: true, reason: 'new_country' }
      }
    }
  }
  
  // Guardar nueva ubicación
  await supabase.from('user_locations').insert({
    user_id: userId,
    ip_address: ipAddress,
    country: location.country,
    city: location.city
  })
  
  return { requiresVerification: false }
}
```

---

### 4. Sistema de Auditoría

#### 4.1 Tabla de Audit Logs

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'login', 'create_news', 'delete_user', etc.
  resource_type TEXT, -- 'news', 'user', 'order', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS: Solo admins pueden ver logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

#### 4.2 Función Helper para Logging

```typescript
// src/lib/audit-logger.ts
export async function logAuditEvent(params: {
  userId?: string
  action: string
  resourceType?: string
  resourceId?: string
  severity?: 'info' | 'warning' | 'error' | 'critical'
  metadata?: Record<string, any>
}) {
  const ipAddress = await getClientIP()
  const userAgent = navigator.userAgent
  
  await supabase.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    ip_address: ipAddress,
    user_agent: userAgent,
    severity: params.severity || 'info',
    metadata: params.metadata || {}
  })
}

// Uso en componentes
await logAuditEvent({
  userId: user.id,
  action: 'create_news',
  resourceType: 'news',
  resourceId: newsId,
  severity: 'info',
  metadata: { title: newsTitle }
})
```

---

### 5. Headers de Seguridad

#### 5.1 Configuración en Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co",
        "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
      ].join('; ')
    }
  }
})
```

#### 5.2 Configuración en Producción (Vercel/Netlify)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co; frame-src 'self' https://www.youtube.com https://player.vimeo.com"
        }
      ]
    }
  ]
}
```

---

### 6. Sanitización de Inputs

#### 6.1 DOMPurify para XSS

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}
```

#### 6.2 Validación con Zod

```typescript
// Ya implementado, pero mejorar
import { z } from 'zod'

export const newsArticleSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeText), // Sanitizar después de validar
  content: z.string()
    .min(20, 'Content must be at least 20 characters')
    .transform(sanitizeHTML), // Sanitizar HTML
  // ... más campos
})
```

---

### 7. Protección CSRF

#### 7.1 Generación de Tokens

```typescript
// src/lib/csrf.ts
import { randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken
}
```

#### 7.2 Uso en Formularios

```typescript
// En componente
const [csrfToken, setCsrfToken] = useState<string>('')

useEffect(() => {
  // Generar token al cargar
  const token = generateCSRFToken()
  setCsrfToken(token)
  // Guardar en sessionStorage
  sessionStorage.setItem('csrf_token', token)
}, [])

// En submit
const handleSubmit = async (data: FormData) => {
  const storedToken = sessionStorage.getItem('csrf_token')
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': storedToken || ''
    },
    body: JSON.stringify({ ...data, csrf_token: storedToken })
  })
  
  // ...
}
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### Fase 1: Fundamentos (Semana 1)

1. **Instalar Dependencias**
```bash
pnpm add @otplib/preset-v11 qrcode dompurify
pnpm add -D @types/dompurify @types/qrcode
```

2. **Crear Tablas de Seguridad**
```sql
-- Ejecutar migración: 00029_security_system.sql
```

3. **Implementar Rate Limiting Básico**
- Crear Edge Function para rate limiting
- Integrar en frontend

4. **Configurar Headers de Seguridad**
- Actualizar vite.config.ts
- Actualizar vercel.json

### Fase 2: Autenticación Avanzada (Semana 2)

1. **Implementar 2FA/MFA**
- Crear componentes de UI
- Implementar lógica de TOTP
- Generar QR codes

2. **Sistema de Backup Codes**
- Generación y almacenamiento
- UI para mostrar códigos

### Fase 3: Detección y Auditoría (Semana 3)

1. **Sistema de Detección de Amenazas**
- Implementar scoring de riesgo
- Detección de ubicaciones inusuales

2. **Sistema de Auditoría**
- Crear tabla de audit logs
- Implementar logger
- Dashboard de auditoría

### Fase 4: Optimización (Semana 4)

1. **Testing**
- Tests de seguridad
- Penetration testing básico

2. **Documentación**
- Guía de uso
- Documentación técnica

---

## 📊 MONITOREO Y MANTENIMIENTO

### Dashboard de Seguridad

**Componentes:**
- Métricas de seguridad en tiempo real
- Gráficos de eventos de seguridad
- Lista de amenazas detectadas
- Estadísticas de autenticación

### Alertas Automáticas

**Tipos de Alertas:**
- Intentos de acceso sospechosos
- Cambios de permisos
- Errores de seguridad críticos
- Picos de tráfico anormales

**Canales:**
- Email al admin
- Notificaciones en dashboard
- Webhooks (opcional)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Semana 1
- [ ] Instalar dependencias
- [ ] Crear tablas de seguridad
- [ ] Implementar rate limiting
- [ ] Configurar headers de seguridad
- [ ] Sanitización de inputs

### Semana 2
- [ ] Implementar 2FA/MFA
- [ ] Sistema de backup codes
- [ ] UI para gestión de 2FA
- [ ] Testing de autenticación

### Semana 3
- [ ] Sistema de detección de amenazas
- [ ] Sistema de auditoría
- [ ] Dashboard de seguridad
- [ ] Alertas automáticas

### Semana 4
- [ ] Testing completo
- [ ] Documentación
- [ ] Optimización
- [ ] Deploy a producción

---

**Última actualización:** Enero 2025  
**Versión:** 1.0

