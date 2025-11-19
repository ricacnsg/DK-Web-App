<?php
session_start();
require_once '../../../database/connect.php';

$filter = $_GET['filter'] ?? 'all';
$search = $_GET['search'] ?? '';

// Prepare SQL with filter and search
if ($filter === 'all') {
    $sql = "SELECT * FROM menuitem WHERE menuItemName LIKE ? ORDER BY menuItemName ASC";
    $stmt = $conn->prepare($sql);
    $likeSearch = "%$search%";
    $stmt->bind_param("s", $likeSearch);
} else {
    $sql = "SELECT * FROM menuitem WHERE menuItemCategory = ? AND menuItemName LIKE ? ORDER BY menuItemName ASC";
    $stmt = $conn->prepare($sql);
    $likeSearch = "%$search%";
    $stmt->bind_param("ss", $filter, $likeSearch);
}

if (!$stmt) {
    die("Error preparing statement: " . $conn->error);
}

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $name = htmlspecialchars($row['menuItemName']);
        $description = htmlspecialchars($row['menuItemDescription']);
        $price = htmlspecialchars($row['menuItemPrice']);
        $imageData = $row['menuItemImage'];
        $category = htmlspecialchars($row['menuItemCategory']);
        $itemID = $row['menuItemID'];

        $imageSrc = !empty($imageData) ? 'data:image/jpeg;base64,' . base64_encode($imageData) : '/assets/image/no_image.png';

        echo '
        <div class="col-12 col-sm-6 col-lg-2 mb-3 menu-item"
             data-name="' . $name . '"
             data-price="' . $price . '"
             data-category="' . $category . '">
            <div class="card card-design border-3 text-center menu-name h-100 rounded-5">
                <div class="card-body mb-3" data-id="' . $itemID . '">
                    <img src="' . $imageSrc . '" class="img-fluid rounded" alt="' . $name . '">
                    <p class="menuitem-name fw-bold">' . $name . '</p><br>
                    <p class="menuitem-description">' . $description . '</p>
                    <p class="menuitem-price">₱' . $price . '</p>
                </div>
                <div class="quantity-control m-2 d-flex justify-content-center">
                    <button class="minus-btn rounded-pill quantity-buttons">-</button>
                    <span class="quantity-display ms-4 me-4 fw-bold">0</span>
                    <button class="plus-btn rounded-pill quantity-buttons">+</button>
                </div>
            </div>
        </div>';
    }
} else {
    echo '<div class="col-12 text-center"><p class="text-muted">No items found.</p></div>';
}
?>
