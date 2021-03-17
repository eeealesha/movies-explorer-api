const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateUser,
  getCurrentUser,
} = require('../controllers/users');

router.get('/users/me', getCurrentUser);

router.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string(),
      email: Joi.string().email(),
    }),
  }), updateUser);

module.exports = router;