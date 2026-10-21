const academicSubjectCatalog = {
    FET: [
        "Accounting",
        "Afrikaans",
        "Business Studies",
        "CAT",
        "EGD",
        "English",
        "History",
        "IT",
        "Life Orientation",
        "Math Literacy",
        "Mathematics",
        "Tourism",
        "Life Science",
        "Physical Science",
        "Custom..."
    ],
    SENIOR: [
        "Afrikaans",
        "Life Orientation",
        "English",
        "Natural Sciences",
        "Mathematics",
        "Creative Arts",
        "Robotics",
        "Social Sciences",
        "Technology",
        "Economic Management Sciences",
        "Computers",
        "Custom..."
    ]
};

let activeSchoolPhase = localStorage.getItem("fhs_exam_phase") || "FET";
let selectedDefaultStartTime = localStorage.getItem("fhs_exam_starttime") || "08:00";
let selectedExamVenue = localStorage.getItem("fhs_exam_venue") || "Centre Number 12038";

function refreshLiveClock() {
    const systemDateObj = new Date();
    const liveHours = systemDateObj.getHours();
    const liveMinutes = systemDateObj.getMinutes();
    const currentTotalMinutes = (liveHours * 60) + liveMinutes;

    const formattedTimeString = systemDateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const [hStr, mStr, sStr] = formattedTimeString.split(":");

    document.getElementById("clock").innerHTML =
        `${hStr}:${mStr}:<span class="seconds">${sStr}</span>`;

    document.getElementById("date").textContent =
        systemDateObj.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.querySelectorAll(".exam-row").forEach(tableRow => {
        const readingNode = tableRow.querySelector(".readingTime");
        const startSelectNode = tableRow.querySelector(".start-select");
        const stopNode = tableRow.querySelector(".stopTime");

        const readingMins = parseInt(tableRow.dataset.readingMins || "0", 10);
        const startMins = parseInt(tableRow.dataset.startMins || "0", 10);
        const stopMins = parseInt(tableRow.dataset.stopMins || "0", 10);

        readingNode.className = "readingTime text-white";
        startSelectNode.className = "start-select text-white";
        stopNode.className = "stopTime text-white";

        if (currentTotalMinutes >= readingMins) {
            readingNode.className = "readingTime text-green";
        }

        if (currentTotalMinutes >= startMins) {
            startSelectNode.className = "start-select text-green";
            stopNode.className = "stopTime text-green";
        }

        if (currentTotalMinutes >= stopMins) {
            stopNode.className = "stopTime text-red";
        }
    });
}

function convertClockStringToMinutes(timeInputStr) {
    const [h, m] = timeInputStr.split(":").map(Number);
    return (h * 60) + m;
}

function convertMinutesToClockString(totalMinutesVal) {
    let normalizedMins = (totalMinutesVal + 24 * 60) % (24 * 60);
    const calculatedHours = String(Math.floor(normalizedMins / 60)).padStart(2, "0");
    const calculatedMinutes = String(normalizedMins % 60).padStart(2, "0");
    return `${calculatedHours}:${calculatedMinutes}`;
}

function populateVenueDropdown() {
    const venueDropdownNode = document.getElementById("venueSelect");
    venueDropdownNode.innerHTML = "";

    const venueList = ["Centre Number 12038"];

    if (activeSchoolPhase === "FET") {
        for (let idx = 1; idx <= 15; idx++) venueList.push(`Classroom F${idx}`);
    } else {
        for (let idx = 1; idx <= 15; idx++) venueList.push(`Classroom S${idx}`);
    }
    venueList.push("Hall");

    venueList.forEach(venueName => {
        const optionElem = document.createElement("option");
        optionElem.value = venueName;
        optionElem.textContent = venueName;
        venueDropdownNode.appendChild(optionElem);
    });

    if (venueList.includes(selectedExamVenue)) {
        venueDropdownNode.value = selectedExamVenue;
    } else {
        venueDropdownNode.value = "Centre Number 12038";
        selectedExamVenue = "Centre Number 12038";
        localStorage.setItem("fhs_exam_venue", selectedExamVenue);
    }
}

function getGradeOptionsForPhase() {
    if (activeSchoolPhase === "FET") {
        return ["Grade 12", "Grade 11", "Grade 10", "Grade 9", "Grade 8", "Grade 7"];
    } else {
        return ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    }
}

