import { auth, db, doc, getDoc, updateDoc } from './FirebaseConfig.js';

let uid; 
auth.onAuthStateChanged((authUser) => {
    if (authUser) {
        uid = authUser.uid;
        console.log('User logged in with userID:', uid);
        fetchProfileData(uid); 
    } else {
        console.log('No user is currently logged in');
    }
});

// Function to fetch profile data from Firestore
async function fetchProfileData(userRef) {
    try {
        const studentDocRef = doc(db, "Students", uid);
        const docSnap = await getDoc(studentDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            displayProfileData(userData);
            displayAttendanceOverview(userData); // Fetch and display attendance overview
        } else {
            console.log('No such document!');
            return null;
        }
    } catch (error) {
        console.log('Error fetching document:', error);
        return null;
    }
}

// Function to display profile data on the page
function displayProfileData(data) {
    console.log(data);
    // Populate the modal form fields for editing
    document.querySelector('#full-name').value = data.fullName;
    document.querySelector('#student-id').value = data.studentID; // Correct ID usage here
    document.querySelector('#email').value = data.email;
    document.querySelector('#department').value = data.department;
    document.querySelector('#phone').value = data.phone;

    // Display the profile data in the profile section
    document.querySelector('#display-full-name').textContent = data.fullName;
    document.querySelector('#display-student-id').textContent = data.studentID;
    document.querySelector('#display-email').textContent = data.email;
    document.querySelector('#display-department').textContent = data.department;
    document.querySelector('#display-phone').textContent = data.phone;

    // If there's an image, display the profile image (keep using 'profileImageURL')
    if (data.profileImageURL) {
        document.querySelector('#profile-img').src = data.profileImageURL;
    } else {
        document.querySelector('#profile-img').src = 'default-profile.png'; // Fallback if no image is provided
    }
}

// Function to fetch and display attendance overview from Firestore
function displayAttendanceOverview(data) {
    const attendance = data.attendance; // Fetch attendance data from Firestore

    // Update the existing fields in the attendance overview
    document.querySelector('#total-classes-attended').innerHTML = `<i class="fas fa-check-circle"></i> ${attendance.totalClassesAttended}/40`;
    document.querySelector('#absences').innerHTML = `<i class="fas fa-times-circle"></i> ${attendance.absences}`;
    document.querySelector('#mc-submitted').innerHTML = `<i class="fas fa-file-medical"></i> ${attendance.medicalCertificateSubmitted}`;
    document.querySelector('#upcoming-classes').innerHTML = `<i class="fas fa-calendar-alt"></i> ${attendance.upcomingClasses}`;

    // Display medical certificate submission table
    displayMedicalCertificates(data.medicalCertificates);
}

// Function to display medical certificates
function displayMedicalCertificates(certificates) {
    const mcTableBody = document.querySelector('.mc-submission .styled-table tbody');
    mcTableBody.innerHTML = ''; // Clear previous rows

    certificates.forEach(cert => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cert.date}</td>
            <td>${cert.status}</td>
            <td>${cert.mcSubmitted ? 'Yes' : 'No'}</td>
            <td>${cert.notes}</td>
        `;
        mcTableBody.appendChild(row);
    });
}

// Select modal and buttons
const editModal = document.getElementById("edit-modal");
const editModalBtn = document.getElementById("edit-modal-btn");
const closeModal = document.querySelector(".close");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editProfileForm = document.getElementById("edit-profile-form");

// Function to open the modal
function openModal() {
    editModal.style.display = "flex"; // Set display to 'flex' to ensure centering
}

// Function to close the modal
function closeModalFunc() {
    editModal.style.display = "none"; // Hide the modal when closed
}

// Event listener to open modal when edit button is clicked
editModalBtn.addEventListener("click", openModal);

// Event listener to close modal when close button is clicked
closeModal.addEventListener("click", closeModalFunc);

// Event listener to close modal when cancel button is clicked
cancelEditBtn.addEventListener("click", closeModalFunc);

// Event listener to handle form submission and Firestore update
editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the form from submitting the default way

    // Get updated values from the form
    const updatedFullName = document.getElementById("full-name").value;
    const updatedEmail = document.getElementById("email").value;
    const updatedPhone = document.getElementById("phone").value;
    const updatedDepartment = document.getElementById("department").value;

    // Update the profile information displayed on the page
    document.getElementById("display-full-name").textContent = updatedFullName;
    document.getElementById("display-email").textContent = updatedEmail;
    document.getElementById("display-phone").textContent = updatedPhone;
    document.getElementById("display-department").textContent = updatedDepartment;

    // Update the Firestore document with the new data
    const studentDocRef = doc(db, "Students", uid);
    try {
        await updateDoc(studentDocRef, {
            fullName: updatedFullName,
            email: updatedEmail,
            phone: updatedPhone,
            department: updatedDepartment
        });
        console.log('Document successfully updated!');
    } catch (error) {
        console.error('Error updating document: ', error);
    }

    // Close the modal after submitting
    closeModalFunc();
});

