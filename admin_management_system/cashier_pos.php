<?php
session_start();

if (!isset($_SESSION['staff_username']) || $_SESSION['staff_role'] !== 'cashier') {
  header("Location: login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daven's Kitchenette - POS System</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="cashier_pos.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css" crossorigin="anonymous" />
</head>
<body>
    <div class="container-fluid">
        <div class="container">
            <div class="sidebar rounded">
                <div class="logo">
                <img src="\assets\image\davens_logo.png" alt="Logo" class="logo-image" />
                <div style="color: #ffd700;">
                    <div>Daven's</div>
                    <div>Kitchenette</div>
                </div>
            </div class="mt-5" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); border-radius: 25px;">
                <button class="sidebar-button active rounded" onclick="switchView('menu')">
                    <i class="fas fa-shopping-cart me-1"></i>  Order Menu
                </button>
                <button class="online-order-button rounded me-1" onclick="switchView('onlineOrders')">
                    <i class="fas fa-list"></i>  Online Orders
                </button>
                <button class="sidebar-link rounded me-1" onclick="switchView('history')">
                    <i class="fas fa-history"></i>  History
                </button>
                <button class="logout-btn rounded me-1" id="logoutbtn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>  Logout
                </button>
            </div>

            <!-- Menu View -->
            <div id="menuView" class="menu-content mt-2 mb-2">
                <div class="order-menu-background pt-2">
                    <div class="category-section">
                        <div class="category-carousel ms-3 me-3" id="categoryCarousel">
                            <div class="category-item active" data-category="bento">
                                <img src="/assets/image/bento.webp" alt="BentoSilog" class="category-icon" />
                                <div class="category-name">BentoSilog</div>
                            </div>
                            <div class="category-item" data-category="wings">
                                <img src="/assets/image/Fried Legs.png" alt="Flavoured Wings" class="category-icon" />
                                <div class="category-name">Flavoured Wings w/ Rice</div>
                            </div>
                            <div class="category-item" data-category="rice">
                                <img src="/assets/image/rice.png" alt="Rice Meal" class="category-icon" />
                                <div class="category-name">Rice Meal</div>
                            </div>
                            <div class="category-item" data-category="burger">
                                <img src="/assets/image/Burgers.png" alt="Burger & Sandwiches" class="category-icon" />
                                <div class="category-name">Burger & Sandwiches</div>
                            </div>
                            <div class="category-item" data-category="pulutan">
                                <img src="/assets/image/puluntan.png" alt="Pulutan Express" class="category-icon" />
                                <div class="category-name">Pulutan Express</div>
                            </div>
                            <div class="category-item" data-category="beverages">
                                <img src="/assets/image/beverages.png" alt="Beverages" class="category-icon" />
                                <div class="category-name">Beverages</div>
                            </div>
                        </div>
                    </div>

                    <div class="menu-items-background">
                        <div>
                            <input type="text" class="w-25 form-control" placeholder="Search menu items..." onkeyup="searchMenu()" id="menuSearchInput">
                        </div>
                        <div class="menu-grid" id="menuGrid">
                            <!-- Menu items will be populated here by JavaScript -->
                        </div>
                    </div>
                </div>

                <div class="order-summary">
                    <div class="order-summary-title">Order Summary</div>

                    <div class="form-group">
                        <label class="form-label">Customer Name</label>
                        <input type="text" class="form-input" id="customerName" placeholder="Enter customer name">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Order Type</label>
                        <div class="order-type-options">
                            <button class="order-type-btn active" data-type="dine-in" onclick="selectOrderType(this, 'dine-in')">Dine In</button>
                            <input type="text" class="form-input" placeholder="Table #" id="tableNumberInput">
                            <button class="order-type-btn" data-type="takeout" onclick="selectOrderType(this, 'takeout')">Takeout</button>
                        </div>
                    </div>

                    <div class="items-section">
                        <div class="items-label">Ordered Items</div>
                        <div class="items-list" id="itemsList">
                            <div class="item-row">
                                <span style="color: #999;">No items selected</span>
                            </div>
                        </div>
                        <div class="total-row">
                            <span>Total:</span>
                            <span id="totalPrice">Php 0.00</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Payment Method</label>
                        <div class="payment-methods">
                            <button class="payment-btn cash active" data-method="cash" onclick="selectPayment(this)">💵 Cash</button>
                            <button class="payment-btn gcash" data-method="gcash" onclick="selectPayment(this)">
                                <img src="\assets\image\gcash.png" alt="GCash" class="gcash-logo"> GCash
                            </button>
                        </div>
                    </div>

                    <button class="place-order-btn" onclick="showOrderConfirmation()">PLACE ORDER</button>
                </div>
            </div>

            <!-- Order History View -->
            <div id="historyView" class="order-history justify-content-center">
                <div class="history-background mt-2 mb-2">
                    <div class="history-header">
                        <div class="history-title">Order History</div>
                        <div class="history-controls">
                            <div class="col-md-4 d-flex align-items-center">
                                <span class="mb-0 me-1">Search Order</span>
                                <input type="text" class="form-control w-50" placeholder="Enter Order ID" id="searchOrderId" onkeyup="searchOrders()">
                            </div>
                            
                            <div class="col col-md-3">
                                <div class="filter-group">
                                    <select class="form-select" id="filterType" onchange="updateFilterOptions()">
                                        <option value="month">Filter By Month</option>
                                        <option value="day">Filter By Day</option>
                                        <option value="year">Filter By Year</option>
                                    </select>
                                </div>
                            </div>        
                            
                            <div class="col col-md-3">
                                    <select class="form-select" id="filterValue" onchange="filterOrders()">
                                    </select>
                            </div>
                            
                        </div>
                    </div>

                    <div class="table-wrapper">
                        <table class="order-table table-striped">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Item Order</th>
                                    <th>Total Amount</th>
                                    <th>Payment Method</th>
                                    <th>Order Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="orderTableBody">
                            </tbody>
                        </table>
                    </div>
                    
                            <div class="history-buttons">
                                <button class="history-btn" onclick="exportData()">EXPORT</button>
                                <button class="history-btn" onclick="printData()">PRINT</button>
                            </div>
                </div>
            </div>

            <!-- Online Orders View -->
            <div id="onlineOrdersView" class="online-content hidden mt-3">
                <div class="history-background">
                    <div class="history-header" style="margin-bottom: -30px">
                        <div class="history-title">Online Orders</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 d-flex align-items-center">
                            <label for="searchOnlineOrder" class="mb-0 me-1">Search Order</label>
                            <input type="text" id="searchOnlineOrder" class="form-control w-50" placeholder="Search Order ID">
                        </div>

                        <div class="col-md-3">
                            <select id="onlineFilterType" class="form-select">
                                <option value="day" selected>Filter by Day</option>
                                <option value="month">Filter by Month</option>
                                <option value="year">Filter by Year</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <select id="onlineFilterValue" class="form-select"></select>
                        </div>
                    </div>

                    <div class="table-wrapper" style="margin-bottom: -30px">
                        <div class="scrollable-div">
                            <table class="table table-borderless table-sm text-center table-striped">
                                <thead>
                                    <tr>
                                        <th class="text-muted" scope="col"><b>Order Number</b></th>
                                        <th class="text-muted" scope="col"><b>Date Ordered</b></th>
                                        <th class="text-muted" scope="col"><b>Subtotal</b></th>
                                        <th class="text-muted" scope="col"><b>Payment Status</b></th>
                                        <th class="text-muted" scope="col"><b>Order Status</b></th>
                                        <th class="text-muted" scope="col"><b>Actions</b></th>
                                    </tr>
                                </thead>
                                <tbody id="ordersTable">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Order Confirmation Modal -->
    <div id="orderConfirmationModal" class="custom-modal-overlay">
        <div class="custom-modal">
            <div class="modal-title">Confirm Order</div>
            <div class="modal-message" id="confirmationMessage">Are you sure you want to place this order?</div>
            <div class="modal-buttons">
                <button class="modal-btn modal-confirm" onclick="confirmOrder()">Yes, Place Order</button>
                <button class="modal-btn modal-cancel" onclick="cancelOrder()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Cash Payment Modal -->
    <div id="cashPaymentModal" class="custom-modal-overlay">
        <div class="custom-modal modal-payment">
            <div class="modal-title">Cash Payment</div>
            <div class="modal-message">
                <p>Total Amount: <strong id="cashTotal" style="font-size:24px;color:#0052cc;">Php 0.00</strong></p>
                <div class="form-group" style="margin-top:20px;text-align:left;">
                    <label class="form-label">Amount Received</label>
                    <input type="number" id="cashReceived" class="form-input cash-input" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="quick-amount-buttons">
                    <button class="quick-amount-btn" onclick="setQuickAmount(50)">₱50</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(100)">₱100</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(200)">₱200</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(500)">₱500</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(1000)">₱1000</button>
                    <button class="quick-amount-btn" onclick="setExactAmount()">Exact</button>
                </div>
                <p id="changeAmount" style="margin-top:20px;font-size:20px;font-weight:bold;min-height:30px;"></p>
            </div>
            <div class="d-flex justify-content-between">
                <span>
                    <button class="modal-btn modal-confirm border-0 rounded-pill p-2" onclick="processCashPayment()">Confirm Payment</button>
                </span>
                <span>
                    <button class="modal-btn modal-cancel border-0 rounded-pill p-2" onclick="closeCashModal()">Cancel</button>
                </span>
            </div>
        </div>
    </div>

    <!-- GCash Modal -->
    <div id="gcashModal" class="custom-modal-overlay">
        <div class="custom-modal">
            <div class="modal-title">GCash Payment</div>
            <div class="modal-message">
                <div class="gcash-confirmation">
                    <i class="fas fa-check-circle"></i>
                    <h3>Payment Received</h3>
                    <p>Please confirm that the customer has completed the GCash payment</p>
                </div>
                <div class="payment-details">
                    <div class="payment-detail-row">
                        <span>Total Amount:</span>
                        <strong id="gcashTotal">Php 0.00</strong>
                    </div>
                    <div class="payment-detail-row">
                        <span>Payment Method:</span>
                        <strong>GCash</strong>
                    </div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-confirm" onclick="confirmGCashPayment()">Confirm Payment</button>
                <button class="modal-btn modal-cancel" onclick="closeGCashModal()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Receipt Section -->
    <div id="receiptSection" style="display: none;" class="receiptOverlay">
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

    <!-- Walk In receipt -->
    <div id="walkInReceiptSection" style="display: none;" class="receiptOverlay">
        <div class="d-flex justify-content-center">
            <div class="card receipt-card m-5" id="walkInReceiptCard">
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
                    <span id="walkInOrderNumber" class="details">Order No:</span>
                    <span id="walkInOrderDate" class="details">Date | Time</span>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="ms-3 me-3">
                    <p id="walkInName" class="details">Walk In Name: </p>
                </div>
                <div class="dashed-line opacity-50" style="margin-top: -5px;"></div>
                <div class="ms-3 me-3">
                    <p style="font-size: 12px; line-height: .8;"><b>Order Summary</b></p>
                    <div id="walkInItemsContainer"></div>
                </div>
                <div class="solid-line opacity-50"></div>
                <div class="ms-3 me-3 d-flex justify-content-between">
                    <span class="payment">Subtotal: </span><span id="walkInSubtotal" class="details"><b></b></span>
                </div>
                <div class="solid-line opacity-50"></div>
                <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                    <span style="font-size: 13px;" class="">TOTAL: </span><span id="walkInTotal" class="details"><b></b></span>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="ms-3 me-3">
                    <span id="walkInPaymentMethod" class="details">Payment Method: </span>
                </div>
                <div class="dashed-line opacity-50"></div>
                <div class="ms-3 me-3 text-center footer-section py-1">
                    <p class="fw-bold mb-2" style="font-size: .7rem;">Thank you for your order!</p>
                    <p class="text-muted mb-0" style="font-size: 0.6rem; line-height: 1;">
                        Keep this receipt for your records.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Set Delivery Fee Modal -->
    <div id="setFeeSection" style="display: none;" class="receiptOverlay">
        <div class="card receipt-card m-5 p-3">
            <div class="">
                <div class="d-flex justify-content-between card-header">
                    <span><h5 class="mb-3">Set Delivery Fee</h5></span>
                    <span><button id="closeDelivery" class="btn btn-sm btn-warning"><i class="fa-solid fa-x"></i></button></span>
                </div>
                <p id="deliveryOrderNumber" class="details mt-2">Order No:</p>
                <p id="deliveryAddressText" class="details">Delivery Address: </p>

                <div class="form-group">
                    <label for="deliveryFeeID">Delivery Fee</label>
                    <input type="number" id="deliveryFeeID" name="DeliveryFeeInput" class="form-control rounded-pill" placeholder="Enter amount" step="0.01" min="0">
                    <button id="submitDeliveryFee" class="btn btn-warning border-0 mt-2">
                        <i class="fa-solid fa-paper-plane"></i> Submit
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="cashier_pos.js"></script>
</body>
</html>