<?php
session_start();
require_once '../database/connect.php';

header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['order_number'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing order number'
    ]);
    exit;
}

$orderNumber = $data['order_number'];

try {
    // First check if order exists and get current status
    $checkStmt = $conn->prepare("SELECT orderStatus FROM orders WHERE orderNo = ?");
    $checkStmt->bind_param("s", $orderNumber);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found'
        ]);
        exit;
    }
    
    $row = $result->fetch_assoc();
    $orderStatus = strtolower($row['orderStatus']);
    $previousStatus = $row['orderStatus'];
    $checkStmt->close();
    
    // Check if order can be rejected
    if ($orderStatus === 'completed' || $orderStatus === 'rejected') {
        echo json_encode([
            'success' => false,
            'message' => 'Order already ' . $orderStatus
        ]);
        exit;
    }
    
    // Update order status to Rejected
    $stmt = $conn->prepare("UPDATE orders SET orderStatus = 'Rejected' WHERE orderNo = ?");
    $stmt->bind_param("s", $orderNumber);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Order rejected successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to reject order'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update order status'
        ]);
    }
    
    $stmt->close();

    $newStatus = 'Rejected';
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
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>