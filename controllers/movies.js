const Movie = require("../models/movie");
const NotFoundError = require("../errors/not-found-error");
const BadReqError = require("../errors/bad-req-error");
const ForbiddenError = require("../errors/forbidden-error");

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

const createMovie = (req, res, next) => {
  Movie.create({
    country: req.body.country,
    director: req.body.director,
    duration: req.body.duration,
    year: req.body.year,
    description: req.body.description,
    image: req.body.image,
    trailer: req.body.trailer,
    thumbnail: req.body.thumbnail,
    nameRU: req.body.nameRU,
    nameEN: req.body.nameEN,
    movieId: req.body.movieId,
  })
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        throw new BadReqError(err.message);
      }
    })
    .catch(next);
};

// const deleteMovie = (req, res, next) => {
//   const id = req.user._id;
//   const movieID = req.params;
//   Movie.findById(movieID)
//     .then((movie) => {
//       if (!movie) {
//         throw new NotFoundError("Нет фильма с таким id");
//       }
//       if (movie.owner.toString() !== id) {
//         throw new ForbiddenError("Не ты владелец фильма с таким id");
//       } else {
//         Movie.findByIdAndDelete(movieID)
//           .then((item) => {
//             res.status(200).send(item);
//           })
//           .catch(next);
//       }
//     })
//     .catch(next);
// };

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  movieModel
    .findById(movieId)
    .select("+owner")
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError(errorMessages.notFoundFilm);
      }
      if (movie.owner.toString() !== req.user._id) {
        throw new Forbidden(errorMessages.notAllow);
      }
      movieModel
        .findByIdAndRemove(movieId)
        .then((data) => res.status(200).send(data));
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.kind === "CastError") {
        next(new BadRequestError(errorMessages.badRequest));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
