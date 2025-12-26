import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorCommission: {
    type: Number,
    default: 0 // percentage
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;

