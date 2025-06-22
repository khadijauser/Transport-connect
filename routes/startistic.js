
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Request = require('../models/Request');


router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalAnnouncements = await Announcement.countDocuments();
    const totalRequests = await Request.countDocuments();
    
   
    const activeAnnouncements = await Announcement.countDocuments({ 
      status: 'active',
      'departure.date': { $gte: new Date() }
    });
    
   
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const acceptedRequests = await Request.countDocuments({ status: 'accepted' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });
    const cancelledRequests = await Request.countDocuments({ status: 'cancelled' });
    
    const monthlyStats = await getMonthlyStats();
    
    
    const topDrivers = await getTopDrivers();
    
   
    const recentActivities = await getRecentActivities();
    
    
    const totalRevenue = await calculateTotalRevenue();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDrivers,
          totalClients,
          totalAnnouncements,
          totalRequests,
          activeAnnouncements,
          totalRevenue
        },
        requestsStatus: {
          pending: pendingRequests,
          accepted: acceptedRequests,
          completed: completedRequests,
          rejected: rejectedRequests,
          cancelled: cancelledRequests
        },
        monthlyStats,
        topDrivers,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Admin statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});


router.get('/user', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let statistics = {};
    
    if (userRole === 'driver') {
     
      const totalAnnouncements = await Announcement.countDocuments({ user: userId });
      const activeAnnouncements = await Announcement.countDocuments({ 
        user: userId, 
        status: 'active',
        'departure.date': { $gte: new Date() }
      });
      
      const totalRequests = await Request.countDocuments({ 
        announcement: { $in: await Announcement.find({ user: userId }).select('_id') }
      });
      
      const acceptedRequests = await Request.countDocuments({ 
        announcement: { $in: await Announcement.find({ user: userId }).select('_id') },
        status: 'accepted'
      });
      
      const completedRequests = await Request.countDocuments({ 
        announcement: { $in: await Announcement.find({ user: userId }).select('_id') },
        status: 'completed'
      });
      
      const pendingRequests = await Request.countDocuments({ 
        announcement: { $in: await Announcement.find({ user: userId }).select('_id') },
        status: 'pending'
      });
      
      const earnings = await calculateDriverEarnings(userId);
      
      const recentDeliveries = await getDriverRecentDeliveries(userId);
      
      statistics = {
        role: 'driver',
        totalAnnouncements,
        activeAnnouncements,
        totalRequests,
        acceptedRequests,
        completedRequests,
        pendingRequests,
        earnings,
        recentDeliveries,
        completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
      };
      
    } else if (userRole === 'client') {
      const totalRequests = await Request.countDocuments({ user: userId });
      const pendingRequests = await Request.countDocuments({ user: userId, status: 'pending' });
      const acceptedRequests = await Request.countDocuments({ user: userId, status: 'accepted' });
      const completedRequests = await Request.countDocuments({ user: userId, status: 'completed' });
      const rejectedRequests = await Request.countDocuments({ user: userId, status: 'rejected' });
      const cancelledRequests = await Request.countDocuments({ user: userId, status: 'cancelled' });
      
      const totalSpending = await calculateClientSpending(userId);
      
      const deliveryHistory = await getClientDeliveryHistory(userId);
      
      statistics = {
        role: 'client',
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        rejectedRequests,
        cancelledRequests,
        totalSpending,
        deliveryHistory,
        successRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
      };
    }
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    console.error('User statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques utilisateur'
    });
  }
});

async function getMonthlyStats() {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const monthlyData = await Request.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  return monthlyData;
}

async function getTopDrivers() {
  const topDrivers = await Request.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $lookup: {
        from: 'announcements',
        localField: 'announcement',
        foreignField: '_id',
        as: 'announcementData'
      }
    },
    {
      $unwind: '$announcementData'
    },
    {
      $group: {
        _id: '$announcementData.user',
        completedDeliveries: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'driverData'
      }
    },
    {
      $unwind: '$driverData'
    },
    {
      $project: {
        _id: 1,
        name: { $concat: ['$driverData.firstName', ' ', '$driverData.lastName'] },
        email: '$driverData.email',
        completedDeliveries: 1
      }
    },
    {
      $sort: { completedDeliveries: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  return topDrivers;
}

async function getRecentActivities() {
  const recentActivities = await Request.find()
    .populate('user', 'firstName lastName email')
    .populate({
      path: 'announcement',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .sort('-createdAt')
    .limit(10)
    .select('status createdAt user announcement');
    
  return recentActivities;
}

async function calculateTotalRevenue() {
  const result = await Request.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$price' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalRevenue : 0;
}

async function calculateDriverEarnings(driverId) {
  const result = await Request.aggregate([
    {
      $lookup: {
        from: 'announcements',
        localField: 'announcement',
        foreignField: '_id',
        as: 'announcementData'
      }
    },
    {
      $unwind: '$announcementData'
    },
    {
      $match: {
        'announcementData.user': driverId,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$price' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalEarnings : 0;
}

async function getDriverRecentDeliveries(driverId) {
  const deliveries = await Request.find({
    status: 'completed'
  })
  .populate('user', 'firstName lastName email')
  .populate({
    path: 'announcement',
    match: { user: driverId },
    select: 'departure destination'
  })
  .sort('-updatedAt')
  .limit(10);
  
  return deliveries.filter(delivery => delivery.announcement);
}

async function calculateClientSpending(clientId) {
  const result = await Request.aggregate([
    {
      $match: {
        user: clientId,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalSpending: { $sum: '$price' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalSpending : 0;
}

async function getClientDeliveryHistory(clientId) {
  const history = await Request.find({ user: clientId })
    .populate({
      path: 'announcement',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .sort('-createdAt')
    .limit(20);
    
  return history;
}

module.exports = router;