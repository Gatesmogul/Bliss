import nodemailer from 'nodemailer';

/**
 * Email Service
 * Handles sending system emails like Verification, Password Reset, etc.
 */

// 1. Create a transporter using your email provider
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Verification Email
 * @param {string} email - Recipient email
 * @param {string} token - Unique verification token
 */
export const sendVerificationEmail = async (email, token) => {
  // Construct the verification URL
  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"Bliss Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Bliss Account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #FF3B5C; text-align: center;">Welcome to Bliss!</h2>
        <p>Hi there,</p>
        <p>Thank you for joining our community. To get started and find your perfect match, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #FF3B5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify My Email
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email. If you did not sign up for Bliss, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to: ${email}`);
  } catch (error) {
    console.error('🛑 Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};