const slider = document.getElementById("venueSlider");
const venueTitle = document.getElementById("current-venue-title");
const pages = document.querySelectorAll(".venue-page");
const dotsContainer = document.getElementById("venueDots");

let scheduleData = [];
let currentDay = "2026-07-20";

// 1. JSON betöltése
async function loadSchedule() {
  try {
    const response = await fetch("schedule.json");
    scheduleData = await response.json();

    const now = getCurrentDateTime();
    const today = now.toISOString().slice(0, 10);

    if (scheduleData.some((e) => e.day === today)) {
      currentDay = today;
    }

    createDots();
    renderSchedule();
    updateNavigationUI();
  } catch (error) {
    console.error("Hiba a JSON betöltése közben:", error);
  }
}

// 2. Slide indikátor pöttyök generálása
function createDots() {
  dotsContainer.innerHTML = "";
  pages.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `dot ${index === 0 ? "active" : ""}`;
    dotsContainer.appendChild(dot);
  });
}

// 3. Események renderelése
function renderSchedule() {
  pages.forEach((page) => (page.innerHTML = ""));
  const now = getCurrentDateTime();

  const activeEvents = scheduleData.filter((event) => {
    if (event.day !== currentDay) return false;

    return getEventStart(event) >= now;
  });
  activeEvents.forEach((event) => {
    const venueContainer = document.getElementById(`venue-${event.venue}`);
    if (venueContainer) {
      const card = document.createElement("div");
      card.className = `event-card ${event.category}`;
      card.innerHTML = `
                <span class="time">${event.time}</span>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
            `;
      venueContainer.appendChild(card);
    }
  });
}

// 4. Napváltás (visszaugrik az első helyszínre)
function switchDay(dateString) {
  currentDay = dateString;
  document
    .querySelectorAll(".day-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");

  renderSchedule();
  slider.scrollTo({ left: 0, behavior: "smooth" });
}

// 5. Swipe (elhúzás) detektálása és felület frissítése
function updateNavigationUI() {
  const scrollLeft = slider.scrollLeft;
  const pageWidth = window.innerWidth;
  const currentPageIndex = Math.round(scrollLeft / pageWidth);

  // Helyszínnév frissítése
  if (pages[currentPageIndex]) {
    const currentVenueName = pages[currentPageIndex].getAttribute("data-venue");
    venueTitle.textContent = currentVenueName;
  }

  // Aktuális pötty frissítése
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    if (index === currentPageIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}
function getCurrentDateTime() {
  return new Date();

  // TESTING:
//   return new Date("2026-07-23T13:52:00");
}

function getEventStart(event) {
  const start = event.time.split("-")[0].trim();

  const [hours, minutes] = start.split(":").map(Number);

  return new Date(
    `${event.day}T${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}:00`,
  );
}

function updateCurrentTime() {
  const now = getCurrentDateTime();

  const timeString = now.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateString = now.toLocaleDateString("hu-HU");

  document.getElementById("current-time").textContent =
    `${dateString} ${timeString}`;
}

slider.addEventListener("scroll", updateNavigationUI);
window.addEventListener("resize", updateNavigationUI);



loadSchedule();

updateCurrentTime();

setInterval(() => {
    updateCurrentTime();
    renderSchedule();
}, 60000);
