require('dotenv').config();
console.log(process.env.FIREBASE_SERVICE_ACCOUNT); // Add this line to debug

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Middleware
app.use(cors());
app.use(express.json());

// Add response time tracking middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const responseTime = Date.now() - start;
    
    try {
      // Log the request with response time
      const db = getFirestore();
      await db.collection('logs').add({
        path: req.path,
        method: req.method,
        timestamp: new Date(),
        responseTime: responseTime,
        server: 'server1',
        level: 'INFO'
      });
      console.log(`Logged response time for ${req.path}: ${responseTime}ms`);
    } catch (err) {
      console.error('Error logging response time:', err);
    }
  });
  
  next();
});

// Rate limiting - 100 requests per 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/info', require('./routes/info'));
app.use('/api/logs', require('./routes/logs'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});