# Email Notification Setup

## Overview
The Aura store now sends email notifications to the admin when new orders are placed.

## Setup Instructions

### 1. Get Gmail App Password

Since you're using Gmail (`abejaoui90@gmail.com`), you need to create an **App Password**:

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** (if not already enabled)
4. After enabling 2-Step Verification, go back to **Security**
5. Under "How you sign in to Google", click on **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)** → Enter "Aura Store"
8. Click **Generate**
9. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### 2. Update .env File

Open `project-backend/.env` and replace `your_gmail_app_password_here` with the app password you just generated:

```env
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Note:** Remove the spaces from the app password, or keep them - both work.

### 3. Restart the Backend Server

After updating the `.env` file:
1. Stop the backend server (Ctrl+C)
2. Run `npm start` again

### 4. Test It!

1. Go to your store frontend
2. Add a product to cart
3. Complete the checkout process
4. Check your email (`abejaoui90@gmail.com`) - you should receive a beautiful HTML email with:
   - Order number
   - Customer details (name, phone, address, size)
   - List of products ordered
   - Total amount

## Email Template Features

The notification email includes:
- ✨ Beautiful HTML design with Aura branding
- 📋 Complete customer information
- 🛒 Detailed product list with quantities and prices
- 💰 Order total
- 🎨 Responsive design that works on all devices

## Troubleshooting

### Email not sending?
1. Check that `EMAIL_PASSWORD` in `.env` is correct
2. Make sure 2-Step Verification is enabled on your Google account
3. Check the backend console for error messages
4. Verify that `EMAIL_USER` and `NOTIFICATION_EMAIL` are set to `abejaoui90@gmail.com`

### Still not working?
- The order will still be created successfully even if the email fails
- Check the backend terminal for error messages starting with "❌ Failed to send..."

## Configuration

All email settings are in `project-backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=abejaoui90@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
NOTIFICATION_EMAIL=abejaoui90@gmail.com
```

- `EMAIL_USER`: The Gmail account to send FROM
- `NOTIFICATION_EMAIL`: The email address to send notifications TO (can be the same or different)
