const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email is configured
const isEmailConfigured = () => {
  return process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD &&
    process.env.NOTIFICATION_EMAIL;
};

// Configure email transporter
let transporter = null;

if (isEmailConfigured()) {
  const port = parseInt(process.env.EMAIL_PORT, 10);
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('⚠️ Email not configured - missing environment variables');
}

// Send new order notification email
const sendOrderNotification = async (order, products) => {
  if (!transporter) {
    console.log('⚠️ Email not sent - transporter not configured');
    return false;
  }

  try {
    // Build product list HTML
    const productListHTML = products.map(p => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${p.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${p.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Aura Store" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🛍️ New Order #${order._id.toString().slice(-6)} - $${order.total.toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .customer-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .total { font-size: 20px; font-weight: bold; color: #3b82f6; text-align: right; padding: 15px 0; border-top: 2px solid #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✨ New Order Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${order._id.toString().slice(-6)}</p>
            </div>
            <div class="content">
              <div class="customer-info">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Customer Information</h3>
                <p><strong>Name:</strong> ${order.fullName}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>Size:</strong> ${order.size}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery 💵' : 'Card Payment 💳'}</p>
              </div>

              <div class="order-details">
                <h3 style="margin-top: 0; color: #1e40af;">🛒 Order Items</h3>
                <table>
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 10px; text-align: left;">Product</th>
                      <th style="padding: 10px; text-align: center;">Quantity</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productListHTML}
                  </tbody>
                </table>
                <div class="total">
                  Total: $${order.total.toFixed(2)}
                </div>
              </div>

              <p style="text-align: center; color: #6b7280; margin-top: 30px;">
                <small>This is an automated notification from your Aura store.</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order notification email:', error);
    // Don't throw error - we don't want to fail the order if email fails
    return false;
  }
};

const sendVerificationEmail = async (email, code) => {
  if (!transporter) return false;

  try {
    const mailOptions = {
      from: `"Aura Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Aura Verification Code`,
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: monospace; text-align: center; padding: 40px; background: #000; color: #fff; }
              .code { 
                font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #fff; margin: 20px 0; display: block;
              }
            </style>
          </head>
          <body>
            <h1>Verify Your Email</h1>
            <p>Welcome to Aura. Use the code below to verify your account:</p>
            <span class="code">${code}</span>
            <p style="margin-top: 30px; opacity: 0.5; font-size: 12px;">Code expires in 1 hour.</p>
          </body>
          </html>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
};

const sendStatusUpdateEmail = async (order) => {
  if (!transporter || !order.email) return false;

  const statusMessages = {
    'confirmed': {
      title: 'Order Confirmed',
      message: 'Great news! Your order has been confirmed and is being prepared.',
      icon: '✨'
    },
    'shipped': {
      title: 'Order Shipped',
      message: 'Your package is on its way! It has been handed over to our delivery partner.',
      icon: '🚚'
    },
    'delivered': {
      title: 'Order Delivered',
      message: 'Your Aura package has been delivered. We hope you love your new pieces!',
      icon: '🎁'
    },
    'cancelled': {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact our support.',
      icon: '❗'
    }
  };

  const config = statusMessages[order.status];
  if (!config) return false;

  try {
    const mailOptions = {
      from: `"Aura Store" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `${config.icon} ${config.title} - Order #${order._id.toString().slice(-6)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #171717; margin: 0; padding: 0; background-color: #f9f9f9; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5; }
            .header { background: #000000; color: #ffffff; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; text-align: center; }
            .status-badge { display: inline-block; padding: 8px 16px; background: #f3f4f6; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
            .order-number { color: #888; font-size: 14px; margin-bottom: 10px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e5e5e5; }
            .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; letter-spacing: 4px; font-weight: 300;">AURA</h1>
            </div>
            <div class="content">
              <div class="order-number">Order #${order._id.toString().toUpperCase().slice(-8)}</div>
              <div class="status-badge" style="color: ${order.status === 'cancelled' ? '#ef4444' : '#000'}">
                ${order.status}
              </div>
              <h2 style="margin: 0 0 20px 0;">${config.title}</h2>
              <p style="color: #444; margin-bottom: 30px;">${config.message}</p>
              
              <div style="background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px; text-align: left;">
                <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #888; text-transform: uppercase;">Shipping Address</h4>
                <p style="margin: 0; font-size: 14px; font-weight: 500;">${order.fullName}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">${order.address}</p>
              </div>

              <a href="#" class="button">Track Order</a>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Aura Essence. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${order.email} for status: ${order.status}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
    return false;
  }
};

module.exports = { sendOrderNotification, sendVerificationEmail, sendStatusUpdateEmail };
