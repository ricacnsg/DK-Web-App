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

// Dashboard
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = document.querySelector('.main-content');
  if (!dashboard) return;

  const tabButtons = dashboard.querySelectorAll('.tab-btn');
  const mainHeader = dashboard.querySelector('.main-header h1');
  const printButton = dashboard.querySelector('.print-summary-btn');

  function switchTab(tabName) {
    if (!tabButtons.length) return;

    tabButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', isActive);
    });

    if (mainHeader) {
      const formatted =
        tabName.charAt(0).toUpperCase() + tabName.slice(1) + ' Dashboard';
      mainHeader.textContent = formatted;
    }

    console.log("Switched to the '${tabName}' tab.");
  }

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
      });
    });

    const defaultTab = tabButtons[0].getAttribute('data-tab');
    switchTab(defaultTab);
  }

  if (printButton) {
    printButton.addEventListener('click', e => {
      e.stopPropagation();
      alert('Printing summary... (In a real app, this would trigger print logic)');
    });
  }
});
