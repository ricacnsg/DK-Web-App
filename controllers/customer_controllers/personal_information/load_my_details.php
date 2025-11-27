<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    $sql = "SELECT 
                c.customerID,
                c.username,
                c.recipientName AS name,
                c.phoneNumber AS contact_number,
                c.email,
                c.createdAT AS created_at
            FROM customer c
            WHERE c.customerID = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $customerID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(['error' => 'Customer not found']);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>