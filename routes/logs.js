const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');

router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const logsSnapshot = await db.collection('logs').get();
    const logs = [];
    
    logsSnapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Improved endpoint to get response time data
router.get('/response-time', async (req, res) => {
  try {
    const db = getFirestore();
    
    // Add error handling and logging
    console.log('Fetching response time data from Firestore');
    
    const logsSnapshot = await db.collection('logs')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const responseTimes = [];
    
    logsSnapshot.forEach(doc => {
      const data = doc.data();
      // Check if responseTime exists before adding to the array
      if (data.responseTime !== undefined) {
        responseTimes.push({
          timestamp: data.timestamp,
          responseTime: data.responseTime || 0,
          server: data.server || 'server1',
          endpoint: data.path || data.url || 'unknown'
        });
      }
    });

    console.log(`Returning ${responseTimes.length} response time records`);
    res.json(responseTimes);
  } catch (error) {
    console.error('Error fetching response times:', error);
    res.status(500).json({ error: 'Failed to fetch response times', details: error.message });
  }
});

// New endpoint to get request counts by endpoint
router.get('/request-count', async (req, res) => {
  try {
    const db = getFirestore();
    const logsSnapshot = await db.collection('logs').get();
    
    const endpointCounts = {};
    
    logsSnapshot.forEach(doc => {
      const data = doc.data();
      const endpoint = data.path || data.url || 'unknown';
      const server = data.server || 'server1';
      
      if (!endpointCounts[endpoint]) {
        endpointCounts[endpoint] = { server1: 0, server2: 0 };
      }
      
      endpointCounts[endpoint][server]++;
    });
    
    const result = Object.keys(endpointCounts).map(endpoint => ({
      endpoint,
      server1Count: endpointCounts[endpoint].server1,
      server2Count: endpointCounts[endpoint].server2
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching request counts:', error);
    res.status(500).json({ error: 'Failed to fetch request counts' });
  }
});

module.exports = router;