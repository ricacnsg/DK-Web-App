<?php
// Save this as: controllers/test_connection.php
// Access it at: http://localhost:3000/controllers/test_connection.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h2>Testing Database Connection</h2>";

// Test 1: Check if database file exists
echo "<h3>Test 1: Database File Check</h3>";
$dbPath = '../database/connect.php';
if (file_exists($dbPath)) {
    echo "✓ Database file exists at: " . realpath($dbPath) . "<br>";
} else {
    echo "✗ Database file NOT found at: $dbPath<br>";
    echo "Current directory: " . __DIR__ . "<br>";
    die("Please fix the database path!");
}

// Test 2: Include database file
echo "<h3>Test 2: Include Database File</h3>";
try {
    require_once $dbPath;
    echo "✓ Database file included successfully<br>";
} catch (Exception $e) {
    echo "✗ Error including database: " . $e->getMessage() . "<br>";
    die();
}

// Test 3: Check connection
echo "<h3>Test 3: Database Connection</h3>";
if (isset($conn)) {
    echo "✓ Database connection variable exists<br>";
    
    if ($conn instanceof mysqli) {
        echo "✓ Connection is a valid mysqli object<br>";
        
        if ($conn->connect_error) {
            echo "✗ Connection error: " . $conn->connect_error . "<br>";
        } else {
            echo "✓ Connection successful!<br>";
            echo "Database: " . $conn->get_server_info() . "<br>";
        }
    } else {
        echo "✗ Connection is not a mysqli object<br>";
    }
} else {
    echo "✗ Database connection variable NOT set<br>";
    die("Database connection failed!");
}

// Test 4: Check tables
echo "<h3>Test 4: Check Tables</h3>";
$tables = ['orders', 'payment', 'itemsordered', 'menuitem'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result && $result->num_rows > 0) {
        echo "✓ Table '$table' exists<br>";
    } else {
        echo "✗ Table '$table' NOT found<br>";
    }
}

// Test 5: Check orders table structure
echo "<h3>Test 5: Orders Table Structure</h3>";
$result = $conn->query("DESCRIBE orders");
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Field</th><th>Type</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "✗ Could not describe orders table: " . $conn->error . "<br>";
}

// Test 6: Check for active orders
echo "<h3>Test 6: Check Active Orders</h3>";
$result = $conn->query("SELECT COUNT(*) as count FROM orders WHERE orderStatus IN ('pending', 'preparing', 'ready')");
if ($result) {
    $row = $result->fetch_assoc();
    echo "Found {$row['count']} active orders<br>";
} else {
    echo "✗ Error querying orders: " . $conn->error . "<br>";
}

echo "<hr>";
echo "<h3>✓ All tests completed!</h3>";
echo "<p>If all tests passed, the issue might be with session or headers in kitchen_staff.php</p>";
?>