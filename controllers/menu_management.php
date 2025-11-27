<?php
session_start();
require_once '../database/connect.php';
include 'admin_loghelper.php';
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

    $category = strtolower(trim($_GET['category'] ?? ''));
    $validCategories = ['bento','rice','pulutan','wings','burger','beverages'];
    if ($category && !in_array($category, $validCategories)) {
        echo json_encode(['success'=>false,'message'=>'Invalid category']);
        return;
    }


    if ($category) {
        $stmt = $conn->prepare("
            SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, 
                   menuItemCategory, menuItemImage, createdAT, editedAT 
            FROM menuitem 
            WHERE menuItemCategory = ?
        ");
        $stmt->bind_param("s", $category);
    } else {
        $stmt = $conn->prepare("
            SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, 
                   menuItemCategory, menuItemImage, createdAT, editedAT 
            FROM menuitem
        ");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $menuItems = [];
    while ($row = $result->fetch_assoc()) {

        if (!empty($row['menuItemImage'])) {
            $row['menuItemImage'] = 'data:image/jpeg;base64,' . base64_encode($row['menuItemImage']);
        } else {
            $row['menuItemImage'] = '/assets/image/davens_logo.png';
        }

        $id = (int)$row['menuItemID'];
        $name = $row['menuItemName'];
        $desc = $row['menuItemDescription'];
        $price = floatval($row['menuItemPrice']);
        $cat = $row['menuItemCategory'];
        $img = $row['menuItemImage'];

        $index = count($menuItems);
        $menuItems[$index] = [
            'id' => $id,
            'name' => $name,
            'desc' => $desc,
            'price' => $price,
            'category' => $cat,
            'img' => $img,
            'ingredients' => []
        ];

        $stmt2 = $conn->prepare("
            SELECT mii.itemID, i.itemName, mii.quantity, i.unitOfMeasurement
            FROM menuitemingredients AS mii
            JOIN item AS i ON mii.itemID = i.itemID
            WHERE mii.menuItemID = ?
        ");

        $stmt2->bind_param("i", $id);
        $stmt2->execute();
        $ingredientsResult = $stmt2->get_result();

        while ($ingredientRow = $ingredientsResult->fetch_assoc()) {

            $menuItems[$index]['ingredients'][] = [
                'itemID' => (int)$ingredientRow['itemID'],
                'itemName' => $ingredientRow['itemName'],
                'quantity' => (float)$ingredientRow['quantity'],
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
    
    // Capture any output that might leak
    ob_start();

    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');
        $price = isset($input['price']) ? floatval($input['price']) : 0;
        $category = trim($input['category'] ?? '');
        $imageData = trim($input['imageData'] ?? '');
        $ingredients = [];

        if (isset($input['ingredients']) && is_array($input['ingredients'])) {
            foreach ($input['ingredients'] as $ingredient) {
                if (!is_array($ingredient)) continue; 

                $sanitizedIngredient = [];
                $sanitizedIngredient['ingredient_id'] = isset($ingredient['ingredient_id']) ? (int)$ingredient['ingredient_id'] : 0;
                $sanitizedIngredient['quantity'] = isset($ingredient['quantity']) ? (float)$ingredient['quantity'] : 0.0;
                $ingredients[] = $sanitizedIngredient;
            }
        }

        if (empty($name) || empty($category) || empty($ingredients) || empty($price)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Fill up the required fields.']);
            exit();
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
        $stmt->bind_param("ssdsb", $name, $description, $price, $category, $null);

        if ($imageBlob) {
            $stmt->send_long_data(4, $imageBlob);
        }

        if ($stmt->execute()) {
            $menuItemID = $stmt->insert_id;
            $ingredientSuccess = true;
            $ingredientError = '';

            foreach ($ingredients as $ing) {
                $ingredientID = $ing['ingredient_id'];
                $qty = $ing['quantity'];

                $stmt2 = $conn->prepare("
                    INSERT INTO menuitemingredients (menuItemID, itemID, quantity)
                    VALUES (?, ?, ?)
                ");
                $stmt2->bind_param("iid", $menuItemID, $ingredientID, $qty);
                if (!$stmt2->execute()) {
                    $ingredientSuccess = false;
                    $ingredientError = 'Failed to add ingredient: ' . $stmt2->error;
                    $stmt2->close();
                    break;
                }
                $stmt2->close();
            }

            if ($ingredientSuccess) {
                $new_data = json_encode([
                    'menuItemName' => (string)$name,
                    'menuItemDescription' => (string)$description,
                    'menuItemPrice' => (float)$price,
                    'menuItemCategory' => (string)$category,
                    'menuItemImage' => null
                ]);

                // Try to log, but don't let it break the response
                try {
                    logAction($conn, $_SESSION['staff_id'], 'menu management', 'ADD', $menuItemID, "Add new menu item: $name", null, $new_data);
                } catch (Exception $e) {
                    // Log failed, but continue
                }
                
                $stmt->close();
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Menu item created with ingredients!', 'id'=> $menuItemID]);
                exit();
            } else {
                $stmt->close();
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => $ingredientError]);
                exit();
            }

        } else {
            $stmt->close();
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to add menu item: ' . $stmt->error]);
            exit();
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
        exit();
    }
}

function updateMenuItem() {
    global $conn;
    
    ob_start();

    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');
        $price = isset($input['price']) ? floatval($input['price']) : 0;
        $category = trim($input['category'] ?? '');
        $imageData = trim($input['imageData'] ?? '');
        $ingredients = [];

        if (isset($input['ingredients']) && is_array($input['ingredients'])) {
            foreach ($input['ingredients'] as $ingredient) {
                if (!is_array($ingredient)) continue; 

                $sanitizedIngredient = [];
                $sanitizedIngredient['ingredient_id'] = isset($ingredient['ingredient_id']) ? (int)$ingredient['ingredient_id'] : 0;
                $sanitizedIngredient['quantity'] = isset($ingredient['quantity']) ? (float)$ingredient['quantity'] : 0.0;
                $ingredients[] = $sanitizedIngredient;
            }
        }

        if ($id == 0) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
            exit();
        }

        $resOld = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage 
                                FROM menuitem 
                                WHERE menuItemID = ?");
        $resOld->bind_param("i", $id);
        $resOld->execute();
        $result = $resOld->get_result();
        $oldData = $result->fetch_assoc();
        $resOld->close();

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
            $stmt->close();
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to update menu item: ' . $stmt->error]);
            exit();
        }
        $stmt->close();

        $currentIngredientsDB = [];
        $res = $conn->query("SELECT itemID, quantity FROM menuitemingredients WHERE menuItemID = $id");
        while ($row = $res->fetch_assoc()) {
            $currentIngredientsDB[$row['itemID']] = $row['quantity'];
        }

        $newIngredientIDs = [];
        foreach ($ingredients as $ing) {
            $ingredientID = $ing['ingredient_id'];
            $qty = $ing['quantity'];
            $newIngredientIDs[] = $ingredientID;

            if (isset($currentIngredientsDB[$ingredientID])) {
                if ($currentIngredientsDB[$ingredientID] != $qty) {
                    $stmt2 = $conn->prepare("UPDATE menuitemingredients SET quantity=? WHERE menuItemID=? AND itemID=?");
                    $stmt2->bind_param("dii", $qty, $id, $ingredientID);
                    $stmt2->execute();
                    $stmt2->close();
                }
                unset($currentIngredientsDB[$ingredientID]);
            } else {
                $stmt2 = $conn->prepare("INSERT INTO menuitemingredients (menuItemID, itemID, quantity) VALUES (?, ?, ?)");
                $stmt2->bind_param("iid", $id, $ingredientID, $qty);
                $stmt2->execute();
                $stmt2->close();
            }
        }

        foreach ($currentIngredientsDB as $itemID => $qty) {
            $stmt2 = $conn->prepare("DELETE FROM menuitemingredients WHERE menuItemID=? AND itemID=?");
            $stmt2->bind_param("ii", $id, $itemID);
            $stmt2->execute();
            $stmt2->close();
        }

        $newData = [
            'menuItemID' => $id,
            'menuItemName' => $name,
            'menuItemDescription' => $description,
            'menuItemPrice' => $price,
            'menuItemCategory' => $category,
            'menuItemImage' => !empty($imageData) ? 'UPDATED' : 'UNCHANGED',
            'ingredients' => $ingredients
        ];

        $newDataJson = json_encode($newData);
        $oldDataJson = json_encode($oldData);

        try {
            logAction($conn, $_SESSION['staff_id'], 'menu management', 'UPDATE', $id, "Update menu item: $name", $oldDataJson, $newDataJson);
        } catch (Exception $e) {
            // Log failed, but continue
        }

        ob_end_clean();
        echo json_encode(['success' => true, 'message' => 'Menu item and ingredients updated successfully']);
        exit();
        
    } catch (Exception $e) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
        exit();
    }
}

function deleteMenuItem() {
    global $conn;
    
    ob_start();

    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? (int)$input['id'] : 0;

        if ($id == 0) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Invalid menu item ID']);
            exit();
        }

        $stmtOld = $conn->prepare("SELECT * FROM menuitem WHERE menuItemID = ?");
        $stmtOld->bind_param("i", $id); 
        $stmtOld->execute();

        $result = $stmtOld->get_result();
        $oldData = $result->fetch_assoc();

        $stmtOld->close();

        $stmt = $conn->prepare("DELETE FROM menuitem WHERE menuItemID = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            try {
                logAction($conn, $_SESSION['staff_id'], 'menu management', 'DELETE', $id, "Deleted menu item: " . $oldData['menuItemName'], json_encode($oldData), null);
            } catch (Exception $e) {
                // Log failed, but continue
            }
            
            $stmt->close();
            ob_end_clean();
            echo json_encode(['success' => true, 'message' => 'Menu item deleted successfully']);
            exit();
        } else {
            $stmt->close();
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to delete menu item: ' . $stmt->error]);
            exit();
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
        exit();
    }
}

function getIngredients() {
    global $conn;

    $keyword= $_GET['keyword'] ?? '';

    $keyword = trim($keyword);
    $keyword = preg_replace("/[^a-zA-Z0-9\s\-]/", "", $keyword); 

    if ($keyword === "") {
        echo json_encode(['success' => false, 'message' => 'No keyword']);
        exit;
    }

    $likeKeyword = "%{$keyword}%";

    $stmt = $conn->prepare("
        SELECT itemID, itemName, unitOfMeasurement
        FROM item
        WHERE itemName LIKE ?
    ");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error (prepare failed)']);
        exit;
    }

    $stmt->bind_param('s', $likeKeyword);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error (execute failed)']);
        exit;
    }

    $result = $stmt->get_result();

    $ingredients = [];
    while ($row = $result->fetch_assoc()) {
        $row['itemName'] = $row['itemName'];
        $row['unitOfMeasurement'] = $row['unitOfMeasurement'];

        $ingredients[] = $row;
    }

    echo json_encode([
        'success' => count($ingredients) > 0,
        'data' => $ingredients
    ]);
}


$conn->close();
?>