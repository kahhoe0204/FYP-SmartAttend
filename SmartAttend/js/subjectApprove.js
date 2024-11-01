import { getFirestore, collection, getDocs } from "./FirebaseConfig.js";

const db = getFirestore();

async function fetchSubmittedSubjects() {
    try {
        const studentsCollection = collection(db, "Students");
        const studentSnapshot = await getDocs(studentsCollection);

        const tbody = document.querySelector('.approval-table tbody');
        tbody.innerHTML = ''; 

        // Loop through each student document
        studentSnapshot.forEach(studentDoc => {
            const studentData = studentDoc.data();
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
                                    <button class="approve-button">Approve</button>
                                    <button class="reject-button">Reject</button>
                                </div>
                            </td>
                        `;
                        tbody.appendChild(row);
                    }
                });
            } else {
                console.warn(`Enrolled subjects missing or not an object for Student ID: ${studentData.studentID}`);
            }
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
    }
}

fetchSubmittedSubjects();
