// Register service worker for PWA
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(console.error);
    });
}

const $ = (id) => document.getElementById(id);
const nameEl = $("targetName");
const dEl = $("d");
const hEl = $("h");
const mEl = $("m");
const sEl = $("s");
const dLabel = $("days-label");
const hLabel = $("hours-label");
const mLabel = $("minutes-label");
const sLabel = $("seconds-label");

const meetingData = JSON.parse(localStorage.getItem("gfCountdown") || '{"dt":"2025-11-10T10:15:00.000Z","title":"Обнимемся в..."}');

// Confetti canvas
const confetti = document.getElementById("confetti");
const ctx = confetti.getContext("2d");

function resizeCanvas() {
    confetti.width = window.innerWidth;
    confetti.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let confettiActive = false;
let confettiStart = 0;
const pieces = [];

function makePiece() {
    return {
        x: Math.random() * confetti.width,
        y: -20,
        r: 4 + Math.random() * 6,
        a: Math.random() * Math.PI * 2,
        s: 1 + Math.random() * 3,
        w: 8 + Math.random() * 12,
        h: 6 + Math.random() * 10,
        hue: Math.floor(Math.random() * 360),
        tilt: Math.random() * 2 * Math.PI
    };
}

function startConfetti() {
    confettiActive = true;
    confettiStart = performance.now();
    pieces.length = 0;
    for (let i = 0; i < 220; i++) pieces.push(makePiece());
    document.body.classList.add("celebrate");
    requestAnimationFrame(drawConfetti);
}

function drawConfetti(ts) {
    ctx.clearRect(0, 0, confetti.width, confetti.height);
    for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];
        p.y += p.s;
        p.x += Math.sin((p.y + p.a) / 30) * 0.8;
        p.tilt += 0.05;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tilt);
        ctx.fillStyle = `hsl(${p.hue} 90% 60%)`;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.y > confetti.height + 20) {
            pieces[i] = makePiece();
        }
    }
    // keep running while app is open (after date), otherwise stop after 9s
    if (isAfterTarget()) {
        requestAnimationFrame(drawConfetti);
    } else if (ts - confettiStart < 9000) {
        requestAnimationFrame(drawConfetti);
    } else {
        confettiActive = false;
        ctx.clearRect(0, 0, confetti.width, confetti.height);
        document.body.classList.remove("celebrate");
    }
}

function isAfterTarget() {
    const data = meetingData
    if (!data.dt) return false;
    const target = new Date(data.dt);
    return (new Date()) - target > 0;
}

// Load saved
const saved = meetingData;

if (saved.title) {
    nameEl.textContent = saved.title || "Next date with GF";
}

function fmtDate(dt) {
    try {
        return dt.toLocaleString([], {dateStyle: "full", timeStyle: "short"});
    } catch (e) {
        return dt.toString();
    }
}

function pluralize(n, forms) {
    // forms: ['день', 'дня', 'дней']
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}

function tick() {
    const data = meetingData
    if (!data.dt) return;
    const target = new Date(data.dt);

    const now = new Date();
    let diff = Math.max(0, target - now);
    const sec = Math.floor(diff / 1000) % 60;
    const min = Math.floor(diff / 60000) % 60;
    const hr = Math.floor(diff / 3600000) % 24;
    const day = Math.floor(diff / 86400000);

    dEl.textContent = day;
    hEl.textContent = hr;
    mEl.textContent = min;
    sEl.textContent = sec;

    dLabel.textContent = pluralize(day, ['день', 'дня', 'дней']);
    hLabel.textContent = pluralize(hr, ['час', 'часа', 'часов']);
    mLabel.textContent = pluralize(min, ['минута', 'минуты', 'минут']);
    sLabel.textContent = pluralize(sec, ['секунда', 'секунды', 'секунд']);

    // Start confetti every time app is opened after the date
    if (!confettiActive && isAfterTarget()) {
        startConfetti();
    }
}

setInterval(tick, 1000);
tick();
