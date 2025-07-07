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

CREATE TABLE parqueadero (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(20) UNIQUE,
  tipo VARCHAR(50),
  capacidad INT,
  creado_por VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE parqueadero TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE parqueadero_id_seq TO anon, authenticated, service_role;



CREATE TABLE nivel (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE zona (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE celda (
  id BIGSERIAL PRIMARY KEY,
  tipo VARCHAR(10),
  estado VARCHAR(45)
  zona VARCHAR(50),
  ADD COLUMN nivel VARCHAR(50);
);


SELECT * FROM celda WHERE estado = 'disponible' AND tipo = 'Carro';


create or replace function get_celdas_por_estado()
returns table(estado varchar, count bigint) as $$
begin
  return query
    select c.estado, count(c.id)
    from celda c
    group by c.estado;
end;
$$ language plpgsql;


create or replace function get_celdas_por_estado()
returns table(estado varchar, count bigint) as $$
begin
  return query
    select c.estado, count(c.id)
    from celda c
    group by c.estado;
end;
$$ language plpgsql;


create or replace function get_vehiculos_por_tipo()
returns table(tipo varchar, count bigint) as $$
begin
  return query
    select v.tipo, count(v.id)
    from vehiculo v
    group by v.tipo;
end;
$$ language plpgsql;


create or replace function get_vehiculos_activos_count()
returns bigint as $$
begin
  return (select count(*) from historial_parqueo);
end;
$$ language plpgsql;



grant execute on function get_celdas_por_estado() to anon, authenticated, service_role;
grant execute on function get_vehiculos_por_tipo() to anon, authenticated, service_role;
grant execute on function get_vehiculos_activos_count() to anon, authenticated, service_role;



CREATE TABLE historial_parqueo (
  celda_id BIGINT NOT NULL REFERENCES celda(id),
  vehiculo_id INT NOT NULL REFERENCES vehiculo(id),
  fecha_hora TIMESTAMP,
  PRIMARY KEY (celda_id, vehiculo_id)
);


INSERT INTO perfil_usuario (perfil) VALUES
  ('administrador'), ('operador'), ('usuario');

INSERT INTO usuario (tipo_documento, numero_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, direccion_correo, numero_celular, foto_perfil, estado, clave, perfil_usuario_id) VALUES
('CC', '651684841', 'Abel', '', 'Rivero', 'Herrera', 'abel.rivero@gmail.com', '561465151', 'img/abel.jpg', 'activo', 'clave1', 3),
('CC', '8947676234', 'Ada', 'Alicia', 'Rivero', 'herrera', 'ada.rivero@gmail.com', '897484561', 'img/ada.jpg', 'activo', 'clave2', 1),
('CC', '8947676234', 'Martha', 'Paola', 'Perez', 'Ospino', 'martha.perez@gmail.com', '897484561', 'img/Martha.jpg', 'activo', 'clave3', 3);

INSERT INTO vehiculo (placa, color, modelo, marca, tipo, usuario_id_usuario) VALUES
('ABC123', 'rojo', '2020', 'Toyota', 'Carro', 1),
('GHT124', 'azul', '2011', 'Chevrolet', 'Carro', 2),
('EWX125', 'oro azucar', '2000', 'Hyundai', 'Carro', 3);

INSERT INTO celda (tipo, estado) VALUES
('Carro', 'Libre'), ('Carro', 'Ocupado'), ('Moto', 'Libre');

INSERT INTO pico_placa (tipo_vehiculo, numero, dia) VALUES
('Carro', '1', 'Lunes'), ('Moto', '2', 'Martes');

INSERT INTO incidencia (nombre) VALUES
('Robo de vehiculo'), ('Robo de accesorios');

INSERT INTO acceso_salida (movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id) VALUES
('Entrada', '2025-04-06 19:22:53', 'Puerta 1', 0, 1);

INSERT INTO reporte_incidencia (vehiculo_id, incidencia_id, fecha_hora) VALUES
(1, 1, '2025-04-06 19:22:53');

INSERT INTO historial_parqueo (celda_id, vehiculo_id, fecha_hora) VALUES
(1, 1, '2025-04-06 19:22:53');

SELECT * FROM usuario;