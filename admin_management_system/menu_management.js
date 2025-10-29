document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const menuSearchInput = document.getElementById('menuSearchInput');
    const menuSorter = document.getElementById('menuSorter');
    // Menu Search and Sort Listeners
    if (menuSearchInput) {
        // When searching, re-render the current category
        menuSearchInput.addEventListener('input', () => renderMenuItems(activeCategory));
    }
    if (menuSorter) { 
        // When sorting, re-render the current category
        menuSorter.addEventListener('change', () => renderMenuItems(activeCategory));
    }
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
                renderMenuItems(initialCategory);
            }
        });
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
    };
    window.closeModal = closeModal; 

    const createMenuCard = (item) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.itemId = item.id;
        
        card.innerHTML = `
            <img src="${item.img && item.img !== 'assets/image/placeholder.jpg' ? item.img : 'assets/image/placeholder.jpg'}" alt="${item.name}" class="menu-image">
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
// Helper function for sorting items=
const sortMenuItems = (items, sortBy) => {
    const sortedItems = items.slice(); 

    switch (sortBy) {
        
        // 1. Name (Z-A): ASCENDING
        // Uses the standard localeCompare for Z-A
        case 'name_asc':
            return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            
        // 2. Name (A-Z): DESCENDING
        // Reverses the comparison by swapping a and b
        case 'name_desc':
            return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
            
        // 3. Price (Hign to Low)ss ASCENDING
        // a - b: If a is cheaper, the result is negative, a comes first.
        case 'price_asc':
            return sortedItems.sort((a, b) => a.price - b.price);
            
        // 4. Price (Low to High): DESCENDING
        // b - a: If b is more expensive, the result is positive, b comes first.
        case 'price_desc':
            return sortedItems.sort((a, b) => b.price - a.price);
            
        default:
            // Default sort to Name (A-Z)
            return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }
};


const renderMenuItems = (category) => {
    document.querySelectorAll('.menu-card:not(.add-item)').forEach(card => card.remove());
    
    // Read search and sort values
    const searchTerm = menuSearchInput ? menuSearchInput.value.toLowerCase() : '';
    const sortBy = menuSorter ? menuSorter.value : 'name_asc'; 
    
    activeCategory = category;

    // Filter by Category first
    let filteredItems = menuItems.filter(item => item.category === category);

    // Apply Search Term Filter
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.desc.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply Sorting 
    filteredItems = sortMenuItems(filteredItems, sortBy);

    filteredItems.forEach(item => {
        const card = createMenuCard(item);
        menuGrid.insertBefore(card, addNewItemCard.nextSibling);
    });

    attachCardListeners();
};

    // CATEGORY CAROUSEL LOGIC
    const scrollAmount = 300;

    // Function to handle smooth scrolling with fallback
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
            
            // This call also updates the activeCategory state inside renderMenuItems
            renderMenuItems(category); 

            // Update Add New Card text
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

        // Attach listener for remove buttons
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
        currentIngredients = []; // Reset ingredients for new item
        renderIngredients(); 
        
        itemImagePreview.style.display = 'none';
        imagePlaceholderIcon.style.display = 'block';
        addEditModal.classList.add('active');

        // Set the category dropdown to the currently active category
 
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
        
        // Pre-fill form
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.desc;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;
        
        // Pre-fill ingredients
        currentIngredients = [...item.ingredients];
        renderIngredients();

        // Handle image preview
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
            const reader = new FileReader();
            reader.onload = (e) => {
                itemImagePreview.src = e.target.result;
                itemImagePreview.style.display = 'block';
                imagePlaceholderIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });


    // Handle Add/Edit Form Submission
    menuItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isEditing = itemToManageId !== null;
        const formValues = {
            name: document.getElementById('itemName').value,
            desc: document.getElementById('itemDescription').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            ingredients: currentIngredients, // Save the ingredients list
            img: itemImagePreview.src, // Simple client-side storage for demo
        };

        if (isEditing) {
            // EDIT Logic
            menuItems = menuItems.map(item => item.id === itemToManageId ? {...item, ...formValues} : item);
            showNotification(`Item "${formValues.name}" successfully updated!`);
        } else {
            // ADD Logic
            const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
            const newItem = {...formValues, id: newId};
            menuItems.push(newItem);
            showNotification(`Item "${formValues.name}" successfully added!`);
        }

        // Call renderMenuItems with the category the item was saved into.
        renderMenuItems(formValues.category);
        
        closeModal('addEditModal');
    });

    // Handle Delete Confirmation
    deleteConfirmBtn.addEventListener('click', () => {
        if (itemToDeleteId !== null) {
            const deletedItem = menuItems.find(item => item.id === itemToDeleteId);
            menuItems = menuItems.filter(item => item.id !== itemToDeleteId);
            
            // Use the category of the deleted item to update the view
            renderMenuItems(deletedItem.category); 
            
            showNotification(`Item "${deletedItem.name}" successfully deleted!`);
        }
        closeModal('deleteModal');
    });
    
    if (document.getElementById('menu').classList.contains('active-page')) {
        renderMenuItems('bento');
    }
});