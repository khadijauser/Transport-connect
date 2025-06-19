const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'La note est requise'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Le commentaire est requis'],
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ratingSchema.post('save', async function() {
  const User = mongoose.model('User');
  const user = await User.findById(this.rated);
  
  const ratings = await this.constructor.find({ rated: this.rated });
  const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  
  user.rating = totalRating / ratings.length;
  user.ratingCount = ratings.length;
  await user.save();
});

module.exports = mongoose.model('Rating', ratingSchema); 