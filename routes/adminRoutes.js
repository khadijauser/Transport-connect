const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, isAdmin, adminController.getDashboardStats);

router.get('/users', protect, isAdmin, adminController.getUsers);
router.put('/users/:userId/status', protect, isAdmin, adminController.updateUserStatus);

router.get('/announcements', protect, isAdmin, adminController.getAnnouncements);
router.put(
  '/announcements/:announcementId/status',
  protect,
  isAdmin,
  adminController.updateAnnouncementStatus
);

router.get('/requests', protect, isAdmin, adminController.getRequests);
router.put(
  '/requests/:requestId/status',
  protect,
  isAdmin,
  adminController.updateRequestStatus
);
router.get('/test', (req, res) => {
  res.json({ message: 'Admin route is working' });
})

module.exports = router; 