import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';

// @desc    Get all products
// @route   GET /api/shop/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search, vendor } = req.query;
    const query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (vendor) {
      query.vendor = vendor;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('vendor', 'username name shopName')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/shop/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'username name shopName');

    if (!product || product.status !== 'active') {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product (Vendor)
// @route   POST /api/shop/products
// @access  Private/Vendor
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, images, category, stock, vendorCommission, status } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Please provide name, price, and category' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice,
      images: images || [],
      category,
      stock: stock || 0,
      vendor: req.user._id,
      vendorCommission: vendorCommission || 0,
      ...(req.user?.isAdmin && status ? { status } : {})
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (Vendor)
// @route   PUT /api/shop/products/:id
// @access  Private/Vendor
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendor.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, price, originalPrice, images, category, stock, status } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (images) product.images = images;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (status && req.user.isAdmin) product.status = status;

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to cart
// @route   POST /api/shop/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide product ID and quantity' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart
// @route   GET /api/shop/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.product');

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create order
// @route   POST /api/shop/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;

    if (!paymentMethod || !shippingAddress) {
      return res.status(400).json({ message: 'Please provide payment method and shipping address' });
    }

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        vendor: product.vendor
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'advance' ? 'pending' : 'pending',
      shippingAddress
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/shop/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product')
      .populate('items.vendor', 'username name shopName')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor orders
// @route   GET /api/shop/vendor/orders
// @access  Private/Vendor
export const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      'items.vendor': req.user._id
    })
      .populate('customer', 'username name email whatsapp')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Vendor)
// @route   PUT /api/shop/orders/:id/status
// @access  Private/Vendor
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if vendor owns any item in order
    const vendorItems = order.items.filter(
      item => item.vendor.toString() === req.user._id.toString()
    );

    if (vendorItems.length === 0 && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // If delivered, calculate vendor earnings
    if (orderStatus === 'delivered' && order.paymentStatus === 'paid') {
      let vendorEarnings = 0;
      for (const item of vendorItems) {
        const product = await Product.findById(item.product);
        if (product) {
          const commission = (item.price * item.quantity * product.vendorCommission) / 100;
          vendorEarnings += commission;
        }
      }

      if (vendorEarnings > 0) {
        const vendor = await User.findById(req.user._id);
        vendor.shopEarnings += vendorEarnings;
        vendor.currentBalance += vendorEarnings;
        vendor.totalEarnings += vendorEarnings;
        await vendor.save();

        await Earning.create({
          userId: vendor._id,
          type: 'shop',
          amount: vendorEarnings,
          status: 'approved',
          description: `Vendor commission from order #${order._id}`,
          referenceId: order._id,
          orderId: order._id
        });
      }
    }

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register as vendor
// @route   POST /api/shop/vendor/register
// @access  Private
export const registerVendor = async (req, res) => {
  try {
    const { shopName } = req.body;

    if (!shopName) {
      return res.status(400).json({ message: 'Please provide shop name' });
    }

    const user = await User.findById(req.user._id);
    user.isVendor = true;
    user.shopName = shopName;
    user.shopStatus = 'pending';
    await user.save();

    res.json({ message: 'Vendor registration submitted. Waiting for admin approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (Admin)
// @route   GET /api/shop/admin/products
// @access  Private/Admin
export const getAllProductsAdmin = async (req, res) => {
  try {
    const { category, search, vendor, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (vendor) query.vendor = vendor;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('vendor', 'username name shopName')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/shop/admin/orders
// @access  Private/Admin
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.query;
    const query = {};
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('customer', 'username name email whatsapp')
      .populate('items.product')
      .populate('items.vendor', 'username name shopName')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/shop/products/:id/admin
// @access  Private/Admin
export const deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

