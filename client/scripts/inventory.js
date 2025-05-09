// Active Pages
const links = document.querySelectorAll('.sidebar a');
links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  });
});

let allProducts = [];
let allCategory = [];
let currentPage = 1;
const rowsPerPage = 10;
let allInventory = [];
let originalInventory = [];
const baseURL = 'http://mvc.tryasp.net';

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCategory();
  loadInventory();
});

// Table Rendering
function createTable() {
  const tbody = document.querySelector('#inventory tbody');
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedItems = allInventory.slice(start, end);

  paginatedItems.forEach(item => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', item.inventory_id);
    row.innerHTML = `
      <td>${item.inventory_product}</td>
      <td>${item.inventory_product_category}</td>
      <td>${parseFloat(item.inventory_quantity).toFixed(2)}</td>
      <td>${new Date(item.updated_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editInventory(${item.inventory_id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteInventory(${item.inventory_id})"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function createPagination() {
  const pagesContainer = document.querySelector('.pagination .pages');
  pagesContainer.innerHTML = "";

  const pageCount = Math.ceil(allInventory.length / rowsPerPage);
  const maxVisiblePages = 3;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > pageCount) {
    endPage = pageCount;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.innerText = '<';
    prevBtn.className = 'btn btn-sm btn-outline-secondary m-1';
    prevBtn.addEventListener('click', () => {
      currentPage--;
      createTable();
      createPagination();
    });
    pagesContainer.appendChild(prevBtn);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} m-1`;
    btn.addEventListener('click', () => {
      currentPage = i;
      createTable();
      createPagination();
    });
    pagesContainer.appendChild(btn);
  }

  if (currentPage < pageCount) {
    const nextBtn = document.createElement('button');
    nextBtn.innerText = '>';
    nextBtn.className = 'btn btn-sm btn-outline-secondary m-1';
    nextBtn.addEventListener('click', () => {
      currentPage++;
      createTable();
      createPagination();
    });
    pagesContainer.appendChild(nextBtn);
  }
}

// Data Loaders
function loadInventory() {
  fetch(`${baseURL}/api/Inventory`)
    .then(res => res.json())
    .then(data => {
      originalInventory = [...data];
      allInventory = [...data];
      createTable();
      createPagination();
    })
    .catch(err => console.error('Error loading Inventory:', err));
}

function loadProducts() {
  fetch(`${baseURL}/api/Product`)
    .then(res => res.json())
    .then(data => {
      allProducts = data;

      const select = document.getElementById('inventory_product_id');
      select.innerHTML = '<option selected disabled>Select a product</option>';

      const defoption = document.createElement('option');
      defoption.value = '';
      defoption.text = 'Please select a Product';
      defoption.selected = true;
      select.appendChild(defoption);

      allProducts.forEach(item => {
        const option = document.createElement('option');
        option.value = item.product_id;
        option.textContent = item.product_name;
        select.appendChild(option);
      });
    })
    .catch(err => console.error('Error loading products:', err));
}

function loadCategory() {
  fetch(`${baseURL}/api/Category`)
    .then(res => res.json())
    .then(data => {
      allCategory = data;

      const select = document.getElementById('filterProductCategory');
      select.innerHTML = '<option selected disabled>Select a Category</option>';

      const defoption = document.createElement('option');
      defoption.value = '';
      defoption.text = 'Please select Category';
      defoption.selected = true;
      select.appendChild(defoption);

      allCategory.forEach(item => {
        const option = document.createElement('option');
        option.value = item.category_name;
        option.textContent = item.category_name;
        select.appendChild(option);
      });
    })
    .catch(err => console.error('Error loading categories:', err));
}

