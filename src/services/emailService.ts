import nodemailer from 'nodemailer';
import config from 'config';

interface ImailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    passs: string;
  };
}

const mailConfig = config.get<ImailConfig>('mail');

const transporter = nodemailer.createTransport({ ...mailConfig });

const sendAccountActivation = async (email: string, token: string) => {
  const info = await transporter.sendMail({
    from: 'My App <info@apartmani.com>',
    to: email,
    subject: 'Account Activation',
    html: `
      <div>
        <b>Please click below link to activate your account</b>
      </div>
      <br />
      <div>
       <a href="http://localhost:3000/activate?${token}">Activate</a>,
      </div>`,
  });
};

const sendPasswordReset = async (email: string, token: string) => {
  const info = await transporter.sendMail({
    from: 'My App <info@apartmani.com>',
    to: email,
    subject: 'Account Activation',
    html: `
      <div>
        <b>Please click below link to change your password</b>
      </div>
      <br />
      <div>
       <a href="http://localhost:3000/passwordreset?token=${token}">Reset your password</a>,
      </div>`,
  });
};

export default { sendAccountActivation, sendPasswordReset };
