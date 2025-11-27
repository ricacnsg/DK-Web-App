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
$password = $input['password'] ?? '';

if (empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Password is required']);
    exit();
}

try {
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
    
    // DEBUG: Check if password is hashed
    $storedPassword = $user['password'];
    $isHashed = (strlen($storedPassword) == 60 && substr($storedPassword, 0, 4) == '$2y$');
    
    if ($isHashed) {
        // Password is hashed, use password_verify
        if (password_verify($password, $storedPassword)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password (hashed)']);
        }
    } else {
        // Password is plain text, compare directly
        if ($password === $storedPassword) {
            echo json_encode(['success' => true, 'warning' => 'Password is stored as plain text']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password (plain text)']);
        }
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>