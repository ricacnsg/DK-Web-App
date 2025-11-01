<?php
session_start();
require_once '../database/connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $user = $_POST["customer_username"];
  $pass = $_POST["customer_password"];

  $stmt = $conn->prepare("SELECT * FROM customer WHERE username=? AND password=?");
  $stmt->bind_param("ss", $user, $pass);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $_SESSION['customer_id'] = $row['customerID'];
    $_SESSION['username'] = $row['username'];
    echo "success";
  } else {
    echo "Invalid username or password.";
  }
      
  $stmt->close();
}

$conn->close();
?>