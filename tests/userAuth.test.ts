import request from 'supertest';
import User from '../src/models/userModel';
import app from '../src/app';

const testUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
  active: true,
};

const testUserCredentials = {
  email: testUser.email,
  password: testUser.password,
};

const addUser = async (user = testUser) => {
  await User.create(user);
};

const postAuthRequest = async (credentials: {
  email?: string;
  password?: string;
}) => {
  return await request(app).post('/api/v1/login').send(credentials);
};

const postValidAuthRequest = () => postAuthRequest(testUserCredentials);

afterEach(async () => {
  await User.deleteMany();
});

describe('User Authentication', () => {
  it('Should return 200 OK when user credentials are correct', async () => {
    await addUser();
    const response = await postValidAuthRequest();

    expect(response.status).toBe(200);
  });

  it('Should return status OK in body when user credentials are correct', async () => {
    await addUser();
    const response = await postValidAuthRequest();

    expect(response.body.status).toBe('OK');
  });

  it('Should return user object in response body when user credentials are correct', async () => {
    await addUser();
    const response = await postValidAuthRequest();

    expect(Object.keys(response.body.user)).toEqual(['username', 'email']);
  });

  it('Should return token in response body when user credentials are correct', async () => {
    await addUser();
    const response = await postValidAuthRequest();

    expect(response.body.token).toBeTruthy();
  });

  it.each([
    ['email', 'Please provide email and password!'],
    ['password', 'Please provide email and password!'],
  ])(
    'Should return status 400 and message Please provide email and password! when email or password are not included in credentilas',
    async (field, expectedMessage) => {
      await addUser();
      const response = await postAuthRequest({
        ...testUserCredentials,
        [field]: null,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(expectedMessage);
    },
  );

  it('Should return status 401 and message Incorrect email or password when password in not correct', async () => {
    await addUser();
    const response = await postAuthRequest({
      ...testUserCredentials,
      password: '30921314',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password!');
  });

  it('Should return status 403 and message Please activate your account when user is not active', async () => {
    await addUser({ ...testUser, active: false });
    const response = await postValidAuthRequest();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Please activate your account!');
  });
});
