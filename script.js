// Subject Lists
const SUBJECT_LISTS = {
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
        "Physical Science"
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
        "Computers"
    ]
};

let currentPhase = localStorage.getItem("fhs_exam_phase") || "FET";
let currentStartTimeStr = localStorage.getItem("fhs_exam_starttime") || "08:00";
let currentVenue = localStorage.getItem("fhs_exam_venue") || "Centre Number 12038";
let currentSession = localStorage.getItem("fhs_exam_session") || "Session 1";

// Update Clock
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const [hours, minutes, seconds] = time.split(":");

    document.getElementById("clock").innerHTML =
        `${hours}:${minutes}:<span class="seconds">${seconds}</span>`;

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

// Convert "HH:MM" to minutes from midnight
function parseTimeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60) + m;
}

// Convert minutes from midnight to "HH:MM"
function formatMinutesToTime(totalMinutes) {
    let mins = (totalMinutes + 24 * 60) % (24 * 60);
    const hours = String(Math.floor(mins / 60)).padStart(2, "0");
    const minutes = String(mins % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
}

// Populate Venue Dropdown based on Phase
function updateVenueOptions() {
    const venueSelect = document.getElementById("venueSelect");
    venueSelect.innerHTML = "";

    const options = ["Centre Number 12038"];

    if (currentPhase === "FET") {
        for (let i = 1; i <= 15; i++) options.push(`Classroom F${i}`);
    } else {
        for (let i = 1; i <= 15; i++) options.push(`Classroom S${i}`);
    }
    options.push("Hall");

    options.forEach(opt => {
        const el = document.createElement("option");
        el.value = opt;
        el.textContent = opt;
        venueSelect.appendChild(el);
    });

    if (options.includes(currentVenue)) {
        venueSelect.value = currentVenue;
    } else {
        venueSelect.value = "Centre Number 12038";
        currentVenue = "Centre Number 12038";
        localStorage.setItem("fhs_exam_venue", currentVenue);
    }
}

// Set Active Phase
function setPhase(phase) {
    currentPhase = phase;
    localStorage.setItem("fhs_exam_phase", currentPhase);

    document.getElementById("phaseFetBtn").classList.toggle("active", phase === "FET");
    document.getElementById("phaseSeniorBtn").classList.toggle("active", phase === "SENIOR");

    updateVenueOptions();
    
    // Refresh subject dropdowns
    document.querySelectorAll(".subject").forEach(select => {
        const previousValue = select.value;
        select.innerHTML = "";
        SUBJECT_LISTS[currentPhase].forEach(sub => {
            const opt = document.createElement("option");
            opt.value = sub;
            opt.textContent = sub;
            select.appendChild(opt);
        });
        if (SUBJECT_LISTS[currentPhase].includes(previousValue)) {
            select.value = previousValue;
        }
    });
}

// Update calculated times for a single row
function updateRowTimes(row) {
    const startSelect = row.querySelector(".start-select");
    const customStartInput = row.querySelector(".custom-start-input");
    const durationSelect = row.querySelector(".duration-select");
    const customDurationInput = row.querySelector(".custom-duration-input");

    let startMins = 8 * 60; // default 08:00

    // Handle Start Time
    if (startSelect.value === "custom") {
        customStartInput.style.display = "block";
        const val = customStartInput.value;
        if (/^\d{2}:\d{2}$/.test(val)) {
            startMins = parseTimeToMinutes(val);
        }
    } else {
        customStartInput.style.display = "none";
        startMins = parseTimeToMinutes(startSelect.value);
    }

    // Reading time is strictly 10 minutes prior
    const readingMins = startMins - 10;
    row.querySelector(".readingTime").textContent = formatMinutesToTime(readingMins);
    row.querySelector(".startTimeDisplay").textContent = formatMinutesToTime(startMins);

    // Handle Duration & Stop Time
    let durationMins = 60;
    if (durationSelect.value === "custom") {
        customDurationInput.style.display = "block";
        durationMins = parseInt(customDurationInput.value, 10) || 0;
    } else {
        customDurationInput.style.display = "none";
        durationMins = parseInt(durationSelect.value, 10) || 0;
    }

    const stopMins = startMins + durationMins;
    row.querySelector(".stopTime").textContent = formatMinutesToTime(stopMins);
}

// Generate an Exam Row HTML
function createRowElement() {
    const tr = document.createElement("tr");
    tr.className = "exam-row";

    // Subjects
    const subjects = SUBJECT_LISTS[currentPhase];
    const subjectOpts = subjects.map(s => `<option value="${s}">${s}</option>`).join("");

    tr.innerHTML = `
        <td>
            <select class="subject" aria-label="Subject">
                ${subjectOpts}
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
            <input type="text" class="custom-paper-input" placeholder="Enter paper" style="display:none; margin-top:5px;">
        </td>
        <td>
            <select class="duration-select" aria-label="Duration">
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120" selected>2 hours</option>
                <option value="150">2.5 hours</option>
                <option value="180">3 hours</option>
                <option value="custom">Custom (mins)...</option>
            </select>
            <input type="number" class="custom-duration-input" placeholder="Mins" min="1" value="60" style="display:none; margin-top:5px; width:100%;">
        </td>
        <td class="readingTime">07:50</td>
        <td>
            <select class="start-select" aria-label="Start Time">
                <option value="07:35">07:35</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="12:00">12:00</option>
                <option value="14:00">14:00</option>
                <option value="custom">Custom...</option>
            </select>
            <input type="text" class="custom-start-input" placeholder="HH:MM" value="08:00" style="display:none; margin-top:5px;">
            <div class="startTimeDisplay" style="font-size: 0.8em; opacity: 0.8; margin-top:2px;">08:00</div>
        </td>
        <td class="stopTime">10:00</td>
        <td class="action-cell">
            <div class="action-btn-wrap">
                <button type="button" class="row-btn add-btn" title="Add Row" aria-label="Add exam row">+</button>
                <button type="button" class="row-btn delete-btn" title="Delete Row" aria-label="Delete exam row">−</button>
            </div>
        </td>
    `;

    // Initialize Start Time select value
    const startSelect = tr.querySelector(".start-select");
    if (["07:35", "08:00", "09:00", "12:00", "14:00"].includes(currentStartTimeStr)) {
        startSelect.value = currentStartTimeStr;
    } else {
        startSelect.value = "custom";
        const customInput = tr.querySelector(".custom-start-input");
        customInput.value = currentStartTimeStr;
        customInput.style.display = "block";
    }

    return tr;
}

// Sync Minus/Delete buttons display state
function updateDeleteButtonsState() {
    const rows = document.querySelectorAll(".exam-row");
    rows.forEach(row => {
        const delBtn = row.querySelector(".delete-btn");
        if (delBtn) {
            delBtn.classList.toggle("hidden", rows.length <= 1);
        }
    });
}

// Add row handler
function addRow(afterRow) {
    const newRow = createRowElement();
    if (afterRow) {
        afterRow.after(newRow);
    } else {
        document.getElementById("examRows").appendChild(newRow);
    }
    updateRowTimes(newRow);
    updateDeleteButtonsState();
}

// Delete row handler
function deleteRow(row) {
    const rows = document.querySelectorAll(".exam-row");
    if (rows.length > 1) {
        row.remove();
        updateDeleteButtonsState();
    }
}

// Fullscreen Toggle
async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (err) {
        console.error("Fullscreen toggle failed:", err);
    }
}

