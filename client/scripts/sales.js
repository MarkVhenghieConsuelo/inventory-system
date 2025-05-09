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
let allSales = [];
let originalSales = [];
let currentEditSaleId = null;
const baseURL = 'http://mvc.tryasp.net';

document.addEventListener('DOMContentLoaded', () => {
  loadSales();
  loadProducts('sale_product_id');
  loadCategory();
});

function createTable() {
  const tbody = document.querySelector('#sales tbody');
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedItems = allSales.slice(start, end);

  paginatedItems.forEach(item => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', item.sale_id);
    row.innerHTML = `
      <td>${item.sale_product}</td>
      <td>${item.sale_product_category}</td>
      <td>${parseFloat(item.sale_quantity).toFixed(2)}</td>
      <td>${parseFloat(item.sale_price).toFixed(2)}</td>
      <td>${new Date(item.created_at).toLocaleDateString('en-CA')}</td>
      <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editSale(${item.sale_id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteSale(${item.sale_id})"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function createPagination() {
  const pagesContainer = document.querySelector('.pagination .pages');
  pagesContainer.innerHTML = "";

  const pageCount = Math.ceil(allSales.length / rowsPerPage);
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

function loadSales() {
  fetch(`${baseURL}/api/Sales`)
    .then(res => res.json())
    .then(data => {
      originalSales = [...data];
      allSales = [...data];
      createTable();
      createPagination();
    })
    .catch(err => console.error('Error loading Sales:', err));
}

function loadProducts(element) {
  fetch(`${baseURL}/api/Product`)
    .then(res => res.json())
    .then(data => {
      allProducts = data;

      const select = document.getElementById(element);
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
        option.setAttribute('data-price', item.product_price);
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Error loading products:', err);
    });
}

function loadCategory() {
  fetch(`${baseURL}/api/Category`)
    .then(res => res.json())
    .then(data => {
      allCategory = data;

      const select = document.getElementById('filterProductCategory');
      select.innerHTML = '';

      const defoption = document.createElement('option');
      defoption.value = '';
      defoption.text = 'Please select Category';
      defoption.selected = true;
      defoption.disabled = true;
      select.appendChild(defoption);

      allCategory.forEach(item => {
        const option = document.createElement('option');
        option.value = item.category_name;
        option.textContent = item.category_name;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Error loading categories:', err);
    });
}

document.getElementById('sale_quantity').addEventListener('input', function () {
  const select = document.getElementById('sale_product_id');
  const selectedOption = select.options[select.selectedIndex];
  const price = parseFloat(selectedOption.getAttribute('data-price'));
  const qty = parseFloat(this.value);
  document.getElementById('sale_price').value = price * qty;
});

// CREATE
document.getElementById('saleForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const qty = parseFloat(document.getElementById('sale_quantity').value);
  const product = document.getElementById('sale_product_id').value;
  const price = parseFloat(document.getElementById('sale_price').value);

  if (!qty || !product || !price) {
    return Toastify({ text: "Please fill out all fields", backgroundColor: "orange", duration: 3000 }).showToast();
  }

  fetch(`${baseURL}/api/Sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sale_product_id: product,
      sale_quantity: qty,
      sale_price: price
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add Sale.');
      return res.json();
    })
    .then(data => {
      Toastify({ text: "Sale added successfully!", backgroundColor: "green", duration: 3000 }).showToast();
      document.getElementById('saleForm').reset();
      loadSales();
    })
    .catch(err => {
      console.error(err);
      Toastify({ text: "Error adding Sale", backgroundColor: "red", duration: 3000 }).showToast();
    });
});

// DELETE
function deleteSale(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${baseURL}/api/Sales/${id}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          Toastify({ text: "Sale deleted", backgroundColor: "green", duration: 3000 }).showToast();
          loadSales();
        })
        .catch(err => {
          console.error(err);
          Toastify({ text: "Error deleting Sale", backgroundColor: "red", duration: 3000 }).showToast();
        });
    }
  });
}

