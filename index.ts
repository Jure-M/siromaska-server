import app from './src/app';
import config from 'config';

app.listen(config.get<number>('port'), () => {
  console.log(`Server is listening on port: ${config.get<number>('port')}`);
});
