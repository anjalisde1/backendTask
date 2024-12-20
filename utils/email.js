const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Disable certificate validation
      },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your Email',
    html: `<p>Please verify your email by clicking the link below:</p>
           <a href="${process.env.CLIENT_URL}/verify/${token}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
