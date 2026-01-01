// Node.js script to add sample review data
const axios = require('axios');

const baseUrl = 'http://localhost:3000/api';

async function addReviewsData() {
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Step 1: Creating guest users...');
    
    // Create multiple guest users
    const guests = [];
    const guestData = [
      { firstname: 'Amit', lastname: 'Sharma', email: 'amit.guest@example.com', password: 'Test@123456', role: 'guest' },
      { firstname: 'Priya', lastname: 'Singh', email: 'priya.guest@example.com', password: 'Test@123456', role: 'guest' },
      { firstname: 'Rahul', lastname: 'Verma', email: 'rahul.guest@example.com', password: 'Test@123456', role: 'guest' },
      { firstname: 'Neha', lastname: 'Patel', email: 'neha.guest@example.com', password: 'Test@123456', role: 'guest' }
    ];

    for (const guestInfo of guestData) {
      try {
        await axios.post(`${baseUrl}/auth/signup`, guestInfo);
        console.log('\x1b[90m%s\x1b[0m', `  ✓ Created guest: ${guestInfo.firstname}`);
      } catch (error) {
        // User might already exist
        console.log('\x1b[90m%s\x1b[0m', `  • Guest exists: ${guestInfo.firstname}`);
      }
      
      // Sign in to get token
      const signinResponse = await axios.post(`${baseUrl}/auth/signin`, {
        email: guestInfo.email,
        password: guestInfo.password
      });
      
      guests.push({
        ...guestInfo,
        token: signinResponse.data.token
      });
    }
    
    console.log('\x1b[32m%s\x1b[0m', `✓ ${guests.length} guest users ready`);

    // Get all treks first
    console.log('\n\x1b[36m%s\x1b[0m', 'Step 2: Fetching treks...');
    const treksResponse = await axios.get(`${baseUrl}/posts?postType=trek&limit=10`);
    const treks = treksResponse.data.posts;
    console.log('\x1b[32m%s\x1b[0m', `✓ Found ${treks.length} treks`);

    if (treks.length === 0) {
      console.log('\x1b[31m%s\x1b[0m', '✗ No treks found. Please run add-sample-data.js first.');
      return;
    }

    // Get the host ID from the first trek
    const hostId = treks[0].user._id || treks[0].user;
    console.log('\x1b[32m%s\x1b[0m', `✓ Using host ID: ${hostId}`);

    // Create reviews for each trek
    console.log('\n\x1b[36m%s\x1b[0m', 'Step 3: Creating sample reviews...');
    let reviewCount = 0;

    const reviewTexts = [
      {
        rating: 5,
        comment: "Absolutely amazing experience! The trek was well-organized and the views were breathtaking. Highly recommend to everyone!"
      },
      {
        rating: 5,
        comment: "One of the best treks I've ever done. The guide was knowledgeable and the entire team was very professional."
      },
      {
        rating: 4,
        comment: "Great trek with stunning scenery. The only minor issue was the weather, but that's nature! Overall, fantastic experience."
      },
      {
        rating: 5,
        comment: "Perfect for adventure enthusiasts! The trek exceeded all my expectations. Will definitely book again."
      },
      {
        rating: 4,
        comment: "Really enjoyed this trek. Good value for money and the camping arrangements were excellent."
      },
      {
        rating: 5,
        comment: "This was my first Himalayan trek and it was incredible! The team made sure everyone was safe and comfortable."
      },
      {
        rating: 4,
        comment: "Beautiful trails and amazing landscapes. Would recommend proper fitness preparation before attempting this trek."
      },
      {
        rating: 5,
        comment: "An unforgettable adventure! The summit views were worth every step. Thank you to the amazing team!"
      }
    ];

    // Add 3-5 reviews for each trek using different guest users
    for (const trek of treks) {
      const numReviews = Math.floor(Math.random() * 3) + 3; // 3 to 5 reviews per trek
      
      for (let i = 0; i < numReviews; i++) {
        const review = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        const guest = guests[i % guests.length]; // Rotate through guests
        
        try {
          await axios.post(`${baseUrl}/reviews`, {
            hostId: hostId,
            postId: trek._id,
            rating: review.rating,
            comment: review.comment
          }, {
            headers: { Authorization: `Bearer ${guest.token}` }
          });
          
          reviewCount++;
          console.log('\x1b[90m%s\x1b[0m', `  ✓ Added review for: ${trek.title}`);
        } catch (error) {
          console.log('\x1b[31m%s\x1b[0m', `  ✗ Failed to add review for: ${trek.title}`);
          if (error.response?.data) {
            console.log('\x1b[31m%s\x1b[0m', `    Error: ${error.response.data.message || error.message}`);
          }
        }
      }
    }

    console.log('\n\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[36m%s\x1b[0m', 'Summary:');
    console.log('\x1b[36m%s\x1b[0m', '==================================');
    console.log('\x1b[32m%s\x1b[0m', `Total reviews created: ${reviewCount}`);
    console.log('\x1b[32m%s\x1b[0m', `Treks reviewed: ${treks.length}`);
    console.log('\n\x1b[33m%s\x1b[0m', 'You can now view top-rated treks at:');
    console.log('\x1b[33m%s\x1b[0m', 'Backend API: http://localhost:3000/api/posts/top-rated/treks');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('\x1b[31m%s\x1b[0m', 'Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

addReviewsData();
