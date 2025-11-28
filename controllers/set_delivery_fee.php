<?php
session_start();
require_once '../database/connect.php';

header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['order_number']) || !isset($data['delivery_fee'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit;
}

$orderNumber = $data['order_number'];
$deliveryFee = floatval($data['delivery_fee']);

if ($deliveryFee < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Delivery fee cannot be negative'
    ]);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Get the current status before updating
    $checkStmt = $conn->prepare("SELECT orderStatus FROM orders WHERE orderNo = ?");
    $checkStmt->bind_param("s", $orderNumber);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Order not found'
        ]);
        exit;
    }
    
    $row = $result->fetch_assoc();
    $previousStatus = $row['orderStatus'];
    $checkStmt->close();
    
    // Update the delivery fee and order status
    $stmt = $conn->prepare("UPDATE orders SET deliveryFee = ?, orderStatus = 'Reviewed' WHERE orderNo = ?");
    $stmt->bind_param("ds", $deliveryFee, $orderNumber);
    
    if (!$stmt->execute()) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update delivery fee'
        ]);
        exit;
    }
    
    $stmt->close();
    
    // Insert into updatestatuslogs table
    $newStatus = 'Reviewed';
    $staffID = $_SESSION['staff_id'] ?? null; // Get staffID from session
    
    if (!$staffID) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Staff ID not found in session. Please login again.'
        ]);
        exit;
    }
    
    $logStmt = $conn->prepare("INSERT INTO updatestatuslogs (orderNo, previousStatus, newStatus, updatedBy, updatedAt) VALUES (?, ?, ?, ?, NOW())");
    $logStmt->bind_param("sssi", $orderNumber, $previousStatus, $newStatus, $staffID);
    
    if (!$logStmt->execute()) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to log status change'
        ]);
        exit;
    }
    
    $logStmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Delivery fee updated and status logged successfully'
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>