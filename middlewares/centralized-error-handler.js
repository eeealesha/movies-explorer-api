// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
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
};
