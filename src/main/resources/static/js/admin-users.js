/* Admin - Manage Users JS (REST API) */

let users = [];

const $ = s => document.querySelector(s);

function renderTable() {
    const tb = $("#usersTableBody"), em = $("#emptyTable");
    const query = $("#searchInput").value.toLowerCase().trim();
    const filtered = users.filter(u =>
        !query ||
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );

    $("#userCount").textContent = filtered.length + " of " + users.length + " users";

    tb.innerHTML = "";
    if (!filtered.length) { em.classList.remove("hidden"); return; }
    em.classList.add("hidden");

    filtered.forEach(u => {
        const isAdmin = u.role === "ROLE_ADMIN";
        const roleBadge = isAdmin
            ? '<span class="badge badge-red">ADMIN</span>'
            : '<span class="badge badge-green">USER</span>';
        const statusBadge = u.enabled
            ? '<span class="badge badge-green">Active</span>'
            : '<span class="badge badge-yellow">Disabled</span>';
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: var(--gray-500);">#${u.id}</td>
            <td><strong>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</strong></td>
            <td>${escapeHtml(u.email)}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>`;
        tb.appendChild(tr);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

async function load() {
    try {
        const res = await fetch("/api/admin/users");
        users = await res.json();
        renderTable();
    } catch (err) {
        console.error("Failed to load:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    $("#searchInput").addEventListener("input", renderTable);
    load();
});
