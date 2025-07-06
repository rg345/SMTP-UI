const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { sendEmail, getEmail } = require('../controllers/emailController');

const router = express.Router();

// Validation middleware
const sendEmailValidation = [
  body('smtpConfigId').isMongoId().withMessage('Valid SMTP configuration ID is required'),
  body('to').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('to.*').isEmail().withMessage('Each recipient must be a valid email'),
  body('cc').optional().isArray().withMessage('CC must be an array'),
  body('cc.*').optional().isEmail().withMessage('Each CC recipient must be a valid email'),
  body('bcc').optional().isArray().withMessage('BCC must be an array'),
  body('bcc.*').optional().isEmail().withMessage('Each BCC recipient must be a valid email'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('body').trim().isLength({ min: 1 }).withMessage('Email body is required'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
];

// Routes
router.post('/send', auth, sendEmailValidation, sendEmail);
router.get('/:id', auth, getEmail);

module.exports = router; 