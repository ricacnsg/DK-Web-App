<?php
session_start();
require_once '../database/connect.php';

if (!isset($_SESSION['customer_id'])) {
    echo "Please log in first";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $feedbackID = $_POST['feedbackID'];
    $customerID = $_SESSION['customer_id'];

    if (empty($feedbackID)) {
        echo "Invalid feedback ID";
        exit;
    }

    $sql = "DELETE FROM feedback WHERE feedbackID = ? AND customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $feedbackID, $customerID);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error deleting feedback";
    }

    $stmt->close();
    $conn->close();
}
?>