function switchSchoolPhase(targetPhase) {
    activeSchoolPhase = targetPhase;
    localStorage.setItem("fhs_exam_phase", activeSchoolPhase);

    document.getElementById("phaseFetBtn").classList.toggle("active", targetPhase === "FET");
    document.getElementById("phaseSeniorBtn").classList.toggle("active", targetPhase === "SENIOR");

    populateVenueDropdown();
    
    // Refresh Grade dropdowns
    const gradeList = getGradeOptionsForPhase();
    document.querySelectorAll(".grade-select").forEach(gradeSelect => {
        const existingGradeVal = gradeSelect.value;
        gradeSelect.innerHTML = "";
        gradeList.forEach(gradeTitle => {
            const optTag = document.createElement("option");
            optTag.value = gradeTitle;
            optTag.textContent = gradeTitle;
            gradeSelect.appendChild(optTag);
        });
        const customGradeOpt = document.createElement("option");
        customGradeOpt.value = "custom";
        customGradeOpt.textContent = "Custom...";
        gradeSelect.appendChild(customGradeOpt);

        if (Array.from(gradeSelect.options).some(opt => opt.value === existingGradeVal || existingGradeVal.startsWith("custom:"))) {
            gradeSelect.value = existingGradeVal;
        } else {
            gradeSelect.selectedIndex = 0;
        }
    });

    // Refresh Subject dropdowns
    document.querySelectorAll(".subject").forEach(subjectSelect => {
        const existingSubjectVal = subjectSelect.value;
        subjectSelect.innerHTML = "";
        academicSubjectCatalog[activeSchoolPhase].forEach(subjectTitle => {
            const optTag = document.createElement("option");
            optTag.value = subjectTitle;
            optTag.textContent = subjectTitle === "Custom..." ? "Custom..." : subjectTitle;
            subjectSelect.appendChild(optTag);
        });
        if (Array.from(subjectSelect.options).some(opt => opt.value === existingSubjectVal || existingSubjectVal.startsWith("custom:"))) {
            subjectSelect.value = existingSubjectVal;
        } else {
            subjectSelect.selectedIndex = 0;
        }
    });

    scaleViewToFitScreen();
}

function recalculateRowSchedule(targetRow) {
    const startTimeDropdown = targetRow.querySelector(".start-select");
    const durationDropdown = targetRow.querySelector(".duration-select");

    let computedStartMinutes = 8 * 60;
    const startDropdownValue = startTimeDropdown.value;

    if (startDropdownValue.startsWith("custom:")) {
        const customTimeStr = startDropdownValue.substring(startDropdownValue.indexOf(":") + 1);
        computedStartMinutes = convertClockStringToMinutes(customTimeStr);
    } else {
        computedStartMinutes = convertClockStringToMinutes(startDropdownValue);
    }

    const computedReadingMinutes = computedStartMinutes - 10;
    targetRow.querySelector(".readingTime").textContent = convertMinutesToClockString(computedReadingMinutes);
    targetRow.dataset.readingMins = computedReadingMinutes;
    targetRow.dataset.startMins = computedStartMinutes;

    let computedDurationMinutes = 60;
    const durationValue = durationDropdown.value;

    if (durationValue.startsWith("custom_mins:")) {
        computedDurationMinutes = parseInt(durationValue.substring(durationValue.indexOf(":") + 1), 10) || 0;
    } else if (durationValue.startsWith("custom_time:")) {
        const timeLenStr = durationValue.substring(durationValue.indexOf(":") + 1);
        const parts = timeLenStr.split(":");
        if (parts.length === 2) {
            computedDurationMinutes = (parseInt(parts[0], 10) * 60) + (parseInt(parts[1], 10) || 0);
        } else {
            computedDurationMinutes = parseInt(timeLenStr, 10) || 0;
        }
    } else {
        computedDurationMinutes = parseInt(durationValue, 10) || 0;
    }

    const computedStopMinutes = computedStartMinutes + computedDurationMinutes;
    targetRow.querySelector(".stopTime").textContent = convertMinutesToClockString(computedStopMinutes);
    targetRow.dataset.stopMins = computedStopMinutes;

    scaleViewToFitScreen();
}

