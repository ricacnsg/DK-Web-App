<?php
session_start();

if (!isset($_SESSION['staff_username']) || $_SESSION['staff_role'] !== 'delivery rider') {
  header("Location: ../admin_management_system/login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daven's Kitchenette - Food Delivery Tracker</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="delivery_tracker.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
</head>
<body>
    <!-- Header Navigation -->
    <header class="navbar-custom">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center py-3 px-3">
                <div class="d-flex align-items-center">
                    <img src="/assets/image/davens_logo.png" alt="Daven's Kitchenette Logo" width="55" height="55" class="me-3">
                    <div>
                        <h1 class="brand-title mb-0 text-white">Daven's Kitchenette</h1>               
                        <p class="brand-subtitle mb-0 text-warning">Food Delivery Tracker</p>
                    </div>
                </div>

                <button class="btn-logout">
                    <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
                        <circle cx="15" cy="15" r="15" fill="#F4D03F"/>
                        <circle cx="15" cy="12" r="4" fill="#1e3a8a"/>
                        <path d="M8 24C8 20 11 17 15 17C19 17 22 20 22 24" stroke="#1e3a8a" stroke-width="2"/>
                    </svg>
                    <span class="ms-2">Logout</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container-fluid py-4">
        <div class="row g-4">
            <!-- Left Column - Current Order -->
            <div class="col-lg-5 col-xl-4">
                <div class="current-order-card">
                    <h2 class="card-title mb-3">Current Order</h2>
                    
                    <div class="order-header-section">
                        <div class="order-info-left">
                            <!-- DYNAMIC: Current order ID -->
                            <h3 class="order-id" id="currentOrderId">Order #12345</h3>
                            
                            <!-- DYNAMIC: Customer name -->
                            <p class="customer-name" id="customerName">John Doe</p>
                            
                            <!-- DYNAMIC: Delivery address -->
                            <p class="delivery-address" id="deliveryAddress">123 Main St.</p>
                        </div>

                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex gap-3 mt-3 mb-3">
                        <!-- DYNAMIC: Mark order as completed -->
                        <button class="btn btn-completed" id="btnCompleted">Completed</button>
                        
                        <!-- DYNAMIC: Mark order for return -->
                        <button class="btn btn-return" id="btnReturn">Return</button>
                        <button id="transitBtn" class="btn btn-transit">In Transit</button>
                    </div>

                    <!-- Divider Line -->
                    <div class="divider-line"></div>

                    <!-- Order Summary Section -->
                    <div class="order-summary">
                        <h3 class="summary-title">Order Summary</h3>
                        <div class="summary-content" id="orderSummary">
                            <!-- DYNAMIC: Load order items here -->
                            <!-- Example structure:
                            <div class="order-item">
                                <span class="item-name">Item Name x2</span>
                                <span class="item-price">₱250.00</span>
                            </div>
                            -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Delivery Order List -->
            <div class="col-lg-7 col-xl-8">
                <div class="delivery-list-card">
                    <h2 class="card-title mb-4">Delivery Order List</h2>
                    
                    <div class="orders-container" id="ordersList">
                        <!-- DYNAMIC: Load all orders here -->
                        <!-- Example structure for each order:
                        <div class="order-item-row">
                            <div class="order-info">
                                <span class="order-number">Order #1234</span>
                                <span class="order-location">123 Main St.</span>
                            </div>
                            <span class="badge badge-not-complete">Not Complete</span>
                            OR
                            <span class="badge badge-completed">Completed</span>
                            OR
                            <span class="badge badge-return">Return</span>
                        </div>
                        -->
                    </div>
                </div>
            </div>
        </div>
    </main>
    <script src="/bootstrap5/js/bootstrap.min.js"></script>
    <script src="delivery_tracker.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</body>
</html>