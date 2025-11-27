// Open/Close Sidebar
document.getElementById("openSidebarBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

function showSection(section) {
    document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
    document.getElementById("section-" + section).classList.add("active");

    document.getElementById("sidebar").classList.remove("open");

    document.querySelectorAll(".sidebar-menu a").forEach(a => a.classList.remove("active-link"));
    document.getElementById("link-" + section).classList.add("active-link");
    
    if (section === 'history') {
        loadOrders();
    }
}

// ============================
// Load Customer Profile Data
// ============================
function loadCustomerProfile() {
    console.log("Loading customer profile...");
    fetch("../../../controllers/customer_controllers/personal_information/load_my_details.php")
        .then(response => response.json())
        .then(data => {
            console.log("Customer data:", data);
            
            if (data.error) {
                console.error("Error:", data.error);
                alert("Error loading profile: " + data.error);
                return;
            }

            // Populate form fields
            document.getElementById("username").value = data.username || '';
            document.getElementById("name").value = data.name || '';
            document.getElementById("contactno").value = data.contact_number || '';
            document.getElementById("email").value = data.email || '';
            
            // Make fields readonly initially
            document.getElementById("username").setAttribute('readonly', true);
            document.getElementById("name").setAttribute('readonly', true);
            document.getElementById("contactno").setAttribute('readonly', true);
            document.getElementById("email").setAttribute('readonly', true);
        })
        .catch(error => {
            console.error("Fetch error:", error);
            alert("Error loading profile data");
        });
}

// ============================
// Edit Profile Function
// ============================
function enableEditProfile() {
    const nameField = document.getElementById("name");
    const contactField = document.getElementById("contactno");
    const emailField = document.getElementById("email");
    
    // Check if already in edit mode
    const isEditMode = !nameField.hasAttribute('readonly');
    
    if (isEditMode) {
        // Save changes (with password prompt)
        saveProfileChanges();
    } else {
        // Prompt for password before enabling edit mode
        Swal.fire({
            title: 'Verify Your Identity',
            html: '<input type="password" id="verifyPassword" class="swal2-input" placeholder="Enter your password">',
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const password = document.getElementById('verifyPassword').value;
                
                if (!password) {
                    Swal.showValidationMessage('Please enter your password');
                    return false;
                }
                
                return { password: password };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading
                Swal.fire({
                    title: 'Verifying...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Verify password with backend
                fetch('../../../controllers/customer_controllers/personal_information/verify_password.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password: result.value.password })
                })
                .then(response => response.json())
                .then(data => {
                    Swal.close();
                    
                    if (data.success) {
                        // Enable editing (except username)
                        nameField.removeAttribute('readonly');
                        contactField.removeAttribute('readonly');
                        emailField.removeAttribute('readonly');
                        
                        nameField.style.backgroundColor = '#fff';
                        contactField.style.backgroundColor = '#fff';
                        emailField.style.backgroundColor = '#fff';
                        
                        // Change button text
                        const editBtn = document.querySelector('.btn-warning');
                        editBtn.textContent = 'Save Changes';
                        editBtn.classList.remove('btn-warning');
                        editBtn.classList.add('btn-success');
                        
                        Swal.fire({
                            title: 'Verified!',
                            text: 'You can now edit your profile',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            title: 'Verification Failed',
                            text: data.message || 'Incorrect password',
                            icon: 'error'
                        });
                    }
                })
                .catch(error => {
                    Swal.close();
                    console.error('Verification error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to verify password',
                        icon: 'error'
                    });
                });
            }
        });
    }
}

