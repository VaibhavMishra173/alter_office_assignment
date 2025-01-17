import request from 'supertest';
import app from '../src/app';
import { deleteMany } from '../src/models/url.model';

describe('URL Shortening API', () => {
  beforeEach(async () => {
    await deleteMany({});
  });

  test('should create short URL', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        longUrl: 'https://example.com',
        customAlias: 'test123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('shortUrl');
  });
});