// Test script for Nearby Treks API
const axios = require('axios');

const baseUrl = 'http://localhost:3000/api';

// Test locations
const testLocations = [
  {
    name: 'Dehradun, Uttarakhand',
    latitude: 30.3165,
    longitude: 78.0322,
    description: 'Central location - should find treks at various distances'
  },
  {
    name: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    description: 'Capital city - popular starting point for treks'
  },
  {
    name: 'Manali, Himachal Pradesh',
    latitude: 32.2396,
    longitude: 77.1892,
    description: 'Mountain town - should find nearby Hampta Pass'
  }
];

// Test configurations
const tests = [
  {
    name: 'Find treks within 50km (Nearest)',
    maxDistance: 50000,
    limit: 10
  },
  {
    name: 'Find treks within 100km (Medium)',
    maxDistance: 100000,
    limit: 10
  },
  {
    name: 'Find all treks within 300km (All)',
    maxDistance: 300000,
    limit: 20
  },
  {
    name: 'Easy treks within 100km',
    maxDistance: 100000,
    difficulty: 'Easy',
    limit: 10
  },
  {
    name: 'Budget treks (under ₹10,000) within 200km',
    maxDistance: 200000,
    maxPrice: 10000,
    limit: 10
  }
];

async function testNearbyTreks() {
  console.log('\x1b[36m%s\x1b[0m', '🗺️  NEARBY TREKS API TEST');
  console.log('\x1b[36m%s\x1b[0m', '='.repeat(80));
  console.log('');

  for (const location of testLocations) {
    console.log('\x1b[33m%s\x1b[0m', `\n📍 Testing from: ${location.name}`);
    console.log('\x1b[90m%s\x1b[0m', `   ${location.description}`);
    console.log('\x1b[90m%s\x1b[0m', `   Coordinates: ${location.latitude}, ${location.longitude}`);
    console.log('');

    for (const test of tests) {
      try {
        // Build query parameters
        const params = {
          latitude: location.latitude,
          longitude: location.longitude,
          maxDistance: test.maxDistance,
          limit: test.limit
        };

        if (test.difficulty) params.difficulty = test.difficulty;
        if (test.maxPrice) params.maxPrice = test.maxPrice;
        if (test.categories) params.categories = test.categories;

        // Make API request
        const response = await axios.get(`${baseUrl}/posts/nearby/treks`, { params });
        const { success, count, treks } = response.data;

        if (success) {
          console.log('\x1b[32m%s\x1b[0m', `  ✓ ${test.name}`);
          console.log('\x1b[90m%s\x1b[0m', `    Found: ${count} treks`);
          
          if (count > 0) {
            console.log('\x1b[90m%s\x1b[0m', '    Results (sorted by distance):');
            treks.forEach((trek, index) => {
              const distance = trek.distance ? `${trek.distance} km` : 'N/A';
              const price = trek.price?.perPerson ? `₹${trek.price.perPerson}` : 'N/A';
              console.log(
                '\x1b[90m%s\x1b[0m', 
                `      ${index + 1}. ${trek.title.padEnd(30)} - ${distance.padEnd(10)} - ${price}`
              );
            });
          }
          console.log('');
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log('\x1b[31m%s\x1b[0m', '  ✗ Server is not running!');
          console.log('\x1b[33m%s\x1b[0m', '    Please start the server: npm start');
          console.log('');
          return;
        }
        console.log('\x1b[31m%s\x1b[0m', `  ✗ ${test.name}`);
        console.log('\x1b[31m%s\x1b[0m', `    Error: ${error.response?.data?.message || error.message}`);
        console.log('');
      }
    }

    console.log('\x1b[36m%s\x1b[0m', '-'.repeat(80));
  }

  console.log('\n\x1b[32m%s\x1b[0m', '✅ Testing Complete!');
  console.log('\x1b[33m%s\x1b[0m', '\n💡 Tips:');
  console.log('\x1b[33m%s\x1b[0m', '   - Treks are sorted by distance (nearest first)');
  console.log('\x1b[33m%s\x1b[0m', '   - Use maxDistance to control search radius');
  console.log('\x1b[33m%s\x1b[0m', '   - Combine filters: difficulty, price, categories');
  console.log('\x1b[33m%s\x1b[0m', '   - Distance is calculated using Haversine formula');
  console.log('');
}

// Run tests
testNearbyTreks().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', 'Test failed:', error.message);
  process.exit(1);
});
