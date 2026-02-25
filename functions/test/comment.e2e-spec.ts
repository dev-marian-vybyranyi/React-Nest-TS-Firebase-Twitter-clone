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
            data: () => ({ id: 'post1', text: 'e2e post' }),
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
          data: () => ({ id: 'post1', text: 'e2e post' }),
        }),
      }),
      add: jest.fn().mockResolvedValue({
        id: 'new-comment',
        get: jest.fn().mockResolvedValue({
          data: () => ({ id: 'new-comment', content: 'Hello Comment' }),
        }),
      }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [{ data: () => ({ id: 'c1', content: 'e2e comment' }) }],
      }),
    }),
  }),
}));

describe('Comment', () => {
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

  it('should fetch comments for a post', async () => {
    const response = await request(app.getHttpServer()).get(
      '/posts/post1/comments',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('docs');
  });

  it('should block creating a comment without authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts/post1/comments')
      .send({ postId: 'post1', content: 'Unauth comment' });

    expect(response.status).toBe(401);
  });

  it('should allow an authenticated user to create a comment', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts/post1/comments')
      .set('Authorization', 'Bearer fake-token')
      .send({
        postId: 'post1',
        authorId: 'u1',
        authorUsername: 'user1',
        content: 'Auth comment',
      });

    expect(response.status).toBe(201);
  });
});
