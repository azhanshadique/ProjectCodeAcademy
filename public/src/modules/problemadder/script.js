import { firebaseConfig } from "/public/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// Form Submission Logic
document.getElementById("course-btn").addEventListener('click', async function (event) {
 
  event.preventDefault(); // Prevent page refresh

  // Gather inputs
  const id = document.getElementById("id").value;
  const title = document.getElementById("title").value;
  const difficulty = document.getElementById("difficulty").value;
  const category = document.getElementById("category").value;
  const order = document.getElementById("order").value;
  const link = document.getElementById("link").value || "N/A";

  // Prepare object for Firestore
  const problemData = {
    title,
    difficulty,
    category,
    order: parseInt(order),
    link,
  };

  try {
    // Check if a document with the same ID already exists
    const docRef = db.collection("problems").doc(id);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      alert("A problem with the same ID already exists. Please use a unique ID.");
      return;
    }

    // Set the document with the custom ID
    await docRef.set(problemData);
    alert("Problem added successfully to Firestore!");
    // document.getElementById("problemForm").reset();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to add problem. Please try again.");
  }
});
