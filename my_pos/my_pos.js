document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, about to load orders...");
    loadOrders();
});

// Load orders
function loadOrders() {
    console.log("loadOrders() function called"); 
    
    fetch("get_online_order.php")
        .then(response => response.text())
        .then(text => {
            console.log("Raw response:", text);
            
            let data;
            try {
                data = JSON.parse(text);
                console.log("Parsed JSON data:", data);
            } catch(e) {
                console.error("JSON parse error:", e);
                console.error("Response was:", text);
                document.getElementById("ordersTable").innerHTML = `
                    <tr><td colspan="6" class="text-center text-danger">Invalid response from server</td></tr>
                `;
                return;
            }

            const tableBody = document.getElementById("ordersTable");
            tableBody.innerHTML = "";

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No orders found</td></tr>`;
                return;
            }

            data.forEach(order => {
                console.log("Order object:", order);
                const statusText = order.order_status || "Unknown";
                let statusClass = "";
                switch(statusText.toLowerCase()) {
                    case "reviewed": statusClass = "reviewed"; break;
                    case "verified": statusClass = "verified"; break;
                    case "accepted": statusClass = "accepted"; break;
                    case "cancelled":
                    case "canceled": statusClass = "btn-danger"; break;
                    default: statusClass = "btn-secondary";
                }

                let actionButtonHTML = '';
                if (statusText.toLowerCase() === "verified") {
                    actionButtonHTML = `
                        <span>
                            <button class="btn btn-sm delivery">
                                <i class="fa-solid fa-truck-fast"></i>
                            </button>
                        </span>
                    `;
                }

                tableBody.innerHTML += `
                    <tr data-order='${JSON.stringify(order).replace(/'/g, "&apos;")}'>
                        <td><b>${order.order_number}</b></td>
                        <td>${order.date_ordered}</td>
                        <td>₱${parseFloat(order.subtotal).toFixed(2)}</td>
                        <td>${order.payment_status || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm rounded-pill ${statusClass}">
                                ${statusText}
                            </button>
                        </td>
                        <td class="justify-content-center">
                            <span>
                                <button class="btn btn-sm view m-2">
                                    <i class="fa-solid fa-eye text-muted"></i>
                                </button>
                            </span>
                            <span>
                                <button class="btn btn-sm cancel">
                                    <i class="fa-solid fa-x"></i>
                                </button>
                            </span>
                            ${actionButtonHTML} 
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.getElementById("ordersTable").innerHTML = `
                <tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>
            `;
        });
}

document.getElementById("ordersTable").addEventListener("click", function(e) {
    const row = e.target.closest("tr");
    if (!row) return;

    const order = JSON.parse(row.getAttribute("data-order"));

    if (e.target.closest(".view")) {
        showReceipt(order);
    } 
    
    if (e.target.closest(".delivery")) {
        showDeliveryOverlay(order);
    }
    
    if (e.target.closest(".cancel")) {
        rejectOrder(order);
    }
});

function showReceipt(order) {
    document.getElementById('receiptSection').style.display = 'block';
    document.getElementById('orderNumber').innerHTML = `Order No: <b>${order.order_number || 'N/A'}</b>`;
    document.getElementById('orderDate').innerHTML = `<b>${order.date_ordered || 'N/A'}</b>`;
    document.getElementById('recipient').innerHTML = `Customer Name: <b>${order.recipient_name || 'N/A'}</b>`;
    document.getElementById('contactNumber').innerHTML = `Contact Number: <b>${order.phone_number || 'N/A'}</b>`;
    document.getElementById('emailAddress').innerHTML = `Email Address: <b>${order.email || 'N/A'}</b>`;
    document.getElementById('deliveryAddress').innerHTML = `Delivery Address: <b>${order.delivery_address || 'N/A'}</b>`;
    
    const subtotal = parseFloat(order.subtotal) || 0;
    const deliveryFee = parseFloat(order.delivery_fee) || 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('subtotal').innerHTML = `<b>₱${subtotal.toFixed(2)}</b>`;
    document.getElementById('deliveryFee').innerHTML = `<b>₱${deliveryFee.toFixed(2)}</b>`;
    document.getElementById('total').innerHTML = `<b>₱${total.toFixed(2)}</b>`;
    document.getElementById('paymentMethod').innerHTML = `Payment Method: <b>${order.payment_method || 'N/A'}</b>`;

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
                <span><b>${qty} ×</b> ${name}</span>
                <span><b>₱${itemSubtotal.toFixed(2)}</b></span>
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

let currentOrderForDelivery = null;

function showDeliveryOverlay(order) {
    currentOrderForDelivery = order; // Store the order
    const overlay = document.getElementById('setFeeSection');
    overlay.style.display = 'flex';

    document.getElementById('deliveryOrderNumber').innerHTML = `Order No: <b>${order.order_number || 'N/A'}</b>`;
    document.getElementById('deliveryAddressText').innerHTML = `Delivery Address: <b>${order.delivery_address || 'N/A'}</b>`;
    
    // Clear the input field
    document.getElementById('deliveryFeeID').value = '';
}

// Close delivery overlay button
document.getElementById('closeDelivery').addEventListener('click', function() {
    document.getElementById('setFeeSection').style.display = 'none';
    currentOrderForDelivery = null;
});

// Submit delivery fee
document.getElementById('submitDeliveryFee').addEventListener('click', function() {
    if (!currentOrderForDelivery) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No order selected'
        });
        return;
    }

    const deliveryFee = document.getElementById('deliveryFeeID').value;
    
    // Validate input
    if (!deliveryFee || isNaN(deliveryFee) || parseFloat(deliveryFee) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Please enter a valid delivery fee'
        });
        return;
    }

    // Send to server
    // Option 1: If set_delivery_fee.php is in the same folder as this HTML file
    fetch('../../controllers/set_delivery_fee.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_number: currentOrderForDelivery.order_number,
            delivery_fee: parseFloat(deliveryFee)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Delivery fee has been set successfully!'
            }).then(() => {
                // Close overlay and reload orders
                document.getElementById('setFeeSection').style.display = 'none';
                currentOrderForDelivery = null;
                loadOrders();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Failed to set delivery fee'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while setting the delivery fee'
        });
    });
});

// Close overlays when clicking outside
document.getElementById('receiptSection').addEventListener('click', function(e) {
    const receiptCard = document.getElementById('receiptCard');
    if (!receiptCard.contains(e.target)) {
        this.style.display = 'none';
    }
});

document.getElementById('setFeeSection').addEventListener('click', function(e) {
    const feeCard = e.target.closest('.card');
    if (!feeCard) {
        this.style.display = 'none';
        currentOrderForDelivery = null;
    }
});

// Reject order function
function rejectOrder(order) {
    Swal.fire({
        title: 'Reject Order?',
        text: `Are you sure you want to reject order ${order.order_number}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reject it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Send rejection request to server
            fetch('../../controllers/reject_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_number: order.order_number
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Rejected!',
                        text: 'Order has been rejected successfully.'
                    }).then(() => {
                        loadOrders(); // Reload the orders table
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Failed to reject order'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while rejecting the order'
                });
            });
        }
    });
}