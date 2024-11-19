import readXlsxFile from 'https://cdn.jsdelivr.net/npm/read-excel-file@5.8.6/+esm';
import { collection, db, doc, getDocs, writeBatch } from './FirebaseConfig.js';
import { toastrOptions } from './toastrConfig.js';

toastr.options = toastrOptions;

const subjectCodes = [
    "BIT101", "BIT102", "BIT103", "BIT104", "BIT106", "BIT107", "BIT108", "BIT110",
    "BIT200", "BIT201", "BIT206", "BIT210", "BIT212", "BIT216", "BIT217", "BIT219",
    "BIT301", "BIT303", "BIT304", "BIT305", "BIT306", "BIT310", "BIT311", "BIT312",
    "BDA100", "BDA101", "BDA203", "BDA205", "BDA206", "BDA306", "BDA307",
    "BCS102", "BCS105", "BCS201", "BCS202", "BCS302"
  ];
  
  function getSemester() {
    const now = new Date();
    const shortSemesterStart = new Date('2024-05-27'); // Short semester start date
    const longSemesterStart1 = new Date('2024-08-19');  // Long semester start date (August)
    const longSemesterStart2 = new Date('2024-01-08');  // Long semester start date (January)

    const longSemesterEnd1 = new Date(longSemesterStart1);
    longSemesterEnd1.setMonth(longSemesterEnd1.getMonth() + 4);  // End of long semester (4 months duration)
    
    const longSemesterEnd2 = new Date(longSemesterStart2);
    longSemesterEnd2.setMonth(longSemesterEnd2.getMonth() + 4);  // End of long semester (4 months duration)

    // Check if it's in the short or long semester based on the current date
    if (now >= shortSemesterStart && now <= longSemesterStart1) {
        return { type: 'short', weeks: 7 };  // Short semester (7 weeks)
    } else if (
        (now >= longSemesterStart1 && now <= longSemesterEnd1) || 
        (now >= longSemesterStart2 && now <= longSemesterEnd2)
    ) {
        return { type: 'long', weeks: 14 };  // Long semester (14 weeks)
    } else {
        return { type: 'unknown', weeks: 0 };  // Default, shouldn't happen during an active semester
    }
}



// Function to delete all documents in /Subjects/{subjectCode}/Classes using batch operations
async function deleteClassesSubCollectionBatch(subjectCode, batch) {
    const classesRef = collection(db, 'Subjects', subjectCode, 'Classes');
    const snapshot = await getDocs(classesRef);

    if (snapshot.empty) {
        console.log(`No documents found in /Subjects/${subjectCode}/Classes.`);
    } else {
        // Add each delete operation to the batch
        snapshot.docs.forEach(docSnapshot => {
            batch.delete(docSnapshot.ref);
        });
    }
}

