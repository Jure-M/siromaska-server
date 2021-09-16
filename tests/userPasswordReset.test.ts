import request from 'supertest';
import User from '../src/models/userModel';
import app from '../src/app';

const testUser = {
  username: 'user1',
  email: 'user1@mail.com',
  acitve: false,
  password: 'P4ssword',
  passwordConfirm: 'P4ssword',
  passwordResetToken: 'sdsa23fs1',
  passwordResetTokenExpires: Date.now() + 10 * 60 * 1000,
};

const testPassword = '123456';
const testPasswordConfirm = '123456';

afterEach(async () => {
  await User.deleteMany();
});

const postRequest = async (
  token: string,
  password: string = '',
  passwordConfirm: string = '',
) => {
  return await request(app)
    .patch(`/api/v1/user/resetpassword/${token}`)
    .send({ password, passwordConfirm });
};

describe('Reset user password', () => {
  it('Should return 401 when there are no password or confirm password in request', async () => {
    await User.create(testUser);
    const res = await postRequest(testUser.passwordResetToken, '', '');

    expect(res.status).toBe(401);
  });

  it('Should return 401 when there is no user with token in database', async () => {
    await User.create(testUser);
    const res = await postRequest(
      'invalidToken',
      testPassword,
      testPasswordConfirm,
    );
    expect(res.status).toBe(401);
  });

  it('should return 401 when reset token is expired', async () => {
    await User.create({
      ...testUser,
      passwordResetTokenExpires: Date.now() - 10000,
    });
    const res = await postRequest(
      testUser.passwordResetToken,
      testPassword,
      testPasswordConfirm,
    );

    expect(res.status).toBe(401);
  });

  it('should return 204 when password is changed', async () => {
    await User.create(testUser);
    const res = await postRequest(
      testUser.passwordResetToken,
      testPassword,
      testPasswordConfirm,
    );

    expect(res.status).toBe(204);
  });
});
