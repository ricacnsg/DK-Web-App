function escapeHTML(value) {
    if (typeof value === "number") return value;
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


fetch("../controllers/islogin.php", {
  method: "GET"
})
  .then(res => res.json())
  .then(data => {
    if (!data.logged_in) {
      window.location.href = "login.php";
    }
  })
  .catch(err => console.error("Error checking session:", err));


document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const menuSearchInput = document.getElementById('menuSearchInput');
    const menuSorter = document.getElementById('menuSorter');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    // Menu Management elements
    const menuGrid = document.getElementById('menuGrid');
    const addNewItemCard = document.getElementById('addNewItemCard');
    const addEditModal = document.getElementById('addEditModal');
    const deleteModal = document.getElementById('deleteModal');
    const menuItemForm = document.getElementById('menuItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const deleteItemNameSpan = document.getElementById('deleteItemName');
    const notification = document.getElementById('notification');
    
    // Ingredients elements
    const ingredientsList = document.getElementById('ingredientsList');
    const newIngredientInput = document.getElementById('newIngredientInput');
    //const addIngredientBtn = document.getElementById('addIngredientBtn');
    
    // Image handling elements
    const imageUpload = document.getElementById('imageUpload');
    const itemImagePreview = document.getElementById('itemImagePreview');
    const imagePlaceholderIcon = document.getElementById('imagePlaceholderIcon');
    
    // Carousel elements
    const categoryListWrapper = document.querySelector('.category-list-wrapper');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let itemToManageId = null; 
    let itemToDeleteId = null;
    let currentIngredients = []; 
    let menuItems = [];
    
    // Variable to track the currently active category
    let activeCategory = 'bento'; 

    // API base URL
    const API_BASE = '../controllers/menu_management.php';

    // PAGE NAVIGATION LOGIC (Sidebar)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => page.classList.remove('active-page'));

            const targetPage = document.getElementById(item.dataset.page);
            if (targetPage) {
                targetPage.classList.add('active-page');
            }

            if (item.dataset.page === 'menu') {
                const currentActiveItem = document.querySelector('.category-item.active');
                const initialCategory = currentActiveItem ? currentActiveItem.dataset.category : 'bento';
                activeCategory = initialCategory;
                loadMenuItems(initialCategory);
            }
        });
    });

    function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when sidebar is open
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    }
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking on nav items (on mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                toggleSidebar();
            }
        });
    });

    // Close sidebar when clicking logout (on mobile)
    document.querySelector('.logout-btn').addEventListener('click', () => {
        if (window.innerWidth <= 900) {
            toggleSidebar();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // DASHBOARD TAB LOGIC
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        const tabButtons = dashboard.querySelectorAll('.tab-btn');
        const mainHeader = dashboard.querySelector('.main-header h1');
        const printButton = dashboard.querySelector('.print-summary-btn');

        const switchTab = (tabName) => {
            tabButtons.forEach(btn => {
                const isActive = btn.getAttribute('data-tab') === tabName;
                btn.classList.toggle('active', isActive);
            });

            if (mainHeader) {
                const formatted = tabName.charAt(0).toUpperCase() + tabName.slice(1) + ' Dashboard';
                mainHeader.textContent = formatted;
            }
        };

        tabButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const tabName = btn.getAttribute('data-tab');
                switchTab(tabName);
            });
        });

        if (tabButtons.length > 0) {
            switchTab(tabButtons[0].getAttribute('data-tab'));
        }

        if (printButton) {
            printButton.addEventListener('click', e => {
                e.stopPropagation();
                alert('Printing summary... (In a real app, this would trigger print logic)');
            });
        }
    }

    // MENU MANAGEMENT CORE LOGIC
    const showNotification = (message) => {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    const closeModal = (modalId) => {
        document.getElementById(modalId).classList.remove('active');
        itemToManageId = null;
        currentIngredients = [];
        // Reset form
        menuItemForm.reset();
        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';
    };
    window.closeModal = closeModal;

    // Load menu items from server
    const loadMenuItems = async (category) => {
        try {
            const response = await fetch(`${API_BASE}?action=getMenuItems&category=${category}`);
            const result = await response.json();
            
            if (result.success) {
                menuItems = result.data;
                renderMenuItems(category);
            } else {
                console.error('Failed to load menu items:', result.message);
                showNotification('Failed to load menu items');
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
            showNotification('Error loading menu items');
        }
    };

    const createMenuCard = (item) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.itemId = item.id;
        card.innerHTML = `
            <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}" class="menu-image">
            <div class="menu-name">${escapeHTML(item.name)}</div>
            <div class="menu-description">${escapeHTML(item.desc)}</div>
            <div class="menu-price">₱${escapeHTML(item.price.toFixed(2))}</div>
            <div class="menu-actions">
                <button class="btn btn-edit" data-id="${escapeHTML(item.id)}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-remove" data-id="${escapeHTML(item.id)}">
                    <i class="fas fa-trash-alt"></i> Remove
                </button>
            </div>
        `;
        return card;
    };


    // Helper function for sorting items
    const sortMenuItems = (items, sortBy) => {
        const sortedItems = items.slice(); 

        switch (sortBy) {
            case 'name_asc':
                return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
            case 'price_asc':
                return sortedItems.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sortedItems.sort((a, b) => b.price - a.price);
            default:
                return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        }
    };

    const renderMenuItems = (category) => {
        document.querySelectorAll('.menu-card:not(.add-item)').forEach(card => card.remove());
        
        const searchTerm = menuSearchInput ? menuSearchInput.value.toLowerCase() : '';
        const sortBy = menuSorter ? menuSorter.value : 'name_asc'; 
        
        activeCategory = category;

        let filteredItems = menuItems.filter(item => item.category === category);

        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.desc.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredItems = sortMenuItems(filteredItems, sortBy);

        filteredItems.forEach(item => {
            const card = createMenuCard(item);
            menuGrid.appendChild(card); // now adds after the Add button
        });


        attachCardListeners();
    };

    // CATEGORY CAROUSEL LOGIC
    const scrollAmount = 300;

    const scrollCategories = (direction) => {
        const newScrollLeft = categoryListWrapper.scrollLeft + (direction * scrollAmount);
        categoryListWrapper.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    };

    prevBtn.addEventListener('click', () => {
        scrollCategories(-1);
    });

    nextBtn.addEventListener('click', () => {
        scrollCategories(1);
    });

    // Handle Category Filter
    document.querySelectorAll('.category-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            const clickedItem = e.currentTarget;
            clickedItem.classList.add('active');
            
            const category = clickedItem.dataset.category;
            loadMenuItems(category);

            const categoryName = clickedItem.querySelector('.category-name').textContent.split(' ')[0];
            addNewItemCard.querySelector('.add-text').textContent = `Add ${categoryName} Item`;
        });
    });

    // INGREDIENTS MANAGEMENT LOGIC
    const ingredientInput = document.getElementById('newIngredientInput');
    const selectIngredientTable = document.querySelector('#selectIngredientsTable tbody');
    let debounceTimer;
    async function fetchIngredients() {
        const keyword = ingredientInput.value.trim();

        const response = await fetch(`${API_BASE}?action=getIngredients&keyword=${keyword}`);
        const data = await response.json();

        selectIngredientTable.innerHTML = "";
        if(data.success){
            data.data.forEach(item => {
            const row = document.createElement("tr");

            row.dataset.id = item.itemID;
            row.dataset.name = item.itemName;
            row.dataset.unit = item.unitOfMeasurement;

            let saved = currentIngredients.find(i => i.id == item.itemID);
            let qty = saved ? saved.quantity : 0;

            row.innerHTML = `
                <td>${escapeHTML(item.itemName)}</td>
                <td>
                    <button type='button'class="btn qty-minus">-</button>
                    <span class="qty-number">${escapeHTML(qty)}</span>
                    <button type='button' class="btn qty-plus">+</button>
                </td>
            `;

            const minusBtn = row.querySelector(".qty-minus");
            const plusBtn = row.querySelector(".qty-plus");
            const qtyDisplay = row.querySelector(".qty-number");

            minusBtn.addEventListener("click", () => {
                if (qty > 0) {
                    qty--;
                    qtyDisplay.textContent = qty;
                }
            });

            plusBtn.addEventListener("click", () => {
                qty++;
                qtyDisplay.textContent = qty;
            });

            selectIngredientTable.appendChild(row);
            });
        }
        else {
            selectIngredientTable.innerHTML = `
            <tr><td colspan="2">No results found</td></tr>
        `;
        }
    }
    ingredientInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchIngredients, 300);
        });
    fetchIngredients();

    const renderIngredients = () => {
        ingredientsList.innerHTML = '';

        currentIngredients.forEach((ingredient) => {
            if (ingredient.quantity === 0) return;

            const item = document.createElement('span');
            item.className = 'ingredient-item';

            item.innerHTML = `
                ${ingredient.name} (x${ingredient.quantity} ${ingredient.unit})
            `;

            ingredientsList.appendChild(item);
        });
    };

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("qty-plus") ||
            e.target.classList.contains("qty-minus")) {
            
            const row = e.target.closest("tr");

            const id = row.dataset.id;
            const name = row.dataset.name;
            const unit = row.dataset.unit;

            const qtyDisplay = row.querySelector(".qty-number");

            let item = currentIngredients.find(i => i.id == id);

            if (!item) {
                item = { id, name, quantity: 0, unit };
                currentIngredients.push(item);
            }

            if (e.target.classList.contains("qty-plus")) {
                item.quantity++;
            }

            if (e.target.classList.contains("qty-minus")) {
                if (item.quantity > 0) item.quantity--;
            }

            qtyDisplay.textContent = item.quantity;

            if (item.quantity === 0) {
                currentIngredients = currentIngredients.filter(i => i.id != id);
            }
            addIngredient(row); 
        }
    });

    function addIngredient(row) {
        const id = row.dataset.id;
        const name = row.dataset.name;
        const unit = row.dataset.unit;

        const qtyDisplay = row.querySelector(".qty-number");
        let quantity = parseInt(qtyDisplay.textContent);

        let existing = currentIngredients.find(i => i.id == id);

        if (!existing) {
            currentIngredients.push({ id, name, quantity, unit });
        } else {
            existing.quantity = quantity;
        }

        renderIngredients(); // update the div
    }

    // Handle Open Add Modal
    addNewItemCard.addEventListener('click', () => {
        modalTitle.textContent = 'Add Menu Item';
        menuItemForm.reset();
        itemToManageId = null;
        currentIngredients = [];
        renderIngredients(); 
        
        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';
        addEditModal.classList.add('active');

        document.getElementById('itemCategory').value = activeCategory;
    });

    // Handle Open Edit/Remove Modal (Delegated Listener)
    const attachCardListeners = () => {
        menuGrid.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                openEditModal(itemId);
            };
        });

        menuGrid.querySelectorAll('.btn-remove').forEach(btn => {
            btn.onclick = (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                openDeleteModal(itemId);
            };
        });
    };

    const openEditModal = (itemId) => {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;

        modalTitle.textContent = 'Edit Menu Item';
        
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.desc;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;
        
        currentIngredients = item.ingredients.map(ing => ({
            id: ing.itemID,
            name: ing.itemName,
            quantity: ing.quantity,
            unit: ing.unit
        }));
        renderIngredients();

        if (item.img && item.img !== 'assets/image/placeholder.jpg') {
            itemImagePreview.src = item.img;
            itemImagePreview.style.display = 'block';
            imagePlaceholderIcon.style.display = 'none';
        } else {
            itemImagePreview.style.display = 'none';
            imagePlaceholderIcon.style.display = 'block';
        }

        itemToManageId = itemId; 
        addEditModal.classList.add('active');
    };
    
    const openDeleteModal = (itemId) => {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        itemToDeleteId = itemId;
        deleteItemNameSpan.textContent = item.name;
        deleteModal.classList.add('active');
    };

        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showNotification('Please select a valid image file');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    showNotification('Image size should be less than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    itemImagePreview.src = e.target.result;
                    itemImagePreview.style.display = 'block';
                    imagePlaceholderIcon.style.display = 'none';
                };
                reader.onerror = () => {
                    showNotification('Error reading image file');
                };
                reader.readAsDataURL(file);
            }
        });

    // Handle Add/Edit Form Submission
    menuItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEditing = itemToManageId !== null;
        const formData = {
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            imageData: itemImagePreview.style.display !== 'none' ? itemImagePreview.src : '',
            ingredients: currentIngredients.map(i => ({
                ingredient_id: i.id,
                quantity: i.quantity
            }))
        };

        try {
            let response;
            if (isEditing) {
                formData.id = itemToManageId;
                response = await fetch(API_BASE, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(API_BASE, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            const result = await response.json();
            
            if (result.success) {
                showNotification(`Item "${formData.name}" successfully ${isEditing ? 'updated' : 'added'}!`);
                closeModal('addEditModal');
                loadMenuItems(formData.category);
            } else {
                showNotification(`Failed to ${isEditing ? 'update' : 'add'} item: ${result.message}`);
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            showNotification('Error saving menu item');
        }
    });

    // Handle Delete Confirmation
    deleteConfirmBtn.addEventListener('click', async () => {
        if (itemToDeleteId !== null) {
            const deletedItem = menuItems.find(item => item.id === itemToDeleteId);
            
            try {
                const response = await fetch(API_BASE, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: itemToDeleteId })
                });

                const result = await response.json();
                
                if (result.success) {
                    showNotification(`Item "${deletedItem.name}" successfully deleted!`);
                    closeModal('deleteModal');
                    loadMenuItems(deletedItem.category);
                } else {
                    showNotification(`Failed to delete item: ${result.message}`);
                }
            } catch (error) {
                console.error('Error deleting menu item:', error);
                showNotification('Error deleting menu item');
            }
        }
    });

    // Menu Search and Sort Listeners
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', () => renderMenuItems(activeCategory));
    }
    if (menuSorter) { 
        menuSorter.addEventListener('change', () => renderMenuItems(activeCategory));
    }

    // Initialize menu when page loads
    if (document.getElementById('menu').classList.contains('active-page')) {
        loadMenuItems('bento');
    } 
});

