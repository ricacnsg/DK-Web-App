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

try {
    // Query to get only saved addresses
    $sql = "SELECT 
            locationID,
            street,
            barangay,
            municipality,
            locationRemark,
            CONCAT(
                COALESCE(street, ''),
                CASE WHEN street IS NOT NULL AND street != '' THEN ', ' ELSE '' END,
                COALESCE(barangay, ''),
                CASE WHEN barangay IS NOT NULL AND barangay != '' THEN ', ' ELSE '' END,
                COALESCE(municipality, ''),
                CASE 
                    WHEN locationRemark IS NOT NULL AND locationRemark != ''
                    THEN CONCAT(' (', locationRemark, ')')
                    ELSE ''
                END
            ) AS full_address
        FROM location
        WHERE customerID = ?
        AND locationStatus = 'isSaved'
        ORDER BY locationID DESC";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $customerID);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $addresses = [];
    while ($row = $result->fetch_assoc()) {
        $addresses[] = $row;
    }
    
    echo json_encode($addresses, JSON_PRETTY_PRINT);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Load addresses error: " . $e->getMessage());
    echo json_encode([
        'error' => 'Failed to load addresses',
        'message' => $e->getMessage()
    ]);
}

exit();
?>