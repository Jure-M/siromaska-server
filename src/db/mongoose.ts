import mongoose from 'mongoose';
import config from 'config';

mongoose
  .connect(config.get<string>('database'), {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log('DB connection successful!'));
