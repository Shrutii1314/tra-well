const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'agency', 'admin'],
      default: 'user'
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: 'default.jpg'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcryptjs before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare candidate password with stored password
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  const hashToCompare = userPassword || this.password;
  return await bcrypt.compare(candidatePassword, hashToCompare);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