function saveProfileChanges() {
    const name = document.getElementById("name").value.trim();
    const contactno = document.getElementById("contactno").value.trim();
    const email = document.getElementById("email").value.trim();
    
    if (!name || !contactno || !email) {
        Swal.fire({
            title: "Validation Error",
            text: "Please fill in all fields",
            icon: "warning"
        });
        return;
    }
    
    Swal.fire({
        title: 'Updating Profile...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    fetch('../../../controllers/customer_controllers/personal_information/edit_personal_details.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            contactno: contactno,
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: "Success!",
                text: "Profile updated successfully",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            
            // Make fields readonly again
            document.getElementById("name").setAttribute('readonly', true);
            document.getElementById("contactno").setAttribute('readonly', true);
            document.getElementById("email").setAttribute('readonly', true);
            
            // Change button back
            const editBtn = document.querySelector('.btn-success');
            if (editBtn) {
                editBtn.textContent = 'Edit Profile';
                editBtn.classList.remove('btn-success');
                editBtn.classList.add('btn-warning');
            }
            
            loadCustomerProfile();
        } else {
            Swal.fire({
                title: "Error",
                text: data.message || "Failed to update profile",
                icon: "error"
            });
        }
    })
    .catch(error => {
        console.error("Error updating profile:", error);
        Swal.fire({
            title: "Error",
            text: "Failed to update profile",
            icon: "error"
        });
    });
}

// ============================
// Change Password Function
// ============================
function changePassword() {
    Swal.fire({
        title: 'Change Password',
        html: `
            <input type="password" id="currentPassword" class="swal2-input" placeholder="Current Password">
            <input type="password" id="newPassword" class="swal2-input" placeholder="New Password">
            <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm New Password">
        `,
        showCancelButton: true,
        confirmButtonText: 'Change Password',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                Swal.showValidationMessage('Please fill in all fields');
                return false;
            }
            
            if (newPassword.length < 6) {
                Swal.showValidationMessage('New password must be at least 6 characters');
                return false;
            }
            
            if (newPassword !== confirmPassword) {
                Swal.showValidationMessage('New passwords do not match');
                return false;
            }
            
            return {
                currentPassword: currentPassword,
                newPassword: newPassword
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Changing Password...',
                text: 'Please wait',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            fetch('../../../controllers/customer_controllers/personal_information/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(result.value)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: "Success!",
                        text: "Password changed successfully",
                        icon: "success"
                    });
                } else {
                    Swal.fire({
                        title: "Error",
                        text: data.message || "Failed to change password",
                        icon: "error"
                    });
                }
            })
            .catch(error => {
                console.error("Error changing password:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to change password",
                    icon: "error"
                });
            });
        }
    });
}

// ============================
// Load Customer Addresses
// ============================
function loadCustomerAddresses() {
    console.log("Loading customer addresses...");
    fetch("../../../controllers/customer_controllers/personal_information/load_my_addresses.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log("Raw address response:", text);
            
            if (text.trim().startsWith('<')) {
                console.error("Received HTML instead of JSON:", text);
                throw new Error("Server returned an error");
            }
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("JSON parse error:", e);
                console.error("Response was:", text);
                throw new Error("Invalid JSON response");
            }
            
            console.log("Parsed address data:", data);
            
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            const addressSection = document.querySelector("#section-address .mobile-card");
            
            const title = addressSection.querySelector('.card-title');
            addressSection.innerHTML = '';
            addressSection.appendChild(title);

            if (!Array.isArray(data) || data.length === 0) {
                addressSection.innerHTML += `
                    <p class="text-muted text-center">No saved addresses found</p>
                `;
            } else {
                data.forEach((address, index) => {
                    addressSection.innerHTML += `
                        <label>Address ${index + 1}</label>
                        <div class="input-group mb-3">
                            <input type="text" 
                                   class="form-control" 
                                   value="${address.full_address || 'N/A'}" 
                                   readonly>
                            <button class="btn" style="background-color: #062970;" onclick="editAddress(${address.locationID})" title="Edit Address">
                                <i class="fa-solid fa-pencil" style="color: white;"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteAddress(${address.locationID})" title="Delete Address">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    `;
                });
            }

            addressSection.innerHTML += `
                <button class="btn btn-warning w-100" onclick="addNewAddress()">Add New Address</button>
            `;
        })
        .catch(error => {
            console.error("Fetch error:", error);
            const addressSection = document.querySelector("#section-address .mobile-card");
            if (addressSection) {
                const title = addressSection.querySelector('.card-title');
                addressSection.innerHTML = '';
                if (title) addressSection.appendChild(title);
                addressSection.innerHTML += `
                    <div class="alert alert-danger">
                        Error loading addresses: ${error.message}<br>
                        <small>Check console for details</small>
                    </div>
                `;
            }
        });
}

