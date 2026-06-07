const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const bikeRoutes = require('./routes/bikeRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const assembleRoutes = require('./routes/assembleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/assembles', assembleRoutes);
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Database Connection
const DB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_URI_HERE';

mongoose.connect(DB_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('Database connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
