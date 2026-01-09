const express = require('express');
const router = express.Router();

// GET route
router.get('/', (req, res) => {
  res.json({ message: 'Hello from route!' });
});

// POST route
router.post('/', (req, res) => {
  res.json({ message: 'POST request received', data: req.body });
});

module.exports = router;
