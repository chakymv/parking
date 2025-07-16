//npx jest --runInBand test/PruebasVehiculo.test.js

require('dotenv').config();
const request = require('supertest');
const express = require('express');
const vehiculoRoutes = require('../api/vehiculos');

const app = express();
app.use(express.json());
app.use('/api/vehiculos', vehiculoRoutes);

describe('API Vehiculos', () => {
  let createdId;

  it('GET /api/vehiculos debe responder con 200 y un array', async () => {
    const res = await request(app).get('/api/vehiculos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/vehiculos debe crear un vehiculo', async () => {
    const vehiculo = {
      placa: 'TEST123',
      color: 'Rojo',
      modelo: '2025',
      marca: 'TestMarca',
      tipo: 'Carro',
      usuario_id_usuario: 1
    };
    const res = await request(app).post('/api/vehiculos').send(vehiculo);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('GET /api/vehiculos/:id debe responder con el vehiculo creado', async () => {
    const res = await request(app).get(`/api/vehiculos/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('PUT /api/vehiculos/:id debe actualizar el vehiculo', async () => {
    const res = await request(app)
      .put(`/api/vehiculos/${createdId}`)
      .send({ color: 'Azul' });
    expect(res.statusCode).toBe(200);
    expect(res.body.color).toBe('Azul');
  });

  it('DELETE /api/vehiculos/:id debe eliminar el vehiculo', async () => {
    const res = await request(app).delete(`/api/vehiculos/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
});
