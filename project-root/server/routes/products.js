const express = require('express');
const router = express.Router();
const { auth } = require('./auth');

// Mock products database (replace with real database in production)
let products = [
  {
    id: 1,
    name: 'Sample Product 1',
    description: 'This is a sample product description',
    price: 99.99,
    image: 'https://via.placeholder.com/150',
    category: 'electronics',
    stock: 10
  }
];

/**
 * @route   GET api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', (req, res, next) => {
  try {
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', (req, res, next) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST api/products
 * @desc    Create a product
 * @access  Private (Admin only)
 */
router.post('/', auth, (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    // Validate input
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const newProduct = {
      id: products.length + 1,
      name,
      description,
      price: parseFloat(price),
      image: image || 'https://via.placeholder.com/150',
      category,
      stock: parseInt(stock) || 0
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT api/products/:id
 * @desc    Update a product
 * @access  Private (Admin only)
 */
router.put('/:id', auth, (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...req.body,
      id: products[productIndex].id // Ensure ID doesn't change
    };

    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products = products.filter(p => p.id !== parseInt(req.params.id));
    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
