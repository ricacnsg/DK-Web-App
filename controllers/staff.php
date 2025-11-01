<?php
session_start();
error_log("Session set: " . print_r($_SESSION, true));
header('Content-Type: application/json');
require_once '../database/connect.php';

if (!isset($_SESSION['staff_username'])){
  $response =  ['logged_in' => false, 'message' => 'No session found.'];
  exit;
}
$response = [
    'logged_in' => true,
    'staff_id' => $_SESSION['staff_id'] ?? null,
    'staff_username' => $_SESSION['staff_username'] ?? null,
    'staff_role' => $_SESSION['staff_role'] ?? null
];

// add new account with hashed password
function createStaffAccount($conn) {
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = $_POST["fullname"];
    $contactno = $_POST["contactno"];
    $user = $_POST["username"];
    $pass = $_POST["password"];
    $role = $_POST["role"];
  // $fullname = "davendaven"; // testing
  // $contactno = 9123456534; //testing
  // $user = "davens"; // testing
  // $pass = "gUstOkOmagwork"; // testing
  // $role = "staff"; // testing
    $createdAt = date("Y-m-d H:i:s");
    $editedAt = date("Y-m-d H:i:s");

    $hash_password = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO staff (staffFullname, contactNumber, staffUsername, staffPassword, staffRole, createdAt, editedAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sisssss", $fullname, $contactno, $user, $hash_password, $role, $createdAt, $editedAt);

    if ($stmt->execute()) {
      $response = ['success' => true, 'message' => 'Account created successfully.'];
    } 
    else {
      $response = ['success' => false, 'message' => 'Database error: ' . $stmt->error];
    }
    $stmt->close();
    } 
  else {
    $response = ['success' => false, 'message' => 'Invalid request method.'];
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
echo json_encode($response);
?>