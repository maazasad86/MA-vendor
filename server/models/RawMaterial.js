const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    required: true,
  },
  image: {
    type: String,
  },
  qualities: [
    {
      qualityName: { type: String, required: true },
      quantity: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
      alertThreshold: { type: Number, default: 10 },
    }
  ],
  partType: {
    type: String,
    enum: ['Front', 'Rear', 'Brake Show', 'None'],
    default: 'None',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
