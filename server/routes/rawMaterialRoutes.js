const express = require('express');
const router = express.Router();
const RawMaterial = require('../models/RawMaterial');
const multer = require('multer');
const path = require('path');

const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// Create Raw Material (with Image)
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, bike, qualities, partType } = req.body;
    const image = req.file ? req.file.path : '';
    
    // Parse qualities if sent as string from FormData
    const parsedQualities = typeof qualities === 'string' ? JSON.parse(qualities) : qualities;

    const newMaterial = new RawMaterial({ 
      name, 
      bike, 
      image,
      qualities: parsedQualities,
      partType: partType || 'None'
    });
    
    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Raw Material (Alternative endpoint if needed)
router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { name, bike, qualities, partType } = req.body;
      const image = req.file ? req.file.path : '';
      const parsedQualities = typeof qualities === 'string' ? JSON.parse(qualities) : qualities;
      const newMaterial = new RawMaterial({ name, bike, image, qualities: parsedQualities, partType: partType || 'None' });
      await newMaterial.save();
      res.status(201).json(newMaterial);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Get All Raw Materials with Bike info
router.get('/', async (req, res) => {
  try {
    const materials = await RawMaterial.find().populate('bike').sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    console.error('Error in raw material route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Raw Material
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, bike, qualities, partType } = req.body;
    let updateData = { name, bike, partType };
    
    if (qualities) {
        updateData.qualities = typeof qualities === 'string' ? JSON.parse(qualities) : qualities;
    }

    if (req.file) {
      updateData.image = req.file.path;
    }
    
    const updatedMaterial = await RawMaterial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedMaterial);
  } catch (err) {
    console.error('Error in raw material route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Raw Material
router.delete('/:id', async (req, res) => {
  try {
    await RawMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('Error in raw material route:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
