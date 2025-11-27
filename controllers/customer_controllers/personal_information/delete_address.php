<?php
session_start();
require_once '../../../database/connect.php';

header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$locationID = $_GET['id'] ?? null;

if (!$locationID) {
    echo json_encode(['success' => false, 'message' => 'No address ID provided']);
    exit();
}

try {
    // Simple ownership verification
    $checkSql = "SELECT locationID FROM location WHERE locationID = ? AND customerID = ? LIMIT 1";
    $checkStmt = $conn->prepare($checkSql);
    
    if (!$checkStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $checkStmt->bind_param("ii", $locationID, $customerID);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Address not found or unauthorized'
        ]);
        $checkStmt->close();
        $conn->close();
        exit();
    }
    
    $checkStmt->close();
    
    // Soft delete
    $deleteSql = "UPDATE location 
                  SET locationStatus = 'isRemoved' 
                  WHERE locationID = ? 
                  AND customerID = ?";
    
    $deleteStmt = $conn->prepare($deleteSql);
    
    if (!$deleteStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $deleteStmt->bind_param("ii", $locationID, $customerID);
    
    if (!$deleteStmt->execute()) {
        throw new Exception("Execute failed: " . $deleteStmt->error);
    }
    
    if ($deleteStmt->affected_rows > 0) {
        echo json_encode([
            'success' => true, 
            'message' => 'Address deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Address not found or already deleted'
        ]);
    }
    
    $deleteStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Delete address error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete address',
        'error' => $e->getMessage()
    ]);
}

exit();
?>