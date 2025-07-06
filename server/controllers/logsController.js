const EmailLog = require('../models/EmailLog');

// List email logs for user
const listEmailLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build query
    const query = { sender: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const logs = await EmailLog.find(query)
      .populate('smtpConfig', 'name host')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-body'); // Exclude email body for performance

    // Get total count
    const total = await EmailLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List email logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get email log by ID with full details
const getEmailLog = async (req, res) => {
  try {
    const log = await EmailLog.findOne({
      _id: req.params.id,
      sender: req.user._id
    }).populate('smtpConfig', 'name host fromEmail');

    if (!log) {
      return res.status(404).json({ error: 'Email log not found' });
    }

    res.json({ log });
  } catch (error) {
    console.error('Get email log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get email statistics
const getEmailStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await EmailLog.aggregate([
      {
        $match: {
          sender: req.user._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalStats = await EmailLog.aggregate([
      {
        $match: { sender: req.user._id }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      last30Days: stats,
      total: totalStats[0] || { total: 0, sent: 0, failed: 0, pending: 0 }
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  listEmailLogs,
  getEmailLog,
  getEmailStats
}; 