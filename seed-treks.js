// Direct MongoDB insertion script for sample trek data
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/athithya')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Post Schema (simplified - should match your actual schema)
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, required: true },
  postType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: {
    days: Number,
    nights: Number
  },
  difficulty: String,
  isFeatured: Boolean,
  location: {
    city: String,
    state: String,
    country: String
  },
  price: {
    perPerson: Number,
    currency: String,
    period: String
  },
  capacity: {
    maxPeople: Number
  },
  amenities: [String],
  categories: [String],
  photos: [{
    url: String,
    public_id: String,
    resource_type: String
  }],
  status: { type: String, default: 'active' }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  role: String
}));

// Sample images URLs (using placeholder/free images)
const trekImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',  // Mountain
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',  // Snow trek
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',  // Mountain peak
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',  // Valley
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',  // Mountain trail
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800',  // Himalayas
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',  // Trek
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'   // Summit
];

const treks = [
  {
    postType: 'trek',
    title: 'Kedarkantha Summit Trek',
    description: 'Experience the breathtaking Kedarkantha trek through pristine snow-covered trails and pine forests. Perfect for beginners and intermediate trekkers seeking an unforgettable Himalayan adventure with stunning 360-degree mountain views.',
    duration: { days: 5, nights: 4 },
    difficulty: 'Easy-Moderate',
    isFeatured: true,
    location: { 
      city: 'Sankri', 
      state: 'Uttarakhand', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [78.3894, 31.0480] }
    },
    price: { perPerson: 7999, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 15 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'First Aid Kit'],
    categories: ['Adventure', 'Mountain', 'Snow', 'Trekking'],
    status: 'active',
    photos: [{ url: trekImages[0], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Valley of Flowers Trek',
    description: 'Discover the UNESCO World Heritage site Valley of Flowers, a spectacular high-altitude valley filled with endemic alpine flowers and diverse flora. A must-visit destination for nature lovers and photography enthusiasts.',
    duration: { days: 6, nights: 5 },
    difficulty: 'Moderate',
    isFeatured: true,
    location: { 
      city: 'Joshimath', 
      state: 'Uttarakhand', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [79.5636, 30.5569] }
    },
    price: { perPerson: 10499, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 12 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'Photography Guide'],
    categories: ['Nature', 'Mountain', 'Flora', 'UNESCO Site'],
    status: 'active',
    photos: [{ url: trekImages[1], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Hampta Pass Trek',
    description: 'Cross the stunning Hampta Pass connecting the lush green Kullu Valley with the barren Lahaul Valley. Experience dramatic landscape changes, river crossings, and camping under star-studded skies.',
    duration: { days: 5, nights: 4 },
    difficulty: 'Moderate',
    isFeatured: true,
    location: { 
      city: 'Manali', 
      state: 'Himachal Pradesh', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [77.1892, 32.2396] }
    },
    price: { perPerson: 9299, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 18 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'River Crossing Equipment'],
    categories: ['Adventure', 'Mountain', 'High Altitude', 'Camping'],
    status: 'active',
    photos: [{ url: trekImages[2], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Triund Trek',
    description: 'A perfect weekend getaway trek offering panoramic views of the Dhauladhar ranges. Ideal for beginners with a well-marked trail through oak and rhododendron forests leading to a stunning ridge-top campsite.',
    duration: { days: 2, nights: 1 },
    difficulty: 'Easy',
    isFeatured: false,
    location: { 
      city: 'McLeod Ganj', 
      state: 'Himachal Pradesh', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [76.3200, 32.2478] }
    },
    price: { perPerson: 2499, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 25 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service'],
    categories: ['Beginner Friendly', 'Weekend Trek', 'Mountain Views'],
    status: 'active',
    photos: [{ url: trekImages[3], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Har Ki Dun Trek',
    description: 'Trek through the cradle of gods in this stunning valley trek. Experience ancient villages, mythological significance, and spectacular views of Swargarohini peak. Rich in culture and natural beauty.',
    duration: { days: 7, nights: 6 },
    difficulty: 'Moderate',
    isFeatured: true,
    location: { 
      city: 'Sankri', 
      state: 'Uttarakhand', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [78.3894, 31.0480] }
    },
    price: { perPerson: 12999, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 15 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'Cultural Guide', 'Porter Service'],
    categories: ['Cultural Trek', 'Mountain', 'Long Trek', 'Valley Trek'],
    status: 'active',
    photos: [{ url: trekImages[4], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Chopta Chandrashila Trek',
    description: 'Summit the Chandrashila peak at 13,000 feet offering 360-degree views of major Himalayan peaks. Visit the sacred Tungnath temple, the highest Shiva temple in the world, on this spiritually enriching trek.',
    duration: { days: 4, nights: 3 },
    difficulty: 'Easy-Moderate',
    isFeatured: false,
    location: { 
      city: 'Chopta', 
      state: 'Uttarakhand', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [79.0317, 30.4679] }
    },
    price: { perPerson: 6999, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 20 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'Temple Visit'],
    categories: ['Spiritual', 'Mountain', 'Summit Trek', 'Moderate'],
    status: 'active',
    photos: [{ url: trekImages[5], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Nag Tibba Trek',
    description: 'The Serpent\'s Peak - a perfect weekend trek from Delhi offering stunning views of Himalayan ranges. Experience snow-clad peaks (in winter), camping under stars, and breathtaking sunrise views.',
    duration: { days: 2, nights: 1 },
    difficulty: 'Easy',
    isFeatured: false,
    location: { 
      city: 'Pantwari', 
      state: 'Uttarakhand', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [78.0996, 30.5645] }
    },
    price: { perPerson: 3499, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 30 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'Bonfire'],
    categories: ['Weekend Trek', 'Beginner Friendly', 'Snow Trek (Winter)'],
    status: 'active',
    photos: [{ url: trekImages[6], public_id: 'sample', resource_type: 'image' }]
  },
  {
    postType: 'trek',
    title: 'Brahmatal Trek',
    description: 'A winter wonderland trek offering pristine snow trails, frozen Brahmatal lake, and stunning views of Mt. Trishul and Nanda Ghunti. Perfect for those seeking a true winter Himalayan experience.',
    duration: { days: 6, nights: 5 },
    difficulty: 'Moderate',
    isFeatured: true,
    location: { 
      city: 'Lohajung', 
      state: 'Uttarakhand', 
      country: 'India',
      coordinates: { type: 'Point', coordinates: [79.6833, 30.1167] }
    },
    price: { perPerson: 11499, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 12 },
    amenities: ['Winter Camping Equipment', 'Meals Included', 'Guide Service', 'Snow Gear', 'Crampons'],
    categories: ['Winter Trek', 'Snow Trek', 'High Altitude', 'Lake Trek'],
    status: 'active',
    photos: [{ url: trekImages[7], public_id: 'sample', resource_type: 'image' }]
  }
];

async function seedDatabase() {
  try {
    // Find or create host user
    console.log('\x1b[36m%s\x1b[0m', 'Step 1: Finding/Creating host user...');
    let hostUser = await User.findOne({ email: 'rajesh.host@example.com' });
    
    if (!hostUser) {
      const bcrypt = require('bcrypt');
      hostUser = await User.create({
        firstname: 'Rajesh',
        lastname: 'Kumar',
        email: 'rajesh.host@example.com',
        password: await bcrypt.hash('Test@123456', 10),
        role: 'host'
      });
      console.log('\x1b[32m%s\x1b[0m', '✓ Host user created');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '✓ Host user already exists');
    }

    // Insert treks
    console.log('\n\x1b[36m%s\x1b[0m', 'Step 2: Inserting trek posts...');
    let createdCount = 0;

    for (const trek of treks) {
      const existingTrek = await Post.findOne({ title: trek.title });
      if (!existingTrek) {
        await Post.create({
          ...trek,
          user: hostUser._id,
          userRole: 'host'
        });
        createdCount++;
        console.log('\x1b[32m%s\x1b[0m', `  ✓ Created: ${trek.title}`);
      } else {
        console.log('\x1b[33m%s\x1b[0m', `  ○ Already exists: ${trek.title}`);
      }
    }

    console.log('\n\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[36m%s\x1b[0m', 'Summary:');
    console.log('\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[32m%s\x1b[0m', `New treks created: ${createdCount}/${treks.length}`);
    console.log('\n\x1b[33m%s\x1b[0m', 'You can now view the treks in your frontend at http://localhost:5173');
    console.log('\x1b[33m%s\x1b[0m', 'Backend API: http://localhost:3000/api/posts');
    
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
