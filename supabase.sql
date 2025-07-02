-- Eliminar todas las tablas si existen, en orden de dependencias para evitar errores de claves foráneas
DROP TABLE IF EXISTS historial_parqueo CASCADE;
DROP TABLE IF EXISTS acceso_salida CASCADE;
DROP TABLE IF EXISTS reporte_incidencia CASCADE;
DROP TABLE IF EXISTS vehiculo CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS celda CASCADE;
DROP TABLE IF EXISTS pico_placa CASCADE;
DROP TABLE IF EXISTS incidencia CASCADE;
DROP TABLE IF EXISTS perfil_usuario CASCADE;

CREATE TABLE perfil_usuario (
  id BIGSERIAL PRIMARY KEY,
  perfil VARCHAR(100)
);

CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  tipo_documento VARCHAR(45) NOT NULL,
  numero_documento VARCHAR(45) NOT NULL,
  primer_nombre VARCHAR(255) NOT NULL,
  segundo_nombre VARCHAR(225),
  primer_apellido VARCHAR(255) NOT NULL,
  segundo_apellido VARCHAR(45),
  direccion_correo VARCHAR(255) NOT NULL,
  numero_celular VARCHAR(45) NOT NULL,
  foto_perfil VARCHAR(255),
  estado VARCHAR(45) NOT NULL,
  clave VARCHAR(255),
  perfil_usuario_id BIGINT NOT NULL REFERENCES perfil_usuario(id)
);

CREATE TABLE vehiculo (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(45),
  color VARCHAR(45),
  modelo VARCHAR(45),
  marca VARCHAR(45),
  tipo VARCHAR(45),
  usuario_id_usuario INT NOT NULL REFERENCES usuario(id_usuario)
);

CREATE TABLE pico_placa (
  id BIGSERIAL PRIMARY KEY,
  tipo_vehiculo VARCHAR(100),
  numero VARCHAR(45),
  dia VARCHAR(45)
);

CREATE TABLE acceso_salida (
  id BIGSERIAL PRIMARY KEY,
  movimiento VARCHAR(10) NOT NULL,
  fecha_hora TIMESTAMP NOT NULL,
  puerta VARCHAR(100),
  tiempo_estadia BIGINT,
  vehiculo_id INT NOT NULL REFERENCES vehiculo(id)
);

CREATE TABLE incidencia (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255)
);

CREATE TABLE reporte_incidencia (
  vehiculo_id INT NOT NULL REFERENCES vehiculo(id),
  incidencia_id BIGINT NOT NULL REFERENCES incidencia(id),
  fecha_hora TIMESTAMP,
  PRIMARY KEY (vehiculo_id, incidencia_id)
);

CREATE TABLE celda (
  id BIGSERIAL PRIMARY KEY,
  tipo VARCHAR(10),
  estado VARCHAR(45)
);

CREATE TABLE historial_parqueo (
  celda_id BIGINT NOT NULL REFERENCES celda(id),
  vehiculo_id INT NOT NULL REFERENCES vehiculo(id),
  fecha_hora TIMESTAMP,
  PRIMARY KEY (celda_id, vehiculo_id)
);