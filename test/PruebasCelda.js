require('dotenv').config();
const request = require('supertest');
const express = require('express');
const celdaRoutes = require('../api/celdas');

const app = express();
app.use(express.json());
app.use('/api/celdas', celdaRoutes);

describe('API Celdas', () => {
  let createdId;

  it('GET /api/celdas debe responder con 200 y un array', async () => {
    const res = await request(app).get('/api/celdas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/celdas debe crear una celda', async () => {
    const celda = { tipo: 'Carro', estado: 'Libre' };
    const res = await request(app).post('/api/celdas').send(celda);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('GET /api/celdas/:id debe responder con la celda creada', async () => {
    const res = await request(app).get(`/api/celdas/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('PUT /api/celdas/:id debe actualizar la celda', async () => {
    const res = await request(app)
      .put(`/api/celdas/${createdId}`)
      .send({ estado: 'Ocupado' });
    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('Ocupado');
  });

  it('DELETE /api/celdas/:id debe eliminar la celda', async () => {
    const res = await request(app).delete(`/api/celdas/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
});
