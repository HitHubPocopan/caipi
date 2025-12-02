-- ========================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ========================================
-- Este script crea la tabla de clientes
-- Copia y pega TODO el contenido en:
-- https://app.supabase.com → SQL Editor
-- ========================================

-- 1. CREAR TABLA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- 2. CREAR ÍNDICES PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON clientes(created_at DESC);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS DE LECTURA (PÚBLICA)
CREATE POLICY "Lectura pública de clientes" ON clientes
FOR SELECT
USING (true);

-- 5. CREAR POLÍTICAS DE INSERCIÓN (PÚBLICA)
CREATE POLICY "Escritura pública de clientes - INSERT" ON clientes
FOR INSERT
WITH CHECK (true);

-- 6. CREAR POLÍTICAS DE ACTUALIZACIÓN (PÚBLICA)
CREATE POLICY "Actualización pública de clientes" ON clientes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 7. CREAR POLÍTICAS DE ELIMINACIÓN (PÚBLICA)
CREATE POLICY "Eliminación pública de clientes" ON clientes
FOR DELETE
USING (true);

-- ========================================
-- VERIFICAR QUE TODO FUNCIONÓ
-- ========================================
-- Ejecuta esto después para verificar:

SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE tablename = 'clientes';

-- Debería mostrar una fila con 'clientes'

-- ========================================
-- PRUEBA RÁPIDA
-- ========================================
-- Descomenta las siguientes líneas para probar:

-- INSERT INTO clientes (nombre, telefono) 
-- VALUES ('Cliente Prueba', '+54 9 11-2222-2222');

-- SELECT * FROM clientes;

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- 1. El teléfono es ÚNICO (no puede haber duplicados)
-- 2. RLS está habilitado (solo lectura/escritura pública)
-- 3. Se crea automaticamente en created_at
-- 4. Email es opcional

-- ========================================
-- DESPUÉS DE EJECUTAR
-- ========================================
-- 1. Ve a la aplicación
-- 2. Click botón "👥 Clientes"
-- 3. Crea una nueva reserva
-- 4. El cliente debería aparecer en la lista
