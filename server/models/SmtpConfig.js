const mongoose = require('mongoose');

const smtpConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: String,
    required: true,
    trim: true
  },
  port: {
    type: Number,
    required: true,
    min: 1,
    max: 65535
  },
  secure: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true
  },
  fromName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Method to get config without sensitive data
smtpConfigSchema.methods.toJSON = function() {
  const config = this.toObject();
  delete config.password;
  delete config.username;
  return config;
};

module.exports = mongoose.model('SmtpConfig', smtpConfigSchema); 