function buildExamRowNode() {
    const tableRowElement = document.createElement("tr");
    tableRowElement.className = "exam-row";

    const gradeList = getGradeOptionsForPhase();
    const gradeOptionsHtml = gradeList.map(g => `<option value="${g}">${g}</option>`).join("") + `<option value="custom">Custom...</option>`;

    const availableSubjectsList = academicSubjectCatalog[activeSchoolPhase];
    const generatedSubjectOptions = availableSubjectsList.map(subItem => `<option value="${subItem}">${subItem}</option>`).join("");

    tableRowElement.innerHTML = `
        <td>
            <select class="grade-select" aria-label="Grade">
                ${gradeOptionsHtml}
            </select>
        </td>
        <td>
            <select class="subject" aria-label="Subject">
                ${generatedSubjectOptions}
            </select>
        </td>
        <td>
            <select class="paper-select" aria-label="Paper">
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="CAT">CAT</option>
                <option value="PAT">PAT</option>
                <option value="-">-</option>
                <option value="custom">Custom...</option>
            </select>
        </td>
        <td>
            <select class="duration-select" aria-label="Duration">
                <option value="60">1h</option>
                <option value="90">1h 30m</option>
                <option value="120" selected>2h</option>
                <option value="150">2h 30m</option>
                <option value="180">3h</option>
                <option value="custom_mins">Custom Minutes...</option>
                <option value="custom_time">Custom Time Length...</option>
            </select>
        </td>
        <td class="readingTime text-white">07:50</td>
        <td>
            <select class="start-select text-white" aria-label="Start Time">
                <option value="07:35">07:35</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="12:00">12:00</option>
                <option value="14:00">14:00</option>
                <option value="custom">Custom...</option>
            </select>
        </td>
        <td class="stopTime text-white">10:00</td>
        <td class="action-cell">
            <div class="action-btn-wrap">
                <button type="button" class="row-btn add-btn" title="Add Row" aria-label="Add exam row">+</button>
                <button type="button" class="row-btn delete-btn" title="Delete Row" aria-label="Delete exam row">−</button>
            </div>
        </td>
    `;

    const startSelectDropdown = tableRowElement.querySelector(".start-select");
    if (["07:35", "08:00", "09:00", "12:00", "14:00"].includes(selectedDefaultStartTime)) {
        startSelectDropdown.value = selectedDefaultStartTime;
    } else {
        const customOption = document.createElement("option");
        customOption.value = `custom:${selectedDefaultStartTime}`;
        customOption.textContent = selectedDefaultStartTime;
        startSelectDropdown.insertBefore(customOption, startSelectDropdown.lastElementChild);
        startSelectDropdown.value = customOption.value;
    }

    return tableRowElement;
}

function refreshActionButtonsVisibility() {
    const totalExamRows = document.querySelectorAll(".exam-row");
    
    totalExamRows.forEach(rowItem => {
        const deleteButtonNode = rowItem.querySelector(".delete-btn");
        const addButtonNode = rowItem.querySelector(".add-btn");

        if (deleteButtonNode) {
            deleteButtonNode.classList.toggle("hidden", totalExamRows.length <= 1);
        }

        if (addButtonNode) {
            addButtonNode.classList.toggle("hidden", totalExamRows.length >= 7); // Updated max row limit to 7
        }
    });
}

function scaleViewToFitScreen() {
    const mainAppContainer = document.getElementById("appContainer");
    if (!mainAppContainer) return;

    mainAppContainer.style.transform = "none";
    const screenHeight = window.innerHeight;
    const contentTotalHeight = mainAppContainer.scrollHeight;

    if (contentTotalHeight > screenHeight - 10) {
        const computedScale = (screenHeight - 20) / contentTotalHeight;
        mainAppContainer.style.transform = `scale(${Math.max(computedScale, 0.4)})`;
    } else {
        mainAppContainer.style.transform = "none";
    }
}

function insertNewExamRow(referenceRow) {
    const allRows = document.querySelectorAll(".exam-row");
    if (allRows.length >= 7) return; // Updated max row limit to 7

    const newlyCreatedRow = buildExamRowNode();
    if (referenceRow) {
        referenceRow.after(newlyCreatedRow);
    } else {
        document.getElementById("examRows").appendChild(newlyCreatedRow);
    }
    recalculateRowSchedule(newlyCreatedRow);
    refreshActionButtonsVisibility();
    scaleViewToFitScreen();
}

function removeExamRow(targetRow) {
    const activeRowsList = document.querySelectorAll(".exam-row");
    if (activeRowsList.length > 1) {
        targetRow.remove();
        refreshActionButtonsVisibility();
        scaleViewToFitScreen();
    }
}

async function toggleDisplayFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (errorLog) {
        console.error("Fullscreen toggle error:", errorLog);
    }
}

function updateFullscreenButtonText() {
    document.getElementById("fsBtn").textContent =
        document.fullscreenElement ? "Exit Full Screen" : "Go Full Screen";
}

