import readXlsxFile from 'https://cdn.jsdelivr.net/npm/read-excel-file@5.8.6/+esm';
import { collection, db, doc, getDocs, deleteDoc, writeBatch } from './FirebaseConfig.js';

const subjectCodes = [
    "BIT101", "BIT102", "BIT103", "BIT104", "BIT106", "BIT107", "BIT108", "BIT110",
    "BIT200", "BIT201", "BIT206", "BIT210", "BIT212", "BIT216", "BIT217", "BIT219",
    "BIT301", "BIT303", "BIT304", "BIT305", "BIT306", "BIT310", "BIT311", "BIT312",
    "BDA100", "BDA101", "BDA203", "BDA205", "BDA206", "BDA306", "BDA307",
    "BCS102", "BCS105", "BCS201", "BCS202", "BCS302"
  ];
  

// Function to delete all documents in /Subjects/{subjectCode}/Classes using batch operations
async function deleteClassesSubCollectionBatch(subjectCode, batch) {
    const classesRef = collection(db, 'Subjects', subjectCode, 'Classes');
    const snapshot = await getDocs(classesRef);

    if (snapshot.empty) {
        console.log(`No documents found in /Subjects/${subjectCode}/Classes.`);
    } else {
        console.log(`Found ${snapshot.docs.length} document(s) in /Subjects/${subjectCode}/Classes.`);
        // Add each delete operation to the batch
        snapshot.docs.forEach(docSnapshot => {
            batch.delete(docSnapshot.ref);
            console.log(`Added to batch: ${docSnapshot.ref.path}`);
        });
    }
}

// Function to delete the subject document after deleting the classes
async function deleteSubjectDocumentBatch(subjectCode, batch) {
    const subjectRef = doc(db, 'Subjects', subjectCode);
    batch.delete(subjectRef);
    console.log(`Added to batch: /Subjects/${subjectCode}`);
}

async function deleteAllSubjectsParallel() {
    const deletePromises = subjectCodes.map(async subjectCode => {
        const batch = writeBatch(db);
        await deleteClassesSubCollectionBatch(subjectCode, batch);
        await deleteSubjectDocumentBatch(subjectCode, batch);
        return batch.commit();
    });

    await Promise.all(deletePromises);  // Wait for all deletions to complete in parallel
    console.log("All subject deletions completed.");
}

// Function to check if /Subjects collection already exists
async function checkIfSubjectsExist() {
    const subjectsRef = collection(db, 'Subjects');
    const snapshot = await getDocs(subjectsRef);

    return !snapshot.empty; 
}

