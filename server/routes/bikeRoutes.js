const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Bike = require('../models/Bike');

const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// Create Bike
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : '';
    
    const newBike = new Bike({ name, image });
    await newBike.save();
    res.status(201).json(newBike);
  } catch (err) {
    console.error('Error in bike route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Bikes
router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    res.json(bikes);
  } catch (err) {
    console.error('Error in bike route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Bike
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    let updateData = { name };
    
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    const updatedBike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBike);
  } catch (err) {
    console.error('Error in bike route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Bike
router.delete('/:id', async (req, res) => {
  try {
    await Bike.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bike deleted successfully' });
  } catch (err) {
    console.error('Error in bike route:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
