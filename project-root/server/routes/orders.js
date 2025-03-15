const express = require('express');
const router = express.Router();
const { auth } = require('./auth');

// Mock orders database (replace with real database in production)
let orders = [];

/**
 * @route   POST api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', auth, (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate input
    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide all required order details' });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
      id: orders.length + 1,
      userId: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET api/orders
 * @desc    Get all orders (admin) or user orders
 * @access  Private
 */
router.get('/', auth, (req, res, next) => {
  try {
    // If admin, return all orders
    if (req.user.role === 'admin') {
      return res.json(orders);
    }

    // For regular users, return only their orders
    const userOrders = orders.filter(order => order.userId === req.user.id);
    res.json(userOrders);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', auth, (req, res, next) => {
  try {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT api/orders/:id
 * @desc    Update order status (admin only)
 * @access  Private (Admin only)
 */
router.put('/:id', auth, (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update only allowed fields (status)
    const updatedOrder = {
      ...orders[orderIndex],
      status: req.body.status || orders[orderIndex].status,
      updatedAt: new Date()
    };

    orders[orderIndex] = updatedOrder;
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE api/orders/:id
 * @desc    Cancel order (admin only)
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Instead of deleting, mark as cancelled
    orders[orderIndex] = {
      ...orders[orderIndex],
      status: 'cancelled',
      updatedAt: new Date()
    };

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
