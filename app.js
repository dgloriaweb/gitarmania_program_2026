const slider = document.getElementById('venueSlider');
const venueTitle = document.getElementById('current-venue-title');
const pages = document.querySelectorAll('.venue-page');
const dotsContainer = document.getElementById('venueDots');

let scheduleData = [];
let currentDay = '2026-07-20';

// 1. JSON betöltése
async function loadSchedule() {
    try {
        const response = await fetch('schedule.json');
        scheduleData = await response.json();
        createDots();
        renderSchedule();
        updateNavigationUI();
    } catch (error) {
        console.error("Hiba a JSON betöltése közben:", error);
    }
}

// 2. Slide indikátor pöttyök generálása
function createDots() {
    dotsContainer.innerHTML = '';
    pages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });
}

// 3. Események renderelése
function renderSchedule() {
    pages.forEach(page => page.innerHTML = '');
    const activeEvents = scheduleData.filter(event => event.day === currentDay);

    activeEvents.forEach(event => {
        const venueContainer = document.getElementById(`venue-${event.venue}`);
        if (venueContainer) {
            const card = document.createElement('div');
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
    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    
    renderSchedule();
    slider.scrollTo({ left: 0, behavior: 'smooth' }); 
}

// 5. Swipe (elhúzás) detektálása és felület frissítése
function updateNavigationUI() {
    const scrollLeft = slider.scrollLeft;
    const pageWidth = window.innerWidth;
    const currentPageIndex = Math.round(scrollLeft / pageWidth);
    
    // Helyszínnév frissítése
    if(pages[currentPageIndex]) {
        const currentVenueName = pages[currentPageIndex].getAttribute('data-venue');
        venueTitle.textContent = currentVenueName;
    }

    // Aktuális pötty frissítése
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index === currentPageIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

slider.addEventListener('scroll', updateNavigationUI);
window.addEventListener('resize', updateNavigationUI);

loadSchedule();