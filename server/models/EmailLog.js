const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  smtpConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmtpConfig',
    required: true
  },
  to: [{
    type: String,
    required: true
  }],
  cc: [{
    type: String
  }],
  bcc: [{
    type: String
  }],
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    path: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  sentAt: {
    type: Date
  },
  messageId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
emailLogSchema.index({ sender: 1, createdAt: -1 });
emailLogSchema.index({ status: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema); 