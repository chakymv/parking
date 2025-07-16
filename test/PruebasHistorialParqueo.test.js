require('dotenv').config();
const request = require('supertest');
const express = require('express');
const historialParqueoRoutes = require('../api/historial_parqueo');

const app = express();
app.use(express.json());
app.use('/api/historial_parqueo', historialParqueoRoutes);

describe('API Historial Parqueo', () => {
  let celdaId = 1;
  let vehiculoId = 1;
  let fecha = new Date().toISOString();

  it('GET /api/historial_parqueo debe responder con 200 y un array', async () => {
    const res = await request(app).get('/api/historial_parqueo');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/historial_parqueo debe crear un registro', async () => {
    const registro = { celda_id: celdaId, vehiculo_id: vehiculoId, fecha_hora: fecha };
    const res = await request(app).post('/api/historial_parqueo').send(registro);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('celda_id', celdaId);
    expect(res.body).toHaveProperty('vehiculo_id', vehiculoId);
  });

  it('GET /api/historial_parqueo/:celda_id/:vehiculo_id debe responder con el registro creado', async () => {
    const res = await request(app).get(`/api/historial_parqueo/${celdaId}/${vehiculoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('celda_id', celdaId);
    expect(res.body).toHaveProperty('vehiculo_id', vehiculoId);
  });

  it('PUT /api/historial_parqueo/:celda_id/:vehiculo_id debe actualizar el registro', async () => {
    const res = await request(app)
      .put(`/api/historial_parqueo/${celdaId}/${vehiculoId}`)
      .send({ fecha_hora: new Date().toISOString() });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('celda_id', celdaId);
  });

  it('DELETE /api/historial_parqueo/:celda_id/:vehiculo_id debe eliminar el registro', async () => {
    const res = await request(app).delete(`/api/historial_parqueo/${celdaId}/${vehiculoId}`);
    expect(res.statusCode).toBe(204);
  });
});
