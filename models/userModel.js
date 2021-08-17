const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [
      'Please tell us your name!',
      true,
    ],
  },
  email: {
    type: String,
    required: [
      'Please provide your email',
      true,
    ],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [
      'Please provide a password',
      true,
    ],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      'Please confirm your password',
      true,
    ],
    // Only works on CREATE and SAVE
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

userSchema.pre(
  'save',
  async function (next) {
    //Only run this function if password was actually modified
    if (!this.isModified('password'))
      return next();

    this.password = await bcrypt.hash(
      this.password,
      12
    );

    this.passwordConfirm = undefined;
    next();
  }
);

userSchema.methods.verifyPassword =
  async function (userPassword) {
    return await bcrypt.compare(
      userPassword,
      this.password
    );
  };

const User = mongoose.model(
  'User',
  userSchema
);

module.exports = User;
