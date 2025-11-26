<?php
session_start();
require_once '../../../database/connect.php';

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
    $checkStmt->close();
    
    if ($orderStatus === 'completed' || $orderStatus === 'rejected' || $orderStatus === 'preparing' || $orderStatus === 'in transit' || $orderStatus === 'ready') {
        echo json_encode([
            'success' => false,
            'message' => 'Order already ' . $orderStatus
        ]);
        exit;
    }
    
    // Update order status to Rejected
    $stmt = $conn->prepare("UPDATE orders SET orderStatus = 'Cancelled' WHERE orderNo = ?");
    $stmt->bind_param("s", $orderNumber);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Order cancelled successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to cancelled order'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update order status'
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>