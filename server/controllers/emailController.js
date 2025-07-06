const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const SmtpConfig = require('../models/SmtpConfig');
const EmailLog = require('../models/EmailLog');

// Send email
const sendEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      smtpConfigId,
      to,
      cc,
      bcc,
      subject,
      body,
      attachments
    } = req.body;

    // Get SMTP configuration
    const smtpConfig = await SmtpConfig.findOne({
      _id: smtpConfigId,
      user: req.user._id,
      isActive: true
    });

    if (!smtpConfig) {
      return res.status(404).json({ error: 'SMTP configuration not found or inactive' });
    }

    // Create email log entry
    const emailLog = new EmailLog({
      sender: req.user._id,
      smtpConfig: smtpConfig._id,
      to: Array.isArray(to) ? to : [to],
      cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
      bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
      subject,
      body,
      attachments: attachments || [],
      status: 'pending'
    });

    await emailLog.save();

    try {
      // Create transporter
      const transporter = nodemailer.createTransporter({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      });

      // Prepare email options
      const mailOptions = {
        from: smtpConfig.fromName 
          ? `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`
          : smtpConfig.fromEmail,
        to: emailLog.to.join(', '),
        cc: emailLog.cc.length > 0 ? emailLog.cc.join(', ') : undefined,
        bcc: emailLog.bcc.length > 0 ? emailLog.bcc.join(', ') : undefined,
        subject: emailLog.subject,
        html: emailLog.body,
        attachments: emailLog.attachments.map(attachment => ({
          filename: attachment.filename,
          path: attachment.path
        }))
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      // Update email log with success
      emailLog.status = 'sent';
      emailLog.sentAt = new Date();
      emailLog.messageId = info.messageId;
      await emailLog.save();

      res.json({
        message: 'Email sent successfully',
        messageId: info.messageId,
        emailLog: emailLog
      });

    } catch (sendError) {
      // Update email log with error
      emailLog.status = 'failed';
      emailLog.errorMessage = sendError.message;
      await emailLog.save();

      console.error('Email send error:', sendError);
      res.status(400).json({
        error: 'Failed to send email',
        details: sendError.message,
        emailLog: emailLog
      });
    }

  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get email by ID
const getEmail = async (req, res) => {
  try {
    const email = await EmailLog.findOne({
      _id: req.params.id,
      sender: req.user._id
    }).populate('smtpConfig', 'name host');

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ email });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  sendEmail,
  getEmail
}; 