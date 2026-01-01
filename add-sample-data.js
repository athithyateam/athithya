// Node.js script to add sample trek data
const axios = require('axios');

const baseUrl = 'http://localhost:3000/api';

// Sample trek data
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
      coordinates: { type: 'Point', coordinates: [78.3894, 31.0480] } // [longitude, latitude]
    },
    price: { perPerson: 7999, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 15 },
    amenities: ['Camping Equipment', 'Meals Included', 'Guide Service', 'First Aid Kit'],
    categories: ['Adventure', 'Mountain', 'Snow', 'Camping'],
    status: 'active'
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
    categories: ['Nature', 'Mountain', 'Photography', 'Pilgrimage'],
    status: 'active'
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
    categories: ['Adventure', 'Mountain', 'Camping', 'Backpacking'],
    status: 'active'
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
    categories: ['Budget', 'Mountain', 'Camping'],
    status: 'active'
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
    categories: ['Cultural', 'Mountain', 'Nature', 'Camping'],
    status: 'active'
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
    categories: ['Spiritual', 'Mountain', 'Pilgrimage', 'Camping'],
    status: 'active'
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
    categories: ['Budget', 'Mountain', 'Snow'],
    status: 'active'
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
    categories: ['Adventure', 'Snow', 'Mountain', 'Camping'],
    status: 'active'
  }
];

async function addSampleData() {
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Step 1: Creating host user...');
    
    // Register host user
    const registerData = {
      firstname: 'Rajesh',
      lastname: 'Kumar',
      email: 'rajesh.host@example.com',
      password: 'Test@123456',
      role: 'host'
    };

    try {
      await axios.post(`${baseUrl}/auth/signup`, registerData);
      console.log('\x1b[32m%s\x1b[0m', '✓ Host user created successfully');
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', 'Note: User might already exist, trying to sign in...');
    }

    // Sign in to get token
    console.log('\n\x1b[36m%s\x1b[0m', 'Step 2: Signing in...');
    const signinResponse = await axios.post(`${baseUrl}/auth/signin`, {
      email: 'rajesh.host@example.com',
      password: 'Test@123456'
    });

    const token = signinResponse.data.token;
    console.log('\x1b[32m%s\x1b[0m', '✓ Signed in successfully');
    console.log('\x1b[90m%s\x1b[0m', `Token: ${token.substring(0, 20)}...`);

    // Create trek posts
    console.log('\n\x1b[36m%s\x1b[0m', 'Step 3: Creating sample trek posts...');
    let createdCount = 0;

    for (const trek of treks) {
      try {
        await axios.post(`${baseUrl}/posts`, trek, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createdCount++;
        console.log('\x1b[32m%s\x1b[0m', `  ✓ Created: ${trek.title}`);
      } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `  ✗ Failed to create: ${trek.title}`);
        console.log('\x1b[31m%s\x1b[0m', `    Error: ${error.response?.data?.message || error.message}`);
        if (error.response?.data) {
          console.log('\x1b[31m%s\x1b[0m', `    Details:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    console.log('\n\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[36m%s\x1b[0m', 'Summary:');
    console.log('\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[32m%s\x1b[0m', `Total treks created: ${createdCount}/${treks.length}`);
    console.log('\n\x1b[33m%s\x1b[0m', 'You can now view the treks in your frontend at http://localhost:5173');
    console.log('\x1b[33m%s\x1b[0m', 'Backend API: http://localhost:3000/api/posts');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

addSampleData();
