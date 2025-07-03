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
