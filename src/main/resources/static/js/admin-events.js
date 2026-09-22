/* Admin - Manage Events JS (REST API) */

let events = [];
let categories = [];
let venues = [];

const $ = s => document.querySelector(s);

function fmtPrice(p) { return Number(p).toLocaleString("mn-MN") + " ₮"; }

function populateSelects() {
    const cf = $("#categoryFilter"), fc = $("#fCategory"), fv = $("#fVenue");
    categories.forEach(c => {
        cf.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        fc.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
    venues.forEach(v => { fv.innerHTML += `<option value="${v.id}">${v.name}</option>`; });
}

function updateStats() {
    $("#totalCount").textContent = events.length;
    $("#publishedCount").textContent = events.filter(e => e.published).length;
    $("#draftCount").textContent = events.filter(e => !e.published).length;
}

function renderTable() {
    const s = $("#searchInput").value.toLowerCase();
    const cv = $("#categoryFilter").value;
    const f = events.filter(e =>
        e.title.toLowerCase().includes(s) &&
        (cv === "all" || String(e.category?.id) === cv)
    );
    const tb = $("#eventsTableBody"), em = $("#emptyTable");
    tb.innerHTML = "";
    if (!f.length) { em.classList.remove("hidden"); return; }
    em.classList.add("hidden");

    f.forEach(ev => {
        const tr = document.createElement("tr");
        const imgSrc = ev.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=120&fit=crop";
        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${imgSrc}" alt="" style="width: 56px; height: 36px; object-fit: cover; border-radius: 6px; background: var(--gray-100);">
                    <span class="info-value">${ev.title}</span>
                </div>
            </td>
            <td style="color: var(--gray-600);">${ev.eventDate}<br><small style="color: var(--gray-400);">${ev.startTime}</small></td>
            <td>${ev.category ? `<span class="badge badge-yellow">${ev.category.name}</span>` : ""}</td>
            <td style="color: var(--gray-600);">${ev.venue?.name || ""}</td>
            <td style="font-weight: 700;">${fmtPrice(ev.ticketPrice)}</td>
            <td>
                ${ev.availableTickets} / ${ev.totalTickets}
                <div class="progress-track" style="height: 6px; margin-top: 4px;">
                    <div class="progress-fill" style="width:${Math.round(((ev.totalTickets - ev.availableTickets) / ev.totalTickets) * 100)}%"></div>
                </div>
            </td>
            <td>${ev.published
                ? '<span class="badge status-CONFIRMED">Published</span>'
                : '<span class="badge status-PENDING">Draft</span>'}</td>
            <td style="text-align: right; white-space: nowrap;">
                <button onclick='editEvent(${JSON.stringify(ev.id)})' class="btn btn-secondary btn-sm">Edit</button>
                <button onclick='deleteEvent(${JSON.stringify(ev.id)})' class="btn btn-danger btn-sm">Delete</button>
            </td>`;
        tb.appendChild(tr);
    });
    updateStats();
}

function showForm() {
    $("#formSection").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideForm() {
    $("#formSection").classList.add("hidden");
    $("#eventForm").reset();
    $("#editId").value = "";
    setImage("", "");
}

function setImage(url, status) {
    $("#fImageUrl").value = url;
    $("#imagePreview").src = url || "";
    $("#imageStatus").textContent = status || (url ? "" : "No image selected");
}

function editEvent(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    showForm();
    $("#formTitle").textContent = "Edit Event";
    $("#editId").value = ev.id;
    $("#fTitle").value = ev.title;
    $("#fDesc").value = ev.description || "";
    $("#fDate").value = ev.eventDate;
    $("#fTime").value = ev.startTime;
    $("#fCategory").value = ev.category?.id || "";
    $("#fVenue").value = ev.venue?.id || "";
    $("#fPrice").value = ev.ticketPrice;
    $("#fTickets").value = ev.totalTickets;
    $("#fPublished").checked = ev.published;
    setImage(ev.imageUrl || "", "");
    $("#fImage").value = "";
}

async function uploadImage(file) {
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
    }
    setImage("", "Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.url) {
            setImage(body.url, "Uploaded");
        } else {
            setImage("", "");
            alert(body.message || "Upload failed");
        }
    } catch (err) {
        console.error(err);
        setImage("", "");
        alert("Upload failed");
    }
}

async function saveEvent(e) {
    e.preventDefault();
    const id = $("#editId").value;
    const data = {
        title: $("#fTitle").value,
        description: $("#fDesc").value,
        eventDate: $("#fDate").value,
        startTime: $("#fTime").value,
        categoryId: Number($("#fCategory").value),
        venueId: Number($("#fVenue").value),
        ticketPrice: Number($("#fPrice").value),
        totalTickets: Number($("#fTickets").value),
        published: $("#fPublished").checked,
        imageUrl: $("#fImageUrl").value
    };

    const url = id ? "/api/admin/events/" + id : "/api/admin/events";
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

async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    try {
        const res = await fetch("/api/admin/events/" + id, { method: "DELETE" });
        if (res.ok) await load();
        else alert("Delete failed");
    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
}

async function load() {
    try {
        const [eRes, cRes, vRes] = await Promise.all([
            fetch("/api/admin/events"),
            fetch("/api/admin/categories"),
            fetch("/api/admin/venues")
        ]);
        events = await eRes.json();
        categories = await cRes.json();
        venues = await vRes.json();
        populateSelects();
        renderTable();
    } catch (err) {
        console.error("Failed to load:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    $("#eventForm").addEventListener("submit", saveEvent);
    $("#searchInput").addEventListener("input", renderTable);
    $("#categoryFilter").addEventListener("change", renderTable);
    $("#fImage").addEventListener("change", e => {
        if (e.target.files && e.target.files[0]) uploadImage(e.target.files[0]);
    });
    load();
});
