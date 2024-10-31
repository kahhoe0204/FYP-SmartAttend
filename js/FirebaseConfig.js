// FirebaseConfig.js

// Import Firebase SDK with consistent versioning
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-storage.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Storage with app context

// Export the Firebase instances
export { auth, db, storage, doc, setDoc, getDoc, updateDoc, ref, uploadBytes, getDownloadURL, deleteObject };

// Function to handle user sign-up
export const handleSignUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// Function to handle user login
export const handleLogin = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Function to send password reset email
export const sendPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
};

// Function to create a user document in Firestore
export const createUserInFirestore = async (uid, fullName, studentId, phone, imageURL = '') => {
    try {
        await setDoc(doc(db, "Students", uid), {
            fullName: fullName,
            studentID: studentId,
            email: auth.currentUser.email,
            phone: phone,
            profileImageURL: imageURL, // Ensure a default or provided URL is set here
            attendance: {
                absences: 0,
                medicalCertificateSubmitted: 0,
                totalClassesAttended: 0,
                upcomingClasses: 0
            },
            department: "Information Technology" // You can make this dynamic if needed
        });
        console.log("User document successfully written!");
    } catch (error) {
        console.error("Error writing document: ", error);
    }
};
