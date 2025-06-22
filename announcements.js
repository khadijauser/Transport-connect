const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');


exports.createAnnouncement = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // ✅ Restrict access to expediteurs only
  if (req.user.role !== 'expediteur') {
    return res.status(403).json({
      success: false,
      message: 'Seuls les expéditeurs peuvent créer une annonce',
    });
  }

  try {
    const announcement = await Announcement.create({
      ...req.body,
      shipper: req.user.id, // 👍 Instead of driver
    });

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};



exports.getAnnouncements = async (req, res) => {
  try {
    const { departure, destination, date, cargoType } = req.query;
    let query = { status: 'active' };

    if (departure) {
      query['departure.location'] = { $regex: departure, $options: 'i' };
    }
    if (destination) {
      query['destination.location'] = { $regex: destination, $options: 'i' };
    }
    if (date) {
      query['departure.date'] = { $gte: new Date(date) };
    }
    if (cargoType) {
      query['cargoDetails.cargoType'] = cargoType;
    }

    const announcements = await Announcement.find(query)
      .populate('driver', 'firstName lastName rating')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('driver', 'firstName lastName rating')
      .populate({
        path: 'requests',
        populate: {
          path: 'sender',
          select: 'firstName lastName rating'
        }
      });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


exports.updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    if (announcement.shipper.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à modifier cette annonce'
      });
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    if (announcement.shipper.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer cette annonce'
      });
    }

    await announcement.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}; 