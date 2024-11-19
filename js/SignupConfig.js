import { auth, db, setDoc, doc, createUserWithEmailAndPassword, getDocs, collection, query, where } from './FirebaseConfig.js';
import { toastrOptions } from './toastrConfig.js';

toastr.options = toastrOptions;

// Function to check if email is a valid @helplive.edu.my email
function isValidHelpLiveEmail(email) {
    return email.endsWith('@helplive.edu.my');
}

// Function to check if the studentId is unique in Firestore
async function isStudentIdUnique(studentId) {
    const studentsRef = collection(db, "Students");
    const q = query(studentsRef, where("studentID", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Returns true if no documents match, meaning studentId is unique
}

// Function to handle user sign-up with email and student ID validation
export const handleSignUp = async (email, password, fullName, department, studentId, phone, imageURL = '') => {
    // Check if email is valid
    if (!isValidHelpLiveEmail(email)) {
        console.error("Registration failed: Email must be a @helplive.edu.my address.");
        toastr.warning("Please use a @helplive.edu.my email address to register.");
        return false; // Exit function if email is invalid
    }

    // Check if studentId is unique
    const uniqueStudentId = await isStudentIdUnique(studentId);
    if (!uniqueStudentId) {
        console.error("Registration failed: Duplicate student ID.");
        toastr.warning("This student ID is already registered. Please use a unique student ID.");
        return false; // Exit function if studentId is not unique
    }

    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Proceed to create user document in Firestore
        await createUserInFirestore(uid, fullName, department, studentId, phone, imageURL);
        console.log("User registered and Firestore document created successfully!");
        return true;

    } catch (error) {
        console.error("Error during sign-up:", error);
        throw error; // Throw error so that the calling function can handle it
    }
};

// Function to create a user document in Firestore
export const createUserInFirestore = async (uid, fullName, department, studentId, phone, imageURL = '') => {
    try {
        await setDoc(doc(db, "Students", uid), {
            fullName: fullName,
            studentID: studentId,
            email: auth.currentUser.email,
            phone: phone,
            profileImageURL: imageURL,
            department,
            attendance: {
                absences: 0,
                medicalCertificateSubmitted: 0,
                totalClassesAttended: 0,
                upcomingClasses: 0
            }
        });
        console.log("User document successfully written in Firestore!");
    } catch (error) {
        console.error("Error writing document to Firestore:", error);
        throw error;
    }
};
