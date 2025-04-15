import { Router } from 'express';
import Amadeus from 'amadeus';
import { default as NodeCache } from 'node-cache';
const cache = new NodeCache();

const router = Router();

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

router.post('/api/flights/search', async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      max
    } = req.body;

    // Validate input
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Origin, destination, and departure date are required'
      });
    }

    // Check cache first
    const cacheKey = `flights:${originLocationCode}:${destinationLocationCode}:${departureDate}`;
    const cachedResults = await cache.get(cacheKey);
    
    if (cachedResults) {
      return res.json({ data: cachedResults });
    }

    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: adults || 1,
      max: max || 10,
      currencyCode: 'USD'
      // Removed 'travelClass' as it is not a valid property in 'FlightSearchParams'
    });

    // Cache the results for 5 minutes
    await cache.set(cacheKey, response.data, 300);

    res.json(response);
  } catch (error) {
    console.error('Amadeus API Error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch flight data',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;

