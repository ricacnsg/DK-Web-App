let activeOrders = [];
let refreshInterval;

// Update API_BASE to match your project structure
const API_BASE = '../controllers/kitchen_staff.php';

// Load orders and stats on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Kitchen Staff Interface Loading...');
    loadOrders();
    loadStats();
    
    // Refresh every 10 seconds
    refreshInterval = setInterval(() => {
        loadOrders();
        loadStats();
    }, 10000);
});

async function loadOrders() {
    try {
        console.log('Loading active orders from:', `${API_BASE}?action=getActiveOrders`);
        const response = await fetch(`${API_BASE}?action=getActiveOrders`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Orders response:', result);
        
        if (result.success) {
            activeOrders = result.data;
            displayOrders(result.data);
        } else {
            showError('Failed to load orders: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Error loading orders. Please check if the server is running.');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}?action=getOrderStats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('totalOrders').textContent = result.data.total;
            document.getElementById('preparingOrders').textContent = result.data.preparing;
            document.getElementById('readyOrders').textContent = result.data.ready;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
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
                <span class="order-number">#${order.id}</span>
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
            ${getActionButton(order.status, order.id)}
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

function getActionButton(status, orderId) {
    switch(status) {
        case 'pending':
            return `<button class="action-btn btn-start" data-order-id="${orderId}">
                <span>▶</span>
                <span>Start Preparing</span>
            </button>`;
        case 'preparing':
            return `<button class="action-btn btn-mark-ready" data-order-id="${orderId}">
                <span>✖</span>
                <span>Mark Ready</span>
            </button>`;
        case 'ready':
            return `<button class="action-btn btn-complete" data-order-id="${orderId}">
                <span>✓</span>
                <span>Complete</span>
            </button>`;
        default:
            return '';
    }
}

function attachButtonListeners() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            const card = this.closest('.order-card');
            const orderNumber = card.querySelector('.order-number').textContent;
            
            if (this.classList.contains('btn-start')) {
                showConfirmDialog(
                    'Start Preparing Order',
                    `Are you sure you want to start preparing ${orderNumber}?`,
                    'question',
                    'Yes, Start Preparing',
                    'preparing',
                    orderId
                );
            } else if (this.classList.contains('btn-mark-ready')) {
                showConfirmDialog(
                    'Mark Order as Ready',
                    `Is ${orderNumber} ready for serving?`,
                    'question',
                    'Yes, Mark Ready',
                    'ready',
                    orderId
                );
            } else if (this.classList.contains('btn-complete')) {
                showConfirmDialog(
                    'Complete Order',
                    `Has ${orderNumber} been served/completed?`,
                    'success',
                    'Yes, Complete',
                    'completed',
                    orderId
                );
            }
        });
    });
}

function showConfirmDialog(title, text, icon, confirmText, status, orderId) {
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
            updateOrderStatus(orderId, status);
        }
    });
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}?action=updateOrderStatus`, {
            method: 'POST',
            headers: {
    'Content-Type': 'application/json'
},
            body: JSON.stringify({
                orderID: orderId,
                status: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(`Order status updated successfully!`);
            
            if (newStatus === 'completed') {
                // Remove the order card with animation
                const card = document.querySelector(`[data-order-id="${orderId}"]`);
                if (card) {
                    card.style.opacity = '0';
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

// Add custom styles for SweetAlert2
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