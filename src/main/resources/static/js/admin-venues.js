/* Admin - Manage Venues JS (REST API) */

let venues = [];

const $ = s => document.querySelector(s);

function renderTable() {
    const tb = $("#venuesTableBody"), em = $("#emptyTable");
    tb.innerHTML = "";
    if (!venues.length) { em.classList.remove("hidden"); return; }
    em.classList.add("hidden");

    venues.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><span class="info-value">${v.name}</span></td>
            <td style="color: var(--gray-600); max-width: 320px;">${v.address}</td>
            <td style="font-weight: 700;">${Number(v.capacity).toLocaleString("mn-MN")}</td>
            <td style="text-align: right; white-space: nowrap;">
                <button onclick='editVenue(${JSON.stringify(v.id)})' class="btn btn-secondary btn-sm">Edit</button>
                <button onclick='deleteVenue(${JSON.stringify(v.id)})' class="btn btn-danger btn-sm">Delete</button>
            </td>`;
        tr.dataset.venue = JSON.stringify(v);
        tb.appendChild(tr);
    });
}

function showForm() {
    $("#formSection").classList.remove("hidden");
    $("#fName").focus();
}

function hideForm() {
    $("#formSection").classList.add("hidden");
    $("#venueForm").reset();
    $("#editId").value = "";
}

function editVenue(id) {
    const v = venues.find(x => x.id === id);
    if (!v) return;
    showForm();
    $("#formTitle").textContent = "Edit Venue";
    $("#editId").value = v.id;
    $("#fName").value = v.name;
    $("#fAddress").value = v.address;
    $("#fCapacity").value = v.capacity;
}

async function saveVenue(e) {
    e.preventDefault();
    const id = $("#editId").value;
    const data = {
        name: $("#fName").value,
        address: $("#fAddress").value,
        capacity: Number($("#fCapacity").value)
    };

    const url = id ? "/api/admin/venues/" + id : "/api/admin/venues";
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

async function deleteVenue(id) {
    if (!confirm("Delete this venue?")) return;
    try {
        const res = await fetch("/api/admin/venues/" + id, { method: "DELETE" });
        if (res.ok) await load();
        else {
            const err = await res.json().catch(() => ({}));
            alert(err.message || "Delete failed (venue may be in use)");
        }
    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
}

async function load() {
    try {
        const res = await fetch("/api/admin/venues");
        venues = await res.json();
        renderTable();
    } catch (err) {
        console.error("Failed to load:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    $("#venueForm").addEventListener("submit", saveVenue);
    load();
});
