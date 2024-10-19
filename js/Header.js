function loadNavBar(role) {
    const navLinks = document.getElementById("nav-links");

    let navContent = '';

    if (role === "student-logged-in") {
        navContent = `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Class Attendance</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Submit MC</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Profile</a></li>
                <li class="nav-item"><button class="btn logout" onclick="logout()">Log Out</button></li>
            </ul>
        `;
    } else if (role === "student-logged-out" || role === "admin-logged-out") {
        navContent = `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
                <li class="nav-item"><button class="btn login-btn" onclick="window.location.href='Login.html'">Login</button></li>
                <li class="nav-item"><button class="btn signup-btn" onclick="window.location.href='Signup.html'">Sign Up</button></li>
            </ul>
        `;
    } else if (role === "lecturer-logged-in") {
        navContent = `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Manage Quiz</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Download Reports</a></li>
                <li class="nav-item"><a class="nav-link" href="#">MC Approval</a></li>
                <li class="nav-item"><button class="btn logout" onclick="logout()">Log Out</button></li>
            </ul>
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
