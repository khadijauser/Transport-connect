const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  announcement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cargoDetails: {
    dimensions: {
      length: {
        type: Number,
        required: true
      },
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      }
    },
    weight: {
      type: Number,
      required: [true, 'Le poids est requis']
    },
    type: {
      type: String,
      required: [true, 'Le type de marchandise est requis']
    },
    description: {
      type: String,
      required: [true, 'La description est requise']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis']
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

requestSchema.post('save', async function() {
  const Announcement = mongoose.model('Announcement');
  const announcement = await Announcement.findById(this.announcement);
  
  if (this.status === 'accepted') {
    announcement.status = 'in_progress';
    await announcement.save();
  }
});

module.exports = mongoose.model('Request', requestSchema); 