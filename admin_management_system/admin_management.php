<?php
session_start();

if (!isset($_SESSION['staff_username']) || $_SESSION['staff_role'] !== 'admin') {
  header("Location: login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daven's Kitchenette - Management System</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="admin_management.css" />
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css" crossorigin="anonymous" />
</head>
<body>
    <div class="container-fluid">
        <div class="sidebar">
            <div class="logo">
                <img src="\assets\image\davens_logo.png" alt="Logo" class="logo-image" />
                <div>
                    <div>Daven's</div>
                    <div>Kitchenette</div>
                </div>
            </div>

            <div class="nav-menu">
                <div class="nav-item active" data-page="dashboard"><i class="fas fa-home"></i> Dashboard</div>
                <div class="nav-item" data-page="menu"><i class="fas fa-utensils"></i> Menu Management</div>
                <div class="nav-item" data-page="inventory"><i class="fas fa-boxes"></i> Inventory Management</div>
                <div class="nav-item" data-page="orders"><i class="fas fa-history"></i> Order History</div>
                <div class="nav-item" data-page="staff"><i class="fas fa-user-friends"></i> Staff Account Management</div>
            </div>

            <button class="logout-btn" id="logoutbtn">LOG OUT</button>
        </div>

        <div class="main-content">
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
            <div id="dashboard" class="page active-page">
                <header class="main-header">
                    <h1>Dashboard</h1>
                </header>

                <div class="toolbar">
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="today">Today</button>
                        <button class="tab-btn" data-tab="weekly">Weekly</button>
                        <button class="tab-btn" data-tab="monthly">Monthly</button>
                    </div>
                    <button class="print-summary-btn">
                        <i class="fa-solid fa-print"></i> Print Summary
                    </button>
                </div>

                <section class="dashboard-cards">
                    <div class="card revenue-card">
                        <div class="card-title-icon-wrapper">
                            <h2>Total Revenue</h2>
                            <i class="fa-solid fa-peso-sign"></i>
                        </div>
                        <div class="card-metric-wrapper">
                            <p class="metric-value">₱25,000</p>
                            <p class="metric-subtext success">
                                <i class="fa-solid fa-arrow-up"></i> +12% vs last month
                            </p>
                        </div>
                    </div>
                    
                    <div class="card today-revenue-card">
                        <div class="card-title-icon-wrapper">
                            <h2>Today's Revenue</h2>
                            <i class="fa-solid fa-chart-line"></i>
                        </div>
                        <div class="card-metric-wrapper">
                            <p class="metric-value">₱3,250</p>
                            <p class="metric-subtext success">
                                <i class="fa-solid fa-arrow-up"></i> +5% vs yesterday
                            </p>
                        </div>
                    </div>

                    <div class="card avg-order-card">
                        <div class="card-title-icon-wrapper">
                            <h2>Avg Order Value</h2>
                            <i class="fa-solid fa-bag-shopping"></i>
                        </div>
                        <div class="card-metric-wrapper">
                            <p class="metric-value">₱185</p>
                            <p class="metric-subtext danger">
                                <i class="fa-solid fa-arrow-down"></i> -2% vs last week
                            </p>
                        </div>
                    </div>

                    <div class="card active-staff-card">
                        <div class="card-title-icon-wrapper">
                            <h2>Active Staff</h2>
                            <i class="fa-solid fa-user-group"></i>
                        </div>
                        <div class="card-metric-wrapper staff-metric-wrapper">
                            <p class="metric-value staff-count">8/10</p>
                            <p class="metric-subtext">
                                <span class="status-available"><i class="fa-solid fa-circle-check"></i> All shifts covered</span>
                            </p>
                        </div>
                    </div>
                    
                    <div class="card chart-section full-width-card">
                        <div class="card-title-icon-wrapper">
                            <h2>Weekly Revenue and Orders</h2>
                        </div>
                        <p class="metric-subtext">Last 7 days performance</p>
                        <div class="chart-placeholder line-chart">
                            </div>
                    </div>

                    <div class="card chart-section top-menu-card full-width-card">
                        <div class="card-title-icon-wrapper">
                            <h2>Top Menu</h2>
                        </div>
                        <p class="metric-subtext">Most ordered this week</p>
                        <div class="chart-placeholder bar-chart">
                            </div>
                    </div>
                </section>
            </div>

            <div id="menu" class="page">
    <div class="header">
        <h1>Manage Your Menu</h1>
    </div>

    <div class="category-section">
        <div class="category-label">Category</div>
        <div class="category-carousel" id="categoryCarousel">
            <button class="carousel-btn prev-btn"><i class="fas fa-chevron-left"></i></button>

            <div class="category-list-wrapper">
                <div class="category-item active" data-category="bento">
                    <div class="category-icon">
                        <img src="/assets/image/bento.webp" alt="BentoSilog" class="icon-image" />
                    </div>
                    <div class="category-name">BentoSilog</div>
                </div>

                <div class="category-item" data-category="wings">
                    <div class="category-icon">
                        <img src="/assets/image/Fried Legs.png" alt="Flavoured Wings" class="icon-image" />
                    </div>
                    <div class="category-name">Flavoured Wings w/ Rice</div>
                </div>

                <div class="category-item" data-category="rice">
                    <div class="category-icon">
                        <img src="/assets/image/rice.png" alt="Rice Meal" class="icon-image" />
                    </div>
                    <div class="category-name">Rice Meal</div>
                </div>
                
                <div class="category-item" data-category="burger">
                    <div class="category-icon">
                        <img src="/assets/image/Burgers.png" alt="Burger & Sandwiches" class="icon-image" />
                    </div>
                    <div class="category-name">Burger & Sandwiches</div>
                </div>

                <div class="category-item" data-category="pulutan">
                    <div class="category-icon">
                        <img src="/assets/image/puluntan.png" alt="Pulutan Express" class="icon-image" />
                    </div>
                    <div class="category-name">Pulutan Express</div>
                </div>

                <div class="category-item" data-category="beverages">
                    <div class="category-icon">
                        <img src="/assets/image/beverages.png" alt="Beverages" class="icon-image" />
                    </div>
                    <div class="category-name">Beverages</div>
                </div>
            </div>

            <button class="carousel-btn next-btn"><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>

    <div class="menu-controls">
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="menuSearchInput" class="search-input" placeholder="Search menu item name or description...">
        </div>
        
        <div class="filter-dropdown">
            <label for="menuSorter">Sort By:</label>
            <select id="menuSorter" class="filter-select">
                <option value="name_asc">Name (Z-A)</option>
                <option value="name_desc">Name (A-Z)</option>
                <option value="price_asc">Price (High to Low)</option>
                <option value="price_desc">Price (Low to High)</option>
            </select>
        </div>
    </div>
    
    <div class="menu-grid category-section" id="menuGrid">
        <div class="menu-card add-item" id="addNewItemCard">
            <i class="fas fa-plus add-icon"></i>
            <div class="add-text">Add BentoSilog Item</div>
        </div>
    </div>
        <div id="addEditModal" class="modal">
        <div class="modal-content">
            <button class="close-btn" onclick="closeModal('addEditModal')"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <h2 id="modalTitle">Add Menu Item</h2>
                <div class="modal-image-placeholder">
                    <img id="itemImagePreview" src="" alt="Menu Item Image" style="display: none;">
                    <i id="imagePlaceholderIcon" class="fas fa-camera"></i>
                    <button class="image-upload-btn" onclick="document.getElementById('imageUpload').click()">
                        <i class="fas fa-upload"></i>
                    </button>
                </div>
                <input type="file" id="imageUpload" class="file-input" accept="image/*">
            </div>
            
            <form id="menuItemForm">
                <div class="form-group">
                    <label for="itemName">Item Name</label>
                    <input type="text" id="itemName" placeholder="e.g., SPAM SILOG" required>
                </div>
                
                <div class="form-group">
                    <label for="itemDescription">Description</label>
                    <textarea id="itemDescription" placeholder="Short description of the dish..."></textarea>
                </div>

                <div class="form-group">
                    <label for="itemPrice">Price (₱)</label>
                    <input type="number" id="itemPrice" placeholder="e.g., 109.00" step="0.01" required>
                </div>

                <div class="form-group">
                    <label for="itemCategory">Category</label>
                    <select id="itemCategory">
                        <option value="bento">BentoSilog</option>
                        <option value="wings">Flavoured Wings w/ Rice</option>
                        <option value="rice">Rice Meal</option>
                        <option value="burger">Burger & Sandwiches</option>
                        <option value="pulutan">Pulutan Express</option>
                        <option value="beverages">Beverages</option>

                    </select>
                </div>
                
                <!-- Add Ingredients -->
                <div class="form-group">
                    <label>Ingredients</label>
                    <div class="ingredients-list" id="ingredientsList"></div>
                    <div class="add-ingredient-wrapper">
                        <input type="text" id="newIngredientInput" placeholder="Enter ingredient name">
                        <!-- onkeydown="if(event.key === 'Enter'){event.preventDefault(); document.getElementById('addIngredientBtn').click();} -->
                        <!-- <button type="button" id="addIngredientBtn" class="add-ingredient-btn"><i class="fas fa-plus"></i> Add</button> -->

                        <div class='table-ingredients'>
                            <table class='table select-ingredient-table' id='selectIngredientsTable'>
                                <thead>
                                    <tr>
                                        <th>Ingredient Name</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- dynamic data here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn-submit">SAVE</button>
                    <button type="button" class="btn-cancel" onclick="closeModal('addEditModal')">CANCEL</button>
                </div>
            </form>
        </div>
    </div>

    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Delete Item</h2>
                <i class="fas fa-exclamation-triangle delete-icon" style="color: #f0ad4e; font-size: 48px;"></i>
            </div>
            <p style="text-align: center; font-size: 16px; margin-bottom: 30px;">Do you really want to delete **<span id="deleteItemName"></span>**?</p>
            <div class="modal-actions">
                <button id="deleteConfirmBtn" class="btn-remove">DELETE</button>
                <button type="button" class="btn-cancel" onclick="closeModal('deleteModal')">CANCEL</button>
            </div>
        </div>
    </div>
    
    <div id="notification" class="notification">
        Item successfully saved!
    </div>

</div>
<div id="inventory" class="page">
    <div class="container">
        <div class="header"><h1>Manage your Inventory</h1></div>
        
        <div class="button-container">
            <button class="add-btn">
                <i class="fas fa-plus"></i>
                ADD NEW ITEM
            </button>

            <div class='search-container'>
                <input type="text" placeholder='Search Item' id='searchItem' class='form-control rounded-pill searchItem'>
            </div>

            <div class="filter-container">
                <select class="filter-select" id="categoryFilter">
                    <option value="">All Item</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Meat">Meat</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Bread">Bread</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Condiments">Condiments</option>
                    <option value="Utensils">Utensils</option>
                </select>
            </div>
        </div>

        <div class="table-wrapper">
            <table class='table inventory-table' id="inventoryTable">
                <thead class="table-header">
                    <tr>
                        <th>Item Name</th>
                        <th>Stocks</th>
                        <th>Reorder Level</th>
                        <th>Category</th>
                        <th>Unit Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>


    <!-- Add New Item Modal -->
    <div id="itemModal" class="modal">
        <div class="modal-content">
            <h2 class="modal-header" id="modalTitle">Add Item</h2>
            <form id="itemForm">
                <div class="form-group">
                    <label for='itemname'>Item Name</label>
                    <input type="text" id="itemname" placeholder="Enter item name" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for='itemStocks'>Stocks</label>
                        <input type="number" id="itemStocks" placeholder="How many stocks?" required>
                    </div>
                    <div class="form-group">
                        <label for="itemMeasurement">Unit of Measurement</label>
                         <select class="filter-select" id="itemMeasurement">
                            <option value="">kg, slice, liter, etc.</option>
                            <option value="kilograms">Kilograms</option>
                            <option value="grams">Grams</option>
                            <option value="mg">Milligrams</option>
                            <option value="oz">Ounces</option>
                            <option value="lb">Pounds</option>
                            <option value="ml">Milliliters</option>
                            <option value="liters">Liters</option>
                            <option value="tsp">Teaspoon</option>
                            <option value="tbsp">Tablespoon</option>
                            <option value="cup">Cups</option>
                            <option value="slice">Slices</option>
                            <option value="pieces">Pieces</option>
                            <option value="packs">Packs</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for='itemReorder'>Reorder Level</label>
                    <input type="number" id="itemReorder" placeholder="Enter reorder level" required>
                </div>
                <div class="form-group">
                    <label for='itemCost'>Unit Cost</label>
                    <input type="number" id="itemCost" step="0.01" placeholder="What is the unit cost?" required>
                </div>
                <div class="form-group">
                    <label for='itemcategory'>Category</label>
                    <select id="itemcategory" required>
                        <option value="">Select Category</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Meat">Meat</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Bread">Bread</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Poultry">Poultry</option>
                        <option value="Condiments">Condiments</option>
                        <option value="Utensils">Utensils</option>
                    </select>
                </div>
                <div class="modal-buttons">
                    <button type="submit" id="addItemBtn" class="modal-btn save-btn">ADD</button>
                </div>
            </form>
        </div>
    </div>
        <!-- Edit Ingredients Item -->
        <div class='modal' id='editItemModal'>
            <div class='modal-content'>
                <h2 class='editItem-modal-header'>Edit Item</h2>

                <form class="editItem-form" id='editItemForm'>  
                    <div class='form-group'>
                        <label for="editMeasurement">Unit of Measurement</label>
                        <select id="editMeasurement" class='form-control'>
                            <option value="kilograms">Kilograms</option>
                            <option value="grams">Grams</option>
                            <option value="ml">Millimeter</option>
                            <option value="liters">Liters</option>
                            <option value="pieces">Pieces</option>
                            <option value="packs">Packs</option>
                        </select>

                        <label for="editUnitPrice">Unit Price</label>
                        <input class='form-control' type="number" id="editUnitPrice" min="0" placeholder="Enter unit price">

                        <label for="editQuantity">Quantity</label>
                        <input class='form-control' type="number" id="editQuantity" min="0" placeholder="Enter quantity">

                        <label for="editReorder">Reorder Level </label>
                        <input class='form-control' type="number" id="editReorder" min="0" placeholder="Enter reorder level">

                        <div class="modal-buttons">
                            <button type="button" class="btn cancelEditItem-btn">Cancel</button>
                            <button type="submit" class="btn saveEditItem-btn">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div id="deleteItemModal" class="modal">
            <div class="modal-content">
                <h2 class="delete-modal-header">Delete Item</h2>
                <!-- <div class="warning-icon">
                    <div class="warning-triangle"></div>
                </div> -->
                <p class="delete-message text-center">Do you really want to delete this item?</p>
                <div class="modal-buttons">
                    <button class="btn delete-confirm-btn">DELETE</button>
                    <button class="btn delete-cancel-btn">CANCEL</button>
                </div>
            </div>
        </div>
    </div>
</div>

    <div id="orders" class="page">
        <div class="header">
            <h1>Order History</h1>
            <div class="history-buttons">
                <button class="history-btn" onclick="exportData()">EXPORT</button>
                <button class="history-btn" onclick="printData()">PRINT</button>
            </div>
        </div>

            <div id="historyView" class="order-history justify-content-center">
                <div class="history-background mt-2 mb-2">
                    <div class="history-header">
                        <div class="history-controls">
                            <span class="search-label">Search Order</span>
                            <input type="text" class="history-search" placeholder="Enter Order ID" id="searchOrderId" onkeyup="searchOrders()">
                            
                            <div class="filter-group">
                                <select class="filter-select" id="filterType" onchange='updateFilterOptions()'>
                                    <option value="">Filter By</option>
                                    <option value="month">Filter By Month</option>
                                    <option value="day">Filter By Day</option>
                                    <option value="year">Filter By Year</option>
                                </select>
                                
                                <select class="filter-select" id="filterValue" >
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="table-wrapper">
                        <table class="order-table">
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

    <div id="staff" class="page">
        <div class="staff-management-container">
            <div class="header">
                <h1>Staff Account Management</h1>
            </div>

            <div class="content-wrapper">
                <div class="staff-list">
                    <div class="search-filter">
                        <input type="text" id='searchInput' placeholder="Search Staff" class="search-input" />
                        <select class="filter-select" id='filterStaff'>
                            <option value=''>All Staff</option>
                            <option value='admin'>Admin</option>
                            <option value='cashier'>Cashier</option>
                            <option value='kitchen staff'>Kitchen Staff</option>
                            <option value='delivery rider'>Delivery Rider</option>
                        </select>
                    </div>
                    <div class='stafftable-wrapper'>
                        <table class="staff-table" id="staffTable">
                            <thead>
                                <tr>
                                    <th>Fullname</th>
                                    <th>Role</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Staff Edit Modal -->
                <div class="modal" id="editaccModal">
                    <div class="modal-content">
                        <h2>Edit Account</h2>
                        <form id="editForm">
                            <label for="editFullname">Fullname</label>
                            <input type="text" id="editFullname" required>
                            <label for="editContact">Contact Number</label>
                            <input type="text" id="editContact" required>
                            <label for="editUsername">Username</label>
                            <input type="text" id="editUsername" required>

                            <label for="editRole">Role</label>
                            <select class='form-select' id="editRole" name="role">
                                <option value="admin">Admin</option>
                                <option value="kitchen staff">Kitchen Staff</option>
                                <option value="cashier">Cashier</option>
                                <option value="delivery rider">Delivery Rider</option>
                            </select>
                            
                            <label for="editPassword">Change Password</label>
                            <input type="password" id="editPassword">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword">

                            <div class="modal-buttons">
                                <button type="button" class="btn cancelbtn">Cancel</button>
                                <button type="submit" class="btn savebtn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Staff Delete Modal -->
                 <div class="modal" id="deleteaccModal">
                    <div class="modal-content">
                        <h3 class='text-center'>Are you sure?</h3>
                        <br>
                        <p class='text-center'>This action cannot be undone.</p>
                        <div class="modal-buttons">
                            <button type='button' class="btn canceldelete-btn" id="cancelDelete">Cancel</button>
                            <button type='submit' class="btn confirm-btn" id="confirmDelete">Yes, Delete</button>
                        </div>
                    </div>
                </div>

                <!-- Add staff account -->
                <div class="add-staff-form">
                    <h2>Add Staff Account</h2>
                    <form id="addStaffForm" method="POST" action="../controllers/staff.php">
                        <label for="fullname">Full Name</label>
                        <input type="text" placeholder="Enter full name" id="fullname" required/>

                        <label for="contactno">Contact Number</label>
                        <input type="text" placeholder="Enter contact number" id="contactno" required/>

                        <label for="role">Role</label>
                        <select id="role" name="role">
                            <option value=""disabled selected >Select Staff Role</option>
                            <option value="admin">Admin</option>
                            <option value="kitchen staff">Kitchen Staff</option>
                            <option value="cashier">Cashier</option>
                            <option value="delivery rider">Delivery Rider</option>
                        </select>

                        <label for="username">Username</label>
                        <input type="text" placeholder="Enter username" id="username"required/>

                        <div class="mb-4 position-relative">
                            <label for="password">Password</label>
                            <input type="password" placeholder="Enter password" id="password" required/>
                            <button type="button" class="position-absolute togglePassword" id="togglePassword">
                                    <i class="fa-solid fa-eye-slash" id='hide'></i>
                            </button>
                        </div>
                                <p id='validationMessage' class='text-center' style='color: red; margin-top: -15px;'></p>
                                <button type="submit" class="save-btn" id="createaccbtn">Create Account</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="admin_management.js"></script>
    <script src="/bootstrap5/js/bootstrap.min.js"></script>
</body>
</html>
