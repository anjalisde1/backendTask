const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email and role 'admin'
    const user = await User.findOne({ email: email , role:"admin"});
    if (!user) {
      return res.status(400).json({ message: 'You are not allowed to login from here' });
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      console.log('User email not verified');
      return res.status(400).json({ message: 'Email not verified' });
    }

    // Compare password with the hashed password stored in the database
    const passwordToCheck = password.trim();
    console
    const isMatch = await bcrypt.compare(passwordToCheck, user.password);
    console.log(isMatch)
    
    console.log('Password entered:', password);
    console.log('Stored hashed password:', user.password);
    console.log('Password match:', isMatch);  // This should log `true` if passwords match

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
});


module.exports = router;
