const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, adminController.getDashboardStats);

router.get('/users', protect, admin, adminController.getUsers);
router.put('/users/:userId/status', protect, admin, adminController.updateUserStatus);

router.get('/announcements', protect, admin, adminController.getAnnouncements);
router.put(
  '/announcements/:announcementId/status',
  protect,
  admin,
  adminController.updateAnnouncementStatus
);

router.get('/requests', protect, admin, adminController.getRequests);
router.put(
  '/requests/:requestId/status',
  protect,
  admin,
  adminController.updateRequestStatus
);

module.exports = router; 