<?php
// Prevent any output before JSON
ob_start();

session_start();

// Fix the path - adjust this based on your folder structure
// If delivery_update_status.php is in: controllers/delivery_controllers/
// And connect.php is in: database/
// Then use this path:
require_once '../../database/connect.php';

// Clear any previous output
ob_clean();

// Set JSON header
header('Content-Type: application/json');

// Disable error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    // Get POST data
    $input = file_get_contents('php://input');
    
    // Log the raw input for debugging
    error_log('Received input: ' . $input);
    
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }
    
    $orderNumber = $data['order_number'] ?? null;
    $newStatus = $data['status'] ?? null;
    
    // Log what we received
    error_log("Order Number: $orderNumber, Status: $newStatus");
    
    // Validate input
    if (!$orderNumber || !$newStatus) {
        echo json_encode([
            'success' => false,
            'message' => 'Order number and status are required'
        ]);
        exit;
    }
    
    // Validate status
    $allowedStatuses = ['Completed', 'Returned', 'Cancelled'];
    if (!in_array($newStatus, $allowedStatuses)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid status provided. Allowed: ' . implode(', ', $allowedStatuses)
        ]);
        exit;
    }
    
    // Check if connection exists
    if (!isset($conn) || !$conn) {
        throw new Exception('Database connection failed');
    }
    
    // First, check if the order exists and is in Ready status
    $checkSql = "SELECT orderNo, orderStatus FROM orders WHERE orderNo = ?";
    $checkStmt = $conn->prepare($checkSql);
    
    if (!$checkStmt) {
        throw new Exception('Failed to prepare check statement: ' . $conn->error);
    }
    
    $checkStmt->bind_param("s", $orderNumber);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => "Order #$orderNumber not found in database"
        ]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    
    $orderData = $checkResult->fetch_assoc();
    error_log("Order found with status: " . $orderData['orderStatus']);
    
    if ($orderData['orderStatus'] !== 'Ready') {
        echo json_encode([
            'success' => false,
            'message' => "Order #$orderNumber is not in Ready status (current status: {$orderData['orderStatus']})"
        ]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    
    $checkStmt->close();
    
    // Update order status
    $sql = "UPDATE orders 
            SET orderStatus = ?
            WHERE orderNo = ? 
            AND orderStatus = 'Ready'";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Failed to prepare update statement: ' . $conn->error);
    }
    
    $stmt->bind_param("ss", $newStatus, $orderNumber);
    
    if ($stmt->execute()) {
        $affectedRows = $stmt->affected_rows;
        error_log("Affected rows: $affectedRows");
        
        if ($affectedRows > 0) {
            echo json_encode([
                'success' => true,
                'message' => "Order #$orderNumber status updated to $newStatus",
                'order_number' => $orderNumber,
                'new_status' => $newStatus
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Order not updated. It may have already been processed.'
            ]);
        }
    } else {
        throw new Exception('Failed to execute update: ' . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    // Log error to PHP error log
    error_log('Delivery update error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}

// Flush output
ob_end_flush();
?>