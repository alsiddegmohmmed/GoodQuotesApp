const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../lib/mongodb');

router.get('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const quotes = await db.collection('quotes').find({}).toArray();
    if (quotes.length === 0) {
      return res.status(404).json({ message: 'No quotes found' });
    }
    res.status(200).json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
