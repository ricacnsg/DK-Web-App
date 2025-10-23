<?php
require_once '../database/connect.php';

// add new account with hashed password
function createStaffAccount($conn) {
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST["staff_username"];
    $pass = $_POST["staff_password"];
    $role = $_POST["staff_role"];
  //$user = "newuser"; // testing
  //$pass = "newpassword"; // testing
  //$role = "staff"; // testing
    $createdAt = date("Y-m-d H:i:s");
    $editedAt = date("Y-m-d H:i:s");

    $encrypt_password = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO staff (staffUsername, staffPassword, staffRole, createdAt, editedAt) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $user, $hashed_password, $role, $createdAt, $editedAt);

    if ($stmt->execute()) {
      echo "Account created successfully.";
    } else {
      echo "Error: " . $stmt->error;
    }

    $stmt->close();
  }
}


// edit account details ++ mababago din ang editedAt kapag inedit
function editStaffAccount($conn) {
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
     $staffId = $_POST["staff_id"];
     $newUsername = $_POST["new_username"];
     $newRole = $_POST["new_role"];
    //$staffId = 1; // testing
    //$newUsername = "Daven"; // testing
    //$newRole = "admin"; // testing
    $editedAt = date("Y-m-d H:i:s");

    $stmt = $conn->prepare("UPDATE staff SET staffUsername = ?, staffRole = ?, editedAt = ? WHERE staffID = ?");
    $stmt->bind_param("sssi", $newUsername, $newRole, $editedAt, $staffId);

    if ($stmt->execute()) {
      echo "Account updated successfully.";
    } else {
      echo "Error: " . $stmt->error;
    }

    $stmt->close();
  }
}


// delete account
function deleteStaffAccount($conn) {
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $staffId = $_POST["staff_id"];
  // $staffId = 3; // testing

  $stmt = $conn->prepare("DELETE FROM staff WHERE staffID = ?");
  $stmt->bind_param("i", $staffId);

  if ($stmt->execute()) {
    echo "Account deleted successfully.";
  } else {
    echo "Error: " . $stmt->error;
  }

  $stmt->close();
  }
}


//call functions here
createStaffAccount($conn);
editStaffAccount($conn);
deleteStaffAccount($conn);

/* TO DO
 - try to put value and name attribute sa html and call it here base sa need iperform through conditional statements OR sa js file na lang itrigger yung function based on button clicked
*/

$conn->close();
?>