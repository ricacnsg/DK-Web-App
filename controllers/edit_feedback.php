<?php
session_start();
require_once '../database/connect.php';

if (!isset($_SESSION['customer_id'])) {
    echo "Please log in first";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $feedbackID = $_POST['feedbackID'];
    $input = trim($_POST['input']);
    $customerID = $_SESSION['customer_id'];

    if (empty($input)) {
        echo "Feedback cannot be empty";
        exit;
    }

    $sql = "UPDATE feedback SET input = ?, updatedAt = NOW() WHERE feedbackID = ? AND customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $input, $feedbackID, $customerID);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error updating feedback";
    }

    $stmt->close();
    $conn->close();
}
?>
