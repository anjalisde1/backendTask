const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const salt = await bcrypt.genSalt();
    const hashedPassword = bcrypt.hashSync(password, salt); // Ensure the password is hashed
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      verificationToken: token,
    });

    await newUser.save()
    await sendVerificationEmail(email, token);
    return res.status(201).json({ message: 'Registration successful! Verify your email to login.' });
  } catch (error) {
    console.error('Error registering user:', error); // Log the error
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Verify Email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
});

module.exports = router;
