const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove 'active' from all nav items
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Hide all pages
        pages.forEach(page => page.classList.remove('active-page'));

        // Show clicked page
        const targetPage = document.getElementById(item.dataset.page);
        targetPage.classList.add('active-page');
    });
});

// Dashboard
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = document.querySelector('.main-content');
  if (!dashboard) return;

  const tabButtons = dashboard.querySelectorAll('.tab-btn');
  const mainHeader = dashboard.querySelector('.main-header h1');
  const printButton = dashboard.querySelector('.print-summary-btn');

  function switchTab(tabName) {
    if (!tabButtons.length) return;

    tabButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', isActive);
    });

    if (mainHeader) {
      const formatted =
        tabName.charAt(0).toUpperCase() + tabName.slice(1) + ' Dashboard';
      mainHeader.textContent = formatted;
    }

    console.log("Switched to the '${tabName}' tab.");
  }

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
      });
    });

    const defaultTab = tabButtons[0].getAttribute('data-tab');
    switchTab(defaultTab);
  }

  if (printButton) {
    printButton.addEventListener('click', e => {
      e.stopPropagation();
      alert('Printing summary... (In a real app, this would trigger print logic)');
    });
  }
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
