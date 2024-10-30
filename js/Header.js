// Import Firebase Authentication from FirebaseConfig.js
import { auth } from './FirebaseConfig.js'; // Ensure the correct relative path to FirebaseConfig.js

// Declare the userRole globally so it's accessible to all functions
let userRole = "student-logged-out";

// Monitor user authentication state
auth.onAuthStateChanged((authUser) => {
    if (authUser) {
        const email = authUser.email; // Retrieve the user's email
        console.log('User logged in with email:', email);
        if (email) {
            login(email); // Call login with user's email
        } else {
            console.log('Email is not available for this user.');
        }
    } else {
        console.log('No user is currently logged in');
        loadNavBar("student-logged-out"); // Show logged-out navbar if no user
    }
});

// Firebase Authentication logic
function determineUserRole(email) {
    // Set role based on email
    if (email === "admin@help.edu.my") {
        userRole = "admin-logged-in";
    } else {
        userRole = "student-logged-in";
    }
    console.log('User role set to:', userRole);
    loadNavBar(userRole); // Reload navbar based on new role
}

// Example login function that calls determineUserRole with email
function login(email) {
    console.log('current email: ', email);
    determineUserRole(email); // Set role based on email
}

// Function to handle logout
function logout() {
    console.log('Logging out...');
    if (userRole === "student-logged-in" || userRole === "lecturer-logged-in" || userRole === "admin-logged-in") {
        userRole = userRole.includes("student") ? "student-logged-out" : "admin-logged-out";
        console.log('Role after logout:', userRole);
        window.location.href = 'index.html'; // Redirect to index.html after logout
        loadNavBar(userRole); // Update navbar after logout
    }
}

function loadNavBar(userRole) {
    const navLinks = document.getElementById("nav-links");

    if (!navLinks) {
        console.error('nav-links element not found in the HTML');
        return;
    }

    let navContent = '';

    // Determine navigation links based on user role
    if (userRole === "student-logged-in") {
        console.log('Loading navbar for student-logged-in');
        navContent = `
            <a href="#">Home</a>
            <a href="#">Class Attendance</a>
            <a href="#">Submit MC</a>
            <a href="subjectEnrol.html">Subject Enrolment</a>
            <a href="Profile.html">Profile</a>
            <button class="btn logout">Log Out</button>
        `;
    } else if (userRole === "admin-logged-in") {
        console.log('Loading navbar for admin-logged-in');
        navContent = `
            <a href="#">Admin Dashboard</a>
            <a href="#">User Management</a>
            <a href="#">Reports</a>
            <button class="btn logout">Log Out</button>
        `;
    } else if (userRole === "student-logged-out" || userRole === "admin-logged-out") {
        console.log('Loading navbar for logged-out user');
        navContent = `
            <a href="#">Home</a>
            <button class="btn login-btn" onclick="window.location.href='index.html'">Login</button>
            <button class="btn signup-btn" onclick="window.location.href='Signup.html'">Sign Up</button>
        `;
    }

    // Inject the navigation HTML into the element
    navLinks.innerHTML = navContent;

    // Add event listener for the logout button if it exists
    const logoutButton = navLinks.querySelector('.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}

// Load the navbar when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, loading navbar...');
    loadNavBar(userRole); // Initially load the navbar with the current role
});
