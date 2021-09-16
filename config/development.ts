const development = {
  port: 5000,
  database: 'mongodb://127.0.0.1:27017/siromaska',
  mail: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'kennedi.kertzmann@ethereal.email',
      pass: 'd9MEXzXU2UXTUCBsFF',
    },
  },
  jwtSecret: 'my-super-secret-word-ha',
  jwtExpiresIn: '90d',
};

export default development;
