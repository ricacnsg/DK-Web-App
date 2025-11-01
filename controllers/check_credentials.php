<?php
session_start();
require_once '../database/connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $user = $_POST["staff_username"];
  $pass = $_POST["staff_password"];

  $stmt = $conn->prepare("SELECT staffID, staffPassword, staffRole FROM staff WHERE staffUsername = ?");
  $stmt->bind_param("s", $user);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    $hashedPassword = $row['staffPassword'];
    
    if (password_verify($pass, $hashedPassword)) {
        $_SESSION['staff_id'] = $row['staffID'];
        $_SESSION['staff_username'] = $user;
        $_SESSION['staff_role'] = $row['staffRole'];
        echo 'success';
    }
  } 
  else {
    echo "❌ Username not found.";
  }
      
  $stmt->close();
}

$conn->close();
?>