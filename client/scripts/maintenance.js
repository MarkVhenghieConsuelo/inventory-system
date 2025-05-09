// Active Pages
const links = document.querySelectorAll('.sidebar a');
links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  });
});

let currentPage = 1;
const rowsPerPage = 10;
let allCategory = [];
let originalCategory = [];
let editedCategoryId = null;
const baseURL = 'http://mvc.tryasp.net';

document.addEventListener('DOMContentLoaded', () => {
    loadCategory();
});

function createTable() {
    const tbody = document.querySelector('#category tbody');
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = allCategory.slice(start, end);

    paginatedItems.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', item.category_id);
        row.innerHTML = `
        <td>${item.category_name}</td>
        <td>
            <button class="btn btn-sm btn-warning me-1" onclick="editCategory(${item.category_id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger" onclick="editCategory(${item.category_id})"><i class="bi bi-trash"></i></button>
        </td>
        `;
        tbody.appendChild(row);
    });
}

function createPagination() {
    const pagesContainer = document.querySelector('.pagination .pages');
    pagesContainer.innerHTML = "";

    const pageCount = Math.ceil(allCategory.length / rowsPerPage);
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

function loadCategory() {
    fetch(`${baseURL}/api/Category`)
        .then(res => res.json())
        .then(data => {
            originalCategory = [...data];
            allCategory = [...data];
            createTable();
            createPagination();
        })
        .catch(err => console.error('Error loading Category:', err));
}

// CREATE
document.getElementById('categoryForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('category_name').value.trim();

    if (!name) {
        return Toastify({ text: "Please fill out all fields", backgroundColor: "orange", duration: 3000 }).showToast();
    }

    fetch(`${baseURL}/api/Category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            category_name: name
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to add Category.');
            return res.json();
        })
        .then(() => {
            Toastify({ text: "Category added successfully!", backgroundColor: "green", duration: 3000 }).showToast();
            document.getElementById('categoryForm').reset();
            loadCategory();
        })
        .catch(err => {
            console.error(err);
            Toastify({ text: "Error adding Category", backgroundColor: "red", duration: 3000 }).showToast();
        });
});

// DELETE
function deleteCategory(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseURL}/api/Category/${id}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (!res.ok) throw new Error('Delete failed');
                Toastify({ text: "Category deleted", backgroundColor: "green", duration: 3000 }).showToast();
                loadProducts();
            })
            .catch(err => {
                console.error(err);
                Toastify({ text: "Error deleting Category", backgroundColor: "red", duration: 3000 }).showToast();
            });
        }
    });
}

// EDIT
function editCategory(id) {
    const category = allCategory.find(p => p.category_id === id);
    if (!category) return;

    editedCategoryId = id;
    const modal = document.querySelector('.categoryModal');
    modal.classList.remove('d-none');

    document.getElementById('edit_category_name').value = category.category_name;
}

document.getElementById('editCategoryForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (editedCategoryId === null) return;

    const updatedCategory = {
        category_name: document.getElementById('edit_category_name').value,
    };

    fetch(`${baseURL}/api/Category/${editedCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory)
    })
        .then(res => {
            if (!res.ok) throw new Error('Update failed');
            Toastify({ text: "Category updated", backgroundColor: "green", duration: 2000 }).showToast();
            closeEditModal();
            loadCategory();
        })
        .catch(err => {
            console.error(err);
            Toastify({ text: "Error updating Category", backgroundColor: "red", duration: 2000 }).showToast();
        });
});

function closeEditModal() {
    editedProductId = null;
    document.querySelector('.categoryModal').classList.add('d-none');
}

// FILTER
function applyFilters() {
    const searchValue = document.getElementById('searchCategoryName').value.trim().toLowerCase();

    allCategory = originalCategory.filter(item => {
        const matchesName = !searchValue || item.category_name.toLowerCase().includes(searchValue); 
        return matchesName;
    });

    currentPage = 1;
    createTable();
    createPagination();
}

document.getElementById('filterProductBtn').addEventListener('click', applyFilters);
document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('searchCategoryName').value = '';
    allCategory = [...originalCategory];
    currentPage = 1;
    createTable();
    createPagination();
});
document.getElementById('refreshCat').addEventListener('click', () => {
    loadCategory();
});