// EDIT
function editSale(id) {
  const sale = allSales.find(p => p.sale_id === id);
  if (!sale) return;

  currentEditSaleId = id;

  const modal = document.querySelector('.saleModal');
  modal.classList.remove('d-none');

  const productSelect = document.getElementById('edit_sale_product_id');
  productSelect.innerHTML = '';

  allProducts.forEach(item => {
    const option = document.createElement('option');
    option.value = item.product_id;
    option.textContent = item.product_name;
    option.setAttribute('data-price', item.product_price);
    if (item.product_id === sale.sale_product_id) {
      option.selected = true;
    }
    productSelect.appendChild(option);
  });

  document.getElementById('edit_sale_quantity').value = sale.sale_quantity.toFixed(2);
  document.getElementById('edit_sale_price').value = sale.sale_price.toFixed(2);
}

document.getElementById('editSaleForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (currentEditSaleId === null) return;

  const updatedProduct = {
    sale_product_id: parseInt(document.getElementById('edit_sale_product_id').value),
    sale_price: parseFloat(document.getElementById('edit_sale_price').value),
    sale_quantity: parseFloat(document.getElementById('edit_sale_quantity').value)
  };

  fetch(`${baseURL}/api/Sales/${currentEditSaleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct)
  })
    .then(res => {
      if (!res.ok) throw new Error('Update failed');
      Toastify({ text: "Sales updated", backgroundColor: "green", duration: 2000 }).showToast();
      closeEditModal();
      loadSales();
    })
    .catch(err => {
      console.error(err);
      Toastify({ text: "Error updating Sales", backgroundColor: "red", duration: 2000 }).showToast();
    });
});

document.getElementById('edit_sale_quantity').addEventListener('input', function () {
  const select = document.getElementById('edit_sale_product_id');
  const selectedOption = select.options[select.selectedIndex];
  const price = parseFloat(selectedOption.getAttribute('data-price'));
  const qty = parseFloat(this.value);
  document.getElementById('edit_sale_price').value = price * qty;
});

function closeEditModal() {
  document.querySelector('.saleModal').classList.add('d-none');
  currentEditSaleId = null;
}

// FILTER
function applyFilters() {
  const searchValue = document.getElementById('searchProductName').value.trim().toLowerCase();
  const selectedCategory = document.getElementById('filterProductCategory').value;
  const minQty = document.getElementById('filterMinQty').value;
  const maxQty = document.getElementById('filterMaxQty').value;
  const minPrice = document.getElementById('filterMinPrice').value;
  const maxPrice = document.getElementById('filterMaxPrice').value;
  const DateFrom = document.getElementById('filterDateFrom').value;
  const DateTo = document.getElementById('filterDateTo').value;

  allSales = originalSales.filter(item => {
    const matchesName = !searchValue || item.sale_product.toLowerCase().includes(searchValue);
    const matchesCategory = !selectedCategory || item.sale_product_category === selectedCategory;
    const matchesMin = !minQty || item.sale_quantity >= parseFloat(minQty);
    const matchesMax = !maxQty || item.sale_quantity <= parseFloat(maxQty);
    const matchesPriceMin = !minPrice || item.sale_price >= parseFloat(minPrice);
    const matchesPriceMax = !maxPrice || item.sale_price <= parseFloat(maxPrice);
    const matchesDateFrom = !DateFrom || new Date(item.created_at) >= new Date(DateFrom);
    const matchesDateTo = !DateTo || new Date(item.created_at) <= new Date(DateTo);
    return matchesName && matchesCategory && matchesMin && matchesMax && matchesPriceMin && matchesPriceMax && matchesDateFrom && matchesDateTo;
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
  document.getElementById('filterMinPrice').value = '';
  document.getElementById('filterMaxPrice').value = '';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value = '';
  allSales = [...originalSales];
  currentPage = 1;
  createTable();
  createPagination();
});

document.getElementById('refreshSales').addEventListener('click', () => {
  loadSales();
});
