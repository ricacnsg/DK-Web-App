document.addEventListener('DOMContentLoaded', () => {
    // Common elements
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Page Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => page.classList.remove('active-page'));

            const targetPage = document.getElementById(item.dataset.page);
            if (targetPage) {
                targetPage.classList.add('active-page');
            }

            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 900) {
                toggleSidebar();
            }
        });
    });

    // Sidebar Toggle Function
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Initialize Dashboard
    initDashboard();
    
    // Initialize Menu Management if on menu page
    if (document.getElementById('menu').classList.contains('active-page')) {
        initMenuManagement();
    }
    
    // Initialize Inventory Management if on inventory page
    if (document.getElementById('inventory').classList.contains('active-page')) {
        initInventoryManagement();
    }
});

// Dashboard Functionality
function initDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    const tabButtons = dashboard.querySelectorAll('.tab-btn');
    const mainHeader = dashboard.querySelector('.main-header h1');
    const printButton = dashboard.querySelector('.print-summary-btn');

    function switchTab(tabName) {
        tabButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabName;
            btn.classList.toggle('active', isActive);
        });

        if (mainHeader) {
            const formatted = tabName.charAt(0).toUpperCase() + tabName.slice(1) + ' Dashboard';
            mainHeader.textContent = formatted;
        }
    }

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const tabName = btn.getAttribute('data-tab');
                switchTab(tabName);
            });
        });

        switchTab(tabButtons[0].getAttribute('data-tab'));
    }

    if (printButton) {
        printButton.addEventListener('click', e => {
            e.stopPropagation();
            alert('Printing summary...');
        });
    }
}

// Menu Management Functionality
function initMenuManagement() {
    const menuSearchInput = document.getElementById('menuSearchInput');
    const menuSorter = document.getElementById('menuSorter');
    const menuGrid = document.getElementById('menuGrid');
    const addNewItemCard = document.getElementById('addNewItemCard');
    const addEditModal = document.getElementById('addEditModal');
    const deleteModal = document.getElementById('deleteModal');
    const menuItemForm = document.getElementById('menuItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const deleteItemNameSpan = document.getElementById('deleteItemName');
    const notification = document.getElementById('notification');
    
    const ingredientsList = document.getElementById('ingredientsList');
    const newIngredientInput = document.getElementById('newIngredientInput');
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    
    const imageUpload = document.getElementById('imageUpload');
    const itemImagePreview = document.getElementById('itemImagePreview');
    const imagePlaceholderIcon = document.getElementById('imagePlaceholderIcon');
    
    const categoryListWrapper = document.querySelector('.category-list-wrapper');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let itemToManageId = null;
    let itemToDeleteId = null;
    let currentIngredients = [];
    let menuItems = [];
    let activeCategory = 'bento';

    // Mock data for demonstration
    menuItems = [
        {
            id: 1,
            name: "SPAM SILOG",
            desc: "Classic spam with egg and rice",
            price: 109.00,
            category: "bento",
            ingredients: ["Spam", "Egg", "Rice", "Tomato"],
            img: ""
        },
        {
            id: 2,
            name: "TAPSILOG",
            desc: "Tapa with egg and rice",
            price: 119.00,
            category: "bento",
            ingredients: ["Beef Tapa", "Egg", "Rice", "Atchara"],
            img: ""
        }
    ];

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
        menuItemForm.reset();
        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';
    };
    window.closeModal = closeModal;

    const loadMenuItems = (category) => {
        const filteredItems = menuItems.filter(item => item.category === category);
        renderMenuItems(category, filteredItems);
    };

    const createMenuCard = (item) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.itemId = item.id;
        
        card.innerHTML = `
            <div class="menu-image" style="background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-utensils" style="font-size: 48px; color: #666;"></i>
            </div>
            <div class="menu-name">${item.name}</div>
            <div class="menu-description">${item.desc}</div>
            <div class="menu-price">₱${item.price.toFixed(2)}</div>
            <div class="menu-actions">
                <button class="btn-edit" data-id="${item.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i> Remove</button>
            </div>
        `;
        return card;
    };

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

    const renderMenuItems = (category, items) => {
        document.querySelectorAll('.menu-card:not(.add-item)').forEach(card => card.remove());
        
        const searchTerm = menuSearchInput ? menuSearchInput.value.toLowerCase() : '';
        const sortBy = menuSorter ? menuSorter.value : 'name_asc';
        
        activeCategory = category;

        let filteredItems = items;

        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.desc.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredItems = sortMenuItems(filteredItems, sortBy);

        filteredItems.forEach(item => {
            const card = createMenuCard(item);
            menuGrid.appendChild(card);
        });

        attachCardListeners();
    };

    const scrollAmount = 300;

    const scrollCategories = (direction) => {
        const newScrollLeft = categoryListWrapper.scrollLeft + (direction * scrollAmount);
        categoryListWrapper.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => scrollCategories(-1));
        nextBtn.addEventListener('click', () => scrollCategories(1));
    }

    // Category Filter
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

    // Ingredients Management
    const renderIngredients = () => {
        ingredientsList.innerHTML = '';
        currentIngredients.forEach((ingredient, index) => {
            const item = document.createElement('span');
            item.className = 'ingredient-item';
            item.innerHTML = `
                ${ingredient}
                <button type="button" class="remove-ingredient-btn" data-index="${index}"><i class="fas fa-times"></i></button>
            `;
            ingredientsList.appendChild(item);
        });

        ingredientsList.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                currentIngredients.splice(index, 1);
                renderIngredients();
            });
        });
    };

    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            const ingredientName = newIngredientInput.value.trim();
            if (ingredientName) {
                currentIngredients.push(ingredientName);
                newIngredientInput.value = '';
                renderIngredients();
            }
        });
    }

    // Add New Item
    if (addNewItemCard) {
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
    }

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
        
        currentIngredients = [...item.ingredients];
        renderIngredients();

        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';

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

    // Image Upload
    if (imageUpload) {
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
                reader.readAsDataURL(file);
            }
        });
    }

    // Form Submission
    if (menuItemForm) {
        menuItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isEditing = itemToManageId !== null;
            const formData = {
                name: document.getElementById('itemName').value,
                description: document.getElementById('itemDescription').value,
                price: parseFloat(document.getElementById('itemPrice').value),
                category: document.getElementById('itemCategory').value,
                ingredients: currentIngredients
            };

            if (isEditing) {
                const index = menuItems.findIndex(item => item.id === itemToManageId);
                if (index !== -1) {
                    menuItems[index] = { ...menuItems[index], ...formData };
                    showNotification(`Item "${formData.name}" successfully updated!`);
                }
            } else {
                const newItem = {
                    id: menuItems.length + 1,
                    ...formData,
                    img: ""
                };
                menuItems.push(newItem);
                showNotification(`Item "${formData.name}" successfully added!`);
            }

            closeModal('addEditModal');
            loadMenuItems(formData.category);
        });
    }

    // Delete Confirmation
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', () => {
            if (itemToDeleteId !== null) {
                const deletedItem = menuItems.find(item => item.id === itemToDeleteId);
                const category = deletedItem.category;
                
                menuItems = menuItems.filter(item => item.id !== itemToDeleteId);
                showNotification(`Item "${deletedItem.name}" successfully deleted!`);
                closeModal('deleteModal');
                loadMenuItems(category);
            }
        });
    }

    // Search and Sort
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', () => loadMenuItems(activeCategory));
    }
    if (menuSorter) {
        menuSorter.addEventListener('change', () => loadMenuItems(activeCategory));
    }

    // Initialize
    loadMenuItems('bento');
}

