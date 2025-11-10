<?php
session_start();
header('Content-Type: application/json');
require_once '../database/connect.php';

$response = [
    'logged_in' => true,
    'staff_id' => $_SESSION['staff_id'] ?? null,
    'staff_username' => $_SESSION['staff_username'] ?? null,
    'staff_role' => $_SESSION['staff_role'] ?? null
];
echo json_encode($response);
?>