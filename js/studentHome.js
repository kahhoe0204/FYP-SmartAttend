import { auth, db, doc, getDoc } from './FirebaseConfig.js';

// Fetch approved subjects for logged-in user
async function fetchApprovedSubjects(uid) {
    try {
        console.log("Fetching enrolledSubjects map for UID:", uid);

        const studentDoc = await getDoc(doc(db, "Students", uid));
        
        if (studentDoc.exists()) {
            const enrolledSubjects = studentDoc.data().enrolledSubjects;
            console.log("Retrieved enrolledSubjects:", enrolledSubjects);

            const approvedSubjects = [];
            for (const [subjectId, subjectData] of Object.entries(enrolledSubjects)) {
                if (subjectData.status === "Enrolled") {
                    approvedSubjects.push({
                        id: subjectId,
                        ...subjectData
                    });
                }
            }

            console.log("Approved subjects found:", approvedSubjects);
            return approvedSubjects;
        } else {
            console.error("Student document not found");
            return [];
        }
    } catch (error) {
        console.error("Error fetching approved subjects:", error);
        return [];
    }
}

// Render subjects in card format
function renderSubjectsAsCards(subjects) {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';

    if (subjects.length === 0) {
        console.log("No approved subjects to display.");
        container.innerHTML = "<p>No approved subjects found.</p>";
        return;
    }

    subjects.forEach((subject) => {
        console.log("Rendering subject:", subject);
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h2>${subject.id}</h2>
            <h3>${subject.name}</h3>
        `;

        container.appendChild(card);
    });
}

// Fetch and display the student’s name as a greeting
async function displayStudentGreeting(uid) {
    try {
        console.log("Fetching student data for greeting with UID:", uid);
        const studentDoc = await getDoc(doc(db, "Students", uid));

        if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            const studentName = studentData.fullName;
            console.log("Student name retrieved:", studentName);
            document.getElementById('student-greeting').textContent = `Hello, ${studentName} 😊!`;
        } else {
            console.log("No student data found for UID:", uid);
        }
    } catch (error) {
        console.error("Error fetching student name:", error);
    }
}

// Main function for authentication and displaying data
function init() {
    auth.onAuthStateChanged(async (authUser) => {
        if (authUser) {
            const uid = authUser.uid;
            console.log("User logged in with UID:", uid);

            await displayStudentGreeting(uid);

            const approvedSubjects = await fetchApprovedSubjects(uid);
            console.log("Approved subjects to render:", approvedSubjects);
            renderSubjectsAsCards(approvedSubjects);
        } else {
            console.log('No user is currently logged in');
        }
    });
}

init();