function updateFullscreenButton() {
    document.getElementById("fsBtn").textContent =
        document.fullscreenElement ? "Exit Full Screen" : "Go Full Screen";
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Session dropdown setup
    const sessionSelect = document.getElementById("sessionSelect");
    sessionSelect.value = currentSession;
    sessionSelect.addEventListener("change", (e) => {
        currentSession = e.target.value;
        localStorage.setItem("fhs_exam_session", currentSession);
    });

    // Phase toggle handlers
    document.getElementById("phaseFetBtn").addEventListener("click", () => setPhase("FET"));
    document.getElementById("phaseSeniorBtn").addEventListener("click", () => setPhase("SENIOR"));
    setPhase(currentPhase);

    // Venue handler
    document.getElementById("venueSelect").addEventListener("change", (e) => {
        currentVenue = e.target.value;
        localStorage.setItem("fhs_exam_venue", currentVenue);
    });

    // Initial Row Setup
    addRow();

    // Event Delegation for Table Events
    const tableBody = document.getElementById("examRows");

    tableBody.addEventListener("change", (e) => {
        const row = e.target.closest(".exam-row");
        if (!row) return;

        // Paper custom toggle
        if (e.target.classList.contains("paper-select")) {
            const customInput = row.querySelector(".custom-paper-input");
            customInput.style.display = e.target.value === "custom" ? "block" : "none";
        }

        // Start time changes
        if (e.target.classList.contains("start-select")) {
            if (e.target.value !== "custom") {
                currentStartTimeStr = e.target.value;
                localStorage.setItem("fhs_exam_starttime", currentStartTimeStr);
            }
        }

        // Custom start time input
        if (e.target.classList.contains("custom-start-input")) {
            currentStartTimeStr = e.target.value;
            localStorage.setItem("fhs_exam_starttime", currentStartTimeStr);
        }

        updateRowTimes(row);
    });

    tableBody.addEventListener("input", (e) => {
        const row = e.target.closest(".exam-row");
        if (row && (e.target.classList.contains("custom-duration-input") || e.target.classList.contains("custom-start-input"))) {
            updateRowTimes(row);
        }
    });

    tableBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const row = btn.closest(".exam-row");
        if (btn.classList.contains("add-btn")) {
            addRow(row);
        } else if (btn.classList.contains("delete-btn")) {
            deleteRow(row);
        }
    });

    // Fullscreen Listeners
    document.getElementById("fsBtn").addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateFullscreenButton);
});