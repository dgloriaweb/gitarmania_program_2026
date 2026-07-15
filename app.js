const slider = document.getElementById('venueSlider');
const venueTitle = document.getElementById('current-venue-title');
const pages = document.querySelectorAll('.venue-page');

// Detect which venue is centered on screen during/after a swipe
slider.addEventListener('scroll', () => {
    const scrollLeft = slider.scrollLeft;
    const pageWidth = window.innerWidth;
    
    // Calculate current page index based on horizontal scroll position
    const currentPageIndex = Math.round(scrollLeft / pageWidth);
    
    // Update header to match the active venue tag
    const currentVenueName = pages[currentPageIndex].getAttribute('data-venue');
    venueTitle.textContent = currentVenueName;
});

// Day switcher handler (for expanding later with data filtration)
function switchDay(dateString) {
    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    console.log(`Switching schedule data to: ${dateString}`);
    // Here you can inject logic to hide/show events matching the chosen day
}