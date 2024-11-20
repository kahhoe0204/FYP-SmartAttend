import { getFirestore, collection, onSnapshot, doc, updateDoc } from "./FirebaseConfig.js";
import 'toastr/build/toastr.min.css';

toastr.options.positionClass = 'toast-bottom-right'; 

const db = getFirestore();

function fetchSubmittedSubjects() {
    const studentsCollection = collection(db, "Students");

    onSnapshot(studentsCollection, (snapshot) => {
        const tbody = document.querySelector('.approval-table tbody');
        tbody.innerHTML = '';

        snapshot.forEach((studentDoc) => {
            const studentData = studentDoc.data();
            const studentID = studentDoc.id; // Get the document ID (student's UID)
            const enrolledSubjects = studentData.enrolledSubjects;

            // Check if enrolledSubjects exists and is an object
            if (enrolledSubjects && typeof enrolledSubjects === 'object') {
                Object.entries(enrolledSubjects).forEach(([subjectCode, subject]) => {
                    // Check for the correct structure and the status condition
                    if (subject && subject.status === "Submitted for approval") {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${studentData.studentID}</td>
                            <td>${subjectCode}</td>
                            <td>${subject.name}</td>
                            <td>
                                <div class="button-container">
                                    <button class="approve-button" data-student-id="${studentID}" data-subject-code="${subjectCode}">Approve</button>
                                    <button class="reject-button" data-student-id="${studentID}" data-subject-code="${subjectCode}">Reject</button>
                                </div>
                            </td>
                        `;
                        tbody.appendChild(row);
                    }
                });
            } else {
                console.log(`Enrolled subjects missing or not an object for Student ID: ${studentData.studentID}`);
            }
        });

        document.querySelectorAll('.approve-button').forEach(button => {
            button.addEventListener('click', handleApprove);
        });

        document.querySelectorAll('.reject-button').forEach(button => {
            button.addEventListener('click', handleReject);
        });
    }, (error) => {
        console.error("Error listening to changes:", error);
    });
}

// Function to handle the approval of a subject
async function handleApprove(event) {
    const studentID = event.target.getAttribute('data-student-id');
    const subjectCode = event.target.getAttribute('data-subject-code');

    if (studentID && subjectCode) {
        const studentDocRef = doc(db, "Students", studentID);

        try {
            // Update the status of the specific subject in Firestore
            await updateDoc(studentDocRef, {
                [`enrolledSubjects.${subjectCode}.status`]: "Enrolled"
            });
        } catch (error) {
            console.error("Error updating document: ", error);
            toastr.warning("Failed to approve enrollment. Please try again.");
        }
    }
}

// Function handle the rejection of a subject
async function handleReject(event){
    const studentID = event.target.getAttribute('data-student-id');
    const subjectCode = event.target.getAttribute('data-subject-code');

    if (studentID && subjectCode) {
        const studentDocRef = doc(db, "Students", studentID);

        try {
            // Update the status of the specific subject in Firestore
            await updateDoc(studentDocRef, {
                [`enrolledSubjects.${subjectCode}.status`]: "Rejected"
            });
        } catch (error) {
            console.error("Error updating document: ", error);
           toastr.warning("Failed to reject enrollment. Please try again.");
        }
    }
}

fetchSubmittedSubjects();
