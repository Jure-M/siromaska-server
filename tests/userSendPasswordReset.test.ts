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

beforeEach(async () => {
  await User.create(testUser);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await server.close();
});

const sendRequest = async (email: string = '') =>
  await request(app).post('/api/v1/user/resetPassword').send({ email });

const sendValidRequest = async () => await sendRequest(testUser.email);

describe('User rest password', () => {
  it('Should return 400 when there is no email in request', async () => {
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it('Should return 200 ok when password reset link is sent with unknown e-mail address', async () => {
    const res = await sendRequest('unknown@email.com');

    expect(res.status).toBe(200);
  });

  it('should return 200 ok when password is send with vaild email address', async () => {
    const res = await sendValidRequest();

    expect(res.status).toBe(200);
  });

  it('should store password reset token when request is sent with vaild email ', async () => {
    await sendValidRequest();
    const user = await User.findOne({ email: testUser.email });
    expect(user.passwordResetToken).toBeTruthy();
  });

  it('should send email contaning token when request is sent with valid email', async () => {
    await sendValidRequest();
    const user = await User.findOne({ email: testUser.email });
    expect(lastMail).toContain(user.email);
    expect(lastMail).toContain(user.passwordResetToken);
  });
});
