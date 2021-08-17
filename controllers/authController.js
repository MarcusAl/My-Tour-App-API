const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm:
        req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and passsword exists
  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password',
        400
      )
    );
  }

  // 2) Check if user exists and password is correct

  const user = await User.findOne({
    email,
  }).select('+password');

  if (
    !user ||
    !(await user.verifyPassword(
      password,
      user.password
    ))
  ) {
    return next(
      new AppError(
        'incorrect email or password',
        401
      )
    );
  }

  // 3) If everything is correct, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.protect = catchAsync(
  (req, res, next) => {
    // 1) Getting token and checking if it exists

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startswith(
        'Bearer'
      )
    ) {
      token =
        req.headers.authorization.split(
          ' '
        )[1];
    }

    if (!token) {
      return next(
        new AppError(
          'Your are not logged in! Please log in to gain access',
          401
        )
      );
    }

    // 2) Verification token

    // 3) Check if user still exists

    // Check if user changed password after the token was issued

    next();
  }
);
