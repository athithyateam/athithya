// Node.js script to add sample service data
const axios = require('axios');

const baseUrl = 'http://localhost:3000/api';

// Sample services data
const services = [
  {
    postType: 'service',
    title: 'Himalayan Trek Guide Service',
    description: 'Professional and certified trek guide service for all major Himalayan treks. Our experienced guides ensure your safety and provide deep knowledge about local culture, flora, and fauna. Available for custom itineraries.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Rishikesh', 
      state: 'Uttarakhand', 
      country: 'India',
      meetingPoint: 'Rishikesh Adventure Hub',
      coordinates: { type: 'Point', coordinates: [78.2676, 30.0869] }
    },
    price: { perPerson: 1500, currency: 'INR', period: 'day' },
    capacity: { maxPeople: 10 },
    amenities: ['Certified Guide', 'First Aid Kit', 'Communication Device', 'Local Knowledge'],
    categories: ['Adventure', 'Mountain'],
    isFeatured: true,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'Camping Equipment Rental',
    description: 'High-quality camping equipment rental service including tents, sleeping bags, backpacks, and trekking poles. All equipment is regularly maintained and sanitized. Delivery and pickup available in major cities.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Manali', 
      state: 'Himachal Pradesh', 
      country: 'India',
      meetingPoint: 'Manali Mall Road',
      coordinates: { type: 'Point', coordinates: [77.1892, 32.2396] }
    },
    price: { perPerson: 500, currency: 'INR', period: 'day' },
    capacity: { maxPeople: 50 },
    amenities: ['Tent', 'Sleeping Bag', 'Backpack', 'Trekking Poles', 'Sanitized Equipment'],
    categories: ['Camping', 'Budget'],
    isFeatured: true,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'Wildlife Safari Photography Guide',
    description: 'Expert wildlife photography guide service for safaris and nature trails. Learn the best techniques for capturing stunning wildlife moments. Equipment advice and post-processing tips included.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Jim Corbett', 
      state: 'Uttarakhand', 
      country: 'India',
      meetingPoint: 'Corbett National Park Gate',
      coordinates: { type: 'Point', coordinates: [78.7808, 29.5305] }
    },
    price: { perPerson: 3000, currency: 'INR', period: 'day' },
    capacity: { maxPeople: 5 },
    amenities: ['Photography Guide', 'Wildlife Expert', 'Safety Equipment', 'Park Permits Assistance'],
    categories: ['Wildlife', 'Photography', 'Nature'],
    isFeatured: true,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'Yoga & Meditation Retreat',
    description: 'Authentic yoga and meditation sessions by certified instructors in serene Himalayan settings. Perfect for spiritual seekers and wellness enthusiasts. Includes pranayama, asanas, and guided meditation.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Rishikesh', 
      state: 'Uttarakhand', 
      country: 'India',
      meetingPoint: 'Parmarth Niketan Ashram',
      coordinates: { type: 'Point', coordinates: [78.2676, 30.0869] }
    },
    price: { perPerson: 1200, currency: 'INR', period: 'day' },
    capacity: { maxPeople: 20 },
    amenities: ['Certified Instructor', 'Yoga Mats', 'Meditation Hall', 'Herbal Tea'],
    categories: ['Spiritual', 'Nature'],
    isFeatured: false,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'River Rafting Adventure',
    description: 'Thrilling white water rafting experience on the Ganges. Professional instructors and safety equipment provided. Suitable for beginners and experienced rafters. Includes safety briefing and photos.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Rishikesh', 
      state: 'Uttarakhand', 
      country: 'India',
      meetingPoint: 'Shivpuri Rafting Point',
      coordinates: { type: 'Point', coordinates: [78.3535, 30.1470] }
    },
    price: { perPerson: 800, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 30 },
    amenities: ['Safety Equipment', 'Life Jackets', 'Helmets', 'Professional Guide', 'Photos'],
    categories: ['Adventure', 'Nature'],
    isFeatured: true,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'Mountain Bike Rental & Tours',
    description: 'Premium mountain bike rental with guided tours through scenic mountain trails. All skill levels welcome. Bikes maintained to highest standards with helmet and safety gear included.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Manali', 
      state: 'Himachal Pradesh', 
      country: 'India',
      meetingPoint: 'Old Manali Square',
      coordinates: { type: 'Point', coordinates: [77.1892, 32.2396] }
    },
    price: { perPerson: 1000, currency: 'INR', period: 'day' },
    capacity: { maxPeople: 15 },
    amenities: ['Mountain Bike', 'Helmet', 'Safety Gear', 'Guide', 'Repair Kit'],
    categories: ['Adventure', 'Mountain'],
    isFeatured: false,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'Cultural Heritage Tours',
    description: 'Guided tours of ancient temples, monasteries, and historical sites. Learn about local culture, traditions, and history from expert local guides. Includes temple visits and cultural interactions.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'McLeod Ganj', 
      state: 'Himachal Pradesh', 
      country: 'India',
      meetingPoint: 'Dalai Lama Temple Complex',
      coordinates: { type: 'Point', coordinates: [76.3200, 32.2478] }
    },
    price: { perPerson: 1500, currency: 'INR', period: 'day' },
    capacity: { maxPeople: 12 },
    amenities: ['Cultural Guide', 'Temple Access', 'Historical Insights', 'Photo Opportunities'],
    categories: ['Cultural', 'Spiritual', 'Historical'],
    isFeatured: false,
    status: 'active'
  },
  {
    postType: 'service',
    title: 'Paragliding Experience',
    description: 'Breathtaking paragliding experience over the Himalayas with certified pilots. Enjoy bird\'s eye views of valleys and mountains. Perfect for adventure seekers. Photos and videos included.',
    duration: { days: 1, nights: 0 },
    location: { 
      city: 'Bir Billing', 
      state: 'Himachal Pradesh', 
      country: 'India',
      meetingPoint: 'Bir Landing Site',
      coordinates: { type: 'Point', coordinates: [76.7289, 32.0500] }
    },
    price: { perPerson: 2500, currency: 'INR', period: 'person' },
    capacity: { maxPeople: 20 },
    amenities: ['Certified Pilot', 'Safety Equipment', 'Insurance', 'Photos & Videos', 'Certificate'],
    categories: ['Adventure', 'Mountain'],
    isFeatured: true,
    status: 'active'
  }
];

