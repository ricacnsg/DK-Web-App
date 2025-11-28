function escapeHTML(value) {
    if (typeof value === "number") return value;
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


fetch("../controllers/islogin.php", {
  method: "GET"
})
  .then(res => res.json())
  .then(data => {
    if (!data.logged_in) {
      window.location.href = "login.php";
    }
  })
  .catch(err => console.error("Error checking session:", err));


document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const menuSearchInput = document.getElementById('menuSearchInput');
    const menuSorter = document.getElementById('menuSorter');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // Menu Management elements
    const menuGrid = document.getElementById('menuGrid');
    const addNewItemCard = document.getElementById('addNewItemCard');
    const addEditModal = document.getElementById('addEditModal');
    const deleteModal = document.getElementById('deleteModal');
    const menuItemForm = document.getElementById('menuItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const deleteItemNameSpan = document.getElementById('deleteItemName');
    const notification = document.getElementById('notification');
    
    // Ingredients elements
    const ingredientsList = document.getElementById('ingredientsList');
    const newIngredientInput = document.getElementById('newIngredientInput');
    //const addIngredientBtn = document.getElementById('addIngredientBtn');
    
    // Image handling elements
    const imageUpload = document.getElementById('imageUpload');
    const itemImagePreview = document.getElementById('itemImagePreview');
    const imagePlaceholderIcon = document.getElementById('imagePlaceholderIcon');
    
    // Carousel elements
    const categoryListWrapper = document.querySelector('.category-list-wrapper');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let itemToManageId = null; 
    let itemToDeleteId = null;
    let currentIngredients = []; 
    let menuItems = [];

    // Variable to track the currently active category
    let activeCategory = 'bento'; 

    // API base URL
    const API_BASE = '../controllers/menu_management.php';

        // PAGE NAVIGATION LOGIC (Sidebar)
        navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => page.classList.remove('active-page'));

            const targetPage = document.getElementById(item.dataset.page);
            if (targetPage) {
                targetPage.classList.add('active-page');
            }

            if (item.dataset.page === 'menu') {
                const currentActiveItem = document.querySelector('.category-item.active');
                const initialCategory = currentActiveItem ? currentActiveItem.dataset.category : 'bento';
                activeCategory = initialCategory;
                loadMenuItems(initialCategory);
            }
            
            // Load dashboard data when dashboard is clicked
            if (item.dataset.page === 'dashboard') {
                loadDashboardData('today');
            }
        });
    });

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking on nav items (on mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                toggleSidebar();
            }
        });
    });

    // Close sidebar when clicking logout (on mobile)
    document.querySelector('.logout-btn').addEventListener('click', () => {
        if (window.innerWidth <= 900) {
            toggleSidebar();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // DASHBOARD TAB LOGIC
const dashboard = document.getElementById('dashboard');
if (dashboard) {
    const tabButtons = dashboard.querySelectorAll('.tab-btn');
    const mainHeader = dashboard.querySelector('.main-header h1');
    const printButton = dashboard.querySelector('.print-summary-btn');

    const switchTab = (tabName) => {
        tabButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabName;
            btn.classList.toggle('active', isActive);
        });

        if (mainHeader) {
            const formatted = tabName.charAt(0).toUpperCase() + tabName.slice(1) + ' Dashboard';
            mainHeader.textContent = formatted;
        }
        
        loadDashboardData(tabName);
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    if (tabButtons.length > 0) {
        switchTab(tabButtons[0].getAttribute('data-tab'));
    }

    // FIXED PRINT BUTTON FUNCTIONALITY
    if (printButton) {
        printButton.addEventListener('click', e => {
            e.stopPropagation();
            printDashboardSummary();
        });
    }
}

// ADD THIS FUNCTION TO YOUR JAVASCRIPT FILE
function printDashboardSummary() {
    // Get current tab period
    const activeTab = document.querySelector('.tab-btn.active');
    const period = activeTab ? activeTab.getAttribute('data-tab') : 'today';
    
    // Get current metrics
    const totalRevenue = document.getElementById('totalRevenue').textContent;
    const todayRevenue = document.getElementById('todayRevenue').textContent;
    const avgOrderValue = document.getElementById('avgOrderValue').textContent;
    const revenueChange = document.getElementById('revenueChange').textContent;
    const todayChange = document.getElementById('todayChange').textContent;
    const avgChange = document.getElementById('avgChange').textContent;
    
    // Get period title
    const periodTitle = document.getElementById('periodTitle').textContent;
    
    // Format period for display
    const periodDisplay = period.charAt(0).toUpperCase() + period.slice(1);
    
    // Create print window content
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Daven's Kitchenette - ${periodDisplay} Summary</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 40px;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 2px solid #062970;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #062970; 
                    margin: 0;
                    font-size: 28px;
                }
                .print-date { 
                    text-align: right; 
                    color: #666;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                .metrics-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 20px; 
                    margin-bottom: 30px;
                }
                .metric-card { 
                    border: 1px solid #ddd; 
                    padding: 20px; 
                    border-radius: 8px;
                    text-align: center;
                    background: #f9f9f9;
                }
                .metric-value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #062970;
                    margin: 10px 0;
                }
                .metric-label { 
                    font-weight: bold; 
                    color: #555;
                    font-size: 16px;
                }
                .metric-change { 
                    font-size: 14px; 
                    color: #666;
                    margin-top: 5px;
                }
                .charts-section { 
                    margin-top: 30px;
                }
                .chart-placeholder {
                    border: 1px dashed #ccc;
                    padding: 40px;
                    text-align: center;
                    color: #666;
                    margin: 10px 0;
                    background: #f5f5f5;
                }
                .section-title {
                    background: #062970;
                    color: white;
                    padding: 10px;
                    margin: 20px 0 10px 0;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 40px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                @media print {
                    body { margin: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="print-date">Printed: ${new Date().toLocaleString()}</div>
            
            <div class="header">
                <h1>Daven's Kitchenette - ${periodDisplay} Dashboard Summary</h1>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Total Revenue</div>
                    <div class="metric-value">${totalRevenue}</div>
                    <div class="metric-change">${revenueChange}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">${periodTitle}</div>
                    <div class="metric-value">${todayRevenue}</div>
                    <div class="metric-change">${todayChange}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Avg Order Value</div>
                    <div class="metric-value">${avgOrderValue}</div>
                    <div class="metric-change">${avgChange}</div>
                </div>
            </div>
            
            <div class="section-title">Performance Charts</div>
            
            <div class="charts-section">
                <div class="chart-placeholder">
                    <strong>Revenue and Orders Chart</strong><br>
                    <small>Visual representation of ${periodDisplay.toLowerCase()} performance</small>
                </div>
                
                <div class="chart-placeholder">
                    <strong>Top Menu Items</strong><br>
                    <small>Most popular items for the selected period</small>
                </div>
            </div>
            
            <div class="footer">
                Generated by Daven's Kitchenette Management System
            </div>
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// Dashboard data loading functions
// Dashboard data loading functions
async function loadDashboardData(period = 'today') {
    try {
        // Show loading states
        showLoadingStates();
        
        const [statsResponse, weeklyResponse, topItemsResponse] = await Promise.all([
            fetch(`../controllers/dashboard.php?action=getDashboardStats&period=${period}`),
            fetch(`../controllers/dashboard.php?action=getWeeklyData`),
            fetch(`../controllers/dashboard.php?action=getTopItems&period=${period}`)
        ]);
        
        const [statsData, weeklyData, topItemsData] = await Promise.all([
            statsResponse.json(),
            weeklyResponse.json(),
            topItemsResponse.json()
        ]);
        
        if (statsData.success) {
            updateDashboardMetrics(statsData.data, period);
        } else {
            setDefaultMetrics();
        }
        
        if (weeklyData.success) {
            loadWeeklyChart(weeklyData.data);
        }
        
        if (topItemsData.success) {
            loadTopMenuChart(topItemsData.data);
        }
        
        await loadSystemLogs();
        
    } catch (error) {
        setDefaultMetrics();
        showNotification('Error loading dashboard data', 'error');
    }
}

function showLoadingStates() {
    const metrics = ['totalRevenue', 'todayRevenue', 'avgOrderValue'];
    metrics.forEach(metric => {
        const element = document.getElementById(metric);
        if (element) {
            element.textContent = 'Loading...';
            element.classList.add('loading');
        }
    });
    
    const trends = ['revenueChange', 'todayChange', 'avgChange'];
    trends.forEach(trend => {
        const element = document.getElementById(trend);
        if (element) {
            element.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...';
        }
    });
}

function updateDashboardMetrics(stats, period) {
    // Update main metrics
    document.getElementById('totalRevenue').textContent = `₱${stats.totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('totalRevenue').classList.remove('loading');
    
    // Update title based on period
    let periodTitle = '';
    let chartTitle = '';
    let chartSubtext = '';
    
    switch (period) {
        case 'today':
            periodTitle = "Today's Revenue";
            chartTitle = "Today's Performance";
            chartSubtext = "Today's orders and revenue";
            break;
        case 'weekly':
            periodTitle = "Weekly Revenue";
            chartTitle = "Weekly Revenue and Orders";
            chartSubtext = "Last 7 days performance";
            break;
        case 'monthly':
            periodTitle = "Monthly Revenue";
            chartTitle = "Monthly Revenue and Orders";
            chartSubtext = "This month's performance";
            break;
    }
    
    // Update the period title
    document.getElementById('periodTitle').textContent = periodTitle;
    
    // Update weekly chart titles
    const weeklyChartTitle = document.querySelector('.charts-container .card.chart-section:first-child h2');
    const weeklyChartSubtext = document.querySelector('.charts-container .card.chart-section:first-child .metric-subtext');
    
    if (weeklyChartTitle) {
        weeklyChartTitle.textContent = chartTitle;
    }
    if (weeklyChartSubtext) {
        weeklyChartSubtext.textContent = chartSubtext;
    }
    
    // Update Top Menu chart title based on period
    const topMenuTitle = document.querySelector('.charts-container .card.chart-section:last-child h2');
    const topMenuSubtext = document.querySelector('.charts-container .card.chart-section:last-child .metric-subtext');

    if (topMenuTitle) {
        switch (period) {
            case 'today':
                topMenuTitle.textContent = "Today's Top Menu";
                topMenuSubtext.textContent = "Most popular items today";
                break;
            case 'weekly':
                topMenuTitle.textContent = "Weekly Top Menu";
                topMenuSubtext.textContent = "Most popular items this week";
                break;
            case 'monthly':
                topMenuTitle.textContent = "Monthly Top Menu";
                topMenuSubtext.textContent = "Most popular items this month";
                break;
        }
    }
    
    document.getElementById('todayRevenue').textContent = `₱${stats.totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('todayRevenue').classList.remove('loading');
    
    document.getElementById('avgOrderValue').textContent = `₱${stats.avgOrderValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('avgOrderValue').classList.remove('loading');
    
    // Update trend indicators
    updateTrendIndicators(stats);
}

function updateTrendIndicators(stats) {
    updateTrendElement('revenueChange', stats.revenueChange, 'revenue');
    updateTrendElement('todayChange', stats.revenueChange, 'revenue');
    updateTrendElement('avgChange', stats.avgChange, 'average');
}

function updateTrendElement(elementId, change, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const isPositive = change > 0;
    const isNeutral = change === 0;
    const isNegative = change < 0;
    
    let text = '';
    if (isNeutral) {
        text = 'No change';
    } else {
        const arrow = isPositive ? 'up' : 'down';
        const changeText = Math.abs(change).toFixed(1);
        const period = type === 'average' ? 'previous period' : 'yesterday';
        text = `<i class="fa-solid fa-arrow-${arrow}"></i> ${changeText}% from ${period}`;
    }
    
    // Set colors based on trend
    if (isPositive) {
        element.className = 'metric-subtext success';
    } else if (isNegative) {
        element.className = 'metric-subtext danger';
    } else {
        element.className = 'metric-subtext';
    }
    
    element.innerHTML = text;
}

function setDefaultMetrics() {
    const metrics = {
        'totalRevenue': '₱0.00',
        'todayRevenue': '₱0.00',
        'avgOrderValue': '₱0.00'
    };
    
    Object.entries(metrics).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.classList.remove('loading');
        }
    });
    
    const trends = ['revenueChange', 'todayChange', 'avgChange'];
    trends.forEach(trend => {
        const element = document.getElementById(trend);
        if (element) {
            element.innerHTML = '<i class="fa-solid fa-minus"></i> No data';
            element.className = 'metric-subtext trend-neutral';
        }
    });
}

async function loadWeeklyChart(data) {
    try {
        const ctx = document.getElementById('weeklyRevenueChart');
        if (!ctx) {
            return;
        }
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }
        
        if (data && data.dates && data.revenues) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.dates,
                    datasets: [{
                        label: 'Revenue (₱)',
                        data: data.revenues,
                        borderColor: '#062970',
                        backgroundColor: 'rgba(6, 41, 112, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }, {
                        label: 'Orders',
                        data: data.orders,
                        borderColor: '#f2d067',
                        backgroundColor: 'rgba(242, 208, 103, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₱' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    }
                }
            });
        }
    } catch (error) {
        // Silent fail for chart errors
    }
}

async function loadTopMenuChart(data) {
    try {
        const ctx = document.getElementById('topMenuCanvas');
        if (!ctx) {
            return;
        }
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }
        
        if (data && data.items && data.quantities) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.items.map(item => 
                        item.length > 15 ? item.substring(0, 15) + '...' : item
                    ),
                    datasets: [{
                        label: 'Quantity Sold',
                        data: data.quantities,
                        backgroundColor: '#062970',
                        borderColor: '#051d5c',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Sold: ${context.parsed.y} units`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        // Silent fail for chart errors
    }
}

// Update your existing loadSystemLogs function
async function loadSystemLogs() {
    try {
        const response = await fetch('../controllers/dashboard.php?action=getSystemLogs');
        const data = await response.json();
        
        const container = document.getElementById('systemLogsContainer');
        if (!container) {
            return;
        }
        
        if (data.success) {
            if (data.data.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No recent activity</p>';
                return;
            }
            
            container.innerHTML = data.data.map(log => `
                <div class="log-entry log-action-${escapeHTML(log.action.toLowerCase())}">
                    <div class="log-entry-header">
                        <span>${escapeHTML(log.module)} - ${escapeHTML(log.action)}</span>
                        <span class="log-entry-time">${escapeHTML(log.time)}</span>
                    </div>
                    <div class="log-entry-description">
                        <strong>${escapeHTML(log.user)}:</strong> ${escapeHTML(log.description)}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Failed to load logs</p>';
        }
    } catch (error) {
        const container = document.getElementById('systemLogsContainer');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Error loading logs</p>';
        }
    }
}

    // MENU MANAGEMENT CORE LOGIC
    const showNotification = (message, type = 'success') => {
        const icon = type === 'success' ? 'success' : 'error';
        const title = type === 'success' ? 'Success' : 'Error';
        
        Swal.fire({
            position: "center",
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 1500
        });
    };

    const closeModal = (modalId) => {
        document.getElementById(modalId).classList.remove('active');
        itemToManageId = null;
        currentIngredients = [];
        // Reset form
        menuItemForm.reset();
        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';
    };
    window.closeModal = closeModal;

    // Load menu items from server
    const loadMenuItems = async (category) => {
        try {
            const response = await fetch(`${API_BASE}?action=getMenuItems&category=${category}`);
            const result = await response.json();
            
            if (result.success) {
                menuItems = result.data;
                renderMenuItems(category);
            } else {
                console.error('Failed to load menu items:', result.message);
                showNotification('Failed to load menu items', 'error');
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
            showNotification('Error loading menu items', 'error');
        }
    };

    const createMenuCard = (item) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.itemId = item.id;
        card.innerHTML = `
            <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}" class="menu-image">
            <div class="menu-name">${escapeHTML(item.name)}</div>
            <div class="menu-description">${escapeHTML(item.desc)}</div>
            <div class="menu-price">₱${escapeHTML(item.price.toFixed(2))}</div>
            <div class="menu-actions">
                <button class="btn btn-edit" data-id="${escapeHTML(item.id)}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-remove" data-id="${escapeHTML(item.id)}">
                    <i class="fas fa-trash-alt"></i> Remove
                </button>
            </div>
        `;
        return card;
    };


    // Helper function for sorting items
    const sortMenuItems = (items, sortBy) => {
        const sortedItems = items.slice(); 

        switch (sortBy) {
            case 'name_asc':
                return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
            case 'price_asc':
                return sortedItems.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sortedItems.sort((a, b) => b.price - a.price);
            default:
                return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        }
    };

    const renderMenuItems = (category) => {
        document.querySelectorAll('.menu-card:not(.add-item)').forEach(card => card.remove());
        
        const searchTerm = menuSearchInput ? menuSearchInput.value.toLowerCase() : '';
        const sortBy = menuSorter ? menuSorter.value : 'name_asc'; 
        
        activeCategory = category;

        let filteredItems = menuItems.filter(item => item.category === category);

        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.desc.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredItems = sortMenuItems(filteredItems, sortBy);

        filteredItems.forEach(item => {
            const card = createMenuCard(item);
            menuGrid.appendChild(card); // now adds after the Add button
        });


        attachCardListeners();
    };

    // CATEGORY CAROUSEL LOGIC
    const scrollAmount = 300;

    const scrollCategories = (direction) => {
        const newScrollLeft = categoryListWrapper.scrollLeft + (direction * scrollAmount);
        categoryListWrapper.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    };

    prevBtn.addEventListener('click', () => {
        scrollCategories(-1);
    });

    nextBtn.addEventListener('click', () => {
        scrollCategories(1);
    });

    // Handle Category Filter
    document.querySelectorAll('.category-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            const clickedItem = e.currentTarget;
            clickedItem.classList.add('active');
            
            const category = clickedItem.dataset.category;
            loadMenuItems(category);

            const categoryName = clickedItem.querySelector('.category-name').textContent.split(' ')[0];
            addNewItemCard.querySelector('.add-text').textContent = `Add ${categoryName} Item`;
        });
    });

    // INGREDIENTS MANAGEMENT LOGIC
    const ingredientInput = document.getElementById('newIngredientInput');
    const selectIngredientTable = document.querySelector('#selectIngredientsTable tbody');
    let debounceTimer;

    async function fetchIngredients() {
        const keyword = ingredientInput.value.trim();

        try {
            const response = await fetch(`${API_BASE}?action=getIngredients&keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();

            selectIngredientTable.innerHTML = "";
            if (data.success && data.data.length > 0) {
                data.data.forEach(item => {
                    const row = document.createElement("tr");

                    row.dataset.id = item.itemID;
                    row.dataset.name = item.itemName;
                    row.dataset.unit = item.unitOfMeasurement;

                    // Check if already selected
                    let saved = currentIngredients.find(i => i.id == item.itemID);
                    let qty = saved ? saved.quantity : 0;

                    row.innerHTML = `
                        <td>${escapeHTML(item.itemName)}</td>
                        <td>
                            <button type='button' class="btn qty-minus">-</button>
                            <input type="text" class="qty-number" value="${qty}" style="width: 2cm;">
                            <button type='button' class="btn qty-plus">+</button>
                        </td>
                    `;

                    const minusBtn = row.querySelector(".qty-minus");
                    const plusBtn = row.querySelector(".qty-plus");
                    const qtyInput = row.querySelector(".qty-number");

                    // Update currentIngredients and summary
                    function updateIngredient(quantity) {
                        const id = row.dataset.id;
                        const name = row.dataset.name;
                        const unit = row.dataset.unit;

                        quantity = Math.max(0, quantity); // prevent negative
                        qtyInput.value = quantity;

                        let existing = currentIngredients.find(i => i.id == id);
                        if (!existing) {
                            if (quantity > 0) currentIngredients.push({ id, name, quantity, unit });
                        } else {
                            existing.quantity = quantity;
                            if (quantity === 0) {
                                currentIngredients = currentIngredients.filter(i => i.id != id);
                            }
                        }

                        renderIngredients();
                    }

                    // Button click handlers
                    minusBtn.addEventListener("click", () => {
                        let currentQty = parseFloat(qtyInput.value) || 0;
                        currentQty--;
                        updateIngredient(currentQty);
                    });

                    plusBtn.addEventListener("click", () => {
                        let currentQty = parseFloat(qtyInput.value) || 0;
                        currentQty++;
                        updateIngredient(currentQty);
                    });

                    // Manual typing
                    qtyInput.addEventListener("input", () => {
                        let currentQty = parseFloat(qtyInput.value);
                        if (isNaN(currentQty) || currentQty < 0) currentQty = 0;
                        updateIngredient(currentQty);
                    });

                    selectIngredientTable.appendChild(row);
                });
            } else {
                selectIngredientTable.innerHTML = `
                    <tr><td colspan="2" style="text-align:center; color:#999;">No results found</td></tr>
                `;
            }
        } catch (err) {
            console.error("Error fetching ingredients:", err);
        }
    }

    ingredientInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchIngredients, 300);
    });
    fetchIngredients();

    // Render summary div
    function renderIngredients() {
        ingredientsList.innerHTML = '';
        currentIngredients.forEach(ingredient => {
            if (ingredient.quantity === 0) return;
            const item = document.createElement('span');
            item.className = 'ingredient-item';
            item.textContent = `${ingredient.name} (x${ingredient.quantity} ${ingredient.unit})`;
            ingredientsList.appendChild(item);
        });
    }

    // function addIngredient(row) {
    //     const id = row.dataset.id;
    //     const name = row.dataset.name;
    //     const unit = row.dataset.unit;

    //     const qtyDisplay = row.querySelector(".qty-number");
    //     let quantity = parseInt(qtyDisplay.textContent);

    //     let existing = currentIngredients.find(i => i.id == id);

    //     if (!existing) {
    //         currentIngredients.push({ id, name, quantity, unit });
    //     } else {
    //         existing.quantity = quantity;
    //     }

    //     renderIngredients(); // update the div
    // }

    // Handle Open Add Modal
    addNewItemCard.addEventListener('click', () => {
        modalTitle.textContent = 'Add Menu Item';
        menuItemForm.reset();
        itemToManageId = null;
        currentIngredients = [];
        renderIngredients(); 
        
        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';
        addEditModal.classList.add('active');

        document.getElementById('itemCategory').value = activeCategory;
    });

    // Handle Open Edit/Remove Modal (Delegated Listener)
    const attachCardListeners = () => {
        menuGrid.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                openEditModal(itemId);
            };
        });

        menuGrid.querySelectorAll('.btn-remove').forEach(btn => {
            btn.onclick = (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                openDeleteModal(itemId);
            };
        });
    };

    const openEditModal = (itemId) => {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;

        modalTitle.textContent = 'Edit Menu Item';
        
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.desc;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;
        
        currentIngredients = item.ingredients.map(ing => ({
            id: ing.itemID,
            name: ing.itemName,
            quantity: ing.quantity,
            unit: ing.unit
        }));
        renderIngredients();

        if (item.img && item.img !== 'assets/image/placeholder.jpg') {
            itemImagePreview.src = item.img;
            itemImagePreview.style.display = 'block';
            imagePlaceholderIcon.style.display = 'none';
        } else {
            itemImagePreview.style.display = 'none';
            imagePlaceholderIcon.style.display = 'block';
        }

        itemToManageId = itemId; 
        addEditModal.classList.add('active');
    };
    
    const openDeleteModal = (itemId) => {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        itemToDeleteId = itemId;
        deleteItemNameSpan.textContent = item.name;
        deleteModal.classList.add('active');
    };

        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showNotification('Please select a valid image file');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    showNotification('Image size should be less than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    itemImagePreview.src = e.target.result;
                    itemImagePreview.style.display = 'block';
                    imagePlaceholderIcon.style.display = 'none';
                };
                reader.onerror = () => {
                    showNotification('Error reading image file');
                };
                reader.readAsDataURL(file);
            }
        });

    // Handle Add/Edit Form Submission
    menuItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEditing = itemToManageId !== null;
        const formData = {
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            imageData: itemImagePreview.style.display !== 'none' ? itemImagePreview.src : '',
            ingredients: currentIngredients.map(i => ({
                ingredient_id: i.id,
                quantity: i.quantity
            }))
        };

        try {
            let response;
            if (isEditing) {
                formData.id = itemToManageId;
                response = await fetch(API_BASE, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(API_BASE, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            const result = await response.json();
            
            if (result.success) {
                showNotification(`Item "${formData.name}" successfully ${isEditing ? 'updated' : 'added'}!`, 'success');
                closeModal('addEditModal');
                loadMenuItems(formData.category);
            } else {
                showNotification(`Failed to ${isEditing ? 'update' : 'add'} item: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            showNotification('Error saving menu item', 'error');
        }
    });

    // Handle Delete Confirmation
    deleteConfirmBtn.addEventListener('click', async () => {
        if (itemToDeleteId !== null) {
            const deletedItem = menuItems.find(item => item.id === itemToDeleteId);
            
            try {
                const response = await fetch(API_BASE, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: itemToDeleteId })
                });

                const result = await response.json();
                
                if (result.success) {
                    showNotification(`Item "${deletedItem.name}" successfully deleted!`, 'success');
                    closeModal('deleteModal');
                    loadMenuItems(deletedItem.category);
                } else {
                    showNotification(`Failed to delete item: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting menu item:', error);
                showNotification('Error deleting menu item', 'error')
            }
        }
    });

    // Menu Search and Sort Listeners
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', () => renderMenuItems(activeCategory));
    }
    if (menuSorter) { 
        menuSorter.addEventListener('change', () => renderMenuItems(activeCategory));
    }

    // Initialize menu when page loads
    if (document.getElementById('menu').classList.contains('active-page')) {
        loadMenuItems('bento');
    } 
});

