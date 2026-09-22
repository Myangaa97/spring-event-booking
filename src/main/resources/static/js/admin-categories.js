/* Admin - Manage Categories JS (REST API) */

let categories = [];

const $ = s => document.querySelector(s);

function renderTable() {
    const tb = $("#categoriesTableBody"), em = $("#emptyTable");
    tb.innerHTML = "";
    if (!categories.length) { em.classList.remove("hidden"); return; }
    em.classList.add("hidden");

    categories.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: var(--gray-500);">#${c.id}</td>
            <td><span class="badge badge-yellow">${c.name}</span></td>
            <td style="text-align: right; white-space: nowrap;">
                <button onclick='editCategory(${JSON.stringify(c.id)}, ${JSON.stringify(c.name)})' class="btn btn-secondary btn-sm">Edit</button>
                <button onclick='deleteCategory(${JSON.stringify(c.id)})' class="btn btn-danger btn-sm">Delete</button>
            </td>`;
        tb.appendChild(tr);
    });
}

function showForm() {
    $("#formSection").classList.remove("hidden");
    $("#formTitle").textContent = "New Category";
    $("#fName").focus();
}

function hideForm() {
    $("#formSection").classList.add("hidden");
    $("#categoryForm").reset();
    $("#editId").value = "";
}

function editCategory(id, name) {
    showForm();
    $("#formTitle").textContent = "Edit Category";
    $("#editId").value = id;
    $("#fName").value = name;
}

async function saveCategory(e) {
    e.preventDefault();
    const id = $("#editId").value;
    const data = { name: $("#fName").value };

    const url = id ? "/api/admin/categories/" + id : "/api/admin/categories";
    const method = id ? "PUT" : "POST";
    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            hideForm();
            await load();
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.message || "Save failed");
        }
    } catch (err) {
        console.error(err);
        alert("Save failed");
    }
}

async function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    try {
        const res = await fetch("/api/admin/categories/" + id, { method: "DELETE" });
        if (res.ok) await load();
        else {
            const err = await res.json().catch(() => ({}));
            alert(err.message || "Delete failed (category may be in use)");
        }
    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
}

async function load() {
    try {
        const res = await fetch("/api/admin/categories");
        categories = await res.json();
        renderTable();
    } catch (err) {
        console.error("Failed to load:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    $("#categoryForm").addEventListener("submit", saveCategory);
    load();
});
