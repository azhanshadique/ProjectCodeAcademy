// const scroll = new LocomotiveScroll({
//   el: document.querySelector('.container'),
//   smooth: true
// });
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPACURk0fECwcx7mdnvgKvzoAwFIZ-wfc",
  authDomain: "authlearn-c0620.firebaseapp.com",
  projectId: "authlearn-c0620",
  storageBucket: "authlearn-c0620.appspot.com",
  messagingSenderId: "1057467852931",
  appId: "1:1057467852931:web:6b68ef4f55754653c753b6",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Form Submission Logic
document.getElementById("problemForm").addEventListener("submit", async function (event) {
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
    document.getElementById("problemForm").reset();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to add problem. Please try again.");
  }
});
