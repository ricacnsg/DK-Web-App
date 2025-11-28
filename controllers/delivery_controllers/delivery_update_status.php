<?php
ob_start();
session_start();

require_once '../../database/connect.php';

ob_clean();
header('Content-Type: application/json');

ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    $input = file_get_contents('php://input');
    error_log('Received input: ' . $input);

    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }

    $orderNumber = $data['order_number'] ?? null;
    $newStatus   = $data['status'] ?? null;

    // Rider / staff ID
    $riderID = $_SESSION['rider_id'] ?? $_SESSION['staff_id'] ?? null;

    if (!$orderNumber || !$newStatus) {
        echo json_encode([
            'success' => false,
            'message' => 'Order number and status are required'
        ]);
        exit;
    }

    if (!$riderID) {
        echo json_encode([
            'success' => false,
            'message' => 'Rider ID missing from session'
        ]);
        exit;
    }

    $allowedStatuses = ['In Transit', 'Completed', 'Returned', 'Cancelled'];
    if (!in_array($newStatus, $allowedStatuses)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid status provided.'
        ]);
        exit;
    }

    if (!isset($conn) || !$conn) {
        throw new Exception('Database connection failed');
    }

    // Fetch current status
    $checkSql = "SELECT orderNo, orderStatus FROM orders WHERE orderNo = ?";
    $checkStmt = $conn->prepare($checkSql);
    if (!$checkStmt) {
        throw new Exception('Failed to prepare check statement: ' . $conn->error);
    }

    $checkStmt->bind_param("s", $orderNumber);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => "Order #$orderNumber not found"
        ]);
        exit;
    }

    $order = $result->fetch_assoc();
    $previousStatus = $order['orderStatus'];

    error_log("Current status of #$orderNumber: $previousStatus");

    // ⚠️ FIXED: Allowed transitions
    $validTransitions = [
        'Ready'      => ['In Transit'],
        'Assigned'   => ['In Transit'],           // ← ADDED THIS
        'In Transit' => ['Completed', 'Returned']
    ];

    if (!isset($validTransitions[$previousStatus]) ||
        !in_array($newStatus, $validTransitions[$previousStatus])) 
    {
        echo json_encode([
            'success' => false,
            'message' => "Cannot update order #$orderNumber from '$previousStatus' to '$newStatus'"
        ]);
        exit;
    }

    // Update the order status
    $updateSql = "UPDATE orders SET orderStatus = ? WHERE orderNo = ?";
    $updateStmt = $conn->prepare($updateSql);

    if (!$updateStmt) {
        throw new Exception('Failed to prepare update: ' . $conn->error);
    }

    $updateStmt->bind_param("ss", $newStatus, $orderNumber);
    $updateStmt->execute();

    if ($updateStmt->affected_rows > 0) {

        // Insert into update_status_logs
        $logSql = "INSERT INTO updatestatuslogs 
                (orderNo, previousStatus, newStatus, updatedBy, updatedAt)
                VALUES (?, ?, ?, ?, NOW())";

        $logStmt = $conn->prepare($logSql);

        if (!$logStmt) {
            throw new Exception('Failed to prepare log statement: ' . $conn->error);
        }

        $logStmt->bind_param("ssss",
            $orderNumber,
            $previousStatus,
            $newStatus,
            $riderID
        );

        $logStmt->execute();

        if ($logStmt->error) {
            error_log("Log Insert Error: " . $logStmt->error);
        }

        // ✅ SEND SUCCESS RESPONSE
        echo json_encode([
            'success' => true,
            'message' => "Order #$orderNumber updated to $newStatus",
            'previous_status' => $previousStatus,
            'new_status' => $newStatus
        ]);

    } else {
        echo json_encode([
            'success' => false,
            'message' => "Order not updated. Possibly same status."
        ]);
    }

} catch (Exception $e) {
    error_log('Delivery update error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

ob_end_flush(); // ← This should stay at the end
?>