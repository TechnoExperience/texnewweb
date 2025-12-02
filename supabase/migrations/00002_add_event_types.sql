-- Agregar campo de evento_type a la tabla events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('dj', 'promoter_festival', 'record_label', 'club'));

-- Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events(event_type);
