const request = require('supertest');
const express = require('express');
const usuarioRoutes = require('../api/usuarios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);

describe('API Usuarios', () => {
  let createdId;

  it('GET /api/usuarios debe responder con 200 y un array', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/usuarios debe crear un usuario', async () => {
    const usuario = {
      tipo_documento: 'CC',
      numero_documento: '123456789',
      primer_nombre: 'Test',
      primer_apellido: 'User',
      direccion_correo: 'testuser@email.com',
      numero_celular: '1234567890',
      estado: 'activo',
      perfil_usuario_id: 1
    };
    const res = await request(app).post('/api/usuarios').send(usuario);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id_usuario');
    createdId = res.body.id_usuario;
  });

  it('GET /api/usuarios/:id debe responder con el usuario creado', async () => {
    const res = await request(app).get(`/api/usuarios/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id_usuario', createdId);
  });

  it('PUT /api/usuarios/:id debe actualizar el usuario', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${createdId}`)
      .send({ primer_nombre: 'TestEdit' });
    expect(res.statusCode).toBe(200);
    expect(res.body.primer_nombre).toBe('TestEdit');
  });

  it('DELETE /api/usuarios/:id debe eliminar el usuario', async () => {
    const res = await request(app).delete(`/api/usuarios/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
});
