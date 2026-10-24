import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { User } from '../models/User';

describe('Pruebas del Módulo de Autenticación (/api/auth)', () => {
  beforeAll(async () => {
    await User.deleteMany({ email: 'test_planificador@pyme.com' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test_planificador@pyme.com' });
    await mongoose.connection.close();
  });

  it('Debe registrar un nuevo usuario Planificador exitosamente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Usuario Test',
        email: 'test_planificador@pyme.com',
        password: 'password123',
        rol: 'planificador',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Usuario creado exitosamente');
  });

  it('Debe iniciar sesión y devolver un Token JWT válido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_planificador@pyme.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('Debe denegar el acceso con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_planificador@pyme.com',
        password: 'clave_incorrecta',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
  });
});