//INVENTORY MANAGEMENT 
document.addEventListener("DOMContentLoaded", () => {
    const addNewItemBtn = document.querySelector('.add-btn');
    const addNewItemModal = document.getElementById('itemModal');
    const addItemForm = document.getElementById('itemForm');
    const itemName = document.getElementById('itemname');
    const stocks = document.getElementById('itemStocks');
    const measurement = document.getElementById('itemMeasurement');
    const reorder = document.getElementById('itemReorder');
    const unitCost = document.getElementById('itemCost');
    const itemCategory = document.getElementById('itemcategory');
    let items = [];

    addNewItemBtn.addEventListener('click', function(e) {
        if (e.target === addNewItemBtn) {
            addNewItemModal.classList.add('active');
        }
    });

    addNewItemModal.addEventListener('click', function(e) {
        if (e.target === addNewItemModal) {
            addNewItemModal.classList.remove('active');
        }
    });

    //add item - DONE
    addItemForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const formData = {
            itemName: itemName.value,
            stocks: stocks.value,
            measurement: measurement.value,
            reorder: reorder.value,
            unitCost: unitCost.value,
            itemCategory: itemCategory.value
        };

        try{
            const response = await fetch('../controllers/inventory.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if(result.success){
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Item added successfully.",
                    showConfirmButton: false,
                    timer: 1500
                });
                document.getElementById('itemForm').reset();
                addNewItemModal.classList.remove('active');
                displayItem();
            }
            else {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Something went wrong. Please try again.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    //filter and search item - DONE
    const filterCategory = document.getElementById('categoryFilter');
    const searchItem = document.getElementById('searchItem');
    const inventoryTable = document.getElementById('inventoryTable');
    let debounceTimer;

    async function displayItem() {
        const filterValue = filterCategory.value.trim();
        const searchValue = searchItem.value;
        try{
            const response = await fetch(`../controllers/inventory.php?&category=${encodeURIComponent(filterValue)}&searchItem=${encodeURIComponent(searchValue)}`)
            items = await response.json();
            const tbody = inventoryTable.querySelector('tbody');
            tbody.innerHTML = ''; 
            if (items.length > 0) {
                items.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${escapeHTML(item.itemName)}</td>
                                    <td>${escapeHTML(item.quantity)} ${escapeHTML(item.unitOfMeasurement)}</td>
                                    <td>${escapeHTML(item.reorderLevel)} ${escapeHTML(item.unitOfMeasurement)}</td>
                                    <td>${escapeHTML(item.itemCategory)}</td>
                                    <td>${escapeHTML(item.pricePerQuantity)}</td>
                                    <td>
                                        <button class="editItem-btn" data-id="${escapeHTML(item.itemID)}">Edit</button>
                                        <button class="deleteItem-btn" data-id="${escapeHTML(item.itemID)}">Delete</button>
                                    </td>`;
                    tbody.appendChild(tr);
                });
            }
            else{
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="6">No record found</td>`;
                tbody.appendChild(tr);
            }

            searchItem.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(displayItem, 300);
            });
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error:', error,
                showConfirmButton: false,
                timer: 1500
            });
        } 
    }
    displayItem();
    filterCategory.addEventListener('change', displayItem);

    //edit and delete item
    const editItemModal = document.getElementById('editItemModal');
    const deleteItemModal = document.getElementById('deleteItemModal');
    const cancelDeleteItemBtn = document.querySelector('.delete-cancel-btn');
    const cancelEditItemBtn = document.querySelector('.cancelEditItem-btn');


    let currentID = null;   // store ID of item being edited
    let currentItemData = null;

    inventoryTable.addEventListener('click', function(e) {
      if (e.target.classList.contains('editItem-btn')) {
        editItemModal.classList.add("active");

        currentID = e.target.dataset.id;
        currentItemData = items.find(i => i.itemID == currentID);

        document.getElementById("editMeasurement").value = currentItemData.unitOfMeasurement;
        document.getElementById("editUnitPrice").value = currentItemData.pricePerQuantity;
        document.getElementById("editQuantity").value = currentItemData.quantity;
        document.getElementById("editReorder").value = currentItemData.reorderLevel;
      }
      else if (e.target.classList.contains('deleteItem-btn')) {
        deleteItemModal.classList.add('active');
        currentID = e.target.dataset.id;
      }
    });

    editItemModal.addEventListener('click', function(e) {
        if (e.target === editItemModal) {
            editItemModal.classList.remove('active');
        }
    });

    cancelEditItemBtn.addEventListener('click', function(e) {
        if (e.target === cancelEditItemBtn) {
            editItemModal.classList.remove('active');
        }
    });

    deleteItemModal.addEventListener('click', function(e) {
        if (e.target === deleteItemModal) {
            deleteItemModal.classList.remove('active');
        }
    });

    cancelDeleteItemBtn.addEventListener('click', function(e) {
        if (e.target === cancelDeleteItemBtn) {
            deleteItemModal.classList.remove('active');
        }
    });

    document.getElementById("editItemForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        if (!currentID || !currentItemData) {
            console.error("No item selected for editing.");
            return;
        }

        const updateItems = {
            id: currentID,
            unitOfMeasurement: document.getElementById("editMeasurement").value,
            unitCost: document.getElementById("editUnitPrice").value,
            quantity: document.getElementById("editQuantity").value,
            reorder: document.getElementById("editReorder").value
        };

        try {
            const response = await fetch(`../controllers/inventory.php`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateItems)
            });

            const result = await response.json();
            if (result.success) {
                editItemModal.classList.remove("active");
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });

                displayItem();

                currentID = null;
                currentItemData = null;

                document.getElementById("editMeasurement").value = "";
                document.getElementById("editUnitPrice").value = "";
                document.getElementById("editQuantity").value = "";
                document.getElementById("editReorder").value = "";
            }
            else {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: result.error || result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error:', 
                text: error,
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    document.querySelector('.delete-confirm-btn').addEventListener('click', async function(e) {
        e.preventDefault();

        if (!currentID) {
            console.error("No item selected for editing.");
            return;
        }

        try{
            const response = await fetch(`../controllers/inventory.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentID })
            });

            const result = await response.json();
            if(result.success){
                deleteItemModal.classList.remove("active");
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });

                displayItem();

                currentID = null;
            }
            else{
                deleteItemModal.classList.remove("active");
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: result.error || result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }

        } catch (error) {
            Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Error:', 
                    text: error,
                    showConfirmButton: false,
                    timer: 1500
            });
        }
    });

});

        
//LOGOUT BUTTON
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutbtn");

  logoutBtn.addEventListener("click", () => {

    fetch("../controllers/logout.php", {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.location.href = "login.php";
        } else {
          console.log(data.message);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  });
});


//STAFF ACCOUNT MANAGEMENT
document.addEventListener("DOMContentLoaded", () => {

    const username = document.getElementById('username');
    const message = document.getElementById('validationMessage');
    const pass = document.getElementById('password');
    const messagePass = document.getElementById('validationPass');
    const createBtn = document.getElementById('createaccbtn');
    
    //validation 1: check if username is unique - DONE
    username.addEventListener('input', () => {
        fetch("../controllers/staff.php?action=usernames", {
                method: 'GET'
            })
        .then(res => res.json())
        .then(data => {
            const user = username.value.trim().toLowerCase();
            const exists = data.some(row => row.staffUsername.toLowerCase() === user);
            if(user === ''){
                message.textContent = '';
                return;
            }

            if (exists){
                message.textContent = '❌ Username is already taken.';
                message.style.fontSize = '12px';
                message.style.marginLeft = '10px'

            }
            else{
                message.textContent = '✅ Username is available.';
                message.style.fontSize = '12px';
                message.style.marginLeft = '10px';
            }

            //validation 2: username should have no space - DONE
            if (/\s/.test(username.value)){
                message.textContent = '❌ Username should not contain spaces.';
                message.style.fontSize = '12px';
                message.style.marginLeft = '10px';
            }      
            
            if(/\s/.test(username.value) || exists){
                createBtn.disabled = true;
                createBtn.style.backgroundColor = 'gray';
            }
            else {
                createBtn.disabled = false;
                createBtn.style.backgroundColor = '#062970';
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    pass.addEventListener('input', () => {
        const hasUpperCase = /[A-Z]/.test(pass.value);
        const hasLowerCase = /[a-z]/.test(pass.value);
        const hasSpecialChar = /[!@#$%^&*()_+-=<>?:{|,.:;'"}1234567890]/.test(pass.value);

        //validation 3: check if password is secure - DONE
        if(pass.value === ''){
            messagePass.textContent = '';
            return;
        }

        if(pass.value.length < 8){
            messagePass.textContent = '❌ Password should contain atleast 8 characters.';
            messagePass.style.fontSize = '12px';
            messagePass.style.marginLeft = '10px';
        }
        else if(hasUpperCase && hasLowerCase && hasSpecialChar){
            messagePass.textContent = '✅ Password is now secure.';
            messagePass.style.fontSize = '12px';
            messagePass.style.marginLeft = '10px';
        }
        else {
            messagePass.textContent = '❌ Password should include uppercase, lowercase, numbers, and special characters';
            messagePass.style.fontSize = '9px';
            messagePass.style.marginLeft = '10px';
        }
    });

    // show/hide password button - DONE
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('hide');

    togglePassword.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');   
    });

    //add staff account - DONE
    document.getElementById('addStaffForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const contactno = document.getElementById('contactno').value;
        const role = document.getElementById('role').value;
        const staff_username = document.getElementById('username').value;
        const staff_password = document.getElementById('password').value;

        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('contactno', contactno);
        formData.append('role', role);
        formData.append('username', staff_username);
        formData.append('password', staff_password);

        fetch("../controllers/staff.php?action=createAcc", {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Account created successfully.",
                    showConfirmButton: false,
                    timer: 1500
                });

                displayStaffAccounts();

                document.getElementById('addStaffForm').reset();
                document.getElementById('validationMessage').textContent = '';
                document.getElementById('validationPass').textContent = '';
            }
            else {
                console.log("⚠️ " + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    let rowStaff = [];

    //display staff accounts - DONE
    function displayStaffAccounts(){
        fetch("../controllers/staff.php?action=accounts", {
            method: 'GET'
        })
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById('staffTable').querySelector('tbody');
            tableBody.innerHTML = '';
            rowStaff = data;
            if(rowStaff.length === 0){
                tableBody = `<tr><td colspan="4">No record found.</td></tr>`;
                return;
            }
            
            rowStaff.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${row.staffFullname}</td>
                                <td>${row.staffRole}</td>
                                <td>
                                    <button class="edit-btn" data-id="${row.staffID}">Edit</button>
                                    <button class="delete-btn" data-id="${row.staffID}">Delete</button>
                                </td>`;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error:', error));
    }
    displayStaffAccounts();
    

    //edit staff accounts - DONE
    const table = document.getElementById('staffTable');
    const form = document.getElementById('editForm');

    const editModal = document.getElementById('editaccModal');
    const deleteModal = document.getElementById('deleteaccModal');
    const cancelDeleteBtn = document.querySelector('.canceldelete-btn');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.querySelector('.cancelbtn');
    const saveBtn = document.querySelector('.savebtn');

    const fullnameInput = document.getElementById('editFullname');
    const contactnoInput = document.getElementById('editContact');
    const usernameInput = document.getElementById('editUsername');
    const roleInput = document.getElementById('editRole');
    const passInput = document.getElementById('editPassword');
    const passConfirm = document.getElementById('confirmPassword');
    
    
    table.addEventListener('click', function(e) {
      if (e.target.classList.contains('edit-btn')) {
        editModal.classList.add('active');
      }
      else if (e.target.classList.contains('delete-btn')) {
        deleteModal.classList.add('active');
      }
    });

    cancelBtn.addEventListener('click', () => {
      editModal.classList.remove('active');
    });

    editModal.addEventListener('click', function(e) {
      if (e.target === editModal) {
        editModal.classList.remove('active');
      }
    });
    
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.remove('active');
    });

    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) {
        deleteModal.classList.remove('active');
      }
    });

    let currentUserId = null;
    fetch('../controllers/islogin.php')
    .then(res => res.json())
    .then(data => {
        currentUserId = data.staff_id;
    })
    .catch(err => console.error('Error fetching session:', err));

    //retrieve data to editForm - DONE
    const tableBody = document.querySelector('#staffTable tbody');
    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;

            const res = await fetch(`../controllers/staff.php?action=staffinfos&staffID=${encodeURIComponent(id)}`);
            const data = await res.json();

            data.forEach(row => {
                document.getElementById('staffID').value = row.staffID;
                fullnameInput.value = row.staffFullname;
                contactnoInput.value = row.contactNumber;
                usernameInput.value = row.staffUsername;
                roleInput.value = row.staffRole;
                // id.value = row.id;

                fullnameInput.dataset.original = row.staffFullname;
                contactnoInput.dataset.original = row.contactNumber;
                usernameInput.dataset.original = row.staffUsername;
                roleInput.dataset.original = row.staffRole;
                passInput.dataset.original = '';
                passConfirm.dataset.original = '';
            });

            saveBtn.disabled = true;

            //condition: if there is no changes, the save button is disabled, else enable. - DONE
            function checkforChanges() {
                const inputs = [fullnameInput, contactnoInput, usernameInput, roleInput, passInput, passConfirm];
                const requiredInputs = [fullnameInput, contactnoInput, usernameInput, roleInput];

                const hasChanged = inputs.some(input => {
                    return input.value.trim() !== (input.dataset.original || '').trim();
                });

                const hasEmptyField = requiredInputs.some(input => input.value.trim() === '');

                saveBtn.disabled = !hasChanged || hasEmptyField;
            }


            [fullnameInput, contactnoInput, usernameInput, roleInput, passInput, passConfirm].forEach(input => {
                input.addEventListener('input', checkforChanges);
                input.addEventListener('change', checkforChanges);
            })

            document.getElementById('editaccModal').classList.add('active');
        }
        //delete staff accounts
        else if(e.target.classList.contains('delete-btn')){
            const id = e.target.dataset.id;

            confirmDeleteBtn.addEventListener('click', () => {
                const formData = new FormData();
                formData.append('staff_id', id);

                fetch('../controllers/staff.php?action=deleteAcc', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data =>{
                    if(data.success){
                        if(parseInt(id) === parseInt(currentUserId)){
                            fetch('../controllers/logout.php')
                            window.location.href = "login.php";
                        }
                        else {
                            document.getElementById('deleteaccModal').classList.remove('active');
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: "Account successfully deleted.",
                                showConfirmButton: false,
                                timer: 1500
                            });
                        displayStaffAccounts();
                        }
                        
                    }
                    else{
                        console.log("⚠️ " + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    });

    //edit staff account
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        //To Do: ayusin ang staff ID
            const id = document.getElementById('staffID').value;
            const formData = new FormData();
            formData.append('staff_id', id);
            formData.append('newFullname', fullnameInput.value);
            formData.append('newUsername', usernameInput.value);
            formData.append('newContactno', contactnoInput.value);
            formData.append('newRole', roleInput.value);
            

            if(passInput.value !== passConfirm.value){
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Confirm your password correctly.",
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }
            else {
                formData.append('newPassword', passConfirm.value);
            }
        
            fetch("../controllers/staff.php?action=editAcc", {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if(data.success){
                    Swal.fire({
                        title: "Success!",
                        text: "Save changes.",
                        icon: "success"
                    });;
                    displayStaffAccounts();
                }
                else{
                    console.log("⚠️ " + data.message);
                }
            })
            .catch(error => console.error('Error:', error));

            editModal.classList.remove('active');
    });
    
    //filter and search staff
    const searchBox = document.getElementById('searchInput');
    const filterRole = document.getElementById('filterStaff');
    let debounceTimer;
    function fetchData(){
            const searchVal = searchBox.value.trim();
            const roleVal = filterRole.value;

            fetch(`../controllers/staff.php?action=search&search=${encodeURIComponent(searchVal)}&role=${encodeURIComponent(roleVal)}`)
            .then(res => res.json())
            .then(data => {
                document.querySelector('#staffTable tbody').innerHTML = ''; 

                if (data.length > 0) {
                    data.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${row.staffFullname}</td>
                                    <td>${row.staffRole}</td>
                                    <td>
                                        <button class="edit-btn" data-id="${row.staffID}">Edit</button>
                                        <button class="delete-btn" data-id="${row.staffID}">Delete</button>
                                    </td>`;
                    tableBody.appendChild(tr);
                });
                }
            })
            .catch(err => console.error('Error:', err));
    }

    searchBox.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchData, 300);
    });
    
    filterRole.addEventListener('change', fetchData);

    fetchData();

});
