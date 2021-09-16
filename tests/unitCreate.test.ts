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

beforeAll(async () => {
  await Unit.deleteMany();
  await User.create(userOne);
});

afterEach(async () => {
  await Unit.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
});

const sendRequest = async (body: any = null, token: string = '') => {
  const agent = request(app).post('/api/v1/units');

  if (token) {
    agent.set('Authorization', `Bearer ${token}`);
  }
  return await agent.send(body);
};

const sendValidRequest = () => sendRequest({ name: 'test' }, userOneToken);

describe('Unit create', () => {
  it('Should return 401 unauthorized when there is no authorization token', async () => {
    const response = await sendRequest({ name: 'test' });

    expect(response.status).toBe(401);
  });

  it('Should return 401 unauthorized when wrong auth token is provided', async () => {
    const response = await sendRequest({ name: 'test' }, 'eadsa31s');

    expect(response.status).toBe(401);
  });

  it('Should retrun 400 when there is no unit name sent', async () => {
    const response = await sendRequest({ name: '' }, userOneToken);

    expect(response.status).toBe(400);
  });

  it('Should retrun 400 when there is no unit name is less than 3 chars', async () => {
    const response = await sendRequest({ name: 'te' }, userOneToken);

    expect(response.status).toBe(400);
  });

  it('Should return 201 Created when valid data is sent', async () => {
    const response = await sendValidRequest();

    expect(response.status).toBe(201);
  });

  it('should save unit in database when valid data is sent', async () => {
    await sendValidRequest();

    const unit = await Unit.findOne({ user: userOne._id });

    expect(unit).toBeTruthy();
  });

  it('should save unit in database when valid data is sent', async () => {
    await sendValidRequest();

    const unit = await Unit.findOne({ user: userOne._id });

    expect(unit.name).toBe('test');
  });
});
