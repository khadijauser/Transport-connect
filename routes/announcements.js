const express = require('express');
const { check } = require('express-validator');
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcements');
const { protect, authorize } = require('../middleware/auth');
const Announcement = require('../models/Announcement');

const router = express.Router();

const announcementValidation = [
  check('departure.location', 'Le lieu de départ est requis').not().isEmpty(),
  check('departure.date', 'La date de départ est requise').not().isEmpty(),
  check('destination.location', 'La destination est requise').not().isEmpty(),
  check('destination.date', 'La date d\'arrivée est requise').not().isEmpty(),
  check('cargoDetails.maxWeight', 'Le poids maximum est requis').isNumeric(),
  check('cargoDetails.cargoType', 'Le type de marchandise est requis').not().isEmpty(),
  check('availableCapacity', 'La capacité disponible est requise').isNumeric(),
  check('price', 'Le prix est requis').isNumeric()
];


router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      user: req.user._id,
    });

    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    if (announcement.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    if (announcement.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await announcement.remove();
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 