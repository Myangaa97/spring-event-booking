/* Customer - Event Detail JS (REST API) */

const fmtPrice = p => Number(p).toLocaleString("mn-MN") + " ₮";
const fmtDate = d => {
    const dt = new Date(d);
    const m = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    return `${dt.getFullYear()} ${m[dt.getMonth()]} ${dt.getDate()}`;
};
const pct = e => Math.round(((e.totalTickets - e.availableTickets) / e.totalTickets) * 100);
const scls = e => {
    const p = pct(e);
    if (p >= 90) return "badge badge-red badge-outlined";
    if (p >= 70) return "badge badge-orange";
    return "badge badge-green badge-outlined";
};

const pathParts = window.location.pathname.split("/");
const eventId = pathParts[pathParts.length - 1];

let ev = null;
let ticketQty = 1;

function changeQty(delta) {
    if (!ev) return;
    const max = Math.min(ev.availableTickets, 10);
    ticketQty = Math.max(1, Math.min(max, ticketQty + delta));
    renderDetail();
}

function bookTickets() {
    if (!ev) return;
    if (window.IS_LOGGED_IN !== true) {
        window.location.href = "/login";
        return;
    }
    const modal = document.getElementById("bookingModal");
    const total = ev.ticketPrice * ticketQty;
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal modal-sm" onclick="event.stopPropagation()">
                <button onclick="closeModal()" class="modal-close">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div class="modal-body">
                    <h2 class="modal-title" style="font-size: 20px;">Confirm Booking</h2>
                    <p style="color: var(--gray-500); font-size: 14px; margin-bottom: 20px;">Review your booking details below</p>
                    <div class="info-box" style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Event</span>
                            <span class="info-value">${ev.title}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Date</span>
                            <span class="info-value">${fmtDate(ev.eventDate)} · ${ev.startTime}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Venue</span>
                            <span class="info-value">${ev.venue?.name}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Tickets</span>
                            <span class="info-value">${ticketQty}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Price per ticket</span>
                            <span class="info-value">${fmtPrice(ev.ticketPrice)}</span>
                        </div>
                        <hr style="border: none; border-top: 1px solid var(--gray-200); margin: 8px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                            <span class="info-value">Total</span>
                            <span class="total-price">${fmtPrice(total)}</span>
                        </div>
                    </div>
                    <button onclick="confirmBooking()" class="btn btn-primary btn-block btn-lg" id="confirmBtn">Confirm Booking</button>
                </div>
            </div>
        </div>`;
}

function closeModal(e) {
    if (e && e.target && !e.target.classList.contains("modal-overlay")) return;
    document.getElementById("bookingModal").innerHTML = "";
}

async function confirmBooking() {
    if (!ev) return;
    if (window.IS_LOGGED_IN !== true) {
        window.location.href = "/login";
        return;
    }
    const btn = document.getElementById("confirmBtn");
    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
        const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: ev.id, ticketQuantity: ticketQty })
        });
        const data = await res.json();
        const modal = document.getElementById("bookingModal");

        if (res.ok) {
            const bookingId = data.data ? data.data.id : "";
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal modal-sm">
                        <div class="modal-body text-center">
                            <div class="success-circle">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <h2 class="modal-title" style="font-size: 20px;">Booking Confirmed!</h2>
                            <p style="color: var(--gray-500); font-size: 14px;">Booking ID:
                                <span style="font-weight: 700;">KiloE-${1000 + Number(bookingId)}</span></p>
                            <p style="color: var(--gray-500); font-size: 14px;">Redirecting to your bookings...</p>
                        </div>
                    </div>
                </div>`;
            setTimeout(() => { window.location.href = "/customer/bookings"; }, 1500);
        } else {
            alert(data.message || "Booking failed. Please sign in first.");
            btn.disabled = false;
            btn.textContent = "Confirm Booking";
        }
    } catch (err) {
        console.error(err);
        alert("Booking failed");
        btn.disabled = false;
        btn.textContent = "Confirm Booking";
    }
}

function renderDetail() {
    const container = document.getElementById("eventContainer");
    if (!ev) {
        container.innerHTML = '<p class="empty-state" style="margin:0;">Event not found</p>';
        return;
    }
    const sold = pct(ev);
    const canBook = ev.availableTickets > 0;
    const max = Math.min(ev.availableTickets, 10);
    const total = ev.ticketPrice * ticketQty;
    const fallbackImg = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop';

    document.title = `${ev.title} - KiloE`;
    container.innerHTML = `
        <img src="${ev.imageUrl || fallbackImg}" alt="${ev.title}" style="width: 100%; height: 320px; object-fit: cover;"
             onerror="this.src='${fallbackImg}'">
        <div style="padding: 32px;">
            <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                <span class="badge badge-yellow">${ev.category?.name}</span>
                <span class="${scls(ev)}">${ev.availableTickets} tickets left</span>
            </div>
            <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 16px;">${ev.title}</h1>
            <p style="color: var(--gray-600); font-size: 17px; line-height: 1.7; margin-bottom: 28px;">${ev.description || ""}</p>

            <div class="two-col" style="margin-bottom: 28px;">
                <div class="info-box">
                    <p class="info-label">Date / Time</p>
                    <p class="info-value">${fmtDate(ev.eventDate)}</p>
                    <p class="info-sub">${ev.startTime} цагаас</p>
                </div>
                <div class="info-box">
                    <p class="info-label">Venue</p>
                    <p class="info-value">${ev.venue?.name}</p>
                    <p class="info-sub">${ev.venue?.address}</p>
                </div>
            </div>

            <div style="margin-bottom: 28px;">
                <div class="progress-meta">
                    <span>Tickets sold</span>
                    <span style="font-weight: 700;">${sold}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${sold}%"></div>
                </div>
            </div>

            ${canBook ? `
            <div class="ticket-panel">
                <h3 style="font-weight: 700; margin-bottom: 16px;">Select Tickets</h3>
                <div class="qty-controls">
                    <button onclick="changeQty(-1)" class="qty-btn">-</button>
                    <span class="qty-value">${ticketQty}</span>
                    <button onclick="changeQty(1)" class="qty-btn">+</button>
                    <span style="font-size: 14px; color: var(--gray-400);">Max ${max}</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-top: 16px; border-top: 1px solid var(--gray-100);">
                    <div>
                        <p class="total-price">${fmtPrice(total)}</p>
                        <p class="price-note">${fmtPrice(ev.ticketPrice)} x ${ticketQty}</p>
                    </div>
                </div>
                ${window.IS_LOGGED_IN === true
                    ? '<button onclick="bookTickets()" class="btn btn-accent btn-block btn-lg">Book Now</button>'
                    : '<a href="/login" class="btn btn-accent btn-block btn-lg">Sign In to Book</a>'}
            </div>
            ` : `
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid var(--gray-100);">
                <div>
                    <p class="total-price" style="font-size: 36px;">${fmtPrice(ev.ticketPrice)}</p>
                    <p class="price-note">per ticket</p>
                </div>
                <button disabled class="btn btn-lg">Sold Out</button>
            </div>
            `}
        </div>`;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/public/events/" + eventId);
        if (!res.ok) throw new Error("Not found");
        ev = await res.json();
    } catch (err) {
        console.error("Failed to load event:", err);
    }
    renderDetail();
});
