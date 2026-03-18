let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
let ringingIndex = null;

// CLOCK
function updateClock() {
    let now = new Date();

    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();

    let ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    let time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm}`;
    document.getElementById("clock").innerText = time;

    document.getElementById("date").innerText = now.toDateString();

    checkAlarms(now);
}

setInterval(updateClock, 1000);

// ADD
function addAlarm() {
    let time = document.getElementById("alarmTime").value;
    let tone = document.getElementById("tone").value;

    if (!time) return alert("Select time!");

    alarms.push({ time, tone, active: true, triggered: false });
    saveAlarms();
    renderAlarms();
}

// RENDER
function renderAlarms() {
    let list = document.getElementById("alarmList");
    list.innerHTML = "";

    alarms.forEach((alarm, index) => {
        let div = document.createElement("div");
        div.className = "alarm-item";

        div.innerHTML = `
            ${alarm.time} (${alarm.tone})
            <button onclick="deleteAlarm(${index})">Delete</button>
            <button onclick="toggleAlarm(${index})">
                ${alarm.active ? "Disable" : "Enable"}
            </button>
        `;

        list.appendChild(div);
    });
}

// DELETE
function deleteAlarm(i) {
    alarms.splice(i,1);
    saveAlarms();
    renderAlarms();
}

// TOGGLE
function toggleAlarm(i) {
    alarms[i].active = !alarms[i].active;
    saveAlarms();
    renderAlarms();
}

// CHECK
function checkAlarms(now) {
    let current = now.toTimeString().slice(0,5);

    alarms.forEach((alarm, index) => {
        if (
            alarm.active &&
            alarm.time === current &&
            !alarm.triggered
        ) {
            ringingIndex = index;
            alarm.triggered = true; // ✅ prevent repeat
            saveAlarms();
            playAlarm(alarm.tone);
        }
    });
}

// PLAY
let currentAudio = null; // 🔥 Track active audio

function playAlarm(tone) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = document.getElementById(tone);
    currentAudio.loop = true;
    currentAudio.play();

    document.getElementById("status").innerHTML = `
        ⏰ Alarm Ringing!<br>
        <button onclick="stopAlarm()">Stop</button>
        <button onclick="snooze()">Snooze</button>
    `;
}

// STOP

function stopAlarm() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    if (ringingIndex !== null) {
        alarms[ringingIndex].triggered = true; // ✅ lock it
        saveAlarms();
    }

    ringingIndex = null;
    document.getElementById("status").innerText = "Stopped";
}

// SNOOZE
function snooze() {
    let now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    let h = String(now.getHours()).padStart(2,'0');
    let m = String(now.getMinutes()).padStart(2,'0');

    alarms[ringingIndex].time = `${h}:${m}`;

    saveAlarms();
    renderAlarms();
    stopAlarm();
}

// SAVE
function saveAlarms() {
    localStorage.setItem("alarms", JSON.stringify(alarms));
}

// INIT
renderAlarms();