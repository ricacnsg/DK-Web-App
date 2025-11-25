<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // papalitan ang '*' pag inihost na
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
    displayStaffAccounts($conn);
    break;
  case 'POST':
    createStaffAccount($conn);
    break;
  case 'PUT':
    editStaffAccount($conn);
    break;
  case 'DELETE':
    deleteStaffAccount($conn);
    break;
  default:
    $response = ['success' => false, 'message' => 'Invalid request method.'];
}

function createStaffAccount($conn) {
    $input = json_decode(file_get_contents('php://input'), true);
    $fullname = isset($input["fullname"]) ? trim(strip_tags($input["fullname"])) : '';
    $contactno = isset($input["contactno"]) ? trim($input["contactno"]) : '';
    $user = isset($input["username"]) ? trim(strip_tags($input["username"])) : '';
    $pass = isset($input["password"]) ? $input["password"] : '';
    $role = isset($input["role"]) ? trim(strip_tags($input["role"])) : '';
    $createdAt = date("Y-m-d H:i:s");
    $editedAt = date("Y-m-d H:i:s");

    // 1. Required fields
    if (empty($fullname) || empty($contactno) || empty($user) || empty($pass) || empty($role)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        return;
    }

    // 2. Username: alphanumeric + underscores, no spaces
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $user)) {
        echo json_encode(['success' => false, 'message' => 'Username must be alphanumeric and contain no spaces.']);
        return;
    }

    // 3. Username must be unique
    $check = $conn->prepare("SELECT staffID FROM staff WHERE staffUsername = ?");
    $check->bind_param("s", $user);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
        return;
    }
    $check->close();

    // 4. Contact number validation (PH format = 11 digits)
    if (!preg_match('/^[0-9]{11}$/', $contactno)) {
        echo json_encode(['success' => false, 'message' => 'Contact number must be 11 digits.']);
        return;
    }

    // 5. Strong password validation
    if (
        strlen($pass) < 8 ||
        !preg_match('/[A-Z]/', $pass) ||
        !preg_match('/[a-z]/', $pass) ||
        !preg_match('/[0-9]/', $pass) ||
        !preg_match('/[\W]/', $pass)
    ) {
        echo json_encode([
            'success' => false,
            'message' => 'Password must be at least 8 chars and include uppercase, lowercase, number, and special character.'
        ]);
        return;
    }

    // 6. Valid role should only be(admin, cashier, kitchen staff, delivery rider)
    $validRoles = ['admin', 'cashier', 'kitchen staff', 'delivery rider'];
    if (!in_array(strtolower($role), $validRoles)) {
        $response = ['success' => false, 'message' => 'Invalid role selected.'];
        return;
    }

    $hash_password = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT INTO staff 
        (staffFullname, contactNumber, staffUsername, staffPassword, staffRole, createdAt, editedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sssssss",
        $fullname,
        $contactno,
        $user,
        $hash_password,
        $role,
        $createdAt,
        $editedAt
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }

    $stmt->close();
}

function displayStaffAccounts($conn) {

    $roleFilter = isset($_GET['role']) ? trim(strip_tags($_GET['role'])) : '';
    $searchFullname = isset($_GET['search']) ? trim(strip_tags($_GET['search'])) : '';

    $validRoles = ['admin','cashier','kitchen staff','delivery rider'];

    $sql = "SELECT staffID, staffFullname, staffUsername, contactNumber, staffRole FROM staff";
    $params = [];
    $types = '';
    $conditions = [];

    if (!empty($roleFilter) && in_array(strtolower($roleFilter), $validRoles)) {
        $conditions[] = "staffRole = ?";
        $params[] = strtolower($roleFilter);
        $types .= 's';
    }

    if (!empty($searchFullname)) {
        $conditions[] = "staffFullname LIKE ?";
        $params[] = "%$searchFullname%";
        $types .= 's';
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success'=>false,'message'=>'Statement preparation failed.']);
        return;
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];

        while ($row = $result->fetch_assoc()) {
            $data[] = [
                'staffID' => (int)$row['staffID'],
                'contactno' => trim($row['contactNumber']),
                'staffFullname' => trim($row['staffFullname']),
                'staffUsername' => trim($row['staffUsername']),
                'staffRole' => trim($row['staffRole'])
            ];
        }

        echo json_encode(['success'=>true,'data'=>$data]);
    } else {
        echo json_encode(['success'=>false,'message'=>'Database error: '.$stmt->error]);
    }

    $stmt->close();
}


