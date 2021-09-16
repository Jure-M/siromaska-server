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

beforeEach(async () => {
  await User.create(testUser);
});

afterEach(async () => {
  await User.deleteMany();
});

const postRequest = async (username: string = '') => {
  return await request(app)
    .patch('/api/v1/user/me')
    .set('Authorization', `Bearer ${testUser.token}`)
    .send({ username });
};

describe('Update user', () => {
  it('should fail if no username is submited', async () => {
    const res = await postRequest();

    expect(res.status).toBe(400);
  });

  it('should update username  if username is submited', async () => {
    const res = await postRequest('user2');

    expect(res.status).toBe(200);
  });

  it('should update username in database if username is submited', async () => {
    await postRequest('user2');

    const user = await User.findById(testUser._id);

    expect(user.username).toBe('user2');
  });
});
