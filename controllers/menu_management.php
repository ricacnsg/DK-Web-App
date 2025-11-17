<?php
session_start();
require_once '../database/connect.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getMenuItems();
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

        $menuItems[] = [
            'id' => $row['menuItemID'],
            'name' => $row['menuItemName'],
            'desc' => $row['menuItemDescription'],
            'price' => floatval($row['menuItemPrice']),
            'category' => $row['menuItemCategory'],
            'img' => $row['menuItemImage'],
            'ingredients' => []
        ];
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

    if (empty($name) || empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Name and category are required']);
        return;
    }

    $imageBlob = null;
    if (!empty($imageData) && strpos($imageData, 'data:image') === 0) {
        $base64 = explode(',', $imageData)[1];
        $imageBlob = base64_decode($base64);
    }

    $stmt = $conn->prepare("INSERT INTO menuitem (menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage, createdAT) VALUES (?, ?, ?, ?, ?, NOW())");
    $null = null;
    $stmt->bind_param("ssdss", $name, $description, $price, $category, $null);

    if ($imageBlob) {
        $stmt->send_long_data(4, $imageBlob);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Menu item added successfully', 'id' => $stmt->insert_id]);
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

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Menu item updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update menu item: ' . $stmt->error]);
    }

    $stmt->close();
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

$conn->close();
echo json_encode($response);
?>