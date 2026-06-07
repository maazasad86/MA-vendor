const mongoose = require('mongoose');

const assembleSchema = new mongoose.Schema({
  assemblyType: {
    type: String,
    enum: ['Front', 'Rear', 'Brake Show'],
    required: true,
  },
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    required: true,
  },
  items: [
    {
      material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
      qualityName: String,
      usedQuantity: Number,
    }
  ],
  totalQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assemble', assembleSchema);