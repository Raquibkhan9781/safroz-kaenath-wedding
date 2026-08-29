const openBtn = document.getElementById("openBtn");
const envelope = document.getElementById("envelope");
const opening = document.getElementById("opening");
const site = document.getElementById("site");

function openInvitation(){
  const opening = document.getElementById("opening");
  const line = document.getElementById("openingLine");
  const button = document.getElementById("openBtn");

  if (opening.classList.contains("opened")) return;

  opening.classList.add("opened");
  line.textContent = "Opening your invitation…";
  button.textContent = "Opening…";

  // 1. Seal disappears and the envelope flap opens.
  // 2. The wedding card slides visibly out of the envelope.
  setTimeout(() => {
    opening.classList.add("reading");
    line.textContent = "Your wedding invitation";
  }, 1800);

  // 3. Keep the card on screen long enough to clearly see it.
  setTimeout(() => {
    opening.classList.add("fade-away");
  }, 4000);

  // 4. Show the complete invitation after the card reveal.
  setTimeout(() => {
    opening.style.display = "none";
    site.classList.remove("hidden");
    window.scrollTo(0, 0);
  }, 4900);
}
openBtn.addEventListener("click", openInvitation);
envelope.addEventListener("click", openInvitation);

// Countdown: 19 November 2026, 9:00 PM IST
const target = new Date("2026-11-19T21:00:00+05:30").getTime();
function tick(){
  let diff = target - Date.now();
  if(diff < 0) diff = 0;
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff/3600000)%24;
  const m = Math.floor(diff/60000)%60;
  const s = Math.floor(diff/1000)%60;
  document.getElementById("days").textContent = String(d).padStart(3,"0");
  document.getElementById("hours").textContent = String(h).padStart(2,"0");
  document.getElementById("minutes").textContent = String(m).padStart(2,"0");
  document.getElementById("seconds").textContent = String(s).padStart(2,"0");
}
tick(); setInterval(tick,1000);

// Reveal animations
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("show")});
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));


// ===== Scratch & Reveal — touch + mouse + animated scratch effect =====
(() => {
  const canvas = document.getElementById("scratchCanvas");
  const card = document.getElementById("scratchCard");
  const status = document.getElementById("scratchStatus");
  const cursor = document.getElementById("scratchCursor");

  if (!canvas || !card) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let drawing = false;
  let revealed = false;
  let scratchedPixels = 0;
  let lastX = null;
  let lastY = null;

  function setupCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Golden scratch coating.
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#8c592e");
    gradient.addColorStop(0.28, "#e5bb76");
    gradient.addColorStop(0.5, "#f6d99d");
    gradient.addColorStop(0.72, "#c68b4b");
    gradient.addColorStop(1, "#70421f");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Metallic lines / texture make it visibly scratchable.
    for (let y = -rect.height; y < rect.height * 2; y += 9) {
      ctx.strokeStyle = "rgba(255,245,215,.20)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y + rect.width * .12);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff0cc";
    ctx.font = "700 13px Montserrat, sans-serif";
    ctx.fillText("SCRATCH TO REVEAL", rect.width / 2, rect.height / 2 + 18);

    ctx.font = "26px serif";
    ctx.fillText("✦", rect.width / 2, rect.height / 2 - 18);
  }

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function scratchAt(x, y) {
    if (revealed) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 48;

    if (lastX !== null) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Little dust particles give the feeling of physically scratching.
    createScratchSpark(x, y);

    lastX = x;
    lastY = y;
    scratchedPixels += 1;

    if (scratchedPixels % 8 === 0) checkReveal();
  }

  function createScratchSpark(x, y) {
    const spark = document.createElement("span");
    spark.className = "scratch-spark";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.textContent = Math.random() > .5 ? "✦" : "·";
    card.appendChild(spark);
    setTimeout(() => spark.remove(), 650);
  }

  function checkReveal() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const sampleStep = 32;

    for (let i = 3; i < pixels.length; i += 4 * sampleStep) {
      if (pixels[i] < 90) transparent++;
    }

    const ratio = transparent / Math.max(1, Math.ceil(pixels.length / (4 * sampleStep)));

    if (ratio >= 0.52) {
      reveal();
    } else {
      status.textContent = "Keep scratching… ✨";
    }
  }

  function reveal() {
    if (revealed) return;
    revealed = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    card.classList.add("revealed");
    status.textContent = "🎉 Surprise revealed!";
    status.classList.add("reveal-done");

    // Celebration burst.
    for (let i = 0; i < 18; i++) {
      setTimeout(() => {
        const rect = card.getBoundingClientRect();
        const x = rect.width / 2 + (Math.random() - .5) * rect.width * .7;
        const y = rect.height / 2 + (Math.random() - .5) * rect.height * .5;
        createScratchSpark(x, y);
      }, i * 35);
    }
  }

  function start(e) {
    if (revealed) return;
    drawing = true;
    lastX = null;
    lastY = null;
    canvas.setPointerCapture?.(e.pointerId);
    const p = pointFromEvent(e);
    scratchAt(p.x, p.y);
    if (cursor) {
      cursor.style.opacity = "0";
    }
  }

  function move(e) {
    const p = pointFromEvent(e);
    if (cursor) {
      cursor.style.left = `${p.x}px`;
      cursor.style.top = `${p.y}px`;
    }
    if (!drawing || revealed) return;
    scratchAt(p.x, p.y);
  }

  function stop() {
    drawing = false;
    lastX = null;
    lastY = null;
    if (!revealed) checkReveal();
  }

  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("pointerleave", () => {
    if (!drawing && cursor) cursor.style.opacity = "0";
  });
  canvas.addEventListener("pointerenter", () => {
    if (!revealed && cursor) cursor.style.opacity = "1";
  });

  window.addEventListener("resize", () => {
    if (!revealed) setupCanvas();
  });

  setupCanvas();
})();


// ===== RSVP -> WhatsApp =====
(() => {
  const form = document.getElementById("rsvpForm");
  const message = document.getElementById("formMessage");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("guestName")?.value.trim();
    const guestWhatsapp = document.getElementById("guestWhatsapp")?.value.trim();
    const attendance = document.getElementById("attendance")?.value;
    const guestCount = document.getElementById("guestCount")?.value;

    if (!name || !guestWhatsapp || !attendance || !guestCount) {
      if (message) message.textContent = "Please fill all RSVP details.";
      return;
    }

    // The recipient is the host's WhatsApp number.
    const hostNumber = "919781041337";

    const text =
      "💍 WEDDING RSVP — KEANATH & SAFROZ%0A%0A" +
      "👤 Name: " + encodeURIComponent(name) + "%0A" +
      "📱 Guest WhatsApp: " + encodeURIComponent(guestWhatsapp) + "%0A" +
      "✅ Attendance: " + encodeURIComponent(attendance) + "%0A" +
      "👥 Guests: " + encodeURIComponent(guestCount) + "%0A%0A" +
      "📅 Nikah: 19 November 2026, 9:00 PM%0A" +
      "📍 Venue: Bheriharwa";

    const url = "https://wa.me/" + hostNumber + "?text=" + text;

    if (message) {
      message.textContent = "Opening WhatsApp…";
    }

    window.location.href = url;
  });
})();
