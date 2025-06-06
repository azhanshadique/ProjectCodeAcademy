// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAEBmeza5fruvR_vezpHrhwhGWNL-5ZhiA",
  authDomain: "codeacademy-741b6.firebaseapp.com",
  projectId: "codeacademy-741b6",
  storageBucket: "codeacademy-741b6.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "366978743466",
  appId: "1:366978743466:web:864dd7fd9bb1153605a4d3",
  // Add missing required configuration
  databaseURL: "https://codeacademy-741b6.firebaseio.com"
};

// Initialize Firebase with offline persistence enabled
firebase.initializeApp(firebaseConfig);

// Enable offline persistence
firebase.firestore().enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not supported in this browser');
    }
  });

// Initialize Auth and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// For debugging purposes (remove in production)
const isFirebaseInitialized = !!firebase.apps.length;
console.log('Firebase initialized:', isFirebaseInitialized);