const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const bikeRoutes = require('./routes/bikeRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const assembleRoutes = require('./routes/assembleRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/assembles', assembleRoutes);
app.use('/api/sales', saleRoutes);
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Database Connection
const DB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_URI_HERE';

mongoose.connect(DB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.log('❌ Database connection error details:');
  console.error(err);
  if (err.message.includes('ESERVFAIL')) {
    console.log('💡 TIP: This is a DNS issue. Please restart your router or set your DNS to 8.8.8.8');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