async function addServicesData() {
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Step 1: Signing in...');
    
    // Sign in to get token (use existing host user)
    const signinResponse = await axios.post(`${baseUrl}/auth/signin`, {
      email: 'rajesh.host@example.com',
      password: 'Test@123456'
    });

    const token = signinResponse.data.token;
    console.log('\x1b[32m%s\x1b[0m', '✓ Signed in successfully');
    console.log('\x1b[90m%s\x1b[0m', `Token: ${token.substring(0, 20)}...`);

    // Create service posts
    console.log('\n\x1b[36m%s\x1b[0m', 'Step 2: Creating sample service posts...');
    let createdCount = 0;

    for (const service of services) {
      try {
        await axios.post(`${baseUrl}/posts/services`, service, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createdCount++;
        console.log('\x1b[32m%s\x1b[0m', `  ✓ Created: ${service.title}`);
      } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `  ✗ Failed to create: ${service.title}`);
        console.log('\x1b[31m%s\x1b[0m', `    Error: ${error.response?.data?.message || error.message}`);
        if (error.response?.data) {
          console.log('\x1b[31m%s\x1b[0m', `    Details:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    console.log('\n\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[36m%s\x1b[0m', 'Summary:');
    console.log('\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[32m%s\x1b[0m', `Total services created: ${createdCount}/${services.length}`);
    console.log('\n\x1b[33m%s\x1b[0m', 'You can now view the services at:');
    console.log('\x1b[33m%s\x1b[0m', 'Backend API: http://localhost:3000/api/posts/services');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

addServicesData();
