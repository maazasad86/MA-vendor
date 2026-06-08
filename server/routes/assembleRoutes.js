const express = require('express');
const router = express.Router();
const Assemble = require('../models/Assemble');
const RawMaterial = require('../models/RawMaterial');
const Bike = require('../models/Bike');

// Log a new assembly and deduct stock
router.post('/add', async (req, res) => {
  try {
    const { assemblyType, assemblyName, bike: bikeId, items, totalQuantity } = req.body;
    
    // Get bike info for category
    const currentBike = await Bike.findById(bikeId);
    if (!currentBike) return res.status(404).json({ error: 'Bike not found' });
    const bikeCategory = currentBike.category;

    // Start updating inventory for each item used
    for (const item of items) {
      const material = await RawMaterial.findById(item.material);
      if (material) {
        // Find the specific quality/grade
        const qualityIndex = material.qualities.findIndex(q => q.qualityName === item.qualityName);
        if (qualityIndex !== -1) {
          // Deduct the quantity: (totalQuantity of assemblies * 1 unit per assembly)
          const deductionAmount = item.usedQuantity || totalQuantity;
          material.qualities[qualityIndex].quantity -= deductionAmount;
          
          if (material.qualities[qualityIndex].quantity < 0) {
            material.qualities[qualityIndex].quantity = 0;
          }
          
          await material.save();
        }
      }
    }

    // Check for existing assembly with same specs (Category, Type) to potentially merge
    const potentialMatches = await Assemble.find({
      assemblyType,
      bikeCategory
    }).sort({ createdAt: -1 });

    let existingAssemble = null;

    // Find if any existing record has the EXACT SAME items (material + quality)
    for (const record of potentialMatches) {
        if (record.items.length === items.length) {
            const allItemsMatch = items.every(newItem => 
                record.items.some(exItem => 
                    exItem.material.toString() === newItem.material.toString() && 
                    exItem.qualityName === newItem.qualityName
                )
            );
            
            if (allItemsMatch) {
                existingAssemble = record;
                break;
            }
        }
    }

    if (existingAssemble) {
      // Increment total units produced for this merged record
      existingAssemble.totalQuantity += parseInt(totalQuantity);
      
      // Update item quantities within the record as well
      for (const newItem of items) {
          const itemIndex = existingAssemble.items.findIndex(ex => 
            ex.material.toString() === newItem.material.toString() && 
            ex.qualityName === newItem.qualityName
          );
          if (itemIndex !== -1) {
              existingAssemble.items[itemIndex].usedQuantity = 
                (existingAssemble.items[itemIndex].usedQuantity || 0) + (newItem.usedQuantity || totalQuantity);
          }
      }

      // Keep the latest name if provided
      if (assemblyName) existingAssemble.assemblyName = assemblyName;
      
      await existingAssemble.save();
      return res.status(200).json(existingAssemble);
    } else {
      // Create new record
      const newAssemble = new Assemble({
        assemblyType,
        assemblyName,
        bike: bikeId,
        bikeCategory,
        items,
        totalQuantity
      });
      await newAssemble.save();
      return res.status(201).json(newAssemble);
    }
  } catch (err) {
    console.error('Error in assembly merge:', err);
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

// Delete an assembly record and return items to stock
router.delete('/:id', async (req, res) => {
  try {
    const assembly = await Assemble.findById(req.params.id);
    if (!assembly) return res.status(404).json({ error: 'Record not found' });

    // Return materials to stock
    for (const item of assembly.items) {
      const material = await RawMaterial.findById(item.material);
      if (material) {
        const qualityIndex = material.qualities.findIndex(q => q.qualityName === item.qualityName);
        if (qualityIndex !== -1) {
          material.qualities[qualityIndex].quantity += (item.usedQuantity || assembly.totalQuantity);
          await material.save();
        }
      }
    }

    await Assemble.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assembly deleted and stock restored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an assembly record (Reference Name and Quantity)
router.put('/:id', async (req, res) => {
  try {
    const { assemblyName, totalQuantity } = req.body;
    const assembly = await Assemble.findById(req.params.id);
    if (!assembly) return res.status(404).json({ error: 'Record not found' });

    const diff = totalQuantity - assembly.totalQuantity;

    // If quantity changed, adjust stock
    if (diff !== 0) {
      for (const item of assembly.items) {
        const material = await RawMaterial.findById(item.material);
        if (material) {
          const qualityIndex = material.qualities.findIndex(q => q.qualityName === item.qualityName);
          if (qualityIndex !== -1) {
            // If diff > 0 (more assemblies), deduct more stock. If diff < 0 (fewer), return stock.
            material.qualities[qualityIndex].quantity -= diff; 
            await material.save();
            
            // Also update the item's usedQuantity in the record
            item.usedQuantity = (item.usedQuantity || assembly.totalQuantity) + diff;
          }
        }
      }
    }

    assembly.assemblyName = assemblyName;
    assembly.totalQuantity = totalQuantity;
    await assembly.save();

    res.json(assembly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
