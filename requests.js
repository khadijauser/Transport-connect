const Request = require('../models/Request');
const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');


exports.createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const announcement = await Announcement.findById(req.body.announcement);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

 
    if (announcement.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cette annonce n\'est plus active'
      });
    }

    
    const existingRequest = await Request.findOne({
      announcement: req.body.announcement,
      sender: req.user.id
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà fait une demande pour cette annonce'
      });
    }

    const request = await Request.create({
      ...req.body,
      sender: req.user.id
    });

   
    announcement.requests.push(request._id);
    await announcement.save();

    
    const message = `Nouvelle demande de transport pour votre annonce ${announcement._id}`;
    await sendEmail({
      email: announcement.driver.email,
      subject: 'Nouvelle demande de transport',
      message
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ sender: req.user.id })
      .populate('announcement')
      .populate('sender', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('announcement')
      .populate('sender', 'firstName lastName');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    if (request.sender.toString() !== req.user.id && 
        request.announcement.driver.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à voir cette demande'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('announcement');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    if (request.announcement.driver.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à modifier cette demande'
      });
    }

    request.status = status;
    await request.save();

    const message = `Votre demande de transport a été ${status}`;
    await sendEmail({
      email: request.sender.email,
      subject: 'Mise à jour de votre demande',
      message
    });

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


exports.addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('announcement');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    if (request.sender.toString() !== req.user.id && 
        request.announcement.driver.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à envoyer un message'
      });
    }

    request.messages.push({
      sender: req.user.id,
      content
    });

    await request.save();

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}; 