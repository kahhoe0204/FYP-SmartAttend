const subjects = {
    "BIT": {
        "1": [
            { code: "BIT101", name: "Computer Architecture and Organisation" },
            { code: "BIT102", name: "Web Design and Development" },
            { code: "BIT103", name: "Introduction to Database Systems" },
            { code: "BIT104", name: "Applied Mathematics Studies" },
            { code: "BIT106", name: "Object Oriented Programming" },
            { code: "BIT107", name: "Data Communications and Networking" },
            { code: "BIT108", name: "Discrete Mathematics" },
            { code: "BIT110", name: "Introduction to Operating Systems" }
        ],
        "2": [
            { code: "BIT200", name: "Technopreneurship and Innovation" },
            { code: "BIT201", name: "Systems Architecture and Design" },
            { code: "BIT206", name: "User Experience Design" },
            { code: "BIT210", name: "Advanced Web development" },
            { code: "BIT212", name: "Cloud Computing" },
            { code: "BIT216", name: "Software Engineering Principles" },
            { code: "BIT217", name: "Internet of Things" },
            { code: "BIT219", name: "Introduction to Mobile Apps" }
        ],
        "3": [
            { code: "BIT301", name: "IT Project Management" },
            { code: "BIT303", name: "Data Analytics" },
            { code: "BIT304", name: "Final Year Project I" },
            { code: "BIT305", name: "Final Year Project II" },
            { code: "BIT306", name: "Enterprise Application Development" },
            { code: "BIT310", name: "Startup Ideation" },
            { code: "BIT311", name: "Mobile Applications Development" },
            { code: "BIT312", name: "Cloud Solutions Development" }
        ]
    },
    "BDA": {
        "1": [
            { code: "BDA100", name: "Programming Fundamentals" },
            { code: "BDA101", name: "Analytics for Decision Making" }
        ],
        "2": [
            { code: "BDA203", name: "Advanced Database Systems" },
            { code: "BDA205", name: "Data Mining and Visualization" },
            { code: "BDA206", name: "Enterprise Data Infrastructure" }
        ],
        "3": [
            { code: "BDA306", name: "Machine Learning and AI" },
            { code: "BDA307", name: "Big Data Technologies" }
        ]
    },
    "BCS": {
        "1": [
            { code: "BCS102", name: "Fundamentals of AI" },
            { code: "BCS105", name: "Multimedia Systems" }
        ],
        "2": [
            { code: "BCS201", name: "Data Structures and Algorithms" },
            { code: "BCS202", name: "Computer Systems Engineering" }
        ],
        "3": [
            { code: "BCS302", name: "Cyber-defense and Ethical Hacking" }
        ]
    }
};

function filterSubjects() {
    const department = document.getElementById('department').value;
    const year = document.getElementById('year').value;
    const yearSelect = document.getElementById('year');
    const subjectSelect = document.getElementById('subject');

    // Reset the subject dropdown
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    subjectSelect.disabled = true;

    // Enable or disable year dropdown based on department selection
    if (department) {
        yearSelect.disabled = false;
    } else {
        yearSelect.disabled = true;
        yearSelect.value = ""; // Reset the year dropdown
    }

    // Populate and enable subject dropdown if both department and year are selected
    if (department && year && subjects[department] && subjects[department][year]) {
        subjects[department][year].forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.code;
            option.textContent = `${subject.code} - ${subject.name}`;
            subjectSelect.appendChild(option);
        });
        subjectSelect.disabled = false;
    }
}
