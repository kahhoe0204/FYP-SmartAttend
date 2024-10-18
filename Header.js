function loadNavBar(role) {
    const navLinks = document.getElementById("nav-links");

    let navContent = '';

    if (role === "student-logged-in") {
        navContent = `
            <a href="#">Home</a>
            <a href="#">Class Attendance</a>
            <a href="#">Submit MC</a>
            <a href="#">Profile</a>
            <button class="btn logout" onclick="logout()">Log Out</button>
        `;
    } else if (role === "student-logged-out" || role === "admin-logged-out") {
        navContent = `
            <a href="#">Home</a>
            <button class="btn login-btn" onclick="window.location.href='Login.html'">Login</button>
            <button class="btn signup-btn" onclick="window.location.href='Signup.html'">Sign Up</button>
        `;
    } else if (role === "lecturer-logged-in") {
        navContent = `
            <a href="#">Home</a>
            <a href="#">Manage Quiz</a>
            <a href="#">Download Reports</a>
            <a href="#">MC Approval</a>
            <button class="btn logout" onclick="logout()">Log Out</button>
        `;
    }

    navLinks.innerHTML = navContent;
}

let userRole = "student-logged-in";
function logout() {
    userRole = "student-logged-out";
    loadNavBar(userRole);
}

loadNavBar(userRole);
