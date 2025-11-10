const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));

// Admin initialization (run once)
app.get('/api/init-admin', async (req, res) => {
  res.json({
    message: 'Admin setup endpoint'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));