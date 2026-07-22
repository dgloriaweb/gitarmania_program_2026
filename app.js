const slider = document.getElementById("venueSlider");
const venueTitle = document.getElementById("current-venue-title");
const pages = document.querySelectorAll(".venue-page");
const dotsContainer = document.getElementById("venueDots");

let scheduleData = [];
let currentDay = "2026-07-20";

/**
 * Loads the schedule data from the JSON file and updates the UI.
 * Also sets the current day to the today's date if it exists in the schedule.
 * Creates the dots and renders the schedule.
 * Updates the navigation UI.
 * 
 * @returns {Promise<void>}
 * @throws {Error} If the JSON file cannot be loaded.
 */
async function loadSchedule() {
  try {
    const response = await fetch("schedule.json");
    scheduleData = await response.json();

    const now = getCurrentDateTime();
    
    // Helyi dátum kinyerése ISO eltolódási hiba nélkül (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

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

/**
 * Creates the dots and renders the schedule.
 */
function createDots() {
  dotsContainer.innerHTML = "";
  pages.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `dot ${index === 0 ? "active" : ""}`;
    dotsContainer.appendChild(dot);
  });
}

/**
 * Renders the schedule.
 * 
 */
function renderSchedule() {
  syncDayButtonUI(currentDay);

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

/**
 * Switches the day and updates the UI.
 * 
 * @param {string} dateString - The date string to switch to.
 * @returns {void}
 */
function switchDay(dateString) {
  const pageWidth = window.innerWidth;
  const currentPageIndex = Math.round(slider.scrollLeft / pageWidth);

  currentDay = dateString;

  // Rendereléskor a renderSchedule() automatikusan lefutatja a syncDayButtonUI-t is
  renderSchedule();
  
  slider.scrollTo({ left: currentPageIndex * pageWidth, behavior: "auto" });
  updateNavigationUI();
}

/**
 * Updates the navigation UI.
 * 
 * @returns {void}
 */
function updateNavigationUI() {
  const scrollLeft = slider.scrollLeft;
  const pageWidth = window.innerWidth;
  const currentPageIndex = Math.round(scrollLeft / pageWidth);

  // Helyszínnév frissítése
  if (pages[currentPageIndex]) {
    const currentVenueName = pages[currentPageIndex].getAttribute("data-venue");
    venueTitle.textContent = `< ${currentVenueName} >`;
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

/**
 * Gets the current date and time.
 * 
 * @returns {Date}
 */
function getCurrentDateTime() {
  return new Date();

  // TESTING:
//   return new Date("2026-07-23T13:52:00");
}

/**
 * Gets the start time of an event.
 * 
 * @param {Object} event - The event object.
 * @returns {Date}
 */
function getEventStart(event) {
  const start = event.time.split("-")[0].trim();

  const [hours, minutes] = start.split(":").map(Number);

  return new Date(
    `${event.day}T${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}:00`,
  );
}

/**
 * Updates the current time.
 * 
 * @returns {void}
 */
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

// --- Hamburger Menu & Search Core Logic ---
const menuToggle = document.getElementById("menuToggle");
const sideDrawer = document.getElementById("sideDrawer");
const globalSearchInput = document.getElementById("globalSearchInput");
const searchResultsContainer = document.getElementById("searchResultsContainer");

const dayMap = {
    "2026-07-20": "Hétfő",
    "2026-07-21": "Kedd",
    "2026-07-22": "Szerda",
    "2026-07-23": "Csütörtök",
    "2026-07-24": "Péntek",
    "2026-07-25": "Szombat",
    "2026-07-26": "Vasárnap"
};

// Toggle Side Drawer Display Menu State
menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("open");
    sideDrawer.classList.toggle("open");
});

// Trigger dynamic matches calculation on keypress inputs
globalSearchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    executeGlobalSearch(keyword);
});

/**
 * Executes the global search.
 * 
 * @param {string} keyword - The keyword to search for.
 * @returns {void}
 */
function executeGlobalSearch(keyword) {
    if (!keyword) {
        searchResultsContainer.innerHTML = '<p class="search-placeholder">Gépelj a kereséshez az összes nap és helyszín között...</p>';
        return;
    }

    // Filters every single entry regardless of current filters or timezone shifts
    const matchPool = scheduleData.filter(event => {
        const titleMatch = event.title?.toLowerCase().includes(keyword);
        const descMatch = event.description?.toLowerCase().includes(keyword);
        const venueMatch = event.venue?.toLowerCase().includes(keyword);
        
        return titleMatch || descMatch || venueMatch;
    });

    searchResultsContainer.innerHTML = "";

    if (matchPool.length === 0) {
        searchResultsContainer.innerHTML = '<p class="search-placeholder">Nincs találat a megadott kulcsszóra.</p>';
        return;
    }

    // Build independent elements matching schema configurations
    matchPool.forEach(event => {
        const resultCard = document.createElement("div");
        resultCard.className = `event-card ${event.category}`;
        
        const friendlyDay = dayMap[event.day] || event.day;
        const friendlyVenue = event.venue || "Nincs kijelölt helyszín";

        resultCard.innerHTML = `
            <div class="result-meta-tags">${friendlyDay} • ${friendlyVenue}</div>
            <span class="time">${event.time}</span>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
        `;
        searchResultsContainer.appendChild(resultCard);
    });
}

/**
 * Synchronizes the day buttons with the current day.
 * 
 * @param {string} targetDate - The target date to synchronize with.
 * @returns {void}
 */
function syncDayButtonUI(targetDate) {
  document.querySelectorAll(".day-btn").forEach((btn) => {
    const onclickText = btn.getAttribute("onclick") || "";
    const dataDate = btn.getAttribute("data-date") || "";

    // Ha a gomb dátuma vagy az onclick függvénye tartalmazza az aktuális dátumot
    if (dataDate === targetDate || onclickText.includes(targetDate)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}