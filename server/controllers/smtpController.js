const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const SmtpConfig = require('../models/SmtpConfig');

// Create SMTP configuration
const createSmtpConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName
    } = req.body;

    // Check if config with same name already exists for this user
    const existingConfig = await SmtpConfig.findOne({
      user: req.user._id,
      name: name
    });

    if (existingConfig) {
      return res.status(400).json({ error: 'SMTP configuration with this name already exists' });
    }

    // Create new SMTP config
    const smtpConfig = new SmtpConfig({
      name,
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName,
      user: req.user._id
    });

    await smtpConfig.save();

    res.status(201).json({
      message: 'SMTP configuration created successfully',
      config: smtpConfig
    });
  } catch (error) {
    console.error('Create SMTP config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// List SMTP configurations for user
const listSmtpConfigs = async (req, res) => {
  try {
    const configs = await SmtpConfig.find({ user: req.user._id })
      .select('-password -username')
      .sort({ createdAt: -1 });

    res.json({ configs });
  } catch (error) {
    console.error('List SMTP configs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Test SMTP configuration
const testSmtpConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      host,
      port,
      secure,
      username,
      password,
      fromEmail
    } = req.body;

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password
      }
    });

    // Test connection
    await transporter.verify();

    // Send test email
    const testEmail = {
      from: fromEmail,
      to: fromEmail, // Send to self for testing
      subject: 'SMTP Configuration Test',
      text: 'This is a test email to verify your SMTP configuration is working correctly.',
      html: '<p>This is a test email to verify your SMTP configuration is working correctly.</p>'
    };

    const info = await transporter.sendMail(testEmail);

    res.json({
      message: 'SMTP configuration test successful',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Test SMTP config error:', error);
    res.status(400).json({
      error: 'SMTP configuration test failed',
      details: error.message
    });
  }
};

// Get SMTP configuration by ID
const getSmtpConfig = async (req, res) => {
  try {
    const config = await SmtpConfig.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-password -username');

    if (!config) {
      return res.status(404).json({ error: 'SMTP configuration not found' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Get SMTP config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update SMTP configuration
const updateSmtpConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const config = await SmtpConfig.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!config) {
      return res.status(404).json({ error: 'SMTP configuration not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (['name', 'host', 'port', 'secure', 'username', 'password', 'fromEmail', 'fromName', 'isActive'].includes(key)) {
        config[key] = req.body[key];
      }
    });

    await config.save();

    res.json({
      message: 'SMTP configuration updated successfully',
      config: config.toJSON()
    });
  } catch (error) {
    console.error('Update SMTP config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete SMTP configuration
const deleteSmtpConfig = async (req, res) => {
  try {
    const config = await SmtpConfig.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!config) {
      return res.status(404).json({ error: 'SMTP configuration not found' });
    }

    res.json({ message: 'SMTP configuration deleted successfully' });
  } catch (error) {
    console.error('Delete SMTP config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createSmtpConfig,
  listSmtpConfigs,
  testSmtpConfig,
  getSmtpConfig,
  updateSmtpConfig,
  deleteSmtpConfig
}; 