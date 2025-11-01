<?php
session_start();
header('Content-Type: application/json');

// Destroy the session
session_unset();
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully.'
]);
exit;
?>