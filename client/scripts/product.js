// Active Pages
const links = document.querySelectorAll('.sidebar a');
links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  });
});

let allCategory = [];
let currentPage = 1;
const rowsPerPage = 10;
let allProducts = [];
let originalProducts = [];
let editedProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCategories('filterProductCategory');
    loadCategories('product_category_id');
    loadProducts();
});

function createTable() {
    const tbody = document.querySelector('#products tbody');
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = allProducts.slice(start, end);

    paginatedItems.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', item.product_id);
        row.innerHTML = `
        <td>${item.product_name}</td>
        <td>${item.product_category}</td>
        <td>AED ${parseFloat(item.product_price).toFixed(2)}</td>
        <td>${new Date(item.created_at).toLocaleDateString()}</td>
        <td>
            <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${item.product_id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${item.product_id})"><i class="bi bi-trash"></i></button>
        </td>
        `;
        tbody.appendChild(row);
    });
}

function createPagination() {
    const pagesContainer = document.querySelector('.pagination .pages');
    pagesContainer.innerHTML = "";

    const pageCount = Math.ceil(allProducts.length / rowsPerPage);
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

function loadProducts() {
    fetch('https://localhost:7150/api/Product')
        .then(res => res.json())
        .then(data => {
            originalProducts = [...data];
            allProducts = [...data];
            createTable();
            createPagination();
        })
        .catch(err => console.error('Error loading products:', err));
}

function loadCategories(selectElement) {
    fetch('https://localhost:7150/api/Category')
        .then(res => res.json())
        .then(data => {
            allCategory = data;

            const select = document.getElementById(selectElement);
            select.innerHTML = '<option selected disabled>Select a product</option>';

            const defoption = document.createElement('option');
            defoption.value = '';
            defoption.text = 'Please select a category';
            defoption.selected = true;
            select.appendChild(defoption);

            allCategory.forEach(item => {
                const option = document.createElement('option');
                option.value = item.category_id;
                option.textContent = item.category_name;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error loading categories:', err);
        });
}

// CREATE
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('product_name').value.trim();
    const price = parseFloat(document.getElementById('product_price').value);
    const categoryId = document.getElementById('product_category_id').value;

    if (!name || !price || !categoryId) {
        return Toastify({ text: "Please fill out all fields", backgroundColor: "orange", duration: 3000 }).showToast();
    }

    fetch('https://localhost:7150/api/Product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_name: name,
            product_price: price,
            product_category_id: parseInt(categoryId)
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to add product.');
            return res.json();
        })
        .then(() => {
            Toastify({ text: "Product added successfully!", backgroundColor: "green", duration: 3000 }).showToast();
            document.getElementById('productForm').reset();
            loadProducts();
        })
        .catch(err => {
            console.error(err);
            Toastify({ text: "Error adding product", backgroundColor: "red", duration: 3000 }).showToast();
        });
});

// DELETE
function deleteProduct(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`https://localhost:7150/api/Product/${id}`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Delete failed');
                    Toastify({ text: "Product deleted", backgroundColor: "green", duration: 3000 }).showToast();
                    loadProducts();
                })
                .catch(err => {
                    console.error(err);
                    Toastify({ text: "Error deleting product", backgroundColor: "red", duration: 3000 }).showToast();
                });
        }
    });
}

// EDIT
function editProduct(id) {
    const product = allProducts.find(p => p.product_id === id);
    if (!product) return;

    editedProductId = id;
    const modal = document.querySelector('.productModal');
    modal.classList.remove('d-none');

    document.getElementById('edit_product_name').value = product.product_name;
    document.getElementById('edit_product_price').value = product.product_price.toFixed(2);
    const categorySelect = document.getElementById('edit_product_category_id');
    categorySelect.innerHTML = `<option selected disabled>Loading Categories...</option>`;

    allCategory.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.category_id;
        option.textContent = cat.category_name;
        if (cat.category_id === product.product_category_id) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });
}

document.getElementById('editProductForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (editedProductId === null) return;

    const updatedProduct = {
        product_name: document.getElementById('edit_product_name').value,
        product_price: parseFloat(document.getElementById('edit_product_price').value),
        product_category_id: parseInt(document.getElementById('edit_product_category_id').value)
    };

    fetch(`https://localhost:7150/api/Product/${editedProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
    })
        .then(res => {
            if (!res.ok) throw new Error('Update failed');
            Toastify({ text: "Product updated", backgroundColor: "green", duration: 2000 }).showToast();
            closeEditModal();
            loadProducts();
        })
        .catch(err => {
            console.error(err);
            Toastify({ text: "Error updating product", backgroundColor: "red", duration: 2000 }).showToast();
        });
});

function closeEditModal() {
    editedProductId = null;
    document.querySelector('.productModal').classList.add('d-none');
}

// FILTER
function applyFilters() {
    const searchValue = document.getElementById('searchProductName').value.trim().toLowerCase();
    const selectedCategory = document.getElementById('filterProductCategory').value;

    allProducts = originalProducts.filter(product => {
        const matchesName = !searchValue || product.product_name.toLowerCase().includes(searchValue);
        const matchesCategory = !selectedCategory || product.product_category_id.toString() === selectedCategory;
        return matchesName && matchesCategory;
    });

    currentPage = 1;
    createTable();
    createPagination();
}

document.getElementById('filterProductBtn').addEventListener('click', applyFilters);
document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('searchProductName').value = '';
    document.getElementById('filterProductCategory').selectedIndex = 0;
    allProducts = [...originalProducts];
    currentPage = 1;
    createTable();
    createPagination();
});
document.getElementById('refreshProduct').addEventListener('click', () => {
    loadProducts();
});
