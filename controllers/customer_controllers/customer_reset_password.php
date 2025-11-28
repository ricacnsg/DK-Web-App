<?php
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

require_once '../../database/connect.php';

// Define log file
define('RESET_LOG_FILE', __DIR__ . '/../../logs/password_reset.log');

function logReset($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] RESET: $message" . PHP_EOL;
    @file_put_contents(RESET_LOG_FILE, $logEntry, FILE_APPEND);
}

logReset("=== Password Reset Attempt Started ===");

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Get and validate input
$rawInput = file_get_contents('php://input');
logReset("Raw input: " . substr($rawInput, 0, 100));

$input = json_decode($rawInput, true);

// Check for valid JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    logReset("JSON decode error: " . json_last_error_msg());
    echo json_encode(['success' => false, 'message' => 'Invalid request format']);
    exit;
}

$token = $input['emailOrToken'] ?? '';
$newPassword = $input['newPassword'] ?? '';

logReset("Token received (first 10 chars): " . substr($token, 0, 10));
logReset("Password length: " . strlen($newPassword));

// Sanitize token (should be alphanumeric)
$token = preg_replace('/[^a-zA-Z0-9]/', '', $token);

if (empty($token) || empty($newPassword)) {
    logReset("Token or password empty after sanitization");
    echo json_encode(['success' => false, 'message' => 'Token and new password are required']);
    exit;
}

// Validate token format (64 hex characters)
if (!preg_match('/^[a-f0-9]{64}$/i', $token)) {
    logReset("Token format invalid. Length: " . strlen($token));
    echo json_encode(['success' => false, 'message' => 'Invalid token format']);
    exit;
}

logReset("Token format validated");

// Validate password strength
if (strlen($newPassword) < 8) {
    logReset("Password too short");
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
    exit;
}

if (strlen($newPassword) > 72) {
    logReset("Password too long");
    echo json_encode(['success' => false, 'message' => 'Password is too long (max 72 characters)']);
    exit;
}

// Check password complexity
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/', $newPassword)) {
    logReset("Password doesn't meet complexity requirements");
    echo json_encode([
        'success' => false, 
        'message' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ]);
    exit;
}

logReset("Password validation passed");

// Hash the token to compare with stored hash
$hashedToken = hash('sha256', $token);
logReset("Token hashed for database lookup");

// Check database connection
if (!$conn) {
    logReset("Database connection failed: " . mysqli_connect_error());
    echo json_encode(['success' => false, 'message' => 'System error. Please try again later.']);
    exit;
}

logReset("Database connected");

// Find user by hashed token and check expiry
$stmt = $conn->prepare("SELECT customerID, token_expiry FROM customer WHERE verificationToken = ? LIMIT 1");
if (!$stmt) {
    logReset("Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'System error. Please try again later.']);
    exit;
}

$stmt->bind_param("s", $hashedToken);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    logReset("No user found with token");
    usleep(rand(100000, 300000));
    echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
    exit;
}

logReset("User found - CustomerID: " . $user['customerID']);

// Check if token has expired
$currentTime = date('Y-m-d H:i:s');
if ($user['token_expiry'] && $user['token_expiry'] < $currentTime) {
    logReset("Token expired. Expiry: " . $user['token_expiry'] . ", Current: " . $currentTime);
    echo json_encode([
        'success' => false, 
        'message' => 'This reset link has expired. Please request a new one.'
    ]);
    exit;
}

logReset("Token not expired");

// Hash password with bcrypt (cost factor 12)
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

if (!$hashedPassword) {
    logReset("Password hashing failed");
    echo json_encode(['success' => false, 'message' => 'System error. Please try again later.']);
    exit;
}

logReset("Password hashed successfully");

// Update password and clear token - use transaction for atomicity
$conn->begin_transaction();
logReset("Transaction started");

try {
    // Update password and clear token
    $stmt = $conn->prepare("UPDATE customer SET password = ?, verificationToken = NULL, token_expiry = NULL, isVerified = 1 WHERE customerID = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    logReset("Update statement prepared");
    
    $stmt->bind_param("si", $hashedPassword, $user['customerID']);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    logReset("Password updated. Rows affected: " . $stmt->affected_rows);
    $stmt->close();
    
    $conn->commit();
    logReset("Transaction committed successfully");
    
    echo json_encode(['success' => true, 'message' => 'Password has been reset successfully. You can now log in with your new password.']);
    
} catch (Exception $e) {
    $conn->rollback();
    logReset("ERROR - Transaction rolled back: " . $e->getMessage());
    logReset("Error trace: " . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Failed to reset password. Please try again.']);
}

$action = "Reset Password";
$previousData = "Old password hash changed";
$newData = "New password hash saved";

$logStmt = $conn->prepare("
    INSERT INTO customerlogs (customerID, action, previousData, newData, timestamp)
    VALUES (?, ?, ?, ?, NOW())
");

if ($logStmt) {
    $logStmt->bind_param("isss", $user['customerID'], $action, $previousData, $newData);
    $logStmt->execute();
    $logStmt->close();
    logReset("Customer log inserted for password reset");
} else {
    logReset("Failed to insert password reset log: " . $conn->error);
}

$conn->close();
logReset("=== Password Reset Attempt Ended ===\n");
?>