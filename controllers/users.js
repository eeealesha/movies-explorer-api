const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const BadReqError = require('../errors/bad-req-error');
const NotAuthError = require('../errors/not-auth-error');
const ConflictRequestError = require('../errors/conflict-request-error');

const { NODE_ENV, JWT_SECRET } = process.env;

const getCurrentUser = (req, res) => {
  const id = req.user._id;
  User.findById({ _id: id })
    .then((user) => res.status(200).send(user))
    .catch((err) => res.status(500).send(err));
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash, // записываем хеш в базу
      name: req.body.name,
    }))
    .then((user) => User.find({ _id: user._id }))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadReqError(err.message);
      }
      if (err.code === 11000) {
        throw new ConflictRequestError(`Пользователь с email: ${req.body.email} уже существует`);
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const id = req.user._id;
  const newName = req.body.name;
  const newEmail = req.body.email;
  User.findOneAndUpdate(
    { _id: id },
    { name: newName, email: newEmail },
    { runValidators: true, new: true, omitUndefined: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadReqError(err.message);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    // аутентификация успешна! пользователь в переменной user
    })
    .catch((err) => {
    // ошибка аутентификации
      throw new NotAuthError(err.message);
    })
    .catch(next);
};

module.exports = {
  createUser, updateUser, login, getCurrentUser,
};