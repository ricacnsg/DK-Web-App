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

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        throw new Exception("Invalid JSON data");
    }
    
    $locationID = $data['locationID'] ?? null;
    $street = $data['street'] ?? '';
    $barangay = $data['barangay'] ?? '';
    $municipality = $data['municipality'] ?? '';
    $locationRemark = $data['locationRemark'] ?? '';
    
    if (!$locationID) {
        echo json_encode(['success' => false, 'message' => 'Missing location ID']);
        exit();
    }
    
    if (empty($street) || empty($barangay) || empty($municipality)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }
    
    // Simple ownership check
    $checkSql = "SELECT locationID FROM location WHERE locationID = ? AND customerID = ? LIMIT 1";
    $checkStmt = $conn->prepare($checkSql);
    
    if (!$checkStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $checkStmt->bind_param("ii", $locationID, $customerID);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Address not found or unauthorized']);
        $checkStmt->close();
        $conn->close();
        exit();
    }
    
    $checkStmt->close();
    
    // Update the address
    $updateSql = "UPDATE location 
                  SET street = ?, 
                      barangay = ?, 
                      municipality = ?, 
                      locationRemark = ?
                  WHERE locationID = ? 
                  AND customerID = ?";
    
    $updateStmt = $conn->prepare($updateSql);
    
    if (!$updateStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $updateStmt->bind_param("ssssii", $street, $barangay, $municipality, $locationRemark, $locationID, $customerID);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Execute failed: " . $updateStmt->error);
    }
    
    if ($updateStmt->affected_rows > 0 || $updateStmt->affected_rows === 0) {
        // affected_rows = 0 means no changes (data was the same)
        echo json_encode([
            'success' => true,
            'message' => 'Address updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Address not found'
        ]);
    }
    
    $updateStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Update address error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update address',
        'error' => $e->getMessage()
    ]);
}

exit();
?>