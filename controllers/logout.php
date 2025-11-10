<?php
session_start();
header('Content-Type: application/json');

// Destroy the session
session_unset();
session_destroy();
$response = [
    'success' => true,
    'message' => 'Logged out successfully.'
];

echo json_encode($response);
exit;
?>