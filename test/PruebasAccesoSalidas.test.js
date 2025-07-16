require('dotenv').config();
const request = require('supertest');
const express = require('express');
const accesoSalidasRoutes = require('../api/acceso_salidas');

const app = express();
app.use(express.json());
app.use('/api/acceso_salidas', accesoSalidasRoutes);

describe('API Acceso Salidas (test/acceso_salidas)', () => {
  let createdId;

  it('GET /api/acceso_salidas debe responder con 200 y un array', async () => {
    const res = await request(app).get('/api/acceso_salidas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/acceso_salidas debe crear un registro', async () => {
    const registro = {
      movimiento: 'Entrada',
      fecha_hora: new Date().toISOString(),
      puerta: 'Puerta 1',
      tiempo_estadia: 0,
      vehiculo_id: 1
    };
    const res = await request(app).post('/api/acceso_salidas').send(registro);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('GET /api/acceso_salidas/:id debe responder con el registro creado', async () => {
    const res = await request(app).get(`/api/acceso_salidas/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('PUT /api/acceso_salidas/:id debe actualizar el registro', async () => {
    const res = await request(app)
      .put(`/api/acceso_salidas/${createdId}`)
      .send({ puerta: 'Puerta 2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.puerta).toBe('Puerta 2');
  });

  it('DELETE /api/acceso_salidas/:id debe eliminar el registro', async () => {
    const res = await request(app).delete(`/api/acceso_salidas/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
});
