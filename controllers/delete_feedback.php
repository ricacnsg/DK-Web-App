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

    // Get previous feedback for logging
    $prevStmt = $conn->prepare("SELECT input FROM feedback WHERE feedbackID = ? AND customerID = ?");
    $prevStmt->bind_param("ii", $feedbackID, $customerID);
    $prevStmt->execute();
    $prevStmt->bind_result($previousData);
    $prevStmt->fetch();
    $prevStmt->close();

    // Delete feedback
    $sql = "DELETE FROM feedback WHERE feedbackID = ? AND customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $feedbackID, $customerID);

    if ($stmt->execute()) {
        echo "success";

        // Insert log with previousData and newData as NULL
        $action = "Delete Feedback";
        $logStmt = $conn->prepare("INSERT INTO customerlogs (customerID, previousData, newData, action, timestamp) VALUES (?, ?, NULL, ?, NOW())");
        $logStmt->bind_param("iss", $customerID, $previousData, $action);
        $logStmt->execute();
        $logStmt->close();

    } else {
        echo "Error deleting feedback: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>