// Function to delete the subject document after deleting the classes
async function deleteSubjectDocumentBatch(subjectCode, batch) {
    const subjectRef = doc(db, 'Subjects', subjectCode);
    batch.delete(subjectRef);
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

    return snapshot.empty; 
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
            toastr.warning('Please upload a valid Excel file.');
            return;
        }

        // Use readXlsxFile to read the uploaded file
        readXlsxFile(file).then(function (data) {

            if (data && data.length > 0) {
                const headers = data[0]; // First row should contain the headers
                const expectedHeaders = ['Day', 'Subject Code', 'Venue', 'Time'];

                const isValid = expectedHeaders.every((header, index) => header === headers[index]);

                if (!isValid) {
                    toastr.error('Error: The file does not have the correct headers (Day, Subject Code, Venue, Time).');
                    return;
                }

                const parsedSubjects = processTimetableData(data);

                if (parsedSubjects) {
                    toastr.info('Timetable uploaded and processed successfully!');
                }
            } else {
                toastr.error('Error: Invalid Excel file format.');
            }
        }).catch(function (error) {
            toastr.error('Error reading Excel file:', error);
            toastr.error('Error processing file!');
        });

        // Implement the save button logic
        document.getElementById('save').addEventListener('click', async () => {

            const saveButton = document.getElementById('save');
            saveButton.disabled = true;

            const timetable = processTimetableDataFromUI();

            if (!timetable) {
                toastr.error('Error: No timetable data to save.');
                return;
            }

            try {
                // Check if /Subjects collection already exists
                const subjectsExist = await checkIfSubjectsExist();

                if (subjectsExist) {
                    // Ask the user for confirmation before overwriting
                    const confirmOverwrite = toastr.confirm('Existing subjects found. Do you want to overwrite the timetable?');
                    if (!confirmOverwrite) {
                        toastr.info('Timetable save operation cancelled.');
                        return;  // Stop if the user cancels the operation
                    }
                }

                // Proceed with deletion and saving
                await deleteAllSubjectsParallel();
                await saveTimetableToFirestore(timetable);

                toastr.success('Timetable saved successfully!');
            } catch (error) {
                toastr.error('Error saving timetable. Please try again.');
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
           toastr.error('Error: Timetable data is missing or invalid.');
            return null;
        }

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
    const semester = getSemester();  // Get the current semester
    const numberOfWeeks = semester.weeks;  // Get the weeks based on the semester type

    if (semester.type === 'unknown') {
        toastr.eroor('Error: Could not determine the semester.');
        return;
    }

    // Get the start date of the semester (based on the current semester)
    const semesterStartDate = getSemesterStartDate();

    try {
        const batch = writeBatch(db);

        // Iterate over each subject in the timetable
        Object.keys(timetable).forEach(subjectCode => {
            const subjectRef = doc(db, 'Subjects', subjectCode);

            // Iterate over the weeks
            for (let week = 1; week <= numberOfWeeks; week++) {
                // Iterate over the time slots for the subject
                timetable[subjectCode].forEach(timeSlot => {
                    // Get the class day (e.g., Monday, Tuesday)
                    const classDay = timeSlot.split('_')[0];

                    // Calculate the class date for the specific week and day
                    const classDate = getClassDateForWeek(semesterStartDate, classDay, week);

                    // Create the sub-collection document name with the format 'date_timeSlot'
                    const classRef = doc(collection(subjectRef, 'Classes'), `${classDate}_${timeSlot}`);

                    // Add the class to the batch
                    batch.set(classRef, {
                        attendance: {},  // Placeholder for student information
                        week,
                        timeSlot,
                        classDate
                    });
                });
            }
        });

        await batch.commit(); 
        toastr.success('New timetable saved successfully.');
    } catch (error) {
        toastr.error('Error saving new timetable to database:', error);
        throw error; 
    }
}

// Helper function to get the start date of the semester
function getSemesterStartDate() {
    const now = new Date();
    const semester = getSemester(); // Get the current semester

    let semesterStartDate = null;

    if (semester.type === 'short') {
        // Short semester starts on May 27
        semesterStartDate = new Date('2024-05-27');
    } else if (semester.type === 'long') {
        // Long semester starts on August 19 or January 8
        const longSemesterStart1 = new Date('2024-08-19');
        const longSemesterStart2 = new Date('2024-01-08');

        // Choose the correct start date depending on the current date
        if (now >= longSemesterStart1 && now <= new Date(longSemesterStart1).setMonth(longSemesterStart1.getMonth() + 4)) {
            semesterStartDate = longSemesterStart1;
        } else if (now >= longSemesterStart2 && now <= new Date(longSemesterStart2).setMonth(longSemesterStart2.getMonth() + 4)) {
            semesterStartDate = longSemesterStart2;
        }
    }

    return semesterStartDate;
}

// Helper function to calculate the date for a specific class day and week
function getClassDateForWeek(startDate, classDay, weekNumber) {
    const dayOfWeekMap = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5
    };

    // Start with the first day of the semester
    const classDate = new Date(startDate);

    // Find the first occurrence of the given class day
    let dayOffset = (dayOfWeekMap[classDay] - classDate.getDay() + 7) % 7;
    classDate.setDate(classDate.getDate() + dayOffset);

    // Add the number of weeks to the date to get the specific week
    classDate.setDate(classDate.getDate() + (weekNumber - 1) * 7);

    // Format the date to 'YYYY-MM-DD' (for example, '2024-08-19')
    const year = classDate.getFullYear();
    const month = (classDate.getMonth() + 1).toString().padStart(2, '0');  // Month is 0-based
    const day = classDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
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


