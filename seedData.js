// Seed data for Featured Treks & Experiences
// Run this after creating a host user account

const featuredTreks = [
  {
    postType: "trek",
    title: "Kedarkantha Summit Trek",
    description: "Experience the magical winter wonderland of Kedarkantha. This trek offers stunning views of snow-capped Himalayan peaks, pristine pine forests, and the rewarding summit climb. Perfect for beginners and experienced trekkers alike.",
    duration: {
      days: 5,
      nights: 4
    },
    difficulty: "Easy-Moderate",
    isFeatured: true,
    location: {
      city: "Sankri",
      state: "Uttarakhand",
      country: "India"
    },
    price: {
      perPerson: 7999,
      currency: "INR",
      period: "person"
    },
    capacity: {
      maxPeople: 15
    },
    availability: {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      isAvailable: true
    },
    amenities: ["Camping", "Meals", "Guide", "First Aid"],
    status: "active"
  },
  {
    postType: "trek",
    title: "Valley of Flowers Trek",
    description: "Discover the UNESCO World Heritage Site - Valley of Flowers. A paradise for nature lovers with over 300 species of alpine flowers blooming in a vibrant carpet of colors. Combined with the sacred Hemkund Sahib, this trek is spiritually and visually rewarding.",
    duration: {
      days: 6,
      nights: 5
    },
    difficulty: "Moderate",
    isFeatured: true,
    location: {
      city: "Govindghat",
      state: "Uttarakhand",
      country: "India"
    },
    price: {
      perPerson: 10499,
      currency: "INR",
      period: "person"
    },
    capacity: {
      maxPeople: 20
    },
    availability: {
      startDate: "2025-06-01",
      endDate: "2025-09-30",
      isAvailable: true
    },
    amenities: ["Camping", "Meals", "Guide", "Porter", "First Aid"],
    status: "active"
  },
  {
    postType: "trek",
    title: "Hampta Pass Trek",
    description: "Cross from the green Kullu Valley to the barren Lahaul Valley in this stunning trans-Himalayan trek. Experience dramatic landscape changes, camp by glacial lakes, and enjoy breathtaking mountain vistas.",
    duration: {
      days: 5,
      nights: 4
    },
    difficulty: "Moderate",
    isFeatured: true,
    location: {
      city: "Manali",
      state: "Himachal Pradesh",
      country: "India"
    },
    price: {
      perPerson: 9299,
      currency: "INR",
      period: "person"
    },
    capacity: {
      maxPeople: 18
    },
    availability: {
      startDate: "2025-05-01",
      endDate: "2025-10-31",
      isAvailable: true
    },
    amenities: ["Camping", "Meals", "Guide", "Transportation", "First Aid"],
    status: "active"
  },
  {
    postType: "experience",
    title: "Sand Dunes Desert Safari",
    description: "Experience the magic of Thar Desert with camel safari, cultural performances, and a night under the stars. Enjoy traditional Rajasthani hospitality, folk music, and authentic cuisine in the heart of the desert.",
    duration: {
      days: 2,
      nights: 1
    },
    difficulty: "Easy",
    isFeatured: true,
    location: {
      city: "Jaisalmer",
      state: "Rajasthan",
      country: "India"
    },
    price: {
      perPerson: 3499,
      currency: "INR",
      period: "person"
    },
    capacity: {
      maxPeople: 25
    },
    availability: {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      isAvailable: true
    },
    amenities: ["Camping", "Meals", "Cultural Show", "Camel Ride", "Bonfire"],
    status: "active"
  },
  {
    postType: "trek",
    title: "Triund Trek",
    description: "Perfect weekend getaway from Delhi/Chandigarh. Enjoy panoramic views of Dhauladhar ranges and camping under the stars. Ideal for beginners and families.",
    duration: {
      days: 2,
      nights: 1
    },
    difficulty: "Easy",
    isFeatured: true,
    location: {
      city: "Mcleodganj",
      state: "Himachal Pradesh",
      country: "India"
    },
    price: {
      perPerson: 2999,
      currency: "INR",
      period: "person"
    },
    capacity: {
      maxPeople: 20
    },
    availability: {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      isAvailable: true
    },
    amenities: ["Camping", "Meals", "Guide"],
    status: "active"
  }
];

module.exports = featuredTreks;