//INVENTORY MANAGEMENT 
document.addEventListener("DOMContentLoaded", () => {
    const addNewItemBtn = document.querySelector('.add-btn');
    const addNewItemModal = document.getElementById('itemModal');
    const addItemForm = document.getElementById('itemForm');
    const itemName = document.getElementById('itemname');
    const stocks = document.getElementById('itemStocks');
    const measurement = document.getElementById('itemMeasurement');
    const reorder = document.getElementById('itemReorder');
    const unitCost = document.getElementById('itemCost');
    const itemCategory = document.getElementById('itemcategory');
    let items = [];

    addNewItemBtn.addEventListener('click', function(e) {
        if (e.target === addNewItemBtn) {
            addNewItemModal.classList.add('active');
        }
    });

    addNewItemModal.addEventListener('click', function(e) {
        if (e.target === addNewItemModal) {
            addNewItemModal.classList.remove('active');
        }
    });

    //add item - DONE
    addItemForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const formData = {
            itemName: itemName.value,
            stocks: stocks.value,
            measurement: measurement.value,
            reorder: reorder.value,
            unitCost: unitCost.value,
            itemCategory: itemCategory.value
        };

        try{
            const response = await fetch('../controllers/inventory.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if(result.success){
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Item added successfully.",
                    showConfirmButton: false,
                    timer: 1500
                });
                document.getElementById('itemForm').reset();
                addNewItemModal.classList.remove('active');
                displayItem();
            }
            else {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Something went wrong. Please try again.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    //filter and search item - DONE
    const filterCategory = document.getElementById('categoryFilter');
    const searchItem = document.getElementById('searchItem');
    const inventoryTable = document.getElementById('inventoryTable');
    let debounceTimer;

    async function displayItem() {
        const filterValue = filterCategory.value.trim();
        const searchValue = searchItem.value;
        try{
            const response = await fetch(`../controllers/inventory.php?&category=${encodeURIComponent(filterValue)}&searchItem=${encodeURIComponent(searchValue)}`)
            items = await response.json();
            const tbody = inventoryTable.querySelector('tbody');
            tbody.innerHTML = ''; 
            if (items.length > 0) {
                items.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${escapeHTML(item.itemName)}</td>
                                    <td>${escapeHTML(item.quantity)} ${escapeHTML(item.unitOfMeasurement)}</td>
                                    <td>${escapeHTML(item.reorderLevel)} ${escapeHTML(item.unitOfMeasurement)}</td>
                                    <td>${escapeHTML(item.itemCategory)}</td>
                                    <td>${escapeHTML(item.pricePerQuantity)}</td>
                                    <td>
                                        <button class="editItem-btn" data-id="${escapeHTML(item.itemID)}">Edit</button>
                                        <button class="deleteItem-btn" data-id="${escapeHTML(item.itemID)}">Delete</button>
                                    </td>`;
                    tbody.appendChild(tr);
                });
            }
            else{
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="6">No record found</td>`;
                tbody.appendChild(tr);
            }

            searchItem.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(displayItem, 300);
            });
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error:', error,
                showConfirmButton: false,
                timer: 1500
            });
        } 
    }
    displayItem();
    filterCategory.addEventListener('change', displayItem);

    //edit and delete item
    const editItemModal = document.getElementById('editItemModal');
    const deleteItemModal = document.getElementById('deleteItemModal');
    const cancelDeleteItemBtn = document.querySelector('.delete-cancel-btn');
    const cancelEditItemBtn = document.querySelector('.cancelEditItem-btn');


    let currentID = null;   // store ID of item being edited
    let currentItemData = null;

    inventoryTable.addEventListener('click', function(e) {
      if (e.target.classList.contains('editItem-btn')) {
        editItemModal.classList.add("active");

        currentID = e.target.dataset.id;
        currentItemData = items.find(i => i.itemID == currentID);

        document.getElementById("editMeasurement").value = currentItemData.unitOfMeasurement;
        document.getElementById("editUnitPrice").value = currentItemData.pricePerQuantity;
        document.getElementById("editQuantity").value = currentItemData.quantity;
        document.getElementById("editReorder").value = currentItemData.reorderLevel;
      }
      else if (e.target.classList.contains('deleteItem-btn')) {
        deleteItemModal.classList.add('active');
        currentID = e.target.dataset.id;
      }
    });

    editItemModal.addEventListener('click', function(e) {
        if (e.target === editItemModal) {
            editItemModal.classList.remove('active');
        }
    });

    cancelEditItemBtn.addEventListener('click', function(e) {
        if (e.target === cancelEditItemBtn) {
            editItemModal.classList.remove('active');
        }
    });

    deleteItemModal.addEventListener('click', function(e) {
        if (e.target === deleteItemModal) {
            deleteItemModal.classList.remove('active');
        }
    });

    cancelDeleteItemBtn.addEventListener('click', function(e) {
        if (e.target === cancelDeleteItemBtn) {
            deleteItemModal.classList.remove('active');
        }
    });

    document.getElementById("editItemForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        if (!currentID || !currentItemData) {
            console.error("No item selected for editing.");
            return;
        }

        const updateItems = {
            id: currentID,
            unitOfMeasurement: document.getElementById("editMeasurement").value,
            unitCost: document.getElementById("editUnitPrice").value,
            quantity: document.getElementById("editQuantity").value,
            reorder: document.getElementById("editReorder").value
        };

        try {
            const response = await fetch(`../controllers/inventory.php`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateItems)
            });

            const result = await response.json();
            if (result.success) {
                editItemModal.classList.remove("active");
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });

                displayItem();

                currentID = null;
                currentItemData = null;

                document.getElementById("editMeasurement").value = "";
                document.getElementById("editUnitPrice").value = "";
                document.getElementById("editQuantity").value = "";
                document.getElementById("editReorder").value = "";
            }
            else {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: result.error || result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error:', 
                text: error,
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    document.querySelector('.delete-confirm-btn').addEventListener('click', async function(e) {
        e.preventDefault();

        if (!currentID) {
            console.error("No item selected for editing.");
            return;
        }

        try{
            const response = await fetch(`../controllers/inventory.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentID })
            });

            const result = await response.json();
            if(result.success){
                deleteItemModal.classList.remove("active");
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });

                displayItem();

                currentID = null;
            }
            else{
                deleteItemModal.classList.remove("active");
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: result.error || result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }

        } catch (error) {
            Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Error:', 
                    text: error,
                    showConfirmButton: false,
                    timer: 1500
            });
        }
    });

});

        
//LOGOUT BUTTON
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutbtn");

  logoutBtn.addEventListener("click", () => {

    fetch("../controllers/logout.php", {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.location.href = "login.php";
        } else {
          console.log(data.message);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  });
});


//STAFF ACCOUNT MANAGEMENT
document.addEventListener("DOMContentLoaded", () => {

    const message = document.getElementById('validationMessage');

    // show/hide password button - DONE
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('hide');

    togglePassword.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');   
    });

    //add staff account - DONE
    document.getElementById('addStaffForm').addEventListener('submit', async(e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const contactno = document.getElementById('contactno').value;
        const role = document.getElementById('role').value;
        const staff_username = document.getElementById('username').value;
        const staff_password = document.getElementById('password').value;

        const formData = {
            fullname: fullname,
            contactno: contactno,
            role: role,
            username: staff_username,
            password: staff_password
        };

        try{
            const response = await fetch('../controllers/staff.php',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
                if(result.success){
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Account created successfully.",
                        showConfirmButton: false,
                        timer: 1500
                    });

                    displayStaffAccounts();

                    document.getElementById('addStaffForm').reset();
                    document.getElementById('validationMessage').textContent = '';
                }
                else {
                    message.textContent = result.message;
                    message.style.fontSize = '12px';
                }
        }
        catch (error) {
            console.error('Error:', error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Something went wrong. Please try again.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    let rowStaff = [];
    let debounceTimer;

    //display staff accounts - DONE
    async function displayStaffAccounts(){
        const searchBox = document.getElementById('searchInput').value;
        const filterRole = document.getElementById('filterStaff').value.trim();
        try{
            const response = await fetch(`../controllers/staff.php?&role=${encodeURIComponent(filterRole)}&search=${encodeURIComponent(searchBox)}`, {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json'
                }
            })
            const result = await response.json();
            if(result.success){
                const tableBody = document.getElementById('staffTable').querySelector('tbody');
                tableBody.innerHTML = '';
                rowStaff = result.data;
                if(rowStaff.length === 0){
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td colspan="2" style="text-align:center;">No record found.</td>`;
                    tableBody.appendChild(tr);
                    return;
                }
                
                rowStaff.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${escapeHTML(row.staffFullname)}</td>
                                    <td>${escapeHTML(row.staffRole)}</td>
                                    <td>
                                        <button class="edit-btn" data-id="${escapeHTML(row.staffID)}">Edit</button>
                                        <button class="delete-btn" data-id="${escapeHTML(row.staffID)}">Delete</button>
                                    </td>`;
                    tableBody.appendChild(tr);
                });
            }
            else{
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Error',
                    text: result.message,
                    showConfirmButton: false,
                    timer: 1700
                });
            }
        }catch (error) {
            console.error('Error:', error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Something went wrong. Please try again.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    }

    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(displayStaffAccounts, 300);
    });
    
    document.getElementById('filterStaff').addEventListener('change', displayStaffAccounts);
    displayStaffAccounts();
    

    //edit staff accounts - DONE
    const table = document.getElementById('staffTable');
    const editForm = document.getElementById('editForm');

    const editModal = document.getElementById('editaccModal');
    const deleteModal = document.getElementById('deleteaccModal');
    const cancelDeleteBtn = document.querySelector('.canceldelete-btn');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.querySelector('.cancelbtn');
    const saveBtn = document.querySelector('.savebtn');

    const fullnameInput = document.getElementById('editFullname');
    const contactnoInput = document.getElementById('editContact');
    const usernameInput = document.getElementById('editUsername');
    const roleInput = document.getElementById('editRole');
    const passInput = document.getElementById('editPassword');
    const passConfirm = document.getElementById('confirmPassword');
    
    
    table.addEventListener('click', function(e) {
      if (e.target.classList.contains('edit-btn')) {
        editModal.classList.add('active');
      }
      else if (e.target.classList.contains('delete-btn')) {
        deleteModal.classList.add('active');
      }
    });

    cancelBtn.addEventListener('click', () => {
      editModal.classList.remove('active');
    });

    editModal.addEventListener('click', function(e) {
      if (e.target === editModal) {
        editModal.classList.remove('active');
      }
    });
    
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.remove('active');
    });

    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) {
        deleteModal.classList.remove('active');
      }
    });

    let currentUserId = null;
    let currentStaffData = null;

    //retrieve data to editForm - DONE
    const tableBody = document.querySelector('#staffTable tbody');
    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            currentUserId = e.target.dataset.id;
            currentStaffData = rowStaff.find(i => i.staffID == currentUserId);

            fullnameInput.value = currentStaffData.staffFullname;
            contactnoInput.value = currentStaffData.contactno;
            usernameInput.value = currentStaffData.staffUsername;
            roleInput.value = currentStaffData.staffRole;

            //original values
            fullnameInput.dataset.original = currentStaffData.staffFullname;
            contactnoInput.dataset.original = currentStaffData.contactno;
            usernameInput.dataset.original = currentStaffData.staffUsername;
            roleInput.dataset.original = currentStaffData.staffRole;
            passInput.dataset.original = '';
            passConfirm.dataset.original = '';

            saveBtn.disabled = true;

            //condition: if there is no changes, the save button is disabled, else enable. - DONE
            function checkforChanges() {
                const inputs = [fullnameInput, contactnoInput, usernameInput, roleInput, passInput, passConfirm];
                const requiredInputs = [fullnameInput, contactnoInput, usernameInput, roleInput];

                const hasChanged = inputs.some(input => {
                    return input.value.trim() !== (input.dataset.original || '').trim();
                });

                const hasEmptyField = requiredInputs.some(input => input.value.trim() === '');

                saveBtn.disabled = !hasChanged || hasEmptyField;
            }


            [fullnameInput, contactnoInput, usernameInput, roleInput, passInput, passConfirm].forEach(input => {
                input.addEventListener('input', checkforChanges);
                input.addEventListener('change', checkforChanges);
            })

            document.getElementById('editaccModal').classList.add('active');
        }
        //delete staff accounts
        else if(e.target.classList.contains('delete-btn')){
            currentUserId = e.target.dataset.id;

            confirmDeleteBtn.addEventListener('click', async(e) => {
                e.preventDefault();
            
            try{
                const response = await fetch('../controllers/staff.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({staff_id: currentUserId})
                })
                const result = await response.json();
                if(result.success){
                    document.getElementById('deleteaccModal').classList.remove('active');
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Account successfully deleted.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    displayStaffAccounts();
                }
                else{
                    Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Error',
                    text: result.message,
                    showConfirmButton: false,
                    timer: 1700
                });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Something went wrong. Please try again.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            });
        }
    });

    //edit staff account
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
       const formData = {
            staff_id: currentUserId,
            newFullname: fullnameInput.value,
            newUsername: usernameInput.value,
            newContactno: contactnoInput.value,
            newRole: roleInput.value,
            newPassword: passInput.value,
            confirmPass: passConfirm.value
        }
        try{
            const response = await fetch("../controllers/staff.php", {
                method: 'PUT',
                header: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const result = await response.json();

            if(result.success){
                Swal.fire({
                    title: "Success!",
                    text: "Save changes.",
                    icon: "success"
                });;
                passInput.value = '';
                passConfirm.value = '';
                displayStaffAccounts();
            }
            else{
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Error',
                    text: result.errors,
                    showConfirmButton: false,
                    timer: 1700
                });
                passInput.value = '';
                passConfirm.value = '';
            }
        } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Something went wrong. Please try again.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            editModal.classList.remove('active');
    });
});


//ORDER HISTORY
let orderHistory = [];
let allOrderHistory = [];

// Populate order history
async function populateOrderHistory() {
    try {
        const response = await fetch('../controllers/pos.php?action=getOrderHistory');
        const result = await response.json();
        
        if (result.success) {
            orderHistory = result.data;
            allOrderHistory = [...result.data]; // Store original
            renderOrderHistory(orderHistory);
        } else {
            console.error('Failed to load order history:', result.message);
        }
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}

// Helper: determine if order is online
function isOnlineOrder(order) {
    if (!order) return false;

    // If API returns an explicit order_number, it's almost certainly an online order
    if (order.order_number && String(order.order_number).trim() !== '') return true;

    // If delivery/customer fields exist -> online
    const hasRecipient = order.recipient_name && order.recipient_name.trim() !== '';
    const hasDeliveryAddress = order.delivery_address && order.delivery_address.trim() !== '';
    const hasPhone = order.phone_number && order.phone_number.trim() !== '';

    if (hasRecipient || hasDeliveryAddress || hasPhone) return true;

    // Payment method heuristics: non-cash usually means online
    if (order.method) {
        const method = String(order.method).toLowerCase().trim();
        if (method !== 'cash' && method !== '') return true; // e.g., 'gcash','card','bank','credit'
    }

    // If order_type explicitly provided and indicates dine-in/takeout -> treat as walk-in
    if (order.orderType) {
        const ot = String(order.orderType).toLowerCase();
        if (ot.includes('dine') || ot.includes('take') || ot.includes('walk')) return false;
    }

    // Default: treat as walk-in only when method is cash and no online indicators
    if (order.method && String(order.method).toLowerCase().trim() === 'cash') return false;

    // Otherwise be conservative: treat as online if any uncertainty (so you don't call showWalkIn for missing online details)
    return true;
}

// Render order history (robust dataset attributes)
function renderOrderHistory(data = orderHistory) {
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) {
        console.error('orderTableBody not found!');
        return;
    }

    tableBody.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No orders found</td></tr>';
        return;
    }

    data.forEach(order => {
        const row = document.createElement('tr');

        // Put defensive fallbacks for properties that might be missing
        const id = order.id ?? order.order_id ?? '';
        const items = order.items ?? order.items_ordered ?? order.items_order ?? '';
        const amount = (order.amount ?? order.subtotal ?? order.total ?? 0);
        const method = order.method ?? order.payment_method ?? '';
        const date = order.date ?? order.date_ordered ?? '';
        const status = order.status ?? order.order_status ?? '';
        const customerName = order.customerName;


        // Additional online fields if available
        const orderNumber = order.order_number ?? '';
        const recipient = order.recipient_name ?? order.recipient ?? '';
        const deliveryAddress = order.delivery_address ?? '';

        // Save everything on dataset (strings only)
        row.dataset.orderId = String(id);
        row.dataset.customerName = String(customerName);
        row.dataset.items = String(items);
        row.dataset.amount = String(amount);
        row.dataset.method = String(method);
        row.dataset.date = String(date);
        row.dataset.status = String(status);
        row.dataset.orderNumber = String(orderNumber);
        row.dataset.recipientName = String(recipient);
        row.dataset.deliveryAddress = String(deliveryAddress);
        if (order.orderType) row.dataset.orderType = String(order.orderType);

        row.innerHTML = `
            <td>${escapeHTML(String(id))}</td>
            <td>${escapeHTML(String(items))}</td>
            <td>${escapeHTML(String(amount))}</td>
            <td>${escapeHTML(String(method))}</td>
            <td>${escapeHTML(String(date))}</td>
            <td><span class="status-badge">${escapeHTML(String(status))}</span></td>
            <td>
                <button class="btn btn-sm view-history-receipt m-2" type="button">
                    <i class="fa-solid fa-eye text-muted"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update filter options
function updateFilterOptions() {
    const filterType = document.getElementById('filterType');
    const filterValue = document.getElementById('filterValue');
    
    if (!filterType || !filterValue) return;
    
    filterValue.innerHTML = '';

    // Add default "Select" option FIRST
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = filterType.value === '' ? 'Select Value' :
                                filterType.value === 'month' ? 'Select Month' : 
                                filterType.value === 'day' ? 'Select Day' : 
                                filterType.value === 'year' ? 'Select Year' : 
                                'Select Value';
    filterValue.appendChild(defaultOption);
    
    if (filterType.value === 'month') {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = (index + 1).toString().padStart(2, '0'); // "01", "02", etc.
            option.textContent = month;
            filterValue.appendChild(option);
        });
    } else if (filterType.value === 'day') {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i.toString().padStart(2, '0'); // "01", "02", etc.
            option.textContent = i;
            filterValue.appendChild(option);
        }
    } else if (filterType.value === 'year') {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 5; i--) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i;
            filterValue.appendChild(option);
        }
    }
    
    // Reset to show all data when filter type changes
    renderOrderHistory(allOrderHistory);
}

