<?php
session_start();
header('Content-Type: application/json');
echo json_encode([
  'isLoggedIn' => isset($_SESSION['customer_id']),
  'username' => $_SESSION['username'] ?? null
]);