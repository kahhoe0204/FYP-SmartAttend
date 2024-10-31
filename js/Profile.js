import { auth, db, doc, getDoc, updateDoc, storage, ref, deleteObject, uploadBytes, getDownloadURL } from './FirebaseConfig.js';

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
        const studentDocRef = doc(db, "Students", userRef);
        const docSnap = await getDoc(studentDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            displayProfileData(userData);
            displayAttendanceOverview(userData);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.log('Error fetching document:', error);
    }
}

// Profile Image Update with File Size Limit
const fileInput = document.getElementById('file-upload');
const profileImg = document.getElementById('profile-img');

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const maxSize = 2 * 1024 * 1024;

    // Check file size
    if (file && file.size <= maxSize) {
        const studentDocRef = doc(db, "Students", uid);
        const docSnap = await getDoc(studentDocRef);

        if (docSnap.exists()) {
            const currentData = docSnap.data();
            const oldImageUrl = currentData.profileImageURL;

            // Delete old image if it exists
            if (oldImageUrl) {
                const oldImageRef = ref(storage, oldImageUrl);
                await deleteObject(oldImageRef).catch((error) => console.error("Error deleting old image:", error));
            }

            // Upload new image
            const newImageRef = ref(storage, `profileImages/${uid}-${Date.now()}`);
            await uploadBytes(newImageRef, file);

            // Update Firestore with new image URL
            const newImageUrl = await getDownloadURL(newImageRef);
            await updateDoc(studentDocRef, { profileImageURL: newImageUrl });

            // Update profile image on the page
            profileImg.src = newImageUrl;
        }
    } else {
        alert("Please upload an image smaller than 2 MB.");
    }
});

// Display Profile Data
function displayProfileData(data) {
    // Populate form fields
    document.querySelector('#full-name').value = data.fullName;
    document.querySelector('#student-id').value = data.studentID;
    document.querySelector('#email').value = data.email;
    document.querySelector('#department').value = data.department;
    document.querySelector('#phone').value = data.phone;

    // Display in profile section
    document.querySelector('#display-full-name').textContent = data.fullName;
    document.querySelector('#display-student-id').textContent = data.studentID;
    document.querySelector('#display-email').textContent = data.email;
    document.querySelector('#display-department').textContent = data.department;
    document.querySelector('#display-phone').textContent = data.phone;

    // Profile image handling
    if (data.profileImageURL) {
        profileImg.src = data.profileImageURL;
    } else {
        profileImg.src = 'Images/Profile.jpeg'; // Default image
    }
}

// Display Attendance Overview
function displayAttendanceOverview(data) {
    const attendance = data.attendance;

    // Update fields in attendance overview
    document.querySelector('#total-classes-attended').innerHTML = `<i class="fas fa-check-circle"></i> ${attendance.totalClassesAttended}/40`;
    document.querySelector('#absences').innerHTML = `<i class="fas fa-times-circle"></i> ${attendance.absences}`;
    document.querySelector('#mc-submitted').innerHTML = `<i class="fas fa-file-medical"></i> ${attendance.medicalCertificateSubmitted}`;
    document.querySelector('#upcoming-classes').innerHTML = `<i class="fas fa-calendar-alt"></i> ${attendance.upcomingClasses}`;

    // Medical certificate submission table
    displayMedicalCertificates(data.medicalCertificates);
}

// Display Medical Certificates
function displayMedicalCertificates(certificates) {
    const mcTableBody = document.querySelector('.mc-submission .styled-table tbody');
    mcTableBody.innerHTML = '';

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

// Modal controls
const editModal = document.getElementById("edit-modal");
const editModalBtn = document.getElementById("edit-modal-btn");
const closeModal = document.querySelector(".close");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editProfileForm = document.getElementById("edit-profile-form");

editModalBtn.addEventListener("click", () => editModal.style.display = "flex");
closeModal.addEventListener("click", () => editModal.style.display = "none");
cancelEditBtn.addEventListener("click", () => editModal.style.display = "none");

// Form Submission
editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Fetch updated values
    const updatedFullName = document.getElementById("full-name").value;
    const updatedEmail = document.getElementById("email").value;
    const updatedPhone = document.getElementById("phone").value;
    const updatedDepartment = document.getElementById("department").value;

    // Update displayed data
    document.getElementById("display-full-name").textContent = updatedFullName;
    document.getElementById("display-email").textContent = updatedEmail;
    document.getElementById("display-phone").textContent = updatedPhone;
    document.getElementById("display-department").textContent = updatedDepartment;

    // Update Firestore
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

    // Close modal
    editModal.style.display = "none";
});
