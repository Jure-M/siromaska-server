import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from 'config';
import User from '../src/models/userModel';
import app from '../src/app';

const testUserId = new mongoose.Types.ObjectId();
const testUserToken = jwt.sign(
  { id: testUserId },
  config.get<string>('jwtSecret'),
  {
    expiresIn: config.get<string>('jwtExpiresIn'),
  },
);

const testUser = {
  _id: testUserId,
  username: 'user1',
  email: 'user1@mail.com',
  acitve: false,
  password: 'P4ssword',
  passwordConfirm: 'P4ssword',
  active: true,
  token: testUserToken,
};
const testAuth = {
  password: '123456',
  passwordConfirm: '123456',
};

afterEach(async () => {
  await User.deleteMany();
});

describe('Reset user password', () => {
  it('Should return 401 when request is send without valid token', async () => {
    await User.create(testUser);
    const res = await request(app)
      .patch('/api/v1/user/updatePassword')
      .set('Authorization', `Bearer 123`);

    expect(res.status).toBe(401);
  });

  it('should return 400 when password or password confirm are not sent in reqest', async () => {
    await User.create(testUser);
    const res = await request(app)
      .patch('/api/v1/user/updatePassword')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('should return 400 when password or password confirm do not match', async () => {
    await User.create(testUser);
    const res = await request(app)
      .patch('/api/v1/user/updatePassword')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ password: '12345', confrimPassword: '123456' });

    expect(res.status).toBe(400);
  });

  it('should return 401 when password or password confirm do not match', async () => {
    await User.create(testUser);
    const res = await request(app)
      .patch('/api/v1/user/updatePassword')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ password: '123456', passwordConfirm: '1234' });

    expect(res.status).toBe(400);
  });

  it('should return 200 when password is updated', async () => {
    await User.create(testUser);
    const res = await request(app)
      .patch('/api/v1/user/updatePassword')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ ...testAuth });

    expect(res.status).toBe(200);
  });

  it('should update user password in database when password is updated', async () => {
    await User.create(testUser);
    const res = await request(app)
      .patch('/api/v1/user/updatePassword')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ ...testAuth });
    const user = await User.findById(testUserId).select('+password');
    const isPasswordMatch = await bcrypt.compare(
      testAuth.password,
      user.password,
    );
    expect(isPasswordMatch).toBeTruthy();
  });
});
