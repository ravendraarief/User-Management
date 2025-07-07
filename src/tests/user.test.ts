import request from 'supertest';
import app from '../app';

describe('User API', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'tester',
        email: 'tester@example.com',
        password: 'password123',
        role: 'admin',
        company: 'Bitnusa'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('tester@example.com');
  });

  it('should login user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'tester@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
