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

module.exports = { sendOrderNotification };
