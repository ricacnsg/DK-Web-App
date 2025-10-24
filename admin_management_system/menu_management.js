const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove 'active' from all nav items
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Hide all pages
        pages.forEach(page => page.classList.remove('active-page'));

        // Show clicked page
        const targetPage = document.getElementById(item.dataset.page);
        targetPage.classList.add('active-page');
    });
});
