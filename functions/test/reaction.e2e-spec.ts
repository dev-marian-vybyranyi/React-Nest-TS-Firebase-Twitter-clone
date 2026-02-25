import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest
      .fn()
      .mockResolvedValue({ uid: 'user-id', email: 'test@test.com' }),
  }),
  firestore: jest.fn().mockReturnValue({
    runTransaction: jest.fn().mockImplementation(
      <T>(cb: (t: any) => Promise<T>): Promise<T> =>
        cb({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ id: 'r1', type: 'like' }),
          }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        } as any),
    ),
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn(),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ id: 'r1', type: 'like' }),
        }),
        delete: jest.fn(),
      }),
      aggregate: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ count: 5 }),
        }),
      }),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        size: 5,
        docs: [{ data: () => ({ id: 'r1', type: 'like' }) }],
      }),
      count: jest.fn().mockReturnThis(),
    }),
  }),
}));

describe('Reaction', () => {
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

  it('should prevent fetching reactions without authentication', async () => {
    const response = await request(app.getHttpServer()).get(
      '/posts/post1/reactions',
    );
    expect(response.status).toBe(401);
  });

  it('should fetch reactions with valid a token', async () => {
    const response = await request(app.getHttpServer())
      .get('/posts/post1/reactions')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('likes');
    expect(response.body).toHaveProperty('dislikes');
  });

  it('should allow authenticating user to add a reaction', async () => {
    const response = await request(app.getHttpServer())
      .put('/posts/post1/reactions/like')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
  });
});
