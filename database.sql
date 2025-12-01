-- Crear tabla de cabañas
CREATE TABLE cabanas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,
  descripcion TEXT,
  capacidad INTEGER NOT NULL,
  precio_base DECIMAL(10, 2) NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de reservas
CREATE TABLE reservas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cabana_id UUID NOT NULL REFERENCES cabanas(id) ON DELETE CASCADE,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(20) NOT NULL,
  cantidad_personas INTEGER NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado_pago VARCHAR(50) NOT NULL,
  monto_total DECIMAL(10, 2) NOT NULL,
  monto_pagado DECIMAL(10, 2) DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de detalles por día
CREATE TABLE dias_reserva (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  ocupacion_am BOOLEAN DEFAULT false,
  ocupacion_pm BOOLEAN DEFAULT false,
  precio_dia DECIMAL(10, 2) DEFAULT 0,
  notas_dia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_reservas_cabana_id ON reservas(cabana_id);
CREATE INDEX idx_reservas_fecha_inicio ON reservas(fecha_inicio);
CREATE INDEX idx_reservas_fecha_fin ON reservas(fecha_fin);
CREATE INDEX idx_dias_reserva_reserva_id ON dias_reserva(reserva_id);
CREATE INDEX idx_dias_reserva_fecha ON dias_reserva(fecha);

-- Habilitar Row Level Security
ALTER TABLE cabanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dias_reserva ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura pública para cabañas
CREATE POLICY "Lectura pública de cabañas" ON cabanas
  FOR SELECT
  USING (true);

-- Crear política de lectura pública para reservas
CREATE POLICY "Lectura pública de reservas" ON reservas
  FOR SELECT
  USING (true);

-- Crear política de lectura pública para dias_reserva
CREATE POLICY "Lectura pública de dias_reserva" ON dias_reserva
  FOR SELECT
  USING (true);

-- Política de escritura para reservas (reemplazar con tu autenticación)
CREATE POLICY "Escritura de reservas para todos" ON reservas
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización de reservas para todos" ON reservas
  FOR UPDATE
  USING (true);

CREATE POLICY "Eliminación de reservas para todos" ON reservas
  FOR DELETE
  USING (true);

-- Política de escritura para dias_reserva
CREATE POLICY "Escritura de dias_reserva para todos" ON dias_reserva
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización de dias_reserva para todos" ON dias_reserva
  FOR UPDATE
  USING (true);

CREATE POLICY "Eliminación de dias_reserva para todos" ON dias_reserva
  FOR DELETE
  USING (true);

-- Insertar cabañas de ejemplo
INSERT INTO cabanas (numero, descripcion, capacidad, precio_base) VALUES
  (1, 'Cabaña con vista al bosque', 4, 150.00),
  (2, 'Cabaña junto al río', 6, 200.00),
  (3, 'Cabaña aislada con jacuzzi', 2, 250.00),
  (4, 'Cabaña familiar con cocina', 8, 300.00),
  (5, 'Cabaña rústica', 5, 180.00),
  (6, 'Cabaña de lujo con piscina', 10, 400.00);
