const Rating = require('../models/Rating');
const Request = require('../models/Request');
const { validationResult } = require('express-validator');

// @desc    Créer une évaluation
// @route   POST /api/ratings
// @access  Private
exports.createRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const request = await Request.findById(req.body.request);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    // Vérifier si la demande est terminée
    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez évaluer que les demandes terminées'
      });
    }

    // Vérifier si l'utilisateur a déjà évalué cette demande
    const existingRating = await Rating.findOne({
      request: req.body.request,
      rater: req.user.id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cette demande'
      });
    }

    // Déterminer qui est évalué (conducteur ou expéditeur)
    const rated = request.sender.toString() === req.user.id
      ? request.announcement.driver
      : request.sender;

    const rating = await Rating.create({
      ...req.body,
      rater: req.user.id,
      rated
    });

    res.status(201).json({
      success: true,
      data: rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir les évaluations d'un utilisateur
// @route   GET /api/ratings/user/:userId
// @access  Public
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ rated: req.params.userId })
      .populate('rater', 'firstName lastName')
      .populate('request')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir une évaluation
// @route   GET /api/ratings/:id
// @access  Public
exports.getRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate('rater', 'firstName lastName')
      .populate('rated', 'firstName lastName')
      .populate('request');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour une évaluation
// @route   PUT /api/ratings/:id
// @access  Private
exports.updateRating = async (req, res) => {
  try {
    let rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Vérifier si l'utilisateur est l'auteur de l'évaluation
    if (rating.rater.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à modifier cette évaluation'
      });
    }

    rating = await Rating.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Supprimer une évaluation
// @route   DELETE /api/ratings/:id
// @access  Private
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Vérifier si l'utilisateur est l'auteur de l'évaluation
    if (rating.rater.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer cette évaluation'
      });
    }

    await rating.remove();

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