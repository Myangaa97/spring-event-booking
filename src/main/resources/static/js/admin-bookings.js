/* Admin - Manage Bookings JS (REST API) */

let bookings = [];

const $ = s => document.querySelector(s);

function fmtPrice(p) { return Number(p).toLocaleString("mn-MN") + " ₮"; }

function statusBadge(status) {
    return `<span class="badge status-${status}">${status}</span>`;
}

function renderTable() {
    const s = $("#searchInput").value.toLowerCase();
    const sv = $("#statusFilter").value;
    const f = bookings.filter(b =>
        b.eventTitle.toLowerCase().includes(s) &&
        (sv === "all" || b.status === sv)
    );
    const tb = $("#bookingsTableBody"), em = $("#emptyTable");
    tb.innerHTML = "";
    if (!f.length) { em.classList.remove("hidden"); return; }
    em.classList.add("hidden");

    f.forEach(b => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: var(--gray-500);">KiloE-${1000 + b.id}</td>
            <td><span class="info-value">${b.eventTitle}</span><br>
                <small style="color: var(--gray-400);">${b.categoryName} · ${b.venueName}</small></td>
            <td>${b.ticketQuantity}</td>
            <td style="font-weight: 700;">${fmtPrice(b.total)}</td>
            <td style="color: var(--gray-600);">${b.createdAt}</td>
            <td>${statusBadge(b.status)}</td>
            <td style="text-align: right;">
                <select onchange='updateStatus(${JSON.stringify(b.id)}, this.value)' class="form-control" style="padding: 6px 10px; font-size: 13px; width: auto;">
                    ${["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(st =>
                        `<option value="${st}" ${st === b.status ? "selected" : ""}>${st}</option>`).join("")}
                </select>
            </td>`;
        tb.appendChild(tr);
    });
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(`/api/admin/bookings/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (res.ok) await load();
        else {
            const err = await res.json().catch(() => ({}));
            alert(err.message || "Update failed");
            await load();
        }
    } catch (err) {
        console.error(err);
        alert("Update failed");
    }
}

async function load() {
    try {
        const res = await fetch("/api/admin/bookings");
        if (res.status === 401 || res.status === 403) {
            window.location.href = "/login";
            return;
        }
        bookings = await res.json();
        renderTable();
    } catch (err) {
        console.error("Failed to load:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    $("#searchInput").addEventListener("input", renderTable);
    $("#statusFilter").addEventListener("change", renderTable);
    load();
});
