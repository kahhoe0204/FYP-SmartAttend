import { auth, db, doc, getDoc, collection, getDocs, setDoc } from './FirebaseConfig.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

toastr.options.positionClass = 'toast-bottom-right'; 

// Fetch approved subjects for logged-in user
async function fetchApprovedSubjects(uid) {
    try {
        const studentDoc = await getDoc(doc(db, "Students", uid));
        if (studentDoc.exists()) {
            const enrolledSubjects = studentDoc.data().enrolledSubjects || {};
            const approvedSubjects = Object.entries(enrolledSubjects)
                .filter(([_, subjectData]) => subjectData.status === "Enrolled")
                .map(([subjectId, subjectData]) => ({
                    id: subjectId,
                    ...subjectData
                }));
            return approvedSubjects;
        } else {
            toastr.error("Student document not found");
            return [];
        }
    } catch (error) {
        toastr.error("Error fetching approved subjects:", error);
        return [];
    }
}

// Fetch class schedules for a subject from Firestore
async function fetchClassSchedules(subjectId) {
    try {
        const classesRef = collection(db, 'Subjects', subjectId, 'Classes');
        const classesSnapshot = await getDocs(classesRef);

        const classSchedules = classesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return classSchedules;
    } catch (error) {
        toastr.error(`Error fetching classes for subject ${subjectId}:`, error);
        return [];
    }
}

// Check if a class is available at the current time
function isClassAvailable(schedule, now) {
    const [day, timeRange] = schedule.timeSlot.split('_'); //
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });

    if (day !== currentDay) {
        return false; 
    }

    // Parse the time range 
    const [startTime, endTime] = timeRange.split('-');

    const parseTime = (timeStr) => {
        const timeParts = timeStr.match(/(\d+)(AM|PM)/);
        if (timeParts) {
            let hour = parseInt(timeParts[1]);
            if (timeParts[2] === 'PM' && hour < 12) hour += 12; // Convert to 24-hour format
            return hour;
        }
        return null;
    };

    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);

    if (startHour === null || endHour === null) {
        console.error("Invalid time format in schedule:", timeRange);
        return false;
    }

    const currentHour = now.getHours();

    // Check if the current time is within the start and end times
    return currentHour >= startHour && currentHour < endHour;
}


// Render subjects in card format and handle schedule checks
async function renderSubjectsAsCards(subjects) {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';

    if (subjects.length === 0) {
        container.innerHTML = "<p>No enrolled subjects found.</p>";
        return;
    }

    const now = new Date();

    for (const subject of subjects) {
        const classSchedules = await fetchClassSchedules(subject.id);

        // Check if any class matches the current day and time
        const availableClass = classSchedules.find(schedule => isClassAvailable(schedule, now));

        // Create card element
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h2>${subject.id}</h2>
            <h3>${subject.name}</h3>
            <button 
                class="check-in-button" 
                data-subject-id="${subject.id}"
                data-class-id="${availableClass ? availableClass.id : ''}"
                ${!availableClass ? 'disabled' : ''} 
                style="${!availableClass ? 'background-color: grey; cursor: not-allowed;' : ''}">
                ${availableClass ? 'Check-In' : 'Unavailable'}
            </button>
        `;

        container.appendChild(card);
    }
}

// Fetch and display the student’s name as a greeting
async function displayStudentGreeting(uid) {
    try {
        const studentDoc = await getDoc(doc(db, "Students", uid));
        if (studentDoc.exists()) {
            const studentName = studentDoc.data().fullName || "Student";
            document.getElementById('student-greeting').textContent = `Hello, ${studentName} 😊!`;
        }
    } catch (error) {
        toastr.error("Error fetching student name:", error);
    }
}

// Handle Check-In Button Click
async function handleCheckIn(subjectId, classId) {
    if (!classId) {
        toastr.warning("Class is currently unavailable for check-in.");
        return;
    }

    try {
        const uid = auth.currentUser.uid;
        const studentDoc = await getDoc(doc(db, "Students", uid));

        if (!studentDoc.exists()) {
            toastr.error("Student document not found.");
            toastr.warning("Failed to retrieve student data. Please try again.");
            return;
        }

        const studentData = studentDoc.data();

        // Use Geolocation API to get the current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    // Reference to the class document's `students` map
                    const classRef = doc(db, `Subjects/${subjectId}/Classes/${classId}`);
                    const classSnapshot = await getDoc(classRef);

                    if (classSnapshot.exists()) {
                        const attendanceMap = classSnapshot.data().attendance || {};

                        // Add or update student information in the `students` map
                        attendanceMap[uid] = {
                            name: studentData.fullName,
                            email: studentData.email,
                            checkInTime,
                            status: "Present",
                            location: {
                                latitude,
                                longitude,
                            },
                        };

                        // Update the `students` map in the Firestore document
                        await setDoc(classRef, { attendance: attendanceMap }, { merge: true });
                        toastr.success("Check-In successful!");
                    } else {
                        console.error(`Class document ${classId} not found in subject ${subjectId}`);
                        toastr.warning("Class not found. Please try again.");
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toastr.warning("Failed to get location. Please enable location services and try again.");
                }
            );
        } else {
            toastr.warning("Geolocation is not supported by your browser.");
        }
    } catch (error) {
        console.error("Error during check-in:", error);
        toastr.warning("Failed to check in. Please try again.");
    }
}



// Add Event Listener for Check-In Buttons
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('check-in-button')) {
        const subjectId = e.target.getAttribute('data-subject-id');
        const classId = e.target.getAttribute('data-class-id');
        await handleCheckIn(subjectId, classId);
    }
});

// Main function for authentication and displaying data
function init() {
    auth.onAuthStateChanged(async (authUser) => {
        if (authUser) {
            const uid = authUser.uid;
            await displayStudentGreeting(uid);
            const approvedSubjects = await fetchApprovedSubjects(uid);
            await renderSubjectsAsCards(approvedSubjects);
        } else {
            toastr.info('No user is currently logged in');
        }
    });
}

init();
