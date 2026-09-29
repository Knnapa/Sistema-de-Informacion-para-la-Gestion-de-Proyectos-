-- Esquema de referencia para el diccionario de datos (Fase 2 - Diseno).
-- Sequelize crea/ajusta estas tablas automaticamente (sequelize.sync), pero
-- este archivo sirve como documentacion explicita del modulo de Administracion
-- y como punto de partida para el diagrama Entidad-Relacion completo.

CREATE DATABASE IF NOT EXISTS miudes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE miudes;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  correo        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('administrador', 'lider', 'colider', 'estudiante') NOT NULL DEFAULT 'estudiante',
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL,
  updated_at    DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS logs_acciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  accion      VARCHAR(100) NOT NULL,
  detalle     TEXT,
  created_at  DATETIME NOT NULL,
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- A partir de aqui se agregan, en la Fase 2, las tablas de los siguientes modulos:
-- proyectos, participantes, formularios_dinamicos, reportes, indicadores, materiales_induccion, etc.
