<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
require_once '../database/connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method){
  case 'GET':
    if(isset($_GET['action'])) {
      switch ($_GET['action']) {
        case 'accounts':
          displayStaffAccounts($conn);
          break;
        case 'usernames':
          getStaffUsername($conn);
          break;
        case 'staffinfos':
          displayInfosForEdit($conn);
          break;
        case 'search':
          searchAndFilterStaffAccount($conn);
          break;
        default:
          $response = ['success' => false, 'message' => 'Unknown action'];
      }
    }
    else {
      $response = ['success' => false, 'message' => 'No action specified.'];
    }
    break;
  case 'POST':
    if(isset($_GET['action'])) {
      switch ($_GET['action']) {
        case 'createAcc':
          createStaffAccount($conn);
          break;
        case 'editAcc':
          editStaffAccount($conn);
          break;
        case 'deleteAcc':
          deleteStaffAccount($conn);
          break;
        default:
          $response = ['success' => false, 'message' => 'Unknown action'];
      }
    }
    else {
      $response = ['success' => false, 'message' => 'No action specified.'];
    }
    break;
  default:
    $response = ['success' => false, 'message' => 'Invalid request method.'];
}

function createStaffAccount($conn) {
  global $response;
    $fullname = $_POST["fullname"];
    $contactno = $_POST["contactno"];
    $user = $_POST["username"];
    $pass = $_POST["password"];
    $role = $_POST["role"];
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

function displayStaffAccounts($conn){
  global $response;
    $stmt = $conn->prepare("SELECT staffID, staffFullname, staffRole FROM staff");

    if ($stmt->execute()) {
      $result = $stmt->get_result();
      $data = [];

      while($row = $result->fetch_assoc()){
        $data[] = $row;
      }
      $response = $data;
    } 
    else {
      $response = ['success' => false, 'message' => 'Database error: ' . $stmt->error];
    }
    $stmt->close();
}

function getStaffUsername($conn){
  global $response;
    $stmt = $conn->prepare("SELECT staffUsername FROM staff");

    if ($stmt->execute()) {
      $result = $stmt->get_result();
      $usernames = [];

      while($row = $result->fetch_assoc()){
        $usernames[] = $row;
      }
      $response = $usernames;
    } 
    else {
      $response = ['success' => false, 'message' => 'Database error: ' . $stmt->error];
    }
    $stmt->close();
}

function displayInfosForEdit($conn){
    global $response;
  if (isset($_GET['staffID'])) {
    $staffID = $_GET['staffID'];
    $stmt = $conn->prepare("SELECT staffID, staffFullname, contactNumber, staffUsername, staffPassword, staffRole FROM staff WHERE staffID = ?");
    $stmt->bind_param("i", $staffID);

    if ($stmt->execute()) {
      $result = $stmt->get_result();
      $staffInfos = [];

      while($row = $result->fetch_assoc()){
        $staffInfos[] = $row;
      }
      $response = $staffInfos;
    } 
    else {
      $response = ['success' => false, 'message' => 'Database error: ' . $stmt->error];
    }
    $stmt->close();
  }
}

function editStaffAccount($conn) {
    global $response;
    $staffId = $_POST["staff_id"];
    $newFullname = $_POST["newFullname"];
    $newUsername = $_POST["newUsername"];
    $newContactno = $_POST["newContactno"];
    $newRole = $_POST["newRole"];
    $newPassword = $_POST["newPassword"];
    $editedAt = date("Y-m-d H:i:s");

    if (!empty($newPassword)) {
        // Update including password
        $hash_newpassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("
            UPDATE staff 
            SET staffFullname = ?, staffUsername = ?, contactNumber = ?, staffRole = ?, staffPassword = ?, editedAt = ?
            WHERE staffID = ?
        ");

        $stmt->bind_param("ssisssi", $newFullname, $newUsername, $newContactno, $newRole, $hash_newpassword, $editedAt, $staffId);

    } else {
        // Update WITHOUT changing password
        $stmt = $conn->prepare("
            UPDATE staff 
            SET staffFullname = ?, staffUsername = ?, contactNumber = ?, staffRole = ?, editedAt = ?
            WHERE staffID = ?
        ");

        $stmt->bind_param("ssissi", $newFullname, $newUsername, $newContactno, $newRole, $editedAt, $staffId);
    }
    
    if ($stmt->execute()) {
      $response = ['success' => true, 'message' => 'Account edited successfully.'];
    } else {
      $response = ['success' => false, 'message' => 'Database error: ' . $stmt->error];
    }

    $stmt->close();
}

function deleteStaffAccount($conn) {
  global $response;
  $staffId = $_POST["staff_id"];
  $stmt = $conn->prepare("DELETE FROM staff WHERE staffID = ?");
  $stmt->bind_param("i", $staffId);

  if ($stmt->execute()) {
    $response = ['success' => true, 'message' => 'Account deleted successfully.'];
  } else {
    $response = ['success' => false, 'message' => 'Database error: ' . $stmt->error];
  }
  $stmt->close();
}

function searchAndFilterStaffAccount($conn){
  global $response;
  $search = $_GET['search']  ?? '';
  $role = $_GET['role']  ?? '';

  $sql = "SELECT staffID, staffFullname, staffRole FROM staff WHERE 1=1";
  $params = [];
  $types = "";

  // If search query exists
  if ($search !== '') {
      $sql .= " AND staffFullname LIKE CONCAT('%', ?, '%')";
      $params[] = $search;
      $types .= "s";
  }

  // If role filter exists
  if ($role !== '') {
      $sql .= " AND staffRole = ?";
      $params[] = $role;
      $types .= "s";
  }

  $stmt = $conn->prepare($sql);

  if (!empty($params)) {
      $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();
  $result = $stmt->get_result();

  $data = [];
  while($row = $result->fetch_assoc()){
    $data[] = $row;
  }

  $response = $data;
}

$conn->close();
echo json_encode($response);
?>