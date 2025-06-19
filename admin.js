const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Request = require('../models/Request');
const Rating = require('../models/Rating');

// @desc    Obtenir les statistiques générales
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalAnnouncements = await Announcement.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalRatings = await Rating.countDocuments();

    // Calculer le taux d'acceptation des demandes
    const acceptedRequests = await Request.countDocuments({ status: 'accepted' });
    const acceptanceRate = (acceptedRequests / totalRequests) * 100;

    // Obtenir les utilisateurs actifs (ayant créé une annonce ou fait une demande dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.countDocuments({
      $or: [
        { 'announcements.createdAt': { $gte: thirtyDaysAgo } },
        { 'requests.createdAt': { $gte: thirtyDaysAgo } }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDrivers,
        totalAnnouncements,
        totalRequests,
        totalRatings,
        acceptanceRate,
        activeUsers
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour le statut d'un utilisateur
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir toutes les annonces
// @route   GET /api/admin/announcements
// @access  Private (Admin)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('driver', 'firstName lastName email')
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


exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
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