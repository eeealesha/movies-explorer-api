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
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limiter } = require('./middlewares/ratelimit');
const NotFoundError = require('./errors/not-found-error');

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

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')),
    name: Joi.string().min(2).max(30),
  }),
}), login);

app.use('/', auth, usersRouter);
app.use('/', auth, moviesRouter);

app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errorLogger);

// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  if (err.kind === 'ObjectId') {
    res
      .status(400)
      .send({
      // проверяем статус и выставляем сообщение в зависимости от него
        message: 'Неверно переданы данные',
      });
  } else {
    res
      .status(statusCode)
      .send({
      // проверяем статус и выставляем сообщение в зависимости от него
        message: statusCode === 500
          ? 'На сервере произошла ошибка'
          : message,
      });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App is on port ${PORT}`);
});