// ============================
// Edit Address Functions
// ============================
function editAddress(locationID) {
    console.log("Editing address:", locationID);
    
    fetch(`../../../controllers/customer_controllers/personal_information/get_address.php?id=${locationID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log("Get address response:", text);
            
            if (text.trim().startsWith('<')) {
                console.error("Received HTML instead of JSON:", text);
                throw new Error("Server returned an error. Check browser console.");
            }
            
            const data = JSON.parse(text);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            document.getElementById('editLocationID').value = data.locationID;
            document.getElementById('editStreet').value = data.street || '';
            document.getElementById('editBarangay').value = data.barangay || '';
            document.getElementById('editMunicipality').value = data.municipality || '';
            document.getElementById('editRemark').value = data.locationRemark || '';
            
            const modal = new bootstrap.Modal(document.getElementById('editAddressModal'));
            modal.show();
        })
        .catch(error => {
            console.error("Error fetching address:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to load address details: " + error.message,
                icon: "error"
            });
        });
}

function saveAddressChanges() {
    const locationID = document.getElementById('editLocationID').value;
    const street = document.getElementById('editStreet').value.trim();
    const barangay = document.getElementById('editBarangay').value.trim();
    const municipality = document.getElementById('editMunicipality').value.trim();
    const remark = document.getElementById('editRemark').value.trim();
    
    if (!street || !barangay || !municipality) {
        Swal.fire({
            title: "Validation Error",
            text: "Please fill in all required fields",
            icon: "warning"
        });
        return;
    }
    
    Swal.fire({
        title: 'Saving...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    const isNewAddress = !locationID || locationID === '';
    const endpoint = isNewAddress 
        ? '../../../controllers/customer_controllers/personal_information/add_address.php'
        : '../../../controllers/customer_controllers/personal_information/edit_address.php';
    
    const requestBody = {
        street: street,
        barangay: barangay,
        municipality: municipality,
        locationRemark: remark
    };
    
    if (!isNewAddress) {
        requestBody.locationID = locationID;
    }
    
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log(`${isNewAddress ? 'Add' : 'Update'} response:`, text);
        
        if (text.trim().startsWith('<')) {
            console.error("Received HTML instead of JSON:", text);
            throw new Error("Server returned an error. Check browser console.");
        }
        
        const data = JSON.parse(text);
        
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAddressModal'));
            modal.hide();
            
            Swal.fire({
                title: "Success!",
                text: isNewAddress ? "Address added successfully" : "Address updated successfully",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            
            loadCustomerAddresses();
        } else {
            throw new Error(data.message || `Failed to ${isNewAddress ? 'add' : 'update'} address`);
        }
    })
    .catch(error => {
        console.error(`Error ${isNewAddress ? 'adding' : 'updating'} address:`, error);
        Swal.fire({
            title: "Error",
            text: `Failed to ${isNewAddress ? 'add' : 'update'} address: ` + error.message,
            icon: "error"
        });
    });
}

function deleteAddress(locationID) {
    Swal.fire({
        title: "Delete this address?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`../../../controllers/customer_controllers/personal_information/delete_address.php?id=${locationID}`, {
                method: "GET"
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then(text => {
                console.log("Delete response:", text);
                
                if (text.trim().startsWith('<')) {
                    console.error("Received HTML instead of JSON:", text);
                    throw new Error("Server returned an error. Check console for details.");
                }
                
                const data = JSON.parse(text);
                
                if (data.success) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Address has been removed.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    loadCustomerAddresses();
                } else {
                    Swal.fire({
                        title: "Failed!",
                        text: data.message || "Unable to delete address.",
                        icon: "error"
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    title: "Error",
                    text: "Something went wrong. Check browser console for details.",
                    icon: "error"
                });
                console.error("Delete error:", err);
            });
        }
    });
}

function addNewAddress() {
    document.getElementById('editLocationID').value = '';
    document.getElementById('editStreet').value = '';
    document.getElementById('editBarangay').value = '';
    document.getElementById('editMunicipality').value = '';
    document.getElementById('editRemark').value = '';
    
    document.getElementById('editAddressModalLabel').innerHTML = '<i class="fa-solid fa-location-dot me-2"></i>Add New Address';
    
    const modal = new bootstrap.Modal(document.getElementById('editAddressModal'));
    modal.show();
    
    const modalElement = document.getElementById('editAddressModal');
    modalElement.addEventListener('hidden.bs.modal', function resetTitle() {
        document.getElementById('editAddressModalLabel').innerHTML = '<i class="fa-solid fa-location-dot me-2"></i>Edit Address';
        modalElement.removeEventListener('hidden.bs.modal', resetTitle);
    });
}

// ============================
// Load Orders (keeping existing code)
// ============================
let allOrders = [];

function loadOrders() {
    console.log("Loading orders...");
    
    fetch("../../../controllers/customer_controllers/personal_information/load_my_orders.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log("Raw response:", text);
            
            if (text.trim().startsWith('<')) {
                console.error("Received HTML instead of JSON:", text);
                throw new Error("Server returned HTML instead of JSON. Check PHP errors.");
            }
            
            let data;
            let orders;

            try {
                data = JSON.parse(text);
                console.log("Parsed JSON data:", data);
                
                if (data.debug) {
                    console.log("=== DEBUG INFO ===");
                    console.log("Customer ID:", data.debug.customer_id);
                    console.log("Order Count:", data.debug.order_count);
                    console.log("==================");
                }
                
                orders = data.orders || data;
                allOrders = orders;
                
                console.log("All orders stored:", allOrders);
                
            } catch(e) {
                console.error("JSON parse error:", e);
                console.error("Failed to parse response:", text);
                const ordersTable = document.getElementById("ordersTable");
                if (ordersTable) {
                    ordersTable.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center text-danger">
                                <strong>Error parsing server response</strong><br>
                                Check browser console for details
                            </td>
                        </tr>
                    `;
                }
                return;
            }

            const tableBody = document.getElementById("ordersTable");
            if (!tableBody) {
                console.error("ordersTable element not found");
                return;
            }
            
            tableBody.innerHTML = "";

            if (orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No orders found</td></tr>`;
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.dataset.order = JSON.stringify(order);
                
                row.innerHTML = `
                    <td><b>${order.order_number}</b></td>
                    <td class="date-column">${order.date_ordered}</td>
                    <td class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-warning view">
                            <i class="fa-solid fa-receipt me-1"></i>
                        </button>
                        <button class="btn btn-sm btn-primary track">
                            <i class="fa-solid fa-location-dot"></i>
                        </button>
                        <button class="btn btn-sm btn-danger cancel">
                            <i class="fa-solid fa-x"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });

            document.querySelectorAll(".view").forEach(btn => {
                btn.addEventListener("click", function () {
                    const row = this.closest("tr");
                    const orderData = JSON.parse(row.dataset.order);
                    showReceipt(orderData);
                });
            });
            
            document.querySelectorAll(".track").forEach(btn => {
                btn.addEventListener("click", function () {
                    const row = this.closest("tr");
                    const orderData = JSON.parse(row.dataset.order);
                    console.log("Track button clicked for order:", orderData.order_number);
                    trackOrder(orderData);
                });
            });

            document.querySelectorAll(".cancel").forEach(btn => {
                btn.addEventListener("click", function () {
                    const row = this.closest("tr");
                    const orderData = JSON.parse(row.dataset.order);
                    cancelOrder(orderData.order_number, row);
                });
            });

        })
        .catch(error => {
            console.error("Fetch error:", error);
            const ordersTable = document.getElementById("ordersTable");
            if (ordersTable) {
                ordersTable.innerHTML = `
                    <tr><td colspan="3" class="text-center text-danger">Error: ${error.message}</td></tr>
                `;
            }
        });
}

