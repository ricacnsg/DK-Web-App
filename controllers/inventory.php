<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // palitan pag ilalagay na sa production ang '*'
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
require_once '../database/connect.php';
include 'admin_loghelper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
switch($method){
  case 'GET':
    displayItems($conn);
    break;
  case 'POST':
    addNewItem($conn);
    break;
  case 'PUT':
    editItem($conn);
    break;
  case 'DELETE':
    deleteItem($conn);
    break;
  default:
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

function addNewItem($conn){
    $input = json_decode(file_get_contents('php://input'), true);
    $itemName = $input["itemName"] ?? '';
    $stocks = $input["stocks"] ?? 0;
    $measurement = $input['measurement'] ?? 0;
    $reorder = $input["reorder"] ?? 0;
    $unitCost = $input["unitCost"] ?? 0;
    $itemCategory = $input["itemCategory"] ?? '';
    $createdAt = date("Y-m-d H:i:s");
    $editedAt = date("Y-m-d H:i:s");
    
    $requiredFields = [$itemName, $stocks, $measurement, $reorder, $unitCost, $itemCategory];
    $numOnly = [$stocks, $reorder, $unitCost];
    $validMeasurements = ['kilograms', 'grams', 'mg', 'oz', 'lb', 'ml', 'liters', 'tsp', 'tbsp', 'cup', 'slice', 'pieces', 'packs'];


    foreach($requiredFields as $field){
        if (empty($field)) {
            echo json_encode(['success' => false, 'message' => 'Fill up the missing field.']);
            exit;
        }
    }
    
    foreach($numOnly as $field){
        if(!is_numeric($field)){
            echo json_encode(['success' => false, 'message' => 'Input in stocks, reorder level, and unit cost should be numeric.']);
            exit;
        }
    }

    if(empty($measurement)){
      echo json_encode(['success' => false, 'message' => 'Unit of measurement is required.']);
      exit;
    }

    $measurement = strtolower($measurement);
    if (!in_array($measurement, $validMeasurements)) {
      echo json_encode(['success' => false, 'message' => 'Invalid measurement option is selected.']);
      exit;
    }

    $stmt = $conn->prepare("INSERT INTO item (itemName, quantity, unitOFMeasurement, pricePerQuantity, itemCategory, reorderLevel, createdAT, editedAT) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error (prepare failed)']);
        exit;
    }

    $stmt->bind_param("sisisiss", $itemName, $stocks, $measurement, $unitCost, $itemCategory, $reorder,  $createdAt, $editedAt);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error (execute failed)']);
        $stmt->close();
        exit;
    }
    else {
        echo json_encode(['success' => true, 'message' => 'Item added successfully.']);
    }
    $itemID = $stmt->insert_id;
    $new_data = json_encode([
        'itemName' => (string)$itemName,
        'quantity' => (float)$stocks,
        'unitOfMeasurement' => (string)$measurement,
        'pricePerQuantity' => (float)$unitCost,
        'itemCategory' => (string)$itemCategory,
        'reorderLevel' => (int)$reorder
    ]);

    logAction($conn, $_SESSION['staff_id'], 'inventory', 'ADD', $itemID, "Add new item: $itemName", null, $new_data);

    $stmt->close();
}

function displayItems($conn) {
    $query = "SELECT itemID, itemName, quantity, unitOfMeasurement, itemCategory, pricePerQuantity, reorderLevel FROM item";
    $conditions = [];
    $params = [];
    $types = "";

    $validCategories = ['vegetables', 'meat', 'drinks', 'dairy', 'poultry', 'condiments', 'bread', 'utensils'];

    if (isset($_GET['category']) && $_GET['category'] !== "") {
        $category = strtolower($_GET['category']);

        if (!in_array($category, $validCategories)) {
            echo json_encode(['success' => false, 'message' => 'Invalid category']);
            exit;
        }

        $conditions[] = "itemCategory = ?";
        $params[] = $category;
        $types .= "s";
    }

    if (isset($_GET['searchItem']) && $_GET['searchItem'] !== "") {
        $search = "%" . $_GET['searchItem'] . "%";
        $conditions[] = "itemName LIKE ?";
        $params[] = $search;
        $types .= "s";
    }

    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Server error (prepare failed)']);
        exit;
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Server error (execute failed)']);
        exit;
    }

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    if (!empty($data)) {
        echo json_encode($data);
    } else {
        echo json_encode(['success' => false, 'message' => 'No record found']);
    }
    $stmt->close();
}

