const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ['Ready to Sale', 'Raw Material'], required: true },
    name: String,
    qualityName: String,
    quantity: Number,
    price: Number, // Future proofing
  }],
  totalAmount: { type: Number, required: true },
  receivedAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 }, // Udhaar
  paymentMethod: { type: String, enum: ['Cash', 'Online'], default: 'Cash' },
  customerName: { type: String, default: 'Walking Customer' },
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike' },
  bikeName: String,
  saleDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
