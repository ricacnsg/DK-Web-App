<?php
require_once '../database/connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $user = $_POST["staff_username"];
  $pass = $_POST["staff_password"];

  // Use prepared statement for security
  $stmt = $conn->prepare("SELECT * FROM staff WHERE staffUsername=? AND staffPassword=?");
  $stmt->bind_param("ss", $user, $pass);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    echo "success"; // JS will detect this
  } else {
    echo "Invalid username or password.";
  }

  $stmt->close();
}

$conn->close();
?>