function editItem($conn){
  $input = json_decode(file_get_contents('php://input'), true);


  if (!isset($input['id'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Item ID is required']);
      exit;
  }

  $id = intval($input['id']);

  $stmt = $conn->prepare("SELECT * FROM item WHERE itemID= ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $result = $stmt->get_result();
  $item = $result->fetch_assoc();

  if (!$item) {
      http_response_code(404);
      echo json_encode(['error' => 'Ingredient not found']);
      exit;
  }

  $fieldMap = [
      'unitOfMeasurement' => 'unitOfMeasurement',
      'unitCost' => 'pricePerQuantity', 
      'quantity' => 'quantity',
      'reorder' => 'reorderLevel'
  ];

  $updates = [];
  $params = [];
  $types = '';

  foreach ($fieldMap as $field => $dbColumn) {
      if (isset($input[$field])) {
          $value = $input[$field];
          $oldValue = $item[$dbColumn];

          if (in_array($field, ['unitCost', 'quantity', 'reorder']) && (!is_numeric($value) || $value < 0)) {
              http_response_code(400);
              echo json_encode(['error' => "$field must be a non-negative number"]);
              exit;
          }

          if ($value == $oldValue) {
              continue;
          }

          $updates[] = "$dbColumn = ?";
          $params[] = $value;

          if ($field == 'unitCost') $types .= 'd';
          else if (in_array($field, ['quantity', 'reorder'])) $types .= 'i';
          else $types .= 's';
      }
  }

  if(!empty($input['unitOfMeasurement'])){
    if (!isset($input['unitOfMeasurement'])) {
        $updates[] = "unitOfMeasurement = ?";
        $params[] = $item['unitOfMeasurement'];
        $types .= 's';
    } 
  }

  if (empty($updates)) {
      echo json_encode(['error' => 'No valid fields to update']);
      exit;
  }

      // Fetch current item for logging
    $resOld = $conn->prepare("SELECT itemName, quantity, unitOfMeasurement, itemCategory, pricePerQuantity, reorderLevel
                            FROM item 
                            WHERE itemID = ?");
    $resOld->bind_param("i", $id);
    $resOld->execute();
    $result = $resOld->get_result();
    $oldData = $result->fetch_assoc();
    $resOld->close();

  $sql = "UPDATE item SET " . implode(", ", $updates) . " WHERE itemID = ?";
  $stmt = $conn->prepare($sql);

  $params[] = $id;
  $types .= 'i';
  $stmt->bind_param($types, ...$params);

  if ($stmt->execute()) {
      echo json_encode(['success' => true, 'message' => 'Item updated successfully']);

      //for logging
      $newData = [
        'quantity' => (float)$input['quantity'],
        'unitOfMeasurement' => (string)$input['unitOfMeasurement'],
        'pricePerQuantity' => (float)$input['unitCost'],
        'reorderLevel' => (int)$input['reorder']
       ];

    $newDataJson = json_encode($newData);
    $oldDataJson = json_encode($oldData);

    logAction($conn, $_SESSION['staff_id'], 'inventory', 'UPDATE', $id, "Updated item", $oldDataJson, $newDataJson);
  } else {
      http_response_code(500);
      echo json_encode(['error' => 'Failed to update item']);
  }

  $stmt->close();
}

function deleteItem($conn){
  $input = json_decode(file_get_contents('php://input'), true);

  if (!isset($input['id'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Item ID is required']);
      exit;
  }

  $id = intval($input['id']);

  $stmt = $conn->prepare("SELECT * FROM item WHERE itemID= ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $result = $stmt->get_result();
  $item = $result->fetch_assoc();

  // 1. Check if ingredient exists
  if (!$item) {
      http_response_code(404);
      echo json_encode(['error' => 'Ingredient not found']);
      exit;
  }

  // 2. Check if ingredient has remaining stock (pag oo, bawal idelete)
  while ($row = $result->fetch_assoc()) {
      if($row['quantity'] > 0){
        http_response_code(400);
        echo json_encode(['error' => 'Ingredient has remaining stock, it cannot be deleted.']);
        exit;
      }
  }

  // 3. Check if used in menuitemIngredient (recipe) table (pag oo, bawal idelete)
  $stmt = $conn->prepare("SELECT * FROM menuitemingredients WHERE itemID= ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $result = $stmt->get_result();
  $item = $result->fetch_assoc();

  if ($item) {
      http_response_code(400);
      echo json_encode(['error' => 'Ingredient found in a recipe, it cannot be deleted.']);
      exit;
  }

    $stmtOld = $conn->prepare("SELECT * FROM item WHERE itemID = ?");
    $stmtOld->bind_param("i", $id); 
    $stmtOld->execute();

    $result = $stmtOld->get_result();
    $oldData = $result->fetch_assoc();

    $stmtOld->close();

  $stmt = $conn->prepare("DELETE FROM item WHERE itemID= ?");
  $stmt->bind_param("i", $id);

  if($stmt->execute()){
    echo json_encode(['success' => true, 'message' => 'Item deleted successfully']);
    logAction($conn, $_SESSION['staff_id'], 'inventory', 'DELETE', $id, "Deleted menu item: " . $oldData['itemName'], json_encode($oldData), null);
  }
  else{
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete item']);
  }

  $stmt->close();
}

$conn->close();
?>