document.addEventListener("DOMContentLoaded", () => {
    refreshLiveClock();
    setInterval(refreshLiveClock, 1000);

    document.getElementById("phaseFetBtn").addEventListener("click", () => switchSchoolPhase("FET"));
    document.getElementById("phaseSeniorBtn").addEventListener("click", () => switchSchoolPhase("SENIOR"));
    switchSchoolPhase(activeSchoolPhase);

    document.getElementById("venueSelect").addEventListener("change", (eventObj) => {
        selectedExamVenue = eventObj.target.value;
        localStorage.setItem("fhs_exam_venue", selectedExamVenue);
    });

    // Assessment Header Selection Handler
    document.getElementById("assessmentHeaderSelect").addEventListener("change", (eventObj) => {
        const assessmentDropdown = eventObj.target;
        if (assessmentDropdown.value === "custom") {
            const customTitleInput = prompt("Enter custom option information (e.g. PRACTICAL ASSESSMENT):", "PRACTICAL ASSESSMENT");
            if (customTitleInput && customTitleInput.trim() !== "") {
                const cleanTitle = `${customTitleInput.trim().toUpperCase()} INFORMATION`;
                let existingOpt = Array.from(assessmentDropdown.options).find(opt => opt.value === cleanTitle);
                if (!existingOpt) {
                    existingOpt = document.createElement("option");
                    existingOpt.value = cleanTitle;
                    existingOpt.textContent = cleanTitle;
                    assessmentDropdown.insertBefore(existingOpt, assessmentDropdown.lastElementChild);
                }
                assessmentDropdown.value = existingOpt.value;
            } else {
                assessmentDropdown.value = "EXAM INFORMATION";
            }
        }
    });

    insertNewExamRow();

    const rowsTableContainer = document.getElementById("examRows");

    rowsTableContainer.addEventListener("change", (eventObj) => {
        const parentExamRow = eventObj.target.closest(".exam-row");
        if (!parentExamRow) return;

        // Custom Grade Selection Popup
        if (eventObj.target.classList.contains("grade-select")) {
            const gradeDropdown = eventObj.target;
            if (gradeDropdown.value === "custom") {
                const userGradeInput = prompt("Enter custom grade (e.g. Grade 6):");
                if (userGradeInput && userGradeInput.trim() !== "") {
                    const cleanGradeName = userGradeInput.trim();
                    let existingGradeOpt = Array.from(gradeDropdown.options).find(opt => opt.value === `custom:${cleanGradeName}`);
                    if (!existingGradeOpt) {
                        existingGradeOpt = document.createElement("option");
                        existingGradeOpt.value = `custom:${cleanGradeName}`;
                        existingGradeOpt.textContent = cleanGradeName;
                        gradeDropdown.insertBefore(existingGradeOpt, gradeDropdown.lastElementChild);
                    }
                    gradeDropdown.value = existingGradeOpt.value;
                } else {
                    gradeDropdown.selectedIndex = 0;
                }
            }
        }

        // Custom Subject Selection Popup
        if (eventObj.target.classList.contains("subject")) {
            const subjectDropdown = eventObj.target;
            if (subjectDropdown.value === "Custom...") {
                const userSubjectInput = prompt("Enter custom subject name:");
                if (userSubjectInput && userSubjectInput.trim() !== "") {
                    const cleanSubjectName = userSubjectInput.trim();
                    let existingSubjectOpt = Array.from(subjectDropdown.options).find(opt => opt.value === `custom:${cleanSubjectName}`);
                    if (!existingSubjectOpt) {
                        existingSubjectOpt = document.createElement("option");
                        existingSubjectOpt.value = `custom:${cleanSubjectName}`;
                        existingSubjectOpt.textContent = cleanSubjectName;
                        subjectDropdown.insertBefore(existingSubjectOpt, subjectDropdown.lastElementChild);
                    }
                    subjectDropdown.value = existingSubjectOpt.value;
                } else {
                    subjectDropdown.selectedIndex = 0;
                }
            }
        }

        // Custom Paper Selection Popup
        if (eventObj.target.classList.contains("paper-select")) {
            const paperDropdown = eventObj.target;
            if (paperDropdown.value === "custom") {
                const userPaperInput = prompt("Enter custom paper (e.g. P4 or CAT):");
                if (userPaperInput && userPaperInput.trim() !== "") {
                    const cleanPaperName = userPaperInput.trim();
                    let existingCustomOpt = Array.from(paperDropdown.options).find(opt => opt.value === `custom:${cleanPaperName}`);
                    if (!existingCustomOpt) {
                        existingCustomOpt = document.createElement("option");
                        existingCustomOpt.value = `custom:${cleanPaperName}`;
                        existingCustomOpt.textContent = cleanPaperName;
                        paperDropdown.insertBefore(existingCustomOpt, paperDropdown.lastElementChild);
                    }
                    paperDropdown.value = existingCustomOpt.value;
                } else {
                    paperDropdown.value = "P1";
                }
            }
            scaleViewToFitScreen();
        }

        // Custom Start Time Selection Popup
        if (eventObj.target.classList.contains("start-select")) {
            const startDropdown = eventObj.target;
            if (startDropdown.value === "custom") {
                const userStartTime = prompt("Enter custom start time (HH:MM format, e.g. 08:30):", "08:30");
                if (userStartTime && /^\d{1,2}:\d{2}$/.test(userStartTime.trim())) {
                    const cleanTimeStr = userStartTime.trim();
                    let existingTimeOpt = Array.from(startDropdown.options).find(opt => opt.value === `custom:${cleanTimeStr}`);
                    if (!existingTimeOpt) {
                        existingTimeOpt = document.createElement("option");
                        existingTimeOpt.value = `custom:${cleanTimeStr}`;
                        existingTimeOpt.textContent = cleanTimeStr;
                        startDropdown.insertBefore(existingTimeOpt, startDropdown.lastElementChild);
                    }
                    startDropdown.value = existingTimeOpt.value;
                    selectedDefaultStartTime = cleanTimeStr;
                    localStorage.setItem("fhs_exam_starttime", selectedDefaultStartTime);
                } else {
                    startDropdown.value = "08:00";
                }
            } else if (!startDropdown.value.startsWith("custom:")) {
                selectedDefaultStartTime = startDropdown.value;
                localStorage.setItem("fhs_exam_starttime", selectedDefaultStartTime);
            }
        }

        // Custom Duration Selection Popup
        if (eventObj.target.classList.contains("duration-select")) {
            const durationDropdown = eventObj.target;
            if (durationDropdown.value === "custom_mins") {
                const userMins = prompt("Enter custom duration in minutes (e.g. 90):", "90");
                const parsedMins = parseInt(userMins, 10);
                if (!isNaN(parsedMins) && parsedMins > 0) {
                    const displayText = `${parsedMins} minutes`;
                    let existingMinsOpt = Array.from(durationDropdown.options).find(opt => opt.value === `custom_mins:${parsedMins}`);
                    if (!existingMinsOpt) {
                        existingMinsOpt = document.createElement("option");
                        existingMinsOpt.value = `custom_mins:${parsedMins}`;
                        existingMinsOpt.textContent = displayText;
                        durationDropdown.insertBefore(existingMinsOpt, durationDropdown.querySelector("option[value='custom_mins']"));
                    }
                    durationDropdown.value = existingMinsOpt.value;
                } else {
                    durationDropdown.value = "120";
                }
            } else if (durationDropdown.value === "custom_time") {
                const userTimeLen = prompt("Enter custom time length (HH:MM format, e.g. 1:45):", "1:45");
                if (userTimeLen && /^\d{1,2}:\d{2}$/.test(userTimeLen.trim())) {
                    const cleanTimeLen = userTimeLen.trim();
                    const parts = cleanTimeLen.split(":");
                    const hoursVal = parseInt(parts[0], 10);
                    const minsVal = parseInt(parts[1], 10);
                    const displayText = `${hoursVal}h ${minsVal}m`;
                    let existingTimeLenOpt = Array.from(durationDropdown.options).find(opt => opt.value === `custom_time:${cleanTimeLen}`);
                    if (!existingTimeLenOpt) {
                        existingTimeLenOpt = document.createElement("option");
                        existingTimeLenOpt.value = `custom_time:${cleanTimeLen}`;
                        existingTimeLenOpt.textContent = displayText;
                        durationDropdown.appendChild(existingTimeLenOpt);
                    }
                    durationDropdown.value = existingTimeLenOpt.value;
                } else {
                    durationDropdown.value = "120";
                }
            }
        }

        recalculateRowSchedule(parentExamRow);
    });

    rowsTableContainer.addEventListener("click", (eventObj) => {
        const clickedButton = eventObj.target.closest("button");
        if (!clickedButton) return;

        const parentExamRow = clickedButton.closest(".exam-row");
        if (clickedButton.classList.contains("add-btn")) {
            insertNewExamRow(parentExamRow);
        } else if (clickedButton.classList.contains("delete-btn")) {
            removeExamRow(parentExamRow);
        }
    });

    document.getElementById("fsBtn").addEventListener("click", toggleDisplayFullscreen);
    document.addEventListener("fullscreenchange", updateFullscreenButtonText);
    window.addEventListener("resize", scaleViewToFitScreen);

    setTimeout(scaleViewToFitScreen, 100);
});
