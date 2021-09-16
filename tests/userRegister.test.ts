import request from 'supertest';
import SMTPServer from 'smtp-server';
import User from '../src/models/userModel';
import app from '../src/app';

const testUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
  passwordConfirm: 'P4ssword',
};

const postUser = async (user: any) =>
  await request(app).post('/api/v1/signup').send(user);

let lastMail: any, server: any;

beforeAll(async () => {
  server = new SMTPServer.SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody: any;
      stream.on('data', (data) => {
        mailBody += data.toString();
      });
      stream.on('end', () => {
        lastMail = mailBody;
        callback();
      });
    },
  });

  await server.listen(8587, 'localhost');
});

afterAll(async () => {
  await server.close();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('User registration', () => {
  it('Returns 201 OK when signup request is valid', async () => {
    const response = await postUser(testUser);
    expect(response.status).toBe(201);
  });

  it('Saves user to database', async () => {
    await postUser(testUser);
    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeTruthy();
  });

  it('Saves user field actived as false when user is created', async () => {
    await postUser(testUser);
    const user = await User.findOne({ email: testUser.email });
    expect(user.active).toBe(false);
  });

  it('Creates Activation token when user is created', async () => {
    await postUser(testUser);
    const user = await User.findOne({ email: testUser.email });
    expect(user.activationToken).toBeTruthy();
  });

  it('Sends token in response body after user is created', async () => {
    const response = await postUser(testUser);
    expect(response.body.message).toBe('User Created!');
  });

  it('sends an Account activation email with activationToken', async () => {
    await postUser(testUser);
    const user = await User.findOne({ email: testUser.email });
    expect(lastMail).toContain(user.email);
    expect(lastMail).toContain(user.activationToken);
  });

  it.each([
    ['username', 'Please fill all required fields'],
    ['email', 'Please fill all required fields'],
    ['password', 'Please fill all required fields'],
    ['passwordConfirm', 'Please fill all required fields'],
  ])(
    'Returns 400 Please fill all required fields when username, password, passwordConfirm are missing ',
    async (field, expectedMessage) => {
      const response = await postUser({ ...testUser, [field]: null });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe(expectedMessage);
    },
  );

  it('Returns 400 Passwords do not match when password do not match', async () => {
    const response = await postUser({
      ...testUser,
      password: '1234567',
      passwordConfirm: 'test',
    });
    expect(response.status).toBe(401);
  });
});
