// Firebase setup
// Replace the values below with your own project's config
// (Firebase Console > Project settings > Your apps > Web app > SDK setup and configuration)
const firebaseConfig = {
  apiKey: "AIzaSyD6e_807np4W1KwPOHCEg6VAQQZQ2IzTb8",
  authDomain: "online-quiz-application-f9e9a.firebaseapp.com",
  projectId: "online-quiz-application-f9e9a",
  storageBucket: "online-quiz-application-f9e9a.firebasestorage.app",
  messagingSenderId: "1085963127195",
  appId: "1:1085963127195:web:21d8f7e9806fd4a569393e",
  measurementId: "G-K4BMS1FP85"
};

// Start Firebase
firebase.initializeApp(firebaseConfig);

// Shortcuts we use in the other files
const auth = firebase.auth();       // login, register, logout
const db = firebase.firestore();    // database (users collection)

// Make them available to all scripts
window.auth = auth;
window.db = db;
