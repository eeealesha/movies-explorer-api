const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: (props) => `${props.value} is not an email!`,
    },
    unique: true,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return validator.isStrongPassword(v);
      },
      message: (props) => `${props.value} is not a strong password!`,
    },
    select: false, // необходимо добавить поле select
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
});

userSchema.statics.findUserByCredentials = (email, password) => this.findOne({ email }).select('+password')
  .then((user) => {
    if (!user) {
      return Promise.reject(new Error('Неправильные почта или пароль'));
    }

    return bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) {
          return Promise.reject(new Error('Неправильные почта или пароль'));
        }

        return user; // теперь user доступен
      });
  });

module.exports = mongoose.model('user', userSchema);
