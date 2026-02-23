import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ id: 'test-user-id', name: 'E2E User' }),
        }),
        set: jest.fn(),
      }),
    }),
  }),
}));

describe('User', () => {
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

  it('should prevent access to user profile without a token', async () => {
    const response = await request(app.getHttpServer()).get('/user/1');
    expect(response.status).toBe(401);
  });

  it('should allow access to user profile with a valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/1')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
  });
});
