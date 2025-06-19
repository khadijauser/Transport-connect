const express = require('express');
const {
  getStats,
  getUsers,
  updateUserStatus,
  getAnnouncements,
  deleteAnnouncement
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router; 