// Modify the existing DOMContentLoaded listener to implement the delete functionality
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('timetable-file');
    const form = document.getElementById('upload-timetable-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const file = input.files[0];

        // Check if the file is an Excel file
        if (!file || !file.name.match(/\.(xls|xlsx)$/)) {
            alert('Please upload a valid Excel file.');
            return;
        }

        // Use readXlsxFile to read the uploaded file
        readXlsxFile(file).then(function (data) {
            console.log('Parsed Excel Data:', data);

            if (data && data.length > 0) {
                const headers = data[0]; // First row should contain the headers
                const expectedHeaders = ['Day', 'Subject Code', 'Venue', 'Time'];

                const isValid = expectedHeaders.every((header, index) => header === headers[index]);

                if (!isValid) {
                    document.getElementById('status').innerText = 'Error: The file does not have the correct headers (Day, Subject Code, Venue, Time).';
                    return;
                }

                const parsedSubjects = processTimetableData(data);

                if (parsedSubjects) {
                    document.getElementById('status').innerText = 'Timetable uploaded and processed successfully!';
                }
            } else {
                document.getElementById('status').innerText = 'Error: Invalid Excel file format.';
            }
        }).catch(function (error) {
            console.error('Error reading Excel file:', error);
            document.getElementById('status').innerText = 'Error processing file!';
        });

        // Implement the save button logic
        document.getElementById('save').addEventListener('click', async () => {
            console.log("Save button clicked once.");

            const saveButton = document.getElementById('save');
            saveButton.disabled = true;

            const timetable = processTimetableDataFromUI();
            console.log("Processed Timetable Data:", timetable);

            if (!timetable) {
                alert('Error: No timetable data to save.');
                return;
            }

            try {
                // Check if /Subjects collection already exists
                const subjectsExist = await checkIfSubjectsExist();

                if (subjectsExist) {
                    // Ask the user for confirmation before overwriting
                    const confirmOverwrite = confirm('Existing subjects found. Do you want to overwrite the timetable?');
                    if (!confirmOverwrite) {
                        alert('Timetable save operation cancelled.');
                        return;  // Stop if the user cancels the operation
                    }
                }

                // Proceed with deletion and saving
                await deleteAllSubjectsParallel();
                await saveTimetableToFirestore(timetable);

                alert('Timetable saved successfully!');
            } catch (error) {
                console.error('Error during save operation:', error);
                alert('Error saving timetable. Please try again.');
            } finally {
                saveButton.disabled = false;
            }
        });
    });

    // Remaining functions related to timetable processing and displaying
    function processTimetableData(rows) {
        const timetable = {
            Monday: {},
            Tuesday: {},
            Wednesday: {},
            Thursday: {},
            Friday: {}
        };

        let currentDay = '';

        rows.forEach((row, rowIndex) => {
            if (rowIndex === 0 || row[0] === 'Day' || row[0] === '') return;

            const subjectCode = row[1];
            const venue = row[2];
            const timeSlot = row[3];

            if (row[0] && row[0] !== currentDay) {
                currentDay = row[0];
            }

            if (subjectCode && venue && timeSlot) {
                if (!timetable[currentDay]) {
                    timetable[currentDay] = {};
                }

                if (!timetable[currentDay][timeSlot]) {
                    timetable[currentDay][timeSlot] = [];
                }

                timetable[currentDay][timeSlot].push({
                    subject: subjectCode,
                    venue: venue
                });
            }
        });

        if (Object.keys(timetable).length === 0 || !Object.values(timetable).some(day => Object.keys(day).length > 0)) {
            document.getElementById('status').innerText = 'Error: Timetable data is missing or invalid.';
            return null;
        }

        console.log('Final timetable:', timetable);
        return displayTimetable(timetable);
    }

    function displayTimetable(timetable) {
        const tableBody = document.getElementById('timetable').getElementsByTagName('tbody')[0];
        const tableHeader = document.getElementById('timetable').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];

        tableBody.innerHTML = '';
        tableHeader.innerHTML = '';

        const timeSlotHeader = document.createElement('th');
        timeSlotHeader.textContent = 'Time / Day';
        tableHeader.appendChild(timeSlotHeader);

        let timeSlots = new Set();
        Object.keys(timetable).forEach(day => {
            Object.keys(timetable[day]).forEach(timeSlot => {
                timeSlots.add(timeSlot);
            });
        });

        timeSlots = Array.from(timeSlots).sort((a, b) => {
            const timeOrder = {
                '9AM - 12PM': 1,
                '10AM - 1PM': 2,
                '2PM - 4PM': 3,
                '2PM - 5PM': 4,
                '3PM - 4PM': 5,
                '4PM - 5PM': 6
            };

            return timeOrder[a] - timeOrder[b];
        });

        timeSlots.forEach(timeSlot => {
            const timeSlotHeaderCell = document.createElement('th');
            timeSlotHeaderCell.textContent = timeSlot;
            tableHeader.appendChild(timeSlotHeaderCell);
        });

        Object.keys(timetable).forEach(day => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = day;

            timeSlots.forEach(timeSlot => {
                const cell = row.insertCell();
                const subjects = timetable[day][timeSlot];

                if (subjects && subjects.length > 0) {
                    let cellContent = '';
                    subjects.forEach(subject => {
                        cellContent += `${subject.subject} (${subject.venue}) <br><br>`;
                    });
                    cell.innerHTML = cellContent;
                } else {
                    cell.innerHTML = '';
                }
            });
        });
    }

    // Function to save the new timetable data
    async function saveTimetableToFirestore(timetable) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Months are 0-based
        const numberOfWeeks = [1, 2, 3, 8, 9, 10, 11, 12].includes(currentMonth) ? 14 : 7;

        try {
            console.log('Starting to save new timetable...');

            const batch = writeBatch(db);

            Object.keys(timetable).forEach(subjectCode => {
                const subjectRef = doc(db, 'Subjects', subjectCode);

                for (let week = 1; week <= numberOfWeeks; week++) {
                    timetable[subjectCode].forEach(timeSlot => {
                        // Create the sub-collection document for the week and time slot
                        const classRef = doc(collection(subjectRef, 'Classes'), `week${week}_${timeSlot}`);
                        batch.set(classRef, {
                            students: {}, 
                            week,
                            timeSlot
                        });
                    });
                }
            });

            await batch.commit(); 
            console.log('New timetable saved successfully.');
        } catch (error) {
            console.error('Error saving new timetable to Firestore:', error);
            throw error; 
        }
    }

    // Function to process timetable data from the UI
    function processTimetableDataFromUI() {
        const timetable = {};

        const tableBody = document.getElementById('timetable').getElementsByTagName('tbody')[0];
        const rows = tableBody.rows;

        for (let i = 0; i < rows.length; i++) {
            const day = rows[i].cells[0].textContent.trim();
            for (let j = 1; j < rows[i].cells.length; j++) {
                const timeSlot = document.querySelector('thead tr').cells[j].textContent.trim();
                const subjects = rows[i].cells[j].innerHTML.split('<br><br>').filter(Boolean);

                subjects.forEach(subjectWithVenue => {
                    const [subjectCode] = subjectWithVenue.replace(/\(|\)/g, '').split(' ');

                    if (!timetable[subjectCode]) {
                        timetable[subjectCode] = [];
                    }

                    timetable[subjectCode].push(`${day}_${timeSlot}`);
                });
            }
        }

        return timetable;
    }
});


