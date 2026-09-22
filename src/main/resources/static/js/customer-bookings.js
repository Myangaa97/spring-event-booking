/* Customer - My Bookings JS (REST API) */

let bookings = [];
let activeTab = "all";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const fmtPrice = p => Number(p).toLocaleString("mn-MN") + " ₮";

function renderStats() {
    $("#statTotal").textContent = bookings.length;
    $("#statPending").textContent = bookings.filter(b => b.status === "PENDING").length;
    $("#statConfirmed").textContent = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
    $("#statCancelled").textContent = bookings.filter(b => b.status === "CANCELLED").length;

    $$(".tab-filters .chip").forEach(chip => {
        const tab = chip.dataset.tab;
        const count = tab === "all" ? bookings.length :
            bookings.filter(b => b.status === tab).length;
        const label = { all: "All", PENDING: "Pending", CONFIRMED: "Confirmed", CANCELLED: "Cancelled" }[tab];
        chip.textContent = `${label} (${count})`;
    });
}

function statusBadge(status) {
    return `<span class="badge status-${status}">${status}</span>`;
}

function renderBookings() {
    const list = $("#bookingsList");
    const empty = $("#emptyState");
    const filtered = activeTab === "all" ? bookings : bookings.filter(b => b.status === activeTab);

    list.innerHTML = "";
    if (!filtered.length) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");

    filtered.forEach(b => {
        const row = document.createElement("div");
        row.className = "booking-row";
        row.innerHTML = `
            <div class="booking-row-main">
                <p class="booking-row-title">${b.eventTitle}</p>
                <p class="booking-row-sub">${b.eventDate} · ${b.startTime} · ${b.venueName}</p>
                <p class="booking-row-sub">Booking ID: KiloE-${1000 + b.id}</p>
            </div>
            <div class="booking-row-side">
                <span class="booking-row-sub">${b.ticketQuantity} ticket(s)</span>
                <span class="booking-total">${fmtPrice(b.total)}</span>
                ${statusBadge(b.status)}
                <a href="/customer/bookings/${b.id}" class="btn btn-secondary btn-sm">Details</a>
                ${(b.status === "PENDING" || b.status === "CONFIRMED") ?
                    `<button onclick="cancelBooking(${b.id})" class="btn btn-danger btn-sm">Cancel</button>` : ""}
            </div>`;
        list.appendChild(row);
    });
}

async function cancelBooking(id) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
        const res = await fetch("/api/bookings/" + id, { method: "DELETE" });
        if (res.ok) {
            await load();
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.message || "Could not cancel booking");
        }
    } catch (err) {
        console.error(err);
        alert("Could not cancel booking");
    }
}

async function load() {
    try {
        const res = await fetch("/api/bookings");
        if (res.status === 401 || res.status === 403) {
            window.location.href = "/login";
            return;
        }
        bookings = await res.json();
    } catch (err) {
        console.error("Failed to load bookings:", err);
    }
    renderStats();
    renderBookings();
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".tab-filters").addEventListener("click", e => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        $$(".tab-filters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeTab = chip.dataset.tab;
        renderBookings();
    });

    load();
});
