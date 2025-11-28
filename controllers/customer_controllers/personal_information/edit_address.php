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
    $street = trim($data['street'] ?? '');
    $barangay = trim($data['barangay'] ?? '');
    $municipality = trim($data['municipality'] ?? '');
    $locationRemark = trim($data['locationRemark'] ?? '');
    
    if (!$locationID) {
        echo json_encode(['success' => false, 'message' => 'Missing location ID']);
        exit();
    }
    
    if (empty($street) || empty($barangay) || empty($municipality)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }

    // --- Fetch previous data ---
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

    // --- Update the address ---
    $updateSql = "UPDATE location 
                  SET street = ?, 
                      barangay = ?, 
                      municipality = ?, 
                      locationRemark = ?
                  WHERE locationID = ? 
                  AND customerID = ?";
    
    $updateStmt = $conn->prepare($updateSql);
    if (!$updateStmt) throw new Exception("Prepare failed: " . $conn->error);
    
    $updateStmt->bind_param("ssssii", $street, $barangay, $municipality, $locationRemark, $locationID, $customerID);
    $updateStmt->execute();
    $updateStmt->close();

    // --- New data for logging ---
    $newData = json_encode([
        'street' => $street,
        'barangay' => $barangay,
        'municipality' => $municipality,
        'locationRemark' => $locationRemark
    ], JSON_UNESCAPED_UNICODE);

    // --- Insert log ---
    $logStmt = $conn->prepare("INSERT INTO customerlogs (customerID, action, previousData, newData, timestamp) VALUES (?, 'Update Address', ?, ?, NOW())");
    if ($logStmt) {
        $logStmt->bind_param("iss", $customerID, $previousData, $newData);
        $logStmt->execute();
        $logStmt->close();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Address updated successfully'
    ]);

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
