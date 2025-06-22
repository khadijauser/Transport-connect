const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth'); // ✅ تم استدعاء authorizeRoles
const Announcement = require('../models/Announcement');

const router = express.Router();

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

router.post('/', protect, authorizeRoles('expediteur'), async (req, res) => {
  const {
    title, description, type, price, deadline,
    origin, destination, dimensions
  } = req.body;

  if (
    !title || !description || !type || !price || !deadline ||
    !origin || !origin.address || !origin.city || !origin.postalCode || !origin.country ||
    !destination || !destination.address || !destination.city || !destination.postalCode || !destination.country ||
    !dimensions || !dimensions.weight || !dimensions.length || !dimensions.width || !dimensions.height
  ) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const announcement = new Announcement({
      title,
      description,
      type,
      price,
      deadline,
      origin,
      destination,
      dimensions,
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

    if (!req.user.isAdmin && announcement.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    Object.assign(announcement, req.body); 
    const updated = await announcement.save();
    res.json(updated);
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

    if (!req.user.isAdmin && announcement.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await announcement.remove();
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
