const User = require('../models/User');
const Announcement = require('../models/Announcement');
const TransportRequest = require('../models/TransportRequest');


exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeAnnouncements,
      completedTransports,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Announcement.countDocuments({ status: 'active' }),
      TransportRequest.countDocuments({ status: 'completed' }),
      TransportRequest.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    res.json({
      totalUsers,
      activeAnnouncements,
      completedTransports,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateAnnouncementStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.announcementId,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!announcement) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await TransportRequest.find()
      .populate('announcement')
      .populate('carrier', 'firstName lastName email')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await TransportRequest.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    )
      .populate('announcement')
      .populate('carrier', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 