function editStaffAccount($conn) {
    $input = json_decode(file_get_contents('php://input'), true);

    $staffId = isset($input["staff_id"]) ? (int)$input["staff_id"] : 0;
    $newFullname = isset($input["newFullname"]) ? trim(strip_tags($input["newFullname"])) : '';
    $newUsername = isset($input["newUsername"]) ? trim(strip_tags($input["newUsername"])) : '';
    $newContactno = isset($input["newContactno"]) ? trim($input["newContactno"]) : '';
    $newRole = isset($input["newRole"]) ? trim(strip_tags($input["newRole"])) : '';
    $newPassword = isset($input["newPassword"]) ? $input["newPassword"] : '';
    $confirmPassword = isset($input["confirmPass"]) ? $input["confirmPass"] : '';
    $editedAt = date("Y-m-d H:i:s");

    $validRoles = ['admin','cashier','kitchen staff','delivery rider'];
    $errors = [];

    if ($staffId <= 0) $errors[] = "Invalid staff ID.";

    if (empty($newFullname)) $errors[] = "Fullname is required.";

    if (empty($newUsername) || preg_match('/\s/', $newUsername) || !preg_match('/^[a-zA-Z0-9_]+$/', $newUsername)) {
        $errors[] = "Invalid username. Must be alphanumeric, no spaces.";
    }

    if (!ctype_digit($newContactno)) $errors[] = "Contact number must be numeric.";
    if (strlen($newContactno) !== 11) $errors[] = "Contact number must be 11 digits.";

    if (!in_array(strtolower($newRole), $validRoles)) $errors[] = "Invalid role selected.";

    if (!empty($newPassword)) {
        if ($newPassword !== $confirmPassword) $errors[] = "Password and confirm password do not match.";
        if (strlen($newPassword) < 8) $errors[] = "Password must be at least 8 characters.";
        if (!preg_match('/[A-Z]/', $newPassword)) $errors[] = "Password must include at least one uppercase letter.";
        if (!preg_match('/[a-z]/', $newPassword)) $errors[] = "Password must include at least one lowercase letter.";
        if (!preg_match('/[0-9]/', $newPassword)) $errors[] = "Password must include at least one number.";
        if (!preg_match('/[\W]/', $newPassword)) $errors[] = "Password must include at least one special character.";
    }

    if (!empty($errors)) {
        echo json_encode(['success'=>false,'errors'=>$errors]);
        return;
    }

    $stmt = $conn->prepare("SELECT staffFullname, staffUsername, contactNumber, staffRole FROM staff WHERE staffID = ?");
    $stmt->bind_param("i", $staffId);
    $stmt->execute();
    $stmt->bind_result($currentFullname, $currentUsername, $currentContactno, $currentRole);
    if (!$stmt->fetch()) {
        echo json_encode(['success'=>false,'errors'=>['Staff account not found.']]);
        return;
    }
    $stmt->close();

    $passwordChanged = !empty($newPassword);
    if (
        $newFullname === $currentFullname &&
        $newUsername === $currentUsername &&
        $newContactno === $currentContactno &&
        strtolower($newRole) === strtolower($currentRole) &&
        !$passwordChanged
    ) {
        echo json_encode(['success'=>false,'errors'=>['No changes detected.']]);
        return;
    }

    if ($newUsername !== $currentUsername) {
        $checkStmt = $conn->prepare("SELECT staffID FROM staff WHERE staffUsername=? AND staffID != ?");
        $checkStmt->bind_param("si",$newUsername,$staffId);
        $checkStmt->execute();
        $checkStmt->store_result();
        if ($checkStmt->num_rows > 0) {
            echo json_encode(['success'=>false,'errors'=>['Username already exists.']]);
            return;
        }
        $checkStmt->close();
    }

    if ($passwordChanged) {
        $hash_newpassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE staff SET staffFullname=?, staffUsername=?, contactNumber=?, staffRole=?, staffPassword=?, editedAt=? WHERE staffID=?");
        $stmt->bind_param("ssssssi", $newFullname, $newUsername, $newContactno, $newRole, $hash_newpassword, $editedAt, $staffId);
    } else {
        $stmt = $conn->prepare("UPDATE staff SET staffFullname=?, staffUsername=?, contactNumber=?, staffRole=?, editedAt=? WHERE staffID=?");
        $stmt->bind_param("sssssi", $newFullname, $newUsername, $newContactno, $newRole, $editedAt, $staffId);
    }

    if ($stmt->execute()) {
        echo json_encode(['success'=>true,'message'=>'Account edited successfully.']);
    } else {
        echo json_encode(['success'=>false,'errors'=>['Database error: '.$stmt->error]]);
    }
    $stmt->close();
}

function deleteStaffAccount($conn) {
  $input = json_decode(file_get_contents('php://input'), true);

  $staffId = isset($input["staff_id"]) ? (int)$input["staff_id"] : 0;

  if ($staffId <= 0 || empty($staffId)){
    echo json_encode(['success' => false, 'message' => 'StaffID is required.']);
    return;
  }

  //If staffID is equal to sessionID then account should not be deleted.
  if ($staffId == $_SESSION['staff_id']){
    echo json_encode(['success' => false, 'message' => 'Admin account should not be deleted.']);
    return;
  }

  $stmt = $conn->prepare("DELETE FROM staff WHERE staffID = ?");
  $stmt->bind_param("i", $staffId);

  if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Account deleted successfully.']);
  } else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
  }
  $stmt->close();
}

$conn->close();
?>