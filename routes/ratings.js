const express = require('express');
const { check } = require('express-validator');
const {
  createRating,
  getUserRatings,
  getRating,
  updateRating,
  deleteRating
} = require('../controllers/ratings');
const { protect } = require('../middleware/auth');

const router = express.Router();

const ratingValidation = [
  check('request', 'La demande est requise').not().isEmpty(),
  check('rating', 'La note est requise').isInt({ min: 1, max: 5 }),
  check('comment', 'Le commentaire est requis').not().isEmpty()
];

router
  .route('/')
  .post(protect, ratingValidation, createRating);

router
  .route('/user/:userId')
  .get(getUserRatings);

router
  .route('/:id')
  .get(getRating)
  .put(protect, ratingValidation, updateRating)
  .delete(protect, deleteRating);

module.exports = router; 