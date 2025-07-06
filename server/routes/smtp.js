const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  createSmtpConfig,
  listSmtpConfigs,
  testSmtpConfig,
  getSmtpConfig,
  updateSmtpConfig,
  deleteSmtpConfig
} = require('../controllers/smtpController');

const router = express.Router();

// Validation middleware
const smtpConfigValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('host').trim().isLength({ min: 1 }).withMessage('Host is required'),
  body('port').isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
  body('secure').isBoolean().withMessage('Secure must be a boolean'),
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  body('fromEmail').isEmail().normalizeEmail().withMessage('From email must be valid'),
  body('fromName').optional().trim()
];

const testSmtpValidation = [
  body('host').trim().isLength({ min: 1 }).withMessage('Host is required'),
  body('port').isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
  body('secure').isBoolean().withMessage('Secure must be a boolean'),
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  body('fromEmail').isEmail().normalizeEmail().withMessage('From email must be valid')
];

// Routes
router.post('/create', auth, smtpConfigValidation, createSmtpConfig);
router.get('/list', auth, listSmtpConfigs);
router.post('/test', auth, testSmtpValidation, testSmtpConfig);
router.get('/:id', auth, getSmtpConfig);
router.put('/:id', auth, smtpConfigValidation, updateSmtpConfig);
router.delete('/:id', auth, deleteSmtpConfig);

module.exports = router; 