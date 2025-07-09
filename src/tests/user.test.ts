import request from 'supertest';
import app from '../app'; // pastikan import express app kamu

describe('User API integration with Supabase', () => {
  let token = '';
  const uniqueEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'password123';

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser1',
        email: uniqueEmail,
        password: testPassword,
        role: 'admin',
        company_id: 'e2c40346-8865-42bf-a0fd-348298db7d1f'
      });

    console.log('[REGISTER]', res.statusCode, res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login with registered user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: uniqueEmail,
        password: testPassword,
      });

    console.log('[LOGIN]', res.statusCode, res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get users with auth token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    console.log('[GET USERS]', res.statusCode, res.body);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
