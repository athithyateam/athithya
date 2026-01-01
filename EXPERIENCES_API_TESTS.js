// Example test file for Experiences API
// You can use this with Postman, Thunder Client, or any API testing tool

// ===========================
// 1. CREATE EXPERIENCE
// ===========================
/*
Method: POST
URL: http://localhost:3000/api/posts/experiences
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body: form-data

Fields:
  title: "Solo Trek to Kedarkantha Peak"
  description: "An unforgettable 6-day journey through the Himalayas. The snow-capped peaks, pristine forests, and the warmth of local villagers made this an unforgettable experience."
  city: "Sankri"
  state: "Uttarakhand"
  country: "India"
  pricePerPerson: 18000
  days: 6
  nights: 5
  difficulty: "Moderate"
  categories: ["Adventure", "Mountain", "Snow", "Solo Travel"]
  amenities: ["Guide", "Meals", "Camping Equipment"]
  photos: [file1.jpg, file2.jpg] (upload actual files)
  videos: [video1.mp4] (upload actual file)

Expected Response (201):
{
  "success": true,
  "message": "Experience created successfully",
  "experience": {
    "_id": "...",
    "postType": "experience",
    "title": "Solo Trek to Kedarkantha Peak",
    ...
  }
}
*/

// ===========================
// 2. GET ALL EXPERIENCES
// ===========================
/*
Method: GET
URL: http://localhost:3000/api/posts/experiences
Headers: None (Public)

Expected Response (200):
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "experiences": [...]
}
*/

// ===========================
// 3. GET EXPERIENCES WITH FILTERS
// ===========================
/*
Method: GET
URL: http://localhost:3000/api/posts/experiences?state=Uttarakhand&categories=Mountain,Adventure&maxPrice=25000&page=1&limit=10
Headers: None (Public)

Query Parameters:
  state: Uttarakhand
  categories: Mountain,Adventure
  maxPrice: 25000
  page: 1
  limit: 10

Expected Response (200):
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "totalPages": 3,
  "experiences": [...]
}
*/

// ===========================
// 4. GET FEATURED EXPERIENCES
// ===========================
/*
Method: GET
URL: http://localhost:3000/api/posts/experiences/featured/list?limit=5
Headers: None (Public)

Expected Response (200):
{
  "success": true,
  "count": 5,
  "experiences": [...]
}
*/

// ===========================
// 5. GET MY EXPERIENCES
// ===========================
/*
Method: GET
URL: http://localhost:3000/api/posts/experiences/my/list
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE

Expected Response (200):
{
  "success": true,
  "count": 3,
  "experiences": [...]
}
*/

// ===========================
// 6. GET USER'S EXPERIENCES
// ===========================
/*
Method: GET
URL: http://localhost:3000/api/posts/experiences/user/USER_ID_HERE
Headers: None (Public)

Expected Response (200):
{
  "success": true,
  "count": 8,
  "experiences": [...]
}
*/

// ===========================
// 7. GET SINGLE EXPERIENCE
// ===========================
/*
Method: GET
URL: http://localhost:3000/api/posts/experiences/EXPERIENCE_ID_HERE
Headers: None (Public)

Expected Response (200):
{
  "success": true,
  "experience": {
    "_id": "...",
    "postType": "experience",
    ...
  }
}
*/

// ===========================
// 8. UPDATE EXPERIENCE
// ===========================
/*
Method: PUT
URL: http://localhost:3000/api/posts/experiences/EXPERIENCE_ID_HERE
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
Body: raw JSON

{
  "title": "Updated Trek to Kedarkantha Peak",
  "pricePerPerson": 20000,
  "difficulty": "Challenging"
}

Expected Response (200):
{
  "success": true,
  "message": "Experience updated successfully",
  "experience": {
    "_id": "...",
    "title": "Updated Trek to Kedarkantha Peak",
    ...
  }
}
*/

// ===========================
// 9. DELETE EXPERIENCE
// ===========================
/*
Method: DELETE
URL: http://localhost:3000/api/posts/experiences/EXPERIENCE_ID_HERE
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE

Expected Response (200):
{
  "success": true,
  "message": "Experience deleted successfully"
}
*/

// ===========================
// FRONTEND USAGE EXAMPLES
// ===========================

// Example 1: Create Experience
async function createExperience() {
  const formData = new FormData();
  formData.append("title", "Amazing Mountain Trek");
  formData.append("description", "A journey through the mountains...");
  formData.append("city", "Manali");
  formData.append("state", "Himachal Pradesh");
  formData.append("country", "India");
  formData.append("pricePerPerson", "15000");
  formData.append("days", "5");
  formData.append("nights", "4");
  formData.append("difficulty", "Moderate");
  formData.append("categories", JSON.stringify(["Adventure", "Mountain"]));
  
  // Add photos
  const photoInput = document.querySelector("#photoInput");
  for (let i = 0; i < photoInput.files.length; i++) {
    formData.append("photos", photoInput.files[i]);
  }
  
  try {
    const response = await fetch("/api/posts/experiences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });
    
    const data = await response.json();
    console.log("Experience created:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 2: Get Experiences with Filters
async function getExperiences() {
  const params = new URLSearchParams({
    state: "Uttarakhand",
    categories: "Mountain,Adventure",
    maxPrice: "25000",
    page: "1",
    limit: "10"
  });
  
  try {
    const response = await fetch(`/api/posts/experiences?${params}`);
    const data = await response.json();
    console.log("Experiences:", data.experiences);
    console.log(`Total: ${data.total}, Page: ${data.page}/${data.totalPages}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 3: Get Featured Experiences
async function getFeatured() {
  try {
    const response = await fetch("/api/posts/experiences/featured/list?limit=5");
    const data = await response.json();
    console.log("Featured experiences:", data.experiences);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 4: Get My Experiences
async function getMyExperiences() {
  try {
    const response = await fetch("/api/posts/experiences/my/list", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await response.json();
    console.log("My experiences:", data.experiences);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 5: Update Experience
async function updateExperience(experienceId) {
  try {
    const response = await fetch(`/api/posts/experiences/${experienceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        title: "Updated Title",
        pricePerPerson: 20000
      })
    });
    const data = await response.json();
    console.log("Updated experience:", data.experience);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 6: Delete Experience
async function deleteExperience(experienceId) {
  if (!confirm("Are you sure you want to delete this experience?")) {
    return;
  }
  
  try {
    const response = await fetch(`/api/posts/experiences/${experienceId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 7: Using the experiences API module
import { 
  createExperience, 
  listExperiences,
  getExperience,
  getFeaturedExperiences,
  getMyExperiences,
  updateExperience,
  deleteExperience
} from "./api/experiences";

async function demonstrateAPI() {
  const token = localStorage.getItem("token");
  
  // Create
  const formData = new FormData();
  formData.append("title", "My Trek");
  formData.append("description", "Amazing experience...");
  const created = await createExperience(formData, { 
    token,
    onUploadProgress: (percent) => console.log(`${percent}%`)
  });
  
  // List with filters
  const list = await listExperiences({
    state: "Uttarakhand",
    maxPrice: 25000
  });
  
  // Get featured
  const featured = await getFeaturedExperiences({ limit: 5 });
  
  // Get my experiences
  const mine = await getMyExperiences({ token });
  
  // Update
  const updated = await updateExperience(
    created.experience._id,
    { title: "Updated Title" },
    { token }
  );
  
  // Delete
  await deleteExperience(created.experience._id, { token });
}
