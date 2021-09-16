import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import User from '../src/models/userModel';
import Unit from '../src/models/unitModel';
import jwt from 'jsonwebtoken';
import config from 'config';

const userOneId = new mongoose.Types.ObjectId();
const userOneToken = jwt.sign(
  { id: userOneId },
  config.get<string>('jwtSecret'),
  {
    expiresIn: config.get<string>('jwtExpiresIn'),
  },
);

const userOne = {
  _id: userOneId,
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
  passwordConfirm: 'P4ssword',
  active: true,
  token: userOneToken,
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwoToken = jwt.sign(
  { id: userTwoId },
  config.get<string>('jwtSecret'),
  {
    expiresIn: config.get<string>('jwtExpiresIn'),
  },
);

const userTwo = {
  _id: userTwoId,
  username: 'user2',
  email: 'user2@mail.com',
  password: 'P4ssword',
  passwordConfirm: 'P4ssword',
  active: true,
  token: userTwoToken,
};

const unitUserTwoId = new mongoose.Types.ObjectId();
const unitUserTwoName = 'testUnit';

const unitUserTwo = {
  _id: unitUserTwoId,
  name: unitUserTwoName,
  user: userTwoId,
};

beforeAll(async () => {
  await User.create(userOne);
  await User.create(userTwo);
});

beforeEach(async () => {
  await Unit.create(unitUserTwo);
});

afterEach(async () => {
  await Unit.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
});

const sendRequest = async (token: string = '') => {
  return await request(app)
    .get(`/api/v1/units/`)
    .set('Authorization', `Bearer ${token}`)
    .send();
};

describe('Get single unit', () => {
  it('Should return 200 when valid request is sent', async () => {
    const response = await sendRequest(userOneToken);

    expect(response.status).toBe(200);
  });

  it('Should return 0 units when user one sends request', async () => {
    const response = await sendRequest(userOneToken);

    expect(response.body.units).toHaveLength(0);
  });

  it('Should return 1 unit when user two sends request', async () => {
    const response = await sendRequest(userTwoToken);

    expect(response.body.units).toHaveLength(1);
  });
});
