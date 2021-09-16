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

const sendRequest = async (
  unitId: any = unitUserTwoId,
  token: string = '',
  body: any = { name: 'test2' },
) => {
  const agent = request(app).delete(`/api/v1/units/${unitId}`);

  if (token) {
    agent.set('Authorization', `Bearer ${token}`);
  }
  return await agent.send(body);
};

describe('Get single unit', () => {
  it('Should return 403 forbiden when unit does not belong to user', async () => {
    const response = await sendRequest(unitUserTwoId, userOneToken);

    expect(response.status).toBe(403);
  });

  it('Should return 400  when unit does not exist', async () => {
    const randomUnitId = new mongoose.Types.ObjectId();

    const response = await sendRequest(randomUnitId, userTwoToken);

    expect(response.status).toBe(400);
  });

  it('Should return 200 when valid request is sent', async () => {
    const response = await sendRequest(unitUserTwoId, userTwoToken);

    expect(response.status).toBe(200);
  });
});
