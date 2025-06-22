const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['transport', 'storage'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed', 'cancelled'],
      default: 'active',
    },
    origin: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    destination: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    dimensions: {
      weight: { type: Number, required: true },
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    price: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    transportRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportRequest',
      },
    ],
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ 'origin.city': 'text', 'destination.city': 'text' });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
