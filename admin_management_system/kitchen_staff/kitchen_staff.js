let activeOrders = [];
let refreshInterval;
let errorCount = 0;
const MAX_ERRORS = 3;

// Update API_BASE to match your project structure
const API_BASE = '../../controllers/kitchen_staff.php';

// Load orders and stats on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadStats();
    
    // Refresh every 10 seconds
    refreshInterval = setInterval(() => {
        if (errorCount < MAX_ERRORS) {
            loadOrders();
            loadStats();
        }
    }, 10000);
});

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}?action=getActiveOrders`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const result = JSON.parse(text);
        
        if (result.success) {
            activeOrders = result.data;
            displayOrders(result.data);
            errorCount = 0; // Reset error count on success
        } else {
            handleError('Failed to load orders: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        handleError('Error loading orders. Check console for details.');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}?action=getOrderStats`);
        const text = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = JSON.parse(text);
        
        if (result.success) {
            document.getElementById('totalOrders').textContent = result.data.total;
            document.getElementById('preparingOrders').textContent = result.data.preparing;
            document.getElementById('readyOrders').textContent = result.data.ready;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function handleError(message) {
    errorCount++;
    
    const container = document.getElementById('ordersContainer');
    container.innerHTML = `
        <div class="loading" style="color: #ef4444;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <div>${message}</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">Check browser console for details</div>
            ${errorCount >= MAX_ERRORS ? `
                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">Auto-refresh stopped after ${MAX_ERRORS} errors</div>
            ` : ''}
        </div>
    `;
    
    if (errorCount >= MAX_ERRORS && refreshInterval) {
        clearInterval(refreshInterval);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <div style="font-size: 48px; margin-bottom: 20px;">👨‍🍳</div>
                <div>No active orders at the moment</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">New orders will appear here automatically</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <span class="order-number">${order.orderNumber}</span>
                <span class="table-badge">${getTableDisplay(order)}</span>
            </div>
            <div class="order-body">
                ${formatOrderItems(order.items)}
            </div>
            <div class="order-footer">
                <div class="footer-item">
                    <span class="icon">🕐</span>
                    <span>${order.minutesAgo} min ago</span>
                </div>
                <div class="footer-item">
                    <span class="icon">${getOrderTypeIcon(order.orderType)}</span>
                    <span>${formatOrderType(order.orderType)}</span>
                </div>
            </div>
            <div class="status-section">
                <div class="status-label">Current Status</div>
                <span class="status-badge status-${order.status}">${capitalizeFirst(order.status)}</span>
            </div>
            ${getActionButton(order.status, order.id, order.orderType)}
        </div>
    `).join('');
    
    // Add event listeners to action buttons
    attachButtonListeners();
    
    // Apply current filter
    applyCurrentFilter();
}

function getTableDisplay(order) {
    // Always show table number, not customer name
    if (order.table && order.table !== 'Table') {
        return order.table;
    }
    
    // Fallback based on order type
    switch(order.orderType) {
        case 'delivery': return 'Delivery';
        case 'takeout': return 'Takeout';
        default: return 'Table 1';
    }
}

function formatOrderItems(items) {
    if (!items || items === 'No items') {
        return '<div style="color: #9ca3af; text-align: center; padding: 20px;">No items in order</div>';
    }
    
    // Split the items string and format each item
    const itemsArray = items.split(', ');
    return itemsArray.map(item => `
        <div style="padding: 8px 0; border-bottom: 1px solid #6b7280; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px;">${item}</span>
        </div>
    `).join('');
}

function getOrderTypeIcon(orderType) {
    switch(orderType) {
        case 'delivery': return '🚚';
        case 'takeout': return '🥡';
        default: return '🍽️';
    }
}

function formatOrderType(orderType) {
    switch(orderType) {
        case 'dine in': return 'Dine In';
        case 'delivery': return 'Delivery';
        case 'takeout': return 'Takeout';
        default: return orderType;
    }
}

function getActionButton(status, orderNo, orderType) {  
    if (status === 'reviewed') {
        return `<button class="action-btn btn-start" data-order-no="${orderNo}">
            <span>Start Preparing</span>
        </button>`;
    }

    if (status === 'preparing') {
        return `<button class="action-btn btn-mark-ready" data-order-no="${orderNo}">
            <span>Mark Ready</span>
        </button>`;
    }

    // If status = ready
    if (status === 'ready') {
        if (orderType === 'delivery') {
            // For delivery orders, show disabled button or just text
            return `<div class="status-message" style="text-align: center; padding: 12px; background: #374151; border-radius: 8px; color: #9ca3af;">
                <span>⏳ Waiting for rider assignment</span>
            </div>`;
        }

        // Dine-in / Takeout → normal complete
        return `<button class="action-btn btn-complete" data-order-no="${orderNo}">
            <span>✓</span>
            <span>Complete</span>
        </button>`;
    }

    // Delivery second stage: in_transit → show status message only
    if (status === 'in_transit') {
        return `<div class="status-message" style="text-align: center; padding: 12px; background: #374151; border-radius: 8px; color: #9ca3af;">
            <span>🚚 Order is being delivered</span>
        </div>`;
    }

    return '';
}

function attachButtonListeners() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNo = this.getAttribute('data-order-no');
            const card = this.closest('.order-card');
            const orderNumber = card.querySelector('.order-number').textContent;
            
            if (this.classList.contains('btn-start')) {
                showConfirmDialog(
                    'Start Preparing Order',
                    `Are you sure you want to start preparing ${orderNumber}?`,
                    'question',
                    'Yes, Start Preparing',
                    'preparing',
                    orderNo
                );
            } else if (this.classList.contains('btn-mark-ready')) {
                showConfirmDialog(
                    'Mark Order as Ready',
                    `Is ${orderNumber} ready for serving?`,
                    'question',
                    'Yes, Mark Ready',
                    'ready',
                    orderNo
                );
            } 
            // Only allow complete for dine-in/takeout (non-delivery orders)
            else if (this.classList.contains('btn-complete')) {
                showConfirmDialog(
                    'Complete Order',
                    `Has ${orderNumber} been completed?`,
                    'success',
                    'Yes, Complete Order',
                    'completed',
                    orderNo
                );
            }
        });
    });
}

function showConfirmDialog(title, text, icon, confirmText, status, orderNo) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        background: '#4b5563',
        color: 'white',
        customClass: {
            popup: 'sweetalert-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            updateOrderStatus(orderNo, status);
        }
    });
}

async function updateOrderStatus(orderNo, newStatus) {
    try {
        const response = await fetch(`${API_BASE}?action=updateOrderStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderNo: orderNo,
                status: newStatus
            })
        });
        
        const text = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = JSON.parse(text);
        
        if (result.success) {
            showSuccess(`Order status updated successfully!`);
            
            if (newStatus === 'completed') {
                const card = document.querySelector(`[data-order-id="${orderNo}"]`);
                if (card) {
                    card.style.opacity = '0';
                    card.style.transition = 'opacity 0.3s';
                    setTimeout(() => {
                        card.remove();
                        loadStats(); // Update stats after removal
                        
                        // Show success message for completion
                        if (document.querySelectorAll('.order-card').length === 0) {
                            showSuccess('All orders completed! 🎉');
                        }
                    }, 300);
                }
            } else {
                // Reload orders to reflect status changes
                loadOrders();
                loadStats();
            }
        } else {
            showError('Failed to update order status: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Error updating order status. Please try again.');
    }
}

// Filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active-all'));
        btn.classList.add('active-all');
        
        applyCurrentFilter();
    });
});

function applyCurrentFilter() {
    const activeFilter = document.querySelector('.filter-btn.active-all');
    if (!activeFilter) return;
    
    const filter = activeFilter.textContent.toLowerCase();
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
        if (filter === 'all orders') {
            card.style.display = 'block';
        } else {
            const status = card.querySelector('.status-badge').textContent.toLowerCase();
            card.style.display = status === filter ? 'block' : 'none';
        }
    });
}

// SweetAlert2 helper functions
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        timer: 2000,
        showConfirmButton: false,
        background: '#4b5563',
        color: 'white'
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        background: '#4b5563',
        color: 'white',
        confirmButtonText: 'OK'
    });
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const style = document.createElement('style');
style.textContent = `
    .sweetalert-popup {
        border-radius: 12px;
    }
    
    .swal2-confirm {
        border-radius: 8px !important;
        padding: 10px 24px !important;
    }
    
    .swal2-cancel {
        border-radius: 8px !important;
        padding: 10px 24px !important;
    }
`;
document.head.appendChild(style);

document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-in-transit')) {
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: "You don't have the privilege to update this order to 'In Transit'.",
            confirmButtonText: 'OK'
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", () => {

        Swal.fire({
            title: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f2d067',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {

                fetch("../../controllers/logout.php", {
                    method: "POST"
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        console.log("✅ " + data.message);
                        window.location.href = "../login.php";
                    } else {
                        console.log("⚠️ " + data.message);
                    }
                })
                .catch(err => {
                    console.error("Error:", err);
                });

            }
        });
    });
});
