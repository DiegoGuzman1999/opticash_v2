-- Migración para agregar tablas faltantes en OptiCash
-- Fecha: 2024-01-15
-- Descripción: Agregar tabla de ingresos y categorías

-- 1. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla de ingresos
CREATE TABLE IF NOT EXISTS ingreso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    descripcion TEXT NOT NULL,
    categoria_id UUID NOT NULL,
    monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    fecha_ingreso DATE NOT NULL,
    estado estado_ingreso NOT NULL DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    
    -- Claves foráneas
    CONSTRAINT fk_ingreso_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_ingreso_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE RESTRICT
);

-- 3. Crear ENUM para estado de ingreso
DO $$ BEGIN
    CREATE TYPE estado_ingreso AS ENUM ('activo', 'eliminado', 'modificado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Agregar relación de categoría a gasto (si no existe)
ALTER TABLE gasto 
ADD CONSTRAINT fk_gasto_categoria 
FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE RESTRICT;

-- 5. Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_categoria_tipo ON categoria(tipo);
CREATE INDEX IF NOT EXISTS idx_ingreso_usuario_fecha ON ingreso(usuario_id, fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_ingreso_categoria_fecha ON ingreso(categoria_id, fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_gasto_categoria_fecha ON gasto(categoria_id, fecha_registro);

-- 6. Insertar categorías por defecto
INSERT INTO categoria (nombre, tipo, descripcion) VALUES
-- Categorías de gastos
('Alimentación', 'gasto', 'Gastos en comida y bebida'),
('Transporte', 'gasto', 'Gastos de transporte público y privado'),
('Vivienda', 'gasto', 'Gastos de alquiler, servicios, mantenimiento'),
('Salud', 'gasto', 'Gastos médicos y farmacéuticos'),
('Entretenimiento', 'gasto', 'Gastos de ocio y entretenimiento'),
('Educación', 'gasto', 'Gastos educativos y de formación'),
('Ropa', 'gasto', 'Gastos en vestimenta y calzado'),
('Tecnología', 'gasto', 'Gastos en dispositivos y servicios tecnológicos'),
('Otros', 'gasto', 'Gastos diversos no categorizados'),

-- Categorías de ingresos
('Salario', 'ingreso', 'Ingresos por trabajo dependiente'),
('Freelance', 'ingreso', 'Ingresos por trabajo independiente'),
('Inversiones', 'ingreso', 'Ingresos por inversiones y dividendos'),
('Negocio', 'ingreso', 'Ingresos por negocio propio'),
('Bonificaciones', 'ingreso', 'Bonificaciones y comisiones'),
('Alquileres', 'ingreso', 'Ingresos por alquiler de propiedades'),
('Pensiones', 'ingreso', 'Ingresos por pensiones y jubilación'),
('Otros', 'ingreso', 'Ingresos diversos no categorizados')
ON CONFLICT DO NOTHING;
