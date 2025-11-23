<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$currentPassword = $input['currentPassword'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (empty($currentPassword) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

try {
    // Get current password from database
    $sql = "SELECT password FROM customer WHERE customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $customerID);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit();
    }
    
    // Check if stored password is hashed
    $storedPassword = $user['password'];
    $isHashed = (strlen($storedPassword) == 60 && substr($storedPassword, 0, 4) == '$2y$');
    
    // Verify current password
    // if ($isHashed) {
    //     // Hashed password - use password_verify
    //     if (!password_verify($currentPassword, $storedPassword)) {
    //         echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
    //         exit();
    //     }
    // } else {
        // Plain text password - direct comparison
        if ($currentPassword !== $storedPassword) {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit();
        }
    
    // Hash the new password
    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update with hashed password
    $sql = "UPDATE customer SET password = ? WHERE customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $hashedNewPassword, $customerID);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password changed successfully. Your password is now securely hashed.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to change password']);
    }
    
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>