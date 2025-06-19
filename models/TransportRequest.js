const mongoose = require('mongoose');

const transportRequestSchema = new mongoose.Schema(
  {
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
      required: true,
    },
    carrier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    documents: [{
      name: String,
      url: String,
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

const TransportRequest = mongoose.model('TransportRequest', transportRequestSchema);

module.exports = TransportRequest; 