// CREATE
document.getElementById('inventoryForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const qty = parseFloat(document.getElementById('inventory_quantity').value);
  const product = document.getElementById('inventory_product_id').value;

  if (!qty || !product) {
    return Toastify({ text: "Please fill out all fields", backgroundColor: "orange", duration: 3000 }).showToast();
  }

  fetch(`${baseURL}/api/Inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inventory_quantity: qty,
      inventory_product_id: product,
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add Inventory.');
      return res.json();
    })
    .then(data => {
      Toastify({ text: "Inventory added successfully!", backgroundColor: "green", duration: 3000 }).showToast();
      document.getElementById('inventoryForm').reset();
      loadInventory();
    })
    .catch(err => {
      console.error(err);
      Toastify({ text: "Error adding Inventory", backgroundColor: "red", duration: 3000 }).showToast();
    });
});

// DELETE
function deleteInventory(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${baseURL}/api/Inventory/${id}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          Toastify({ text: "Inventory deleted", backgroundColor: "green", duration: 3000 }).showToast();
          loadInventory();
        })
        .catch(err => {
          console.error(err);
          Toastify({ text: "Error deleting inventory", backgroundColor: "red", duration: 3000 }).showToast();
        });
    }
  });
}

// EDIT
let currentEditId = null;
const editInventoryForm = document.getElementById('editInventoryForm');

function editInventory(id) {
  const inv = allInventory.find(p => p.inventory_id === id);
  if (!inv) return;

  currentEditId = id;
  const modal = document.querySelector('.inventoryModal');
  modal.classList.remove('d-none');

  const productSelect = document.getElementById('edit_inventory_product_id');
  productSelect.innerHTML = '';

  allProducts.forEach(item => {
    const option = document.createElement('option');
    option.value = item.product_id;
    option.textContent = item.product_name;
    if (item.product_id === inv.inventory_product_id) {
      option.selected = true;
    }
    productSelect.appendChild(option);
  });

  document.getElementById('edit_inventory_quantity').value = inv.inventory_quantity.toFixed(2);
}

editInventoryForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!currentEditId) return;

  const updatedProduct = {
    inventory_product_id: document.getElementById('edit_inventory_product_id').value,
    inventory_quantity: parseFloat(document.getElementById('edit_inventory_quantity').value)
  };

  fetch(`${baseURL}/api/Inventory/${currentEditId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct)
  })
    .then(res => {
      if (!res.ok) throw new Error('Update failed');
      Toastify({ text: "Inventory updated", backgroundColor: "green", duration: 2000 }).showToast();
      closeEditModal();
      loadInventory();
    })
    .catch(err => {
      console.error(err);
      Toastify({ text: "Error updating Inventory", backgroundColor: "red", duration: 2000 }).showToast();
    });
});

function closeEditModal() {
  document.querySelector('.inventoryModal').classList.add('d-none');
  currentEditId = null;
}

// FILTER
function applyFilters() {
  const searchValue = document.getElementById('searchProductName').value.trim().toLowerCase();
  const selectedCategory = document.getElementById('filterProductCategory').value;
  const minQty = document.getElementById('filterMinQty').value;
  const maxQty = document.getElementById('filterMaxQty').value;

  allInventory = originalInventory.filter(item => {
    const matchesName = !searchValue || item.inventory_product.toLowerCase().includes(searchValue);
    const matchesCategory = !selectedCategory || item.inventory_product_category.toString() === selectedCategory;
    const matchesMin = !minQty || item.inventory_quantity >= parseFloat(minQty);
    const matchesMax = !maxQty || item.inventory_quantity <= parseFloat(maxQty);
    return matchesName && matchesCategory && matchesMin && matchesMax;
  });

  currentPage = 1;
  createTable();
  createPagination();
}

document.getElementById('filterProductBtn').addEventListener('click', applyFilters);

document.getElementById('clearFilterBtn').addEventListener('click', () => {
  document.getElementById('searchProductName').value = '';
  document.getElementById('filterProductCategory').selectedIndex = 0;
  document.getElementById('filterMinQty').value = '';
  document.getElementById('filterMaxQty').value = '';
  allInventory = [...originalInventory];
  currentPage = 1;
  createTable();
  createPagination();
});

document.getElementById('refreshInv').addEventListener('click', () => {
  loadInventory();
});
