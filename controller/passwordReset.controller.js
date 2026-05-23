const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const forgotPassword = async (req, res) => {
  try {
    const { email, type } = req.body;
    let user;

    // Find user based on the selected type
    if (type === 'admin') {
      user = await Admin.findOne({ email });
    } else if (type === 'employee') {
      user = await Employee.findOne({ email });
    } else if (type === 'client') {
      // Assuming clients are stored in Admin model with role 'client', or similar.
      // Adjust this query if you have a separate Client login model.
      user = await Admin.findOne({ email }); 
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist.' });
    }

    // Generate crypto token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token for database storage
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}?type=${type}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
            <h2 style="color: #4F46E5; margin: 0;">Attendance Management System</h2>
          </div>
          <div style="padding: 30px 20px;">
            <h3 style="color: #333;">Hello ${user.name || 'User'},</h3>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>Or copy this link to your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
              <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
            </p>
            <p><strong>Note:</strong> This link will expire in <strong>1 hour</strong>.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email content
    const mailOptions = {
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password - Attendance Management System',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending email. Please try again later.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, type, password } = req.body;

    // Hash the received token to compare with the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    let user;
    const query = {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Ensure token hasn't expired
    };

    if (type === 'admin') {
      user = await Admin.findOne(query);
    } else if (type === 'employee') {
      user = await Employee.findOne(query);
    } else if (type === 'client') {
      user = await Admin.findOne(query); 
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    // Direct password update since existing system seems to store passwords in plaintext
    // If you add bcrypt hashing later, do it here:
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(password, salt);
    
    user.password = password; 

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been successfully reset.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
};

module.exports = { forgotPassword, resetPassword };
