const express = require('express');
const { auth } = require('../middleware/auth');
const {
  listEmailLogs,
  getEmailLog,
  getEmailStats
} = require('../controllers/logsController');

const router = express.Router();

// Routes
router.get('/list', auth, listEmailLogs);
router.get('/stats', auth, getEmailStats);
router.get('/:id', auth, getEmailLog);

module.exports = router; 