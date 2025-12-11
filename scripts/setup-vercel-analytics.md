# 📊 Configurar Vercel Analytics

## Pasos para habilitar Analytics

### 1. Desde el Dashboard de Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto: `techno-experience`
3. Ve a **Settings** → **Analytics**
4. Click en **Enable Analytics**
5. Selecciona el plan (Hobby es gratis hasta cierto límite)

### 2. Verificar que funciona

1. Espera unos minutos después de habilitarlo
2. Ve a la pestaña **Analytics** en tu proyecto
3. Deberías ver:
   - Web Vitals (FCP, LCP, CLS, TTI)
   - Páginas vistas
   - Usuarios únicos
   - Tiempo de carga

## Qué monitorear

### Web Vitals
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.8s

### Métricas Adicionales
- Tiempo de carga promedio
- Páginas más visitadas
- Dispositivos y navegadores
- Países de origen

## Alertas

Puedes configurar alertas para:
- Cuando LCP > 4s
- Cuando CLS > 0.25
- Cuando hay errores críticos

## Costos

- **Hobby Plan**: Gratis hasta 100k eventos/mes
- **Pro Plan**: Incluido en el plan
- **Enterprise**: Contacta a Vercel

## Documentación

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Web Vitals Guide](https://web.dev/vitals/)

