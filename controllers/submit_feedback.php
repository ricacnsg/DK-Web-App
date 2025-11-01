<?php
session_start();
require_once '../database/connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (!isset($_SESSION['customer_id'])) {
        echo "Please log in first";
        exit;
    }

    if (empty($_POST['input'])) {
        echo "Feedback cannot be empty";
        exit;
    }

    $feedback = $_POST['input'];
    $customer_id = $_SESSION['customer_id'];
    $currentDateTime = date('Y-m-d H:i:s');

    $stmt = $conn->prepare("INSERT INTO feedback (customerID, input, createdAT) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $customer_id, $feedback, $currentDateTime);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request";
}
?>