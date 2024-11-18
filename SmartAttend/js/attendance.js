// attendance.js
import { db } from './FirebaseConfig.js'; // Import your Firestore configuration
import { doc, setDoc } from 'firebase/firestore';

/**
 * Function to check in attendance for a student.
 * @param {string} uid - The user's unique ID.
 * @param {string} classId - The class ID for which the student is checking in.
 */
async function checkInAttendance(uid, classId) {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const timeSlot = "10AM"; // You can customize this based on your needs
    const attendancePath = `Subjects/BIT301/Classes/${date}-${timeSlot}/Attendance/${uid}`;

    try {
        // Create or update the attendance document for the user
        await setDoc(doc(db, attendancePath), {
            checkedIn: true,
            timestamp: new Date().toISOString(), // Store the check-in time
        });

        console.log(`Attendance checked in for UID: ${uid} in ${classId}`);
    } catch (error) {
        console.error("Error checking in attendance:", error);
    }
}

export { checkInAttendance };
