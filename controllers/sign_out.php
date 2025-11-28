<?php
session_start();

// Include database connection FIRST
require_once '../database/connect.php';

// Log the sign out action
if (isset($_SESSION['customer_id'])) {
    $userID = $_SESSION['customer_id'];
    
    $logStmt = $conn->prepare("INSERT INTO customerlogs (customerID, action, timestamp) VALUES (?, 'Sign Out', NOW())");
    if ($logStmt) {
        $logStmt->bind_param('i', $userID);
        $logStmt->execute();
        if ($logStmt->error) {
            error_log("Failed to log sign out: " . $logStmt->error);
        }
        $logStmt->close();
    } else {
        error_log("Failed to prepare log statement: " . $conn->error);
    }
}

// Close database connection
if (isset($conn)) {
    $conn->close();
}

// Clear all session variables
$_SESSION = array();

// Delete the session cookie
if (isset($_COOKIE[session_name()])) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
    
    // Fallback cookie deletion
    setcookie(session_name(), '', time() - 42000, '/');
}

// Destroy the session
session_destroy();

// Redirect with cache prevention headers
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header("Location: /landing_page/landing.php");
exit;
?>