const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  // Registration Welcome Email
  registration: (firstName, email) => ({
    subject: 'Welcome to Our Platform! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #4CAF50;
            }
            .header h1 {
              color: #4CAF50;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for registering with us! We're excited to have you on board.</p>
              <p>Your account has been successfully created with the email: <strong>${email}</strong></p>
              <p>You can now log in and start exploring all the features we have to offer.</p>
              <a href="${process.env.FRONTEND_URL}/login" class="button">Get Started</a>
              <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\nThank you for registering with us! We're excited to have you on board.\n\nYour account has been successfully created with the email: ${email}\n\nYou can now log in and start exploring all the features we have to offer.\n\nBest regards,\nThe Team`,
  }),

  // Password Reset OTP Email
  passwordResetOTP: (firstName, otp) => ({
    subject: 'Password Reset OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #FF9800;
            }
            .header h1 {
              color: #FF9800;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .otp-box {
              background: #f5f5f5;
              border: 2px dashed #FF9800;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #FF9800;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">If you didn't request this password reset, please ignore this email and ensure your account is secure.</p>
              </div>

              <p>Enter this code on the password reset page to create a new password.</p>
              <p>Best regards,<br>The Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\nWe received a request to reset your password. Use the OTP code below to proceed:\n\nOTP Code: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe Team`,
  }),



  // Password Reset Confirmation Email
  passwordResetConfirmation: (firstName) => ({
    subject: 'Password Successfully Reset ✓',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #4CAF50;
            }
            .header h1 {
              color: #4CAF50;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .success-icon {
              text-align: center;
              font-size: 60px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-box {
              background: #e8f5e9;
              border-left: 4px solid #4CAF50;
              padding: 15px;
              margin: 20px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Password Reset Successful</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              
              <h2>Hi ${firstName},</h2>
              <p>Your password has been successfully reset!</p>

              <div class="info-box">
                <strong>ℹ️ What this means:</strong>
                <p style="margin: 5px 0 0 0;">You can now log in to your account using your new password. All your account data and settings remain unchanged.</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Log In Now</a>
              </div>

              <div class="warning">
                <strong>⚠️ Didn't reset your password?</strong>
                <p style="margin: 5px 0 0 0;">If you didn't make this change, please contact our support team immediately at <strong>${process.env.SUPPORT_EMAIL || 'support@yourcompany.com'}</strong> as your account may be compromised.</p>
              </div>

              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Use a unique password for each of your accounts</li>
                <li>Enable two-factor authentication if available</li>
                <li>Never share your password with anyone</li>
              </ul>

              <p>Best regards,<br>The Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>This confirmation was sent to you for security purposes.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\nYour password has been successfully reset!\n\nYou can now log in to your account using your new password.\n\nIf you didn't make this change, please contact our support team immediately at ${process.env.SUPPORT_EMAIL || 'support@yourcompany.com'}.\n\nSecurity Tips:\n- Use a unique password for each of your accounts\n- Enable two-factor authentication if available\n- Never share your password with anyone\n\nBest regards,\nThe Team`,
  }),
};

// Send email function
const sendEmail = async (to, template, ...args) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](...args);

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Your Company'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

module.exports = {
  sendEmail,
  generateOTP,
  emailTemplates,
};