// Search orders
function searchOrders() {
    const searchInput = document.getElementById('searchOrderId');
    if (!searchInput) return;
    
    const searchValue = searchInput.value.toLowerCase().trim();
    
    // If search is empty, apply current filter or show all
    if (!searchValue) {
        filterOrders();
        return;
    }
    
    // Filter from all orders
    const filtered = allOrderHistory.filter(order => {
        const orderId = order.id ? order.id.toString().toLowerCase() : '';
        return orderId.includes(searchValue);
    });
    
    renderOrderHistory(filtered);
}

// Filter orders
function filterOrders() {
    const filterType = document.getElementById('filterType');
    const filterValue = document.getElementById('filterValue');
    
    if (!filterType || !filterValue || !filterValue.value) {
        renderOrderHistory(allOrderHistory);
        return;
    }
    
    const filtered = allOrderHistory.filter(order => {
        if (!order.date) return false;
        
        const dateText = order.date.trim();
        const dateParts = dateText.split('-');
        
        if (dateParts.length !== 3) {
            return false;
        }
        
        // Parse date parts - assuming format is MM-DD-YYYY or M-D-YYYY
        const month = dateParts[0].padStart(2, '0');
        const day = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        
        let match = false;
        
        if (filterType.value === 'month') {
            match = month === filterValue.value;
        } else if (filterType.value === 'day') {
            match = day === filterValue.value;
        } else if (filterType.value === 'year') {
            match = year === filterValue.value;
        }
        
        return match;
    });
    
    renderOrderHistory(filtered);
}