function showReceipt(order) {
    const receiptSection = document.getElementById('receiptSection');
    if (!receiptSection) return;
    
    receiptSection.style.display = 'block';
    
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

document.getElementById('receiptSection')?.addEventListener('click', function(e) {
    const receiptCard = document.getElementById('receiptCard');
    if (!receiptCard.contains(e.target)) {
        this.style.display = 'none';
    }
});

const statusDescriptions = {
    "Pending": "Your order has been received and is waiting to be processed.",
    "Preparing": "Our kitchen is preparing your delicious meal.",
    "Ready": "Your order is ready and waiting for delivery.",
    "Out for Delivery": "Your order is on its way to you!",
    "Delivered": "Your order has been successfully delivered. Enjoy!"
};

function trackOrder(orderData) {
    console.log("trackOrder called with:", orderData);
    
    if (!orderData) {
        alert('Order not found!');
        return;
    }
    
    document.getElementById('trackSection').style.display = 'flex';
    
    const trackStatusElem = document.getElementById('trackStatus');
    const currentStatus = (orderData.order_status || '').trim(); 

    document.getElementById('trackOrderNo').textContent = orderData.order_number;
    document.getElementById('trackOrderDate').textContent = orderData.date_ordered;
    document.getElementById('trackDeliveryRider').textContent = orderData.rider_name || 'Unassigned';

    if (currentStatus === "Canceled" || currentStatus === "Rejected") {
        trackStatusElem.textContent = currentStatus;
        trackStatusElem.style.color = currentStatus === "Canceled" ? "red" : "orange";
        document.getElementById('statusTracker').innerHTML = '';
        return; // stop here, skip normal tracker
    } else {
        trackStatusElem.textContent = '';
    }

    
    const statuses = [
        "Pending",
        "Preparing", 
        "Ready",
        "Out for Delivery",
        "Delivered"
    ];

    let currentStep = statuses.indexOf(currentStatus);
    if (currentStep === -1) currentStep = 0;
    
    console.log("Current step index:", currentStep);

    let html = '';
    statuses.forEach((status, index) => {
        const isCompleted = index <= currentStep;
        const showLine = index < statuses.length - 1;
        
        html += `
            <div class="status-item">
                <div class="checkpoint ${isCompleted ? 'completed' : ''}"></div>
                <div>
                    <div class="status-label ${isCompleted ? 'completed' : ''}">${status}</div>
                    <div class="status-description">${statusDescriptions[status]}</div>
                </div>
                ${showLine ? `<div class="connecting-line ${index < currentStep ? 'completed' : ''}"></div>` : ''}
            </div>
        `;
    });

    document.getElementById('statusTracker').innerHTML = html;
}

function closeTrackOrder() {
    document.getElementById('trackSection').style.display = 'none';
}

document.getElementById('trackSection')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeTrackOrder();
    }
});

