document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Error handling for missing elements
    if (!navToggle || !navLinks) {
        console.error('Navigation elements not found');
        return;
    }

    // Toggle menu when hamburger is clicked
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.classList.toggle('show');
        navToggle.setAttribute('aria-expanded', 
            navLinks.classList.contains('show'));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            navToggle.setAttribute('aria-expanded', false);
        }
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            navToggle.setAttribute('aria-expanded', false);
        }
    });
});