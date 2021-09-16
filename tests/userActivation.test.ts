import request from 'supertest';
import app from '../src/app';
import User from '../src/models/userModel';

const testUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
  passwordConfirm: 'P4ssword',
  active: false,
  activationToken: 'sae123ksq1',
};

afterEach(async () => {
  await User.deleteMany();
});

describe('User activation', () => {
  it('Should return 200 OK when valid token is sent', async () => {
    await User.create(testUser);

    const response = await request(app).post(
      '/api/v1/activationtoken/' + testUser.activationToken,
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User account acctivated!');
  });

  it('Should save User to database with correct fields when valid token is sent', async () => {
    await User.create(testUser);
    await request(app).post(
      '/api/v1/activationtoken/' + testUser.activationToken,
    );
    const user = await User.findOne({ email: testUser.email });

    expect(user.active).toBe(true);
    expect(user.activationToken).toBeFalsy();
  });

  it('Should return 400 error when invalid token is sent', async () => {
    const response = await request(app).post('/api/v1/activationtoken/31');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Activation token does not exist!');
  });
});