// Export data
function exportData() {
    const visibleRows = document.querySelectorAll('#orderTableBody tr:not([style*="display: none"])');
    
    if (visibleRows.length === 0 || (visibleRows.length === 1 && visibleRows[0].cells.length === 1)) {
                Swal.fire({
            position: "center",
            icon: "warning",
            title: 'Error',
            text: "No data to export",
            showConfirmButton: false,
            timer: 1700
        });
        return;
    }
    
    let csv = 'Order ID,Item Order,Total Amount,Payment Method,Order Date,Status\n';
    
    // Get currently displayed orders
    const currentData = [];
    visibleRows.forEach(row => {
        if (row.dataset.orderId) {
            const order = {
                id: row.dataset.orderId,
                items: row.dataset.items,
                amount: row.dataset.amount,
                method: row.dataset.method,
                date: row.dataset.date,
                status: row.dataset.status
            };
            currentData.push(order);
        }
    });
    
    currentData.forEach(order => {
        csv += `${order.id},"${order.items}",${order.amount},${order.method},${order.date},${order.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Print data
function printData() {
    const table = document.querySelector('.order-table');
    if (!table) return;
    
    // Clone the table
    const tableClone = table.cloneNode(true);
    
    // Remove hidden rows from clone
    const rows = tableClone.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.style.display === 'none') {
            row.remove();
        }
    });
    
    // Remove action column
    const headers = tableClone.querySelectorAll('th');
    if (headers.length > 0) {
        headers[headers.length - 1].remove();
    }
    
    const cells = tableClone.querySelectorAll('tbody td:last-child');
    cells.forEach(cell => cell.remove());
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order History - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    h1 {
                        text-align: center;
                        color: #0052cc;
                        margin-bottom: 20px;
                    }
                    table { 
                        border-collapse: collapse;
                        width: 100%;
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background-color: #0052cc;
                        color: white;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .print-date {
                        text-align: right;
                        color: #666;
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="print-date">Printed: ${new Date().toLocaleString()}</div>
                <h1>Order History</h1>
                ${tableClone.outerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Fetch and show online receipt
async function fetchAndShowOnlineReceipt(orderId) {
    try {
        const response = await fetch(`../controllers/get_online_order.php?order_id=${orderId}`);
        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch(e) {
            console.error("JSON parse error:", e);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error',
                text: "Failed to load order details",
                showConfirmButton: false,
                timer: 1700
            });
            return;
        }
        
        if (data.error) {
            console.error("Server error:", data.error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error',
                text: 'Failed to load order details: ' + data.error,
                showConfirmButton: false,
                timer: 1700
            });
            return;
        }
        
        if (data && data.length > 0) {
            const order = data[0];
            showReceipt(order);
        } else {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error',
                text: 'This order does not have online order details.',
                showConfirmButton: false,
                timer: 1700
            });
        }
        
    } catch (error) {
        console.error("Error fetching online order:", error);
        Swal.fire({
            position: "center",
            icon: "warning",
            title: 'Error',
            text: 'Failed to load order details',
            showConfirmButton: false,
            timer: 1700
        });
    }
}

// Show receipt for walk in customers
function showWalkInReceipt(order) {
    const receiptSection = document.getElementById('walkInReceiptSection');
    
    if (!receiptSection) {
        console.error('walkInReceiptSection not found!');
        return;
    }
    
    // Hide online receipt if visible
    const onlineReceipt = document.getElementById('receiptSection');
    if (onlineReceipt) {
        onlineReceipt.style.display = 'none';
    }
    
    // Show walk-in receipt with flex display
    receiptSection.style.display = 'flex';
    
    try {
        const orderNumEl = document.getElementById('walkInOrderNumber');
        if (orderNumEl) {
            orderNumEl.innerHTML = `Order No: <b>${escapeHTML(order.id) || 'N/A'}</b>`;
        }
        
        const orderDateEl = document.getElementById('walkInOrderDate');
        if (orderDateEl) {
            orderDateEl.innerHTML = `<b>${escapeHTML(order.date) || 'N/A'}</b>`;
        }
        
        const nameEl = document.getElementById('walkInName');
        if (nameEl) {
            nameEl.innerHTML = `Walk In Name: <b>${escapeHTML(order.customerName) || 'Walk-in Customer'}</b>`;
        }
        
        const totalAmount = escapeHTML(order.amount) || '₱0.00';
        
        const subtotalEl = document.getElementById('walkInSubtotal');
        if (subtotalEl) {
            subtotalEl.innerHTML = `<b>${totalAmount}</b>`;
        }
        
        const totalEl = document.getElementById('walkInTotal');
        if (totalEl) {
            totalEl.innerHTML = `<b>${totalAmount}</b>`;
        }
        
        const methodEl = document.getElementById('walkInPaymentMethod');
        if (methodEl) {
            methodEl.innerHTML = `Payment Method: <b>${escapeHTML(order.method) || 'Cash'}</b>`;
        }

        const itemsContainer = document.getElementById('walkInItemsContainer');
        
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            
            if (order.items && order.items.trim() !== '' && order.items !== 'No items') {
                // Parse items like "1x coke" or "2x burger, 1x fries"
                const itemsList = escapeHTML(order.items).split(', ');
                
                itemsList.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'details mb-1';
                    
                    // Try to parse format like "1x coke" or "2x burger"
                    const match = item.match(/(\d+)x\s*(.+)/i);
                    
                    if (match) {
                        const qty = match[1];
                        const name = match[2];
                        div.innerHTML = `<span><b>${qty} ×</b> ${name}</span>`;
                    } else {
                        // If format doesn't match, just display as is
                        div.innerHTML = `<span>${escapeHTML(item)}</span>`;
                    }
                    
                    itemsContainer.appendChild(div);
                });
            } else {
                itemsContainer.innerHTML = '<p class="details">No items found</p>';
            }
        }
        
    } catch (error) {
        console.error("Error populating walk-in receipt:", error);
    }
}

// Show receipt for online orders
function showReceipt(order) {
    const receiptSection = document.getElementById('receiptSection');
    if (!receiptSection) {
        console.error('receiptSection not found!');
        return;
    }
    
    // Hide walk-in receipt if visible
    const walkInReceipt = document.getElementById('walkInReceiptSection');
    if (walkInReceipt) {
        walkInReceipt.style.display = 'none';
    }
    
    // Show online receipt with flex display
    receiptSection.style.display = 'flex';
    
    document.getElementById('orderNumber').innerHTML = `Order No: <b>${escapeHTML(order.order_number) || 'N/A'}</b>`;
    document.getElementById('orderDate').innerHTML = `<b>${escapeHTML(order.date_ordered) || 'N/A'}</b>`;
    document.getElementById('recipient').innerHTML = `Customer Name: <b>${escapeHTML(order.recipient_name) || 'N/A'}</b>`;
    document.getElementById('contactNumber').innerHTML = `Contact Number: <b>${escapeHTML(order.phone_number) || 'N/A'}</b>`;
    document.getElementById('emailAddress').innerHTML = `Email Address: <b>${escapeHTML(order.email) || 'N/A'}</b>`;
    document.getElementById('deliveryAddress').innerHTML = `Delivery Address: <b>${escapeHTML(order.delivery_address) || 'N/A'}</b>`;
    
    const subtotal = parseFloat(order.subtotal) || 0;
    const deliveryFee = parseFloat(order.delivery_fee) || 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('subtotal').innerHTML = `<b>₱${escapeHTML(subtotal.toFixed(2))}</b>`;
    document.getElementById('deliveryFee').innerHTML = `<b>₱${escapeHTML(deliveryFee.toFixed(2))}</b>`;
    document.getElementById('total').innerHTML = `<b>₱${escapeHTML(total.toFixed(2))}</b>`;
    document.getElementById('paymentMethod').innerHTML = `Payment Method: <b>${escapeHTML(order.payment_method) || 'N/A'}</b>`;

    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = '';
    
    if (order.items_ordered && order.items_ordered.trim() !== '') {
        const items = order.items_ordered.split(', ');
        items.forEach(item => {
            const span = document.createElement('div');
            span.className = 'details mb-1 d-flex justify-content-between w-100';

            const parts = item.split(" x");
            const name = parts[0] || "Item";

            const qtyAndPrice = (parts[1] || "").split(" @");
            const qty = parseInt(qtyAndPrice[0]) || 0;
            const price = parseFloat(qtyAndPrice[1]) || 0;

            const itemSubtotal = qty * price;

            span.innerHTML = `
                <span><b>${escapeHTML(qty)} ×</b> ${escapeHTML(name)}</span>
                <span><b>₱${escapeHTML(itemSubtotal.toFixed(2))}</b></span>
            `;

            itemsContainer.appendChild(span);
        });
    } else {
        const p = document.createElement('p');
        p.className = 'details';
        p.textContent = 'No items found';
        itemsContainer.appendChild(p);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load order history
    populateOrderHistory();
    
    // Setup event listener for search input
    const searchInput = document.getElementById('searchOrderId');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchOrders);
    }
    
    // Setup event listener for filter type
    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', updateFilterOptions);
    }
    
    // Setup event listener for filter value
    const filterValue = document.getElementById('filterValue');
    if (filterValue) {
        filterValue.addEventListener('change', filterOrders);
    }
    
    // Setup event listener for export button
    const exportBtn = document.querySelector('.history-btn[onclick="exportData()"]');
    if (exportBtn) {
        exportBtn.removeAttribute('onclick');
        exportBtn.addEventListener('click', exportData);
    }
    
    // Setup event listener for print button
    const printBtn = document.querySelector('.history-btn[onclick="printData()"]');
    if (printBtn) {
        printBtn.removeAttribute('onclick');
        printBtn.addEventListener('click', printData);
    }

    document.getElementById('receiptSection').addEventListener('click', function(e) {
        const receiptCard = document.getElementById('receiptCard');
        if (!receiptCard.contains(e.target)) {
            this.style.display = 'none';
        }
    });

    document.getElementById('walkInReceiptSection').addEventListener('click', function(e) {
        const walkInCard = document.getElementById('walkInReceiptCard');
        if (!walkInCard.contains(e.target)) {
            this.style.display = 'none';
        }
    });
    
    // Setup event listener for view receipt buttons
    const orderTableBody = document.getElementById("orderTableBody");
if (orderTableBody) {
    orderTableBody.addEventListener("click", function(e) {
        const viewButton = e.target.closest(".view-history-receipt");
        if (!viewButton) return;

        const row = viewButton.closest("tr");
        if (!row) return;

        // Rebuild order object from dataset (use the same keys as renderOrderHistory)
        const order = {
            id: row.dataset.orderId,
            items: row.dataset.items,
            customerName: row.dataset.customerName,
            amount: row.dataset.amount,
            method: row.dataset.method,
            date: row.dataset.date,
            status: row.dataset.status,
            order_number: row.dataset.orderNumber,
            recipient_name: row.dataset.recipientName,
            delivery_address: row.dataset.deliveryAddress,
            orderType: row.dataset.orderType
        };

        // Debugging — uncomment if you need to inspect what fields are present
        // console.log('View receipt clicked. Order reconstructed:', order);

        // Decide which receipt to show
        if (isOnlineOrder(order)) {
            // Online: fetch full details (server side) then show receipt
            fetchAndShowOnlineReceipt(order.id || order.order_number);
        } else {
            // Walk-in: show local walk-in receipt using available dataset
            showWalkInReceipt(order);
        }
    });
}
});