// ============================
// Initialize on page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
    loadCustomerProfile();
    loadCustomerAddresses();
    loadOrders();
    
    const editForm = document.getElementById('editAddressForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAddressChanges();
        });
    }
    
    // Attach Edit Profile button event
    const editProfileBtn = document.querySelector('.btn-warning');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', enableEditProfile);
    }
    
    // Attach Change Password button event
    const changePasswordBtn = document.querySelector('.btn-secondary');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
});


// ============================
// Cancel Order
// ============================
function cancelOrder(orderNumber, tableRow) {
    Swal.fire({
        title: `Cancel Order #${orderNumber}?`,
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Call PHP API to cancel order
            fetch("../../../controllers/customer_controllers/personal_information/cancel_order.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_number: orderNumber })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cancelled!',
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Update row visually
                    if (tableRow) {
                        const orderData = JSON.parse(tableRow.dataset.order);
                        orderData.order_status = "Cancelled";
                        tableRow.dataset.order = JSON.stringify(orderData);

                        tableRow.querySelectorAll("button").forEach(btn => btn.disabled = true);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: data.message
                    });
                }
            })
            .catch(err => {
                console.error("Cancel order error:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to cancel order. Check console for details.'
                });
            });
        }
    });
}


// ============================
// Exit My Profile
// ============================
const exitprofileBtn = document.getElementById('exitBtn');
if (exitprofileBtn) {
  exitprofileBtn.addEventListener('click', () => {
    window.location.href = '../get_order/get_order.php';
  });
}


