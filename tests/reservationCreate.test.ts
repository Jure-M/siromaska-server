import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import User from '../src/models/userModel';
import Unit from '../src/models/unitModel';
import Reservation from '../src/models/reservationModel';
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

const userTwoId = new mongoose.Types.ObjectId();
const userTwoToken = jwt.sign(
  { id: userTwoId },
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

const unituserOneId = new mongoose.Types.ObjectId();
const unitUserOneName = 'testUnit';

const unitUserOne = {
  _id: unituserOneId,
  name: unitUserOneName,
  userId: userOneId,
};

const existingReservation = {
  dateFrom: '2019-11-24',
  dateTo: '2019-11-27',
  numberOfGuests: 2,
  guestName: 'Bad Guy',
  price: 100,
  agency: 'booking',
  unit: unituserOneId,
};

const testReservation = {
  dateFrom: '2019-11-25',
  dateTo: '2019-11-28',
  numberOfGuests: 2,
  guestName: 'Nice Guy',
  price: 100,
  agency: 'booking',
  unit: unituserOneId,
};

beforeAll(async () => {
  await User.create(userOne);
  await Unit.create(unitUserOne);
});

afterEach(async () => {
  await Reservation.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
  await Unit.deleteMany();
});

describe('Create new reservation', () => {
  it('Should return 401 unauthorized when there is no authorization token', async () => {
    const response = await request(app)
      .post('/api/v1/reservations/')
      .send(testReservation);

    expect(response.status).toBe(401);
  });

  it('Should return 401 unauthorized when wrong auth token is provided', async () => {
    const response = await request(app)
      .post('/api/v1/reservations/')
      .set(`Authorization`, `Bearer 2312312`)
      .send(testReservation);

    expect(response.status).toBe(401);
  });

  it('should return 500 when unit id is not send in request', async () => {
    const res = await request(app)
      .post('/api/v1/reservations/')
      .set(`Authorization`, `Bearer ${userOneToken}`)
      .send({ ...testReservation, unit: '' });

    expect(res.status).toBe(500);
  });

  it('should return 400 when one of fields in reservation is missing', async () => {
    const res = await request(app)
      .post('/api/v1/reservations/')
      .set(`Authorization`, `Bearer ${userOneToken}`)
      .send({ ...testReservation, dateTo: '' });

    expect(res.status).toBe(400);
  });
  it('should return 400 when reservation ends before it begins', async () => {
    const res = await request(app)
      .post('/api/v1/reservations/')
      .set(`Authorization`, `Bearer ${userOneToken}`)
      .send({
        ...testReservation,
        dateFrom: '2019-12-30',
        dateTo: '2019-12-27',
      });

    expect(res.status).toBe(400);
  });

  it('should return 403 when existing reservation overlaps with reservation', async () => {
    await Reservation.create(existingReservation);

    const res = await request(app)
      .post('/api/v1/reservations/')
      .set(`Authorization`, `Bearer ${userOneToken}`)
      .send(testReservation);

    expect(res.status).toBe(403);
  });

  it('should return 200 when valid request is sent', async () => {
    const res = await request(app)
      .post('/api/v1/reservations/')
      .set(`Authorization`, `Bearer ${userOneToken}`)
      .send(testReservation);

    expect(res.status).toBe(200);
  });
});
