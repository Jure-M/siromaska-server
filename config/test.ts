const test = {
  port: 5000,
  database: 'mongodb://127.0.0.1:27017/siromaskatest',
  mail: {
    host: 'localhost',
    port: 8587,
    tls: {
      rejectUnauthorized: false,
    },
  },
  jwtSecret: 'my-super-secret-word-hah',
  jwtExpiresIn: '100000',
};

export default test;
