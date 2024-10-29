// Declare the userRole globally so it's accessible to all functions
let userRole = "student-logged-in";

// Function to handle logout
function logout() {
    console.log('Logging out...');
    if (userRole === "student-logged-in" || userRole === "lecturer-logged-in") {
        userRole = "student-logged-out";
        console.log('Role after logout:', userRole);
        loadNavBar(userRole);
    }
}


function loadNavBar(role) {
    const navLinks = document.getElementById("nav-links");

    if (!navLinks) {
        console.error('nav-links element not found in the HTML');
        return;
    }

    let navContent = '';

    if (role === "student-logged-in") {
        console.log('Loading navbar for student-logged-in');
        navContent = `
            <a href="#">Home</a>
            <a href="#">Class Attendance</a>
            <a href="#">Submit MC</a>
            <a href="Profile.html">Profile</a>
            <button class="btn logout" onclick="logout()">Log Out</button>
        `;
    } else if (role === "student-logged-out" || role === "admin-logged-out") {
        console.log('Loading navbar for student-logged-out');
        navContent = `
            <a href="#">Home</a>
            <button class="btn login-btn" onclick="window.location.href='Login.html'">Login</button>
            <button class="btn signup-btn" onclick="window.location.href='Signup.html'">Sign Up</button>
        `;
    } else if (role === "lecturer-logged-in") {
        console.log('Loading navbar for lecturer-logged-in');
        navContent = `
            <a href="#">Home</a>
            <a href="#">Manage Quiz</a>
            <a href="#">Download Reports</a>
            <a href="#">MC Approval</a>
            <button class="btn logout" onclick="logout()">Log Out</button>
        `;
    }

    // Inject the navigation HTML into the element
    navLinks.innerHTML = navContent;
}

// Ensure DOMContentLoaded is used properly to wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, loading navbar...');
    loadNavBar(userRole); // Initially load the navbar with the current role
});