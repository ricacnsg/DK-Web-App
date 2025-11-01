fetch("../controllers/staff.php", {
  method: "GET",
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {
    if (!data.logged_in) {
      // 🔒 No session → redirect to login page
      window.location.href = "login.php";
    } 
    // else {
    //   // ✅ Session active → continue loading the page
    //   document.getElementById("welcome").textContent =
    //     "Welcome, " + data.staff_username;
    // }
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
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    
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
    const API_BASE = '../controllers/admin_control.php';

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
            const response = await fetch(`${API_BASE}?category=${category}`);
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
            <img src="${item.img}" alt="${item.name}" class="menu-image">
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

    addIngredientBtn.addEventListener('click', () => {
        const ingredientName = newIngredientInput.value.trim();
        if (ingredientName) {
            currentIngredients.push(ingredientName);
            newIngredientInput.value = '';
            renderIngredients();
        }
    });

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
        
        currentIngredients = [...item.ingredients];
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

    // Handle Image Upload Change
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showNotification('Please select a valid image file');
                    return;
                }

                // Validate file size (max 5MB)
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
            ingredients: currentIngredients,
            imageData: itemImagePreview.style.display !== 'none' ? itemImagePreview.src : ''
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

    //INVENTORY MANAGEMENT 
    
});

let items = [];
        let editingIndex = -1;
        let deletingIndex = -1;

        function openModal(index = -1) {
            const modal = document.getElementById('itemModal');
            const modalTitle = document.getElementById('modalTitle');
            
            if (index >= 0) {
                editingIndex = index;
                modalTitle.textContent = 'Edit Item';
                const item = items[index];
                document.getElementById('itemName').value = item.name;
                document.getElementById('itemStocks').value = item.stocks;
                document.getElementById('itemCategory').value = item.category;
                document.getElementById('itemReorder').value = item.reorder;
                document.getElementById('itemCost').value = item.cost;
            } else {
                editingIndex = -1;
                modalTitle.textContent = 'Add Item';
                document.getElementById('itemForm').reset();
            }
            
            modal.style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('itemModal').style.display = 'none';
            document.getElementById('itemForm').reset();
            editingIndex = -1;
        }

        document.getElementById('itemForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const item = {
                name: document.getElementById('itemName').value,
                stocks: document.getElementById('itemStocks').value,
                category: document.getElementById('itemCategory').value,
                reorder: document.getElementById('itemReorder').value,
                cost: parseFloat(document.getElementById('itemCost').value).toFixed(2)
            };

            if (editingIndex >= 0) {
                items[editingIndex] = item;
            } else {
                items.push(item);
            }

            closeModal();
            displayItems();
        });

        function deleteItem(index) {
            deletingIndex = index;
            document.getElementById('deleteModal').style.display = 'flex';
        }

        function closeDeleteModal() {
            document.getElementById('deleteModal').style.display = 'none';
            deletingIndex = -1;
        }

        function confirmDelete() {
            if (deletingIndex >= 0) {
                items.splice(deletingIndex, 1);
                displayItems();
            }
            closeDeleteModal();
        }

        function filterItems() {
            const filterValue = document.getElementById('categoryFilter').value;
            displayItems(filterValue);
        }

        function displayItems(filter = '') {
            const container = document.getElementById('itemsContainer');
            
            let filteredItems = items;
            if (filter) {
                filteredItems = items.filter(item => item.category === filter);
            }

            if (filteredItems.length === 0) {
                container.innerHTML = '<div class="empty-state">No items yet. Click "ADD NEW ITEM" to add your first inventory item.</div>';
                return;
            }

            container.innerHTML = filteredItems.map((item, index) => {
                const actualIndex = items.indexOf(item);
                return `
                    <div class="item-row">
                        <div class="item-cell">Item #${actualIndex + 1}: ${item.name}</div>
                        <div class="item-cell">${item.stocks}</div>
                        <div class="item-cell">${item.category}</div>
                        <div class="item-cell">${item.reorder}</div>
                        <div class="item-cell">₱${item.cost}</div>
                        <div class="actions">
                            <button class="action-btn edit-btn" onclick="openModal(${actualIndex})">
                                <i class="fas fa-pencil"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteItem(${actualIndex})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('itemModal');
            const deleteModal = document.getElementById('deleteModal');
            if (event.target === modal) {
                closeModal();
            }
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        }

        // Initial display
        displayItems();

//Logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutbtn");

  logoutBtn.addEventListener("click", () => {

    fetch("../controllers/customer_logout.php", {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("✅ " + data.message);
          // Option 1: Redirect to login page
          window.location.href = "login.php";
        } else {
          console.log("⚠️ " + data.message);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  });
});
        