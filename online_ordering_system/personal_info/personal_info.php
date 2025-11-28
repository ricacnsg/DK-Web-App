<?php
session_start();
echo "<!-- Logged in as Customer ID: " . ($_SESSION['customer_id'] ?? 'NOT SET') . " -->";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personal Info</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">
    <link rel="stylesheet" href="personal_info.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
</head>
<body>
    <div class="mobile-header">
        <button id="openSidebarBtn" class="header-btn">
            <i class="fa-solid fa-bars" style="font-size:20px;"></i>
        </button>
        <span class="header-title">My Profile</span>
    </div>

    <!-- Sidebar -->
    <div id="sidebar" class="sidebar">
        <div class="sidebar-header">
            <img src="/assets/image/davens_logo.png" width="45">
            <span><b>Daven's<br> Kitchenette</b></span>
        </div>

        <ul class="sidebar-menu">
            <li><a id="link-profile" onclick="showSection('profile')"><i class="fa-solid fa-user"></i> My Profile</a></li>
            <li><a id="link-address" onclick="showSection('address')"><i class="fa-solid fa-location-dot"></i> My Addresses</a></li>
            <li><a id="link-history" onclick="showSection('history')"><i class="fa-solid fa-clock-rotate-left"></i> Order History</a></li>
            <li><a id="exitBtn"><i class="fa-solid fa-angle-left"></i> Exit My Profile</a></li>
            <li><a id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">

        <!-- Profile Section -->
        <section id="section-profile" class="content-section active">
            <div class="d-flex justify-content-center">
                <div class="mobile-card w-100">
                    <h5 class="card-title mb-3 text-center">Personal Information</h5>

                    <label>Username</label>
                    <input type="text" id="username" class="form-control mb-3">

                    <label>Recipient's Name</label>
                    <input type="text" id="name" class="form-control mb-3">

                    <label>Contact Number</label>
                    <input type="text" id="contactno" class="form-control mb-3">

                    <label>Email</label>
                    <input type="email" id="email" class="form-control mb-4 readonly-input" disabled>

                    <button class="btn btn-warning w-100 mb-2">Edit Profile</button>
                    <button class="btn btn-secondary w-100">Change Password</button>
                </div>
            </div>
        </section>

        <!-- Address Section -->
        <section id="section-address" class="content-section">
            <div class="d-flex justify-content-center">
                <div class="mobile-card w-100">
                    <h5 class="card-title text-center mb-3">My Addresses</h5>

                    <label>Address 1</label>
                    <div class="input-group mb-3">
                        <input type="text" id="address1" class="form-control">
                        <button class="btn btn-danger"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <button class="btn btn-warning w-100">Add New Address</button>
                </div>
            </div>
        </section>

        <!-- Order History Section -->
        <section id="section-history" class="content-section">
            <div class="d-flex justify-content-center">
                <div class="mobile-card w-100" >
                    <h5 class="card-title text-center mb-3" >Order History</h5>
                    <div style="overflow-y: scroll; overflow-x: scroll;">
                        <table class="table-borderless table-sm text-center table-striped m-0 w-100" >
                            <thead style="color: white;">
                                <tr>
                                    <th><b>Order Number</b></th>
                                    <th><b>Date Ordered</b></th>
                                    <th><b>Actions</b></th>
                                </tr>
                            </thead>
                            <tbody id="ordersTable"></tbody>
                    </table>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- Receipt Section -->
    <div id="receiptSection" style="display: none;" class="overlay">
        <div class="d-flex justify-content-center">
            <div class="card receipt-card m-5" id="receiptCard">
                <div class="align-self-center p-3">
                    <div class="overall-header mr-3 mb-2">
                        <span class="davens-receipt-header fw-bold" style="line-height:1; display:block; position:relative;">
                            Daven's
                            <img src="/assets/image/davens_logo.png" alt="Daven's Logo" class="davens-receipt-logo">
                        </span>
                        <span class="davens-receipt-header fw-bold" style="line-height:1; display:block;">Kitchenette</span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <p class="contact-header justify-content-center">146 Consuelo St. Brgy 8, <br>
                            Nasugbu, 4231, Batangas <br>
                            0967 622 1293
                        </p>
                    </div>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="d-flex justify-content-between ms-3 me-3">
                    <span id="orderNumber" class="details">Order No:</span>
                    <span id="orderDate" class="details">Date | Time</span>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="ms-3 me-3">
                    <p id="recipient" class="details">Customer Name: </p>
                    <p id="contactNumber" class="details">Contact Number: </p>
                    <p id="emailAddress" class="details">Email Address: </p>
                    <p id="deliveryAddress" class="details">Delivery Address: </p>
                </div>
                <div class="dashed-line opacity-50" style="margin-top: -5px;"></div>
                <div class="ms-3 me-3">
                    <p style="font-size: 12px; line-height: .8;"><b>Order Summary</b></p>
                    <div id="itemsContainer"></div>
                </div>
                <div class="solid-line opacity-50"></div>
                <div class="ms-3 me-3 d-flex justify-content-between">
                    <span class="payment">Subtotal: </span><span id="subtotal" class="details"><b></b></span>
                </div>
                <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                    <span class="payment">Delivery Fee: </span><span id="deliveryFee" class="details"><b></b></span>
                </div>
                <div class="solid-line opacity-50"></div>
                <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                    <span style="font-size: 13px;" class="">TOTAL: </span><span id="total" class="details"><b></b></span>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="ms-3 me-3">
                    <span id="paymentMethod" class="details">Payment Method: </span>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="ms-3 me-3 text-center footer-section py-1">
                    <p class="fw-bold mb-2" style="font-size: .7rem;">Thank you for Ordering!</p>
                    <p class="text-muted mb-0" style="font-size: 0.6rem; line-height: 1;">
                        You can screenshot this receipt. Use<br>
                        your Order Number to track your order anytime.
                    </p>
                    <p class="fw-bold mt-3 mb-0" style="font-size: 0.7rem;">Track your order @</p>
                    <p class="mb-0" style="font-size: 0.7rem;">www.davenskitchenette.ph/track</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Track Order Section -->
    <div id="trackSection" style="display: none;" class="overlay">
        <div class="card trackCard" style="max-width: 500px; margin: 20px auto; padding: 20px; position: relative;">
            <button onclick="closeTrackOrder()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
            
            <h2 style="text-align: center; margin-bottom: 20px; color: #333;">Track Order</h2>
            <h1 style="text-align: center; margin-bottom: 20px; color: red; font-size: 20px;" id="trackStatus"><strong></strong></h1>
            
            <div id="orderInfo" style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Order #:</strong> <span id="trackOrderNo"></span></p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Date:</strong> <span id="trackOrderDate"></span></p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Delivery Rider:</strong> <span id="trackDeliveryRider"></span></p>
            </div>
            
            <div id="statusTracker" style="padding: 0 10px;">
                <!-- Status will be inserted here -->
            </div>
        </div>
    </div>

    <!-- Edit Address Modal -->
    <div class="modal fade edit-modal" id="editAddressModal" tabindex="-1" aria-labelledby="editAddressModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editAddressModalLabel">
                        <i class="fa-solid fa-location-dot me-2"></i>Edit Address
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="editAddressForm">
                        <input type="hidden" id="editLocationID">
                        
                        <div class="mb-3">
                            <label for="editStreet" class="form-label">
                                <i class="fa-solid fa-road me-1"></i>Street Address
                            </label>
                            <input type="text" class="form-control" id="editStreet" required placeholder="e.g., 123 Main Street">
                        </div>
                        
                        <div class="mb-3">
                            <label for="editBarangay" class="form-label">
                                <i class="fa-solid fa-map-pin me-1"></i>Barangay
                            </label>
                            <input type="text" class="form-control" id="editBarangay" required placeholder="e.g., Barangay 1">
                        </div>
                        
                        <div class="mb-3">
                            <label for="editMunicipality" class="form-label">
                                <i class="fa-solid fa-city me-1"></i>Municipality/City
                            </label>
                            <input type="text" class="form-control" id="editMunicipality" required placeholder="e.g., Quezon City">
                        </div>
                        
                        <div class="mb-3">
                            <label for="editRemark" class="form-label">
                                <i class="fa-solid fa-comment me-1"></i>Additional Notes (Optional)
                            </label>
                            <input type="text" class="form-control" id="editRemark" placeholder="e.g., Near 7-Eleven, Red Gate">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fa-solid fa-times me-1"></i>Cancel
                    </button>
                    <button type="button" class="btn" style="background-color: #f2d067;" onclick="saveAddressChanges()">
                        <i class="fa-solid fa-save me-1"></i>Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>


    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/bootstrap5/js/bootstrap.min.js"></script>
    <script src="personal_info.js"></script>

</body>
</html>
