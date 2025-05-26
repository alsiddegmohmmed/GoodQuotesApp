require('dotenv').config();
const express = require('express');
const cors = require('cors');
const quotesRoute = require('./routes/quotes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quotes', quotesRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
