// FirebaseConfig.js

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJBy-1ToR0aLnbngDOL8kKa5onMtQoNcw",
    authDomain: "smartattend-f36c4.firebaseapp.com",
    projectId: "smartattend-f36c4",
    storageBucket: "smartattend-f36c4.appspot.com",
    messagingSenderId: "478728054218",
    appId: "1:478728054218:web:2b69ded405972ea3dadb33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);  // Initialize Firestore

// Function to handle user sign-up
export const handleSignUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

// Function to handle user login
export const handleLogin = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

// Function to send password reset email
export const sendPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
}

// Export Firestore database for use in other parts of the application
export { db };