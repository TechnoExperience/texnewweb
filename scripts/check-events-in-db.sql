-- Script para verificar eventos en la base de datos
-- Ejecutar en Supabase SQL Editor

-- Ver todos los eventos
SELECT 
  id,
  title,
  slug,
  event_date,
  city,
  venue,
  status,
  featured,
  created_at
FROM events
ORDER BY event_date DESC
LIMIT 50;

-- Contar eventos por status
SELECT 
  status,
  COUNT(*) as count
FROM events
GROUP BY status;

-- Contar eventos futuros
SELECT COUNT(*) as future_events
FROM events
WHERE event_date >= NOW();

-- Ver eventos sin status (pueden ser antiguos)
SELECT 
  id,
  title,
  event_date,
  status
FROM events
WHERE status IS NULL
ORDER BY event_date DESC
LIMIT 20;

