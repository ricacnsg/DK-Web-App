<?php
session_start();
require_once '../database/connect.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // palitan pag ilalagay na sa production ang '*'
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET': 
    if(isset($_GET['action'])) {
      switch ($_GET['action']) {
        case 'getMenuItems':
          getMenuItems();
          break;
        case 'getIngredients':
          getIngredients();
          break;
        default:
          echo json_encode(['success' => false, 'message' => 'Unknown action']);
      }
    }
    else {
      echo json_encode(['success' => false, 'message' => 'No action specified.']);
    }
    break;
    case 'POST':
        addMenuItem();
        break;
    case 'PUT':
        updateMenuItem();
        break;
    case 'DELETE':
        deleteMenuItem();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

function getMenuItems() {
    global $conn;

    $category = $_GET['category'] ?? '';

    if ($category) {
        $stmt = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage, createdAT, editedAT FROM menuitem WHERE menuItemCategory = ?");
        $stmt->bind_param("s", $category);
    } else {
        $stmt = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage, createdAT, editedAT FROM menuitem");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $menuItems = [];
    while ($row = $result->fetch_assoc()) {

        if (!empty($row['menuItemImage'])) {
            $row['menuItemImage'] = 'data:image/jpeg;base64,' . base64_encode($row['menuItemImage']);
        } else {
            $row['menuItemImage'] = 'assets/image/placeholder.jpg';
        }

        // 🔥 Save index where this item will be inserted
        $index = count($menuItems);

        // Insert base menu item
        $menuItems[$index] = [
            'id' => $row['menuItemID'],
            'name' => $row['menuItemName'],
            'desc' => $row['menuItemDescription'],
            'price' => floatval($row['menuItemPrice']),
            'category' => $row['menuItemCategory'],
            'img' => $row['menuItemImage'],
            'ingredients' => []   // Placeholder
        ];

        // Now load ingredients
        $menuItemID = $row['menuItemID'];
        $stmt2 = $conn->prepare("
            SELECT 
                mii.itemID,
                i.itemName,
                mii.quantity,
                i.unitOfMeasurement
            FROM menuitemingredients AS mii
            JOIN item AS i 
                ON mii.itemID = i.itemID
            WHERE mii.menuItemID = ?
        ");
        $stmt2->bind_param("i", $menuItemID);
        $stmt2->execute();
        $ingredientsResult = $stmt2->get_result();

        while ($ingredientRow = $ingredientsResult->fetch_assoc()) {
            // 🔥 Insert ingredients inside the correct item
            $menuItems[$index]['ingredients'][] = [
                'itemID' => $ingredientRow['itemID'],
                'itemName' => $ingredientRow['itemName'],
                'quantity' => $ingredientRow['quantity'],
                'unit' => $ingredientRow['unitOfMeasurement']
            ];
        }

        $stmt2->close();
    }

    echo json_encode(['success' => true, 'data' => $menuItems]);
    $stmt->close();
}


function addMenuItem() {
    global $conn;

    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $price = $input['price'] ?? 0;
    $category = $input['category'] ?? '';
    $imageData = $input['imageData'] ?? '';
    $ingredients = $input['ingredients'] ?? [];

    if (empty($name) || empty($category) || empty($ingredients) || empty($price)) {
        echo json_encode(['success' => false, 'message' => 'Fill up the required fields.']);
        return;
    }

    $imageBlob = null;
    if (!empty($imageData) && strpos($imageData, 'data:image') === 0) {
        $base64 = explode(',', $imageData)[1];
        $imageBlob = base64_decode($base64);
    }

    $stmt = $conn->prepare("
        INSERT INTO menuitem 
        (menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage, createdAT) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $null = null;
    $stmt->bind_param("ssdss", $name, $description, $price, $category, $null);

    if ($imageBlob) {
        $stmt->send_long_data(4, $imageBlob);
    }


    if ($stmt->execute()) {
        $menuItemID = $stmt->insert_id;

        // Insert ingredients
        foreach ($ingredients as $ing) {
            $ingredientID = $ing['ingredient_id'];
            $qty = $ing['quantity'];

            $stmt2 = $conn->prepare("
                INSERT INTO menuitemingredients (menuItemID, itemID, quantity)
                VALUES (?, ?, ?)
            ");
            $stmt2->bind_param("iii", $menuItemID, $ingredientID, $qty);
            if (!$stmt2->execute()) {
                $response['success'] = false;
                $response['message'] = 'Failed to add ingredient: ' . $stmt2->error;
                $stmt2->close();
                break;
            }
            $stmt2->close();
        }

        if (empty($response['message'])) {
            echo json_encode(['success' => true, 'message' => 'Menu item created with ingredients!', 'id'=> $menuItemID]);
        }

    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add menu item: ' . $stmt->error]);
    }

    $stmt->close();
}

function updateMenuItem() {
    global $conn;

    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $price = $input['price'] ?? 0;
    $category = $input['category'] ?? '';
    $imageData = $input['imageData'] ?? '';
    $ingredients = $input['ingredients'] ?? [];

    if ($id == 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
        return;
    }

    if (!empty($imageData) && strpos($imageData, 'data:image') === 0) {
        $base64 = explode(',', $imageData)[1];
        $imageBlob = base64_decode($base64);

        $stmt = $conn->prepare("UPDATE menuitem SET menuItemName=?, menuItemDescription=?, menuItemPrice=?, menuItemCategory=?, menuItemImage=?, editedAT=NOW() WHERE menuItemID=?");
        $null = null;
        $stmt->bind_param("ssdsbi", $name, $description, $price, $category, $null, $id);
        $stmt->send_long_data(4, $imageBlob);
    } else {
        $stmt = $conn->prepare("UPDATE menuitem SET menuItemName=?, menuItemDescription=?, menuItemPrice=?, menuItemCategory=?, editedAT=NOW() WHERE menuItemID=?");
        $stmt->bind_param("ssdsi", $name, $description, $price, $category, $id);
    }

    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed to update menu item: ' . $stmt->error]);
        $stmt->close();
        return;
    }
    $stmt->close();

    //Get current ingredients in DB for this menu item
    $currentIngredientsDB = [];
    $res = $conn->query("SELECT itemID, quantity FROM menuitemingredients WHERE menuItemID = $id");
    while ($row = $res->fetch_assoc()) {
        $currentIngredientsDB[$row['itemID']] = $row['quantity'];
    }

    //Determine which ingredients to delete, update, insert
    $newIngredientIDs = [];
    foreach ($ingredients as $ing) {
        $ingredientID = $ing['ingredient_id'];
        $qty = $ing['quantity'];
        $newIngredientIDs[] = $ingredientID;

        if (isset($currentIngredientsDB[$ingredientID])) {
            // Already exists → update quantity if different
            if ($currentIngredientsDB[$ingredientID] != $qty) {
                $stmt2 = $conn->prepare("UPDATE menuitemingredients SET quantity=? WHERE menuItemID=? AND itemID=?");
                $stmt2->bind_param("iii", $qty, $id, $ingredientID);
                $stmt2->execute();
                $stmt2->close();
            }
            // Remove from current DB array so leftover = to delete
            unset($currentIngredientsDB[$ingredientID]);
        } else {
            // New ingredient → insert
            $stmt2 = $conn->prepare("INSERT INTO menuitemingredients (menuItemID, itemID, quantity) VALUES (?, ?, ?)");
            $stmt2->bind_param("iii", $id, $ingredientID, $qty);
            $stmt2->execute();
            $stmt2->close();
        }
    }

    //Delete leftover ingredients that were removed
    foreach ($currentIngredientsDB as $itemID => $qty) {
        $stmt2 = $conn->prepare("DELETE FROM menuitemingredients WHERE menuItemID=? AND itemID=?");
        $stmt2->bind_param("ii", $id, $itemID);
        $stmt2->execute();
        $stmt2->close();
    }

    echo json_encode(['success' => true, 'message' => 'Menu item and ingredients updated successfully']);
}


function deleteMenuItem() {
    global $conn;

    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;

    if ($id == 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
        return;
    }

    $stmt = $conn->prepare("DELETE FROM menuitem WHERE menuItemID = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Menu item deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete menu item: ' . $stmt->error]);
    }

    $stmt->close();
}

function getIngredients(){
    global $conn;

    $keyword = $_GET['keyword'] ?? '';

    if (empty($keyword)) {
        echo json_encode(['success' => false, 'message' => 'No keyword']);
        exit;
    }
    $keyword = "%{$keyword}%";
    
    $stmt = $conn->prepare("SELECT itemID, itemName, unitOfMeasurement FROM item WHERE itemName LIKE ?");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error (prepare failed)']);
        exit;
    }

    $stmt->bind_param('s', $keyword);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error (execute failed)']);
        exit;
    }

    $result = $stmt->get_result();

    $ingredients = [];
    while($row = $result->fetch_assoc()){
        $ingredients[] = $row;
    }

    if ($result->num_rows > 0) {
        echo json_encode(['success' => true, 'data' => $ingredients]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No record found']);
    }
}

$conn->close();
?>
