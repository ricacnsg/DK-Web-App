<?php
session_start();
require_once '../../../database/connect.php';

header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

$locationID = $_GET['id'] ?? null;

if (!$locationID) {
    echo json_encode(['error' => 'No address ID provided']);
    exit();
}

try {
    // Super simple now - just check customerID directly!
    $sql = "SELECT 
            locationID,
            street,
            barangay,
            municipality,
            locationRemark
        FROM location
        WHERE locationID = ? 
        AND customerID = ?
        AND (locationStatus IS NULL OR locationStatus != 'isRemoved')
        LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("ii", $locationID, $customerID);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['error' => 'Address not found or unauthorized']);
        $stmt->close();
        $conn->close();
        exit();
    }
    
    $address = $result->fetch_assoc();
    
    echo json_encode($address);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Get address error: " . $e->getMessage());
    echo json_encode([
        'error' => 'Failed to load address',
        'message' => $e->getMessage()
    ]);
}

exit();
?>