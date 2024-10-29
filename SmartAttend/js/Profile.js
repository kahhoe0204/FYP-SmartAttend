// Firestore imports (ensure FirebaseConfig.js is correctly imported)
import { db } from './FirebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Reference to Firestore document (change this to match the logged-in user's ID)
const userId = 'b1901935';  // Replace with dynamic user ID if necessary
const userRef = doc(db, 'Students', userId);

// Fetch and display profile and attendance data
async function loadProfileData() {
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();

            // Display profile data
            document.getElementById('display-first-name').textContent = userData.firstName;
            document.getElementById('display-surname').textContent = userData.surname;
            document.getElementById('display-email').textContent = userData.email;
            document.getElementById('display-phone').textContent = userData.phone;
            document.getElementById('display-department').textContent = userData.department;
            document.getElementById('profile-img').src = userData.profileImageURL || 'Images/Profile.jpeg';

            // Display attendance overview
            const attendance = userData.attendance;
            document.querySelector('.info-card:nth-child(1) p').innerHTML = `<i class="fas fa-check-circle"></i> ${attendance.totalClassesAttended}/40`;
            document.querySelector('.info-card:nth-child(2) p').innerHTML = `<i class="fas fa-times-circle"></i> ${attendance.absences}`;
            document.querySelector('.info-card:nth-child(3) p').innerHTML = `<i class="fas fa-file-medical"></i> ${attendance.medicalCertificateSubmitted}`;
            document.querySelector('.info-card:nth-child(4) p').innerHTML = `<i class="fas fa-calendar-alt"></i> ${attendance.upcomingClasses}`;
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.log('Error fetching document:', error);
    }
}

// Load profile and attendance data when the page loads
loadProfileData();

// Update profile info (same as before)
document.getElementById('edit-profile-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const firstName = document.getElementById('first-name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const department = document.getElementById('department').value;

    try {
        await updateDoc(userRef, {
            firstName,
            surname,
            email,
            phone,
            department
        });
        // Update UI
        document.getElementById('display-first-name').textContent = firstName;
        document.getElementById('display-surname').textContent = surname;
        document.getElementById('display-email').textContent = email;
        document.getElementById('display-phone').textContent = phone;
        document.getElementById('display-department').textContent = department;

        // Hide edit form and show profile display
        document.getElementById('edit-profile-form').style.display = 'none';
        document.getElementById('profile-info-display').style.display = 'grid';
    } catch (error) {
        console.log('Error updating document:', error);
    }
});