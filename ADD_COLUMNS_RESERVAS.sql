ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS nota_completada BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_reservas_nota_completada ON reservas(nota_completada);