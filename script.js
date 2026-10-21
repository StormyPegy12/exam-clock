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

function parseTimeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60) + m;
}

function formatMinutesToTime(totalMinutes) {
    let mins = (totalMinutes + 24 * 60) % (24 * 60);
    const hours = String(Math.floor(mins / 60)).padStart(2, "0");
    const minutes = String(mins % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
}

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

function setPhase(phase) {
    currentPhase = phase;
    localStorage.setItem("fhs_exam_phase", currentPhase);

    document.getElementById("phaseFetBtn").classList.toggle("active", phase === "FET");
    document.getElementById("phaseSeniorBtn").classList.toggle("active", phase === "SENIOR");

    updateVenueOptions();
    
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

    autoFitScreen();
}

function updateRowTimes(row) {
    const startSelect = row.querySelector(".start-select");
    const customStartInput = row.querySelector(".custom-start-input");
    const durationSelect = row.querySelector(".duration-select");
    const customDurationInput = row.querySelector(".custom-duration-input");

    let startMins = 8 * 60;

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

    const readingMins = startMins - 10;
    row.querySelector(".readingTime").textContent = formatMinutesToTime(readingMins);
    row.querySelector(".startTimeDisplay").textContent = formatMinutesToTime(startMins);

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

    autoFitScreen();
}

function createRowElement() {
    const tr = document.createElement("tr");
    tr.className = "exam-row";

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
            <input type="text" class="custom-paper-input" placeholder="Enter paper" style="display:none; margin-top:4px;">
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
            <input type="number" class="custom-duration-input" placeholder="Mins" min="1" value="60" style="display:none; margin-top:4px; width:100%;">
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
            <input type="text" class="custom-start-input" placeholder="HH:MM" value="08:00" style="display:none; margin-top:4px;">
            <div class="startTimeDisplay" style="display:none;">08:00</div>
        </td>
        <td class="stopTime">10:00</td>
        <td class="action-cell">
            <div class="action-btn-wrap">
                <button type="button" class="row-btn add-btn" title="Add Row" aria-label="Add exam row">+</button>
                <button type="button" class="row-btn delete-btn" title="Delete Row" aria-label="Delete exam row">−</button>
            </div>
        </td>
    `;

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

function updateDeleteButtonsState() {
    const rows = document.querySelectorAll(".exam-row");
    rows.forEach(row => {
        const delBtn = row.querySelector(".delete-btn");
        if (delBtn) {
            delBtn.classList.toggle("hidden", rows.length <= 1);
        }
    });
}

function autoFitScreen() {
    const container = document.getElementById("appContainer");
    if (!container) return;

    container.style.transform = "none";
    const availableHeight = window.innerHeight;
    const contentHeight = container.scrollHeight;

    if (contentHeight > availableHeight - 10) {
        const scaleFactor = (availableHeight - 20) / contentHeight;
        container.style.transform = `scale(${Math.max(scaleFactor, 0.45)})`;
    } else {
        container.style.transform = "none";
    }
}

function addRow(afterRow) {
    const newRow = createRowElement();
    if (afterRow) {
        afterRow.after(newRow);
    } else {
        document.getElementById("examRows").appendChild(newRow);
    }
    updateRowTimes(newRow);
    updateDeleteButtonsState();
    autoFitScreen();
}

function deleteRow(row) {
    const rows = document.querySelectorAll(".exam-row");
    if (rows.length > 1) {
        row.remove();
        updateDeleteButtonsState();
        autoFitScreen();
    }
}

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

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);

    document.getElementById("phaseFetBtn").addEventListener("click", () => setPhase("FET"));
    document.getElementById("phaseSeniorBtn").addEventListener("click", () => setPhase("SENIOR"));
    setPhase(currentPhase);

    document.getElementById("venueSelect").addEventListener("change", (e) => {
        currentVenue = e.target.value;
        localStorage.setItem("fhs_exam_venue", currentVenue);
    });

    addRow();

    const tableBody = document.getElementById("examRows");

    tableBody.addEventListener("change", (e) => {
        const row = e.target.closest(".exam-row");
        if (!row) return;

        if (e.target.classList.contains("paper-select")) {
            const customInput = row.querySelector(".custom-paper-input");
            customInput.style.display = e.target.value === "custom" ? "block" : "none";
            autoFitScreen();
        }

        if (e.target.classList.contains("start-select")) {
            if (e.target.value !== "custom") {
                currentStartTimeStr = e.target.value;
                localStorage.setItem("fhs_exam_starttime", currentStartTimeStr);
            }
        }

        if (e.target.classList.contains("custom-start-input")) {
            currentStartTimeStr = e.target.value;
            localStorage.setItem("fhs_exam_starttime", currentStartTimeStr);
        }

        updateRowTimes(row);
    });

    tableBody.addEventListener("input", (e) => {
        const row = e.target.closest(".exam-row");
        if (row && (e.target.classList.contains("custom-duration-input") || e.target.classList.contains("custom-start-input") || e.target.classList.contains("custom-paper-input"))) {
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

    document.getElementById("fsBtn").addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateFullscreenButton);
    window.addEventListener("resize", autoFitScreen);

    setTimeout(autoFitScreen, 100);
});
