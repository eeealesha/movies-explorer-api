const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const authRouter = require('./routes/authentication');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limiter } = require('./middlewares/ratelimit');
const NotFoundError = require('./errors/not-found-error');
const centralizedErrorHandler = require('./middlewares/centralized-error-handler');

const { MONGODB } = process.env;
const { PORT = 3000 } = process.env;

app.use(limiter);

mongoose.connect(`${MONGODB}`, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

app.use('/', authRouter);

app.use('/', auth, usersRouter);
app.use('/', auth, moviesRouter);

app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errorLogger);

// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate

// eslint-disable-next-line no-unused-vars
app.use(centralizedErrorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App is on port ${PORT}`);
});
