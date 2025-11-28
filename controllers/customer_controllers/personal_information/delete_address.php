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
    // 1. Fetch previous data
    $prevStmt = $conn->prepare("SELECT street, barangay, municipality, locationRemark FROM location WHERE locationID = ? AND customerID = ? LIMIT 1");
    if (!$prevStmt) throw new Exception("Prepare failed: " . $conn->error);
    
    $prevStmt->bind_param("ii", $locationID, $customerID);
    $prevStmt->execute();
    $prevResult = $prevStmt->get_result();
    
    if ($prevResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Address not found or unauthorized']);
        $prevStmt->close();
        $conn->close();
        exit();
    }
    
    $previousRow = $prevResult->fetch_assoc();
    $prevStmt->close();
    
    $previousData = json_encode($previousRow, JSON_UNESCAPED_UNICODE);
    $newData = NULL; // Since this is a deletion

    // 2. Soft delete
    $deleteSql = "UPDATE location 
                  SET locationStatus = 'isRemoved' 
                  WHERE locationID = ? 
                  AND customerID = ?";
    
    $deleteStmt = $conn->prepare($deleteSql);
    if (!$deleteStmt) throw new Exception("Prepare failed: " . $conn->error);
    
    $deleteStmt->bind_param("ii", $locationID, $customerID);
    
    if (!$deleteStmt->execute()) {
        throw new Exception("Execute failed: " . $deleteStmt->error);
    }

    // 3. Log deletion
    $logStmt = $conn->prepare("
        INSERT INTO customerlogs (customerID, action, previousData, newData, timestamp)
        VALUES (?, 'Delete Address', ?, ?, NOW())
    ");
    if ($logStmt) {
        $logStmt->bind_param("iss", $customerID, $previousData, $newData);
        $logStmt->execute();
        $logStmt->close();
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
