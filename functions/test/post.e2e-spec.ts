import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest
      .fn()
      .mockResolvedValue({ uid: 'test-user-id', email: 'test@example.com' }),
  }),
  firestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn(),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ id: 'test-user-id', name: 'User' }),
        }),
      }),
      add: jest.fn().mockResolvedValue({
        id: 'new-post',
        get: jest.fn().mockResolvedValue({
          data: () => ({ id: 'new-post', title: 'My Post', text: 'Hello' }),
        }),
      }),
      get: jest.fn().mockResolvedValue({
        docs: [{ data: () => ({ id: 'post1', text: 'e2e text' }) }],
      }),
    }),
  }),
}));

describe('Post Flow', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should block creating a post without authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'My Post', text: 'Hello' });

    expect(response.status).toBe(401);
  });

  it('should allow an authenticated user to create a post', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', 'Bearer fake-token')
      .send({ title: 'My Post', text: 'Hello' });

    expect(response.status).toBe(201);
  });
});
