<?php
session_start();

if (!isset($_SESSION['staff_username']) || $_SESSION['staff_role'] !== 'kitchen staff') {
  header("Location: ../login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daven's Kitchenette</title>
    <link rel="stylesheet" href="kitchen_staff.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="/assets/image/davens_logo.png" alt="Daven's Kitchenette" class="chef-icon">
            <span>Daven's Kitchenette</span>
        </div>
        <div class="stats">
            <div class="stat total">
                <span class="stat-number" id="totalOrders">0</span>
                <span class="stat-label">Total Orders</span>
            </div>
            <div class="stat presenting">
                <span class="stat-number" id="preparingOrders">0</span>
                <span class="stat-label">Preparing</span>
            </div>
            <div class="stat ready">
                <span class="stat-number" id="readyOrders">0</span>
                <span class="stat-label">Ready</span>
            </div>
            <div class="d-flex align-items-center">
                <span style="color: white;" id="logoutBtn">Log Out</span>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="title-bar">
            <h1 class="title">Active Orders</h1>
            <div class="filters">
                <button class="filter-btn active-all">All Orders</button>
                <button class="filter-btn">Reviewed</button>
                <button class="filter-btn">Preparing</button>
                <button class="filter-btn">Ready</button>
            </div>
        </div>

        <div class="orders-grid" id="ordersContainer">
            <div class="loading">Loading orders...</div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="kitchen_staff.js"></script>
</body>
</html>