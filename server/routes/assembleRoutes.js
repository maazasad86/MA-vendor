const express = require('express');
const router = express.Router();
const Assemble = require('../models/Assemble');
const RawMaterial = require('../models/RawMaterial');

// Log a new assembly and deduct stock
router.post('/add', async (req, res) => {
  try {
    const { assemblyType, bike, items, totalQuantity } = req.body;

    // Start updating inventory for each item used
    for (const item of items) {
      const material = await RawMaterial.findById(item.material);
      if (material) {
        // Find the specific quality/grade
        const qualityIndex = material.qualities.findIndex(q => q.qualityName === item.qualityName);
        if (qualityIndex !== -1) {
          // Deduct the quantity: (totalQuantity of assemblies * 1 unit per assembly)
          // Or if they explicitly sent usedQuantity, use that
          const deductionAmount = item.usedQuantity || totalQuantity;
          material.qualities[qualityIndex].quantity -= deductionAmount;
          
          // Basic check to prevent negative inventory (optional, but good)
          if (material.qualities[qualityIndex].quantity < 0) {
            material.qualities[qualityIndex].quantity = 0;
          }
          
          await material.save();
        }
      }
    }

    const newAssemble = new Assemble({
      assemblyType,
      bike,
      items,
      totalQuantity
    });

    await newAssemble.save();
    res.status(201).json(newAssemble);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assembly logs
router.get('/', async (req, res) => {
  try {
    const logs = await Assemble.find()
      .populate('bike')
      .populate('items.material')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
