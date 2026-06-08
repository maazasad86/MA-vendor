const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const RawMaterial = require('../models/RawMaterial');
const Assemble = require('../models/Assemble');

// Record a new sale
router.post('/add', async (req, res) => {
  try {
    const { items, totalAmount, receivedAmount, paymentMethod, customerName, bikeId, bikeName } = req.body;
    
    const dueAmount = totalAmount - receivedAmount;

    // Deduct stock for each item in the sale
    for (const item of items) {
      if (item.itemType === 'Raw Material') {
        const material = await RawMaterial.findById(item.itemId);
        if (material) {
          const qIndex = material.qualities.findIndex(q => q.qualityName === item.qualityName);
          if (qIndex !== -1) {
            material.qualities[qIndex].quantity -= item.quantity;
            await material.save();
          }
        }
      } else if (item.itemType === 'Ready to Sale') {
        const assembly = await Assemble.findById(item.itemId);
        if (assembly) {
          assembly.totalQuantity -= item.quantity;
          await assembly.save();
        }
      }
    }

    const newSale = new Sale({
      items,
      totalAmount,
      receivedAmount,
      dueAmount: dueAmount > 0 ? dueAmount : 0,
      paymentMethod,
      customerName,
      bikeId,
      bikeName
    });

    await newSale.save();
    res.status(201).json(newSale);
  } catch (err) {
    console.error('Error in sale route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all sales (with filters support potentially)
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ saleDate: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
