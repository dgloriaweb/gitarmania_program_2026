const slider = document.getElementById('venueSlider');
const venueTitle = document.getElementById('current-venue-title');
const pages = document.querySelectorAll('.venue-page');

let scheduleData = [];
let currentDay = '2026-07-20'; // Starting day state

// 1. Fetch JSON Data on launch
async function loadSchedule() {
    try {
        const response = await fetch('schedule.json');
        scheduleData = await response.json();
        renderSchedule();
    } catch (error) {
        console.error("Error reading the festival schedule data file:", error);
    }
}

// 2. Filter data by date and dynamically build the layout blocks
function renderSchedule() {
    // Clear out existing cards from all view tracks first
    pages.forEach(page => page.innerHTML = '');

    // Filter events matching the active user calendar day selection
    const activeEvents = scheduleData.filter(event => event.day === currentDay);

    activeEvents.forEach(event => {
        // Find the specific container block allocated for this location target
        const venueContainer = document.getElementById(`venue-${event.venue}`);
        
        if (venueContainer) {
            // Generate clean inner semantic structural component elements
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

// 3. Handle active Top bar Button swaps
function switchDay(dateString) {
    currentDay = dateString;
    
    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderSchedule();
    
    // Snap back to the first venue slide panel view automatically on calendar swap
    slider.scrollTo({ left: 0, behavior: 'smooth' }); 
}

// 4. Update Header Subtitle as user tracks viewport shifts laterally
slider.addEventListener('scroll', () => {
    const scrollLeft = slider.scrollLeft;
    const pageWidth = window.innerWidth;
    const currentPageIndex = Math.round(scrollLeft / pageWidth);
    
    if(pages[currentPageIndex]) {
        const currentVenueName = pages[currentPageIndex].getAttribute('data-venue');
        venueTitle.textContent = currentVenueName;
    }
});

// Run application loader sequence
loadSchedule();