// Inventory Management Functionality
function initInventoryManagement() {
    let inventoryItems = [];
    let editingIndex = -1;

    function openInventoryModal(index = -1) {
        const modal = document.getElementById('inventoryModal');
        const modalTitle = document.getElementById('inventoryModalTitle');
        
        if (index >= 0) {
            editingIndex = index;
            modalTitle.textContent = 'Edit Item';
            const item = inventoryItems[index];
            document.getElementById('inventoryItemName').value = item.name;
            document.getElementById('inventoryItemStocks').value = item.stocks;
            document.getElementById('inventoryItemCategory').value = item.category;
            document.getElementById('inventoryItemReorder').value = item.reorder;
            document.getElementById('inventoryItemCost').value = item.cost;
        } else {
            editingIndex = -1;
            modalTitle.textContent = 'Add Item';
            document.getElementById('inventoryForm').reset();
        }
        
        modal.classList.add('active');
    }
    window.openInventoryModal = openInventoryModal;

    function closeInventoryModal() {
        document.getElementById('inventoryModal').classList.remove('active');
        document.getElementById('inventoryForm').reset();
        editingIndex = -1;
    }
    window.closeInventoryModal = closeInventoryModal;

    document.getElementById('inventoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const item = {
            name: document.getElementById('inventoryItemName').value,
            stocks: document.getElementById('inventoryItemStocks').value,
            category: document.getElementById('inventoryItemCategory').value,
            reorder: document.getElementById('inventoryItemReorder').value,
            cost: parseFloat(document.getElementById('inventoryItemCost').value).toFixed(2)
        };

        if (editingIndex >= 0) {
            inventoryItems[editingIndex] = item;
        } else {
            inventoryItems.push(item);
        }

        closeInventoryModal();
        displayInventoryItems();
    });

    function deleteInventoryItem(index) {
        if (confirm('Are you sure you want to delete this item?')) {
            inventoryItems.splice(index, 1);
            displayInventoryItems();
        }
    }

    function filterInventoryItems() {
        const filterValue = document.getElementById('categoryFilter').value;
        displayInventoryItems(filterValue);
    }
    window.filterInventoryItems = filterInventoryItems;

    function displayInventoryItems(filter = '') {
        const container = document.getElementById('itemsContainer');
        
        let filteredItems = inventoryItems;
        if (filter) {
            filteredItems = inventoryItems.filter(item => item.category === filter);
        }

        if (filteredItems.length === 0) {
            container.innerHTML = '<div class="empty-state">No items yet. Click "ADD NEW ITEM" to add your first inventory item.</div>';
            return;
        }

        container.innerHTML = filteredItems.map((item, index) => {
            const actualIndex = inventoryItems.indexOf(item);
            return `
                <div class="item-row">
                    <div class="item-cell">${item.name}</div>
                    <div class="item-cell">${item.stocks}</div>
                    <div class="item-cell">${item.category}</div>
                    <div class="item-cell">${item.reorder}</div>
                    <div class="item-cell">₱${item.cost}</div>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="openInventoryModal(${actualIndex})">
                            <i class="fas fa-pencil"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteInventoryItem(${actualIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('inventoryModal');
        if (event.target === modal) {
            closeInventoryModal();
        }
    }

    // Initial display
    displayInventoryItems();
}