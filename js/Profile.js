import { db } from './FirebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

const userRef = doc(db, 'Students', userId);

// Elements
const editButton = document.getElementById('edit-profile-btn');
const cancelButton = document.getElementById('cancel-edit-btn');
const modal = document.getElementById('edit-modal');
const closeModal = document.getElementsByClassName('close')[0];

// Fetch and display profile data
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

            // Display profile image if available
            if (userData.profileImageURL) {
                document.getElementById('profile-img').src = userData.profileImageURL;
            }

            // Set modal form placeholders
            document.getElementById('first-name').value = userData.firstName;
            document.getElementById('surname').value = userData.surname;
            document.getElementById('email').value = userData.email;
            document.getElementById('phone').value = userData.phone;
            document.getElementById('department').value = userData.department;

            // Attendance Overview
            document.querySelector('.total-classes-attended').textContent = `${userData.attendance.totalClassesAttended}/40`;
            document.querySelector('.absences').textContent = userData.attendance.absences;
            document.querySelector('.mc-submitted').textContent = userData.attendance.medicalCertificateSubmitted;
            document.querySelector('.upcoming-classes').textContent = userData.attendance.upcomingClasses;

            // Populate the Medical Certificate Submission table
            const mcTableBody = document.querySelector('.mc-submission-table tbody');
            mcTableBody.innerHTML = '';  // Clear previous data

            userData.medicalCertificates.forEach(cert => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cert.date}</td>
                    <td>${cert.status}</td>
                    <td>${cert.mcSubmitted ? 'Yes' : 'No'}</td>
                    <td>${cert.notes}</td>
                `;
                mcTableBody.appendChild(row);
            });

        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.log('Error fetching document:', error);
    }
}

// Show the modal when edit button is clicked
editButton.addEventListener('click', function () {
    modal.style.display = 'block';
});

// Close modal on click of close button
closeModal.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Close modal when clicking outside of the modal
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Cancel editing
cancelButton.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Handle form submission and update Firestore
document.getElementById('edit-profile-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const updatedFirstName = document.getElementById('first-name').value;
    const updatedSurname = document.getElementById('surname').value;
    const updatedEmail = document.getElementById('email').value;
    const updatedPhone = document.getElementById('phone').value;
    const updatedDepartment = document.getElementById('department').value;

    try {
        // Update Firestore
        await updateDoc(userRef, {
            firstName: updatedFirstName,
            surname: updatedSurname,
            email: updatedEmail,
            phone: updatedPhone,
            department: updatedDepartment
        });

        // Update UI
        document.getElementById('display-first-name').textContent = updatedFirstName;
        document.getElementById('display-surname').textContent = updatedSurname;
        document.getElementById('display-email').textContent = updatedEmail;
        document.getElementById('display-phone').textContent = updatedPhone;
        document.getElementById('display-department').textContent = updatedDepartment;

        // Close modal
        modal.style.display = 'none';
    } catch (error) {
        console.log('Error updating document:', error);
    }
});

// Initial load of profile data
loadProfileData();
