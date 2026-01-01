// Script to check and update existing treks with coordinates
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/athithya')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));

// Trek coordinates mapping
const trekCoordinates = {
  'Kedarkantha Summit Trek': { type: 'Point', coordinates: [78.3894, 31.0480] },
  'Valley of Flowers Trek': { type: 'Point', coordinates: [79.5636, 30.5569] },
  'Hampta Pass Trek': { type: 'Point', coordinates: [77.1892, 32.2396] },
  'Triund Trek': { type: 'Point', coordinates: [76.3200, 32.2478] },
  'Har Ki Dun Trek': { type: 'Point', coordinates: [78.3894, 31.0480] },
  'Chopta Chandrashila Trek': { type: 'Point', coordinates: [79.0317, 30.4679] },
  'Nag Tibba Trek': { type: 'Point', coordinates: [78.0996, 30.5645] },
  'Brahmatal Trek': { type: 'Point', coordinates: [79.6833, 30.1167] }
};

async function updateTrekCoordinates() {
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Checking and updating trek coordinates...\n');

    // First, check existing treks
    const treks = await Post.find({ postType: 'trek' }).select('title location');
    
    console.log('\x1b[36m%s\x1b[0m', `Found ${treks.length} treks in database\n`);

    let updatedCount = 0;
    let alreadyHaveCoords = 0;

    for (const trek of treks) {
      const coords = trekCoordinates[trek.title];
      
      if (!coords) {
        console.log('\x1b[33m%s\x1b[0m', `⚠ No coordinates defined for: ${trek.title}`);
        continue;
      }

      // Check if coordinates already exist
      if (trek.location?.coordinates?.coordinates && 
          trek.location.coordinates.coordinates.length === 2) {
        console.log('\x1b[32m%s\x1b[0m', `✓ ${trek.title} - Already has coordinates`);
        alreadyHaveCoords++;
      } else {
        // Update with coordinates
        await Post.updateOne(
          { _id: trek._id },
          { 
            $set: { 
              'location.coordinates': coords
            } 
          }
        );
        console.log('\x1b[32m%s\x1b[0m', `✓ ${trek.title} - Updated with coordinates [${coords.coordinates[0]}, ${coords.coordinates[1]}]`);
        updatedCount++;
      }
    }

    console.log('\n\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[36m%s\x1b[0m', 'Summary:');
    console.log('\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[32m%s\x1b[0m', `Treks already with coordinates: ${alreadyHaveCoords}`);
    console.log('\x1b[32m%s\x1b[0m', `Treks updated: ${updatedCount}`);
    console.log('\x1b[32m%s\x1b[0m', `Total treks: ${treks.length}`);

    // Verify all treks now have coordinates
    const treksWithCoords = await Post.countDocuments({ 
      postType: 'trek',
      'location.coordinates.coordinates': { $exists: true, $ne: [] }
    });

    console.log('\n\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[36m%s\x1b[0m', 'Verification:');
    console.log('\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[32m%s\x1b[0m', `Treks with valid coordinates: ${treksWithCoords}/${treks.length}`);

    if (treksWithCoords === treks.length) {
      console.log('\n\x1b[32m%s\x1b[0m', '✅ All treks now have location coordinates!');
      console.log('\x1b[33m%s\x1b[0m', '\nYou can now test the nearby treks API:');
      console.log('\x1b[33m%s\x1b[0m', 'GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000');
    } else {
      console.log('\n\x1b[31m%s\x1b[0m', '⚠ Some treks are missing coordinates');
    }

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error:', error.message);
    process.exit(1);
  }
}

updateTrekCoordinates();
