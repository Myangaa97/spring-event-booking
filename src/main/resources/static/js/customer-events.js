/* Customer - Events Listing JS (REST API) */

let events = [];
let activeCategory = "all";
let searchQuery = "";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function formatPrice(p) { return Number(p).toLocaleString("mn-MN") + " ₮"; }
function formatDate(d) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
function ticketPct(e) { return Math.round(((e.totalTickets - e.availableTickets) / e.totalTickets) * 100); }
function statusCls(e) {
    const p = ticketPct(e);
    if (p >= 90) return "badge badge-red";
    if (p >= 70) return "badge badge-orange";
    return "badge badge-green";
}

function renderCategories() {
    const c = $("#categoryFilters");
    const seen = new Set();
    events.forEach(ev => {
        if (!ev.category || seen.has(ev.category.id)) return;
        seen.add(ev.category.id);
        const b = document.createElement("button");
        b.dataset.category = ev.category.id;
        b.className = "chip";
        b.textContent = ev.category.name;
        c.appendChild(b);
    });
}

function renderEvents() {
    const grid = $("#eventsGrid");
    const empty = $("#emptyState");
    const filtered = events.filter(e => {
        const mc = activeCategory === "all" || String(e.category?.id) === String(activeCategory);
        const ms = !searchQuery || e.title.toLowerCase().includes(searchQuery) ||
                   (e.description || "").toLowerCase().includes(searchQuery);
        return mc && ms;
    });
    grid.innerHTML = "";
    if (!filtered.length) { empty.classList.remove("hidden"); return; }
    empty.classList.add("hidden");

    filtered.forEach(ev => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-card-image">
                <img src="${ev.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop'}" alt="${ev.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop'">
                <div class="image-badge-top"><span class="badge badge-white">${ev.category?.name || ""}</span></div>
                <div class="image-badge-bottom"><span class="${statusCls(ev)}">${ev.availableTickets} tickets</span></div>
            </div>
            <div class="event-card-body">
                <h3 class="event-card-title">${ev.title}</h3>
                <div class="event-meta">
                    <div class="event-meta-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span>${formatDate(ev.eventDate)} · ${ev.startTime}</span>
                    </div>
                    <div class="event-meta-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>${ev.venue?.name || ""}</span>
                    </div>
                </div>
                <div class="event-card-footer">
                    <div>
                        <p class="price">${formatPrice(ev.ticketPrice)}</p>
                        <p class="price-note">per ticket</p>
                    </div>
                    <a href="/events/${ev.id}" class="btn btn-primary btn-sm" style="padding: 10px 20px;">Details</a>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

document.addEventListener("click", e => {
    const b = e.target.closest("#categoryFilters .chip");
    if (b) {
        $$("#categoryFilters .chip").forEach(c => c.classList.remove("active"));
        b.classList.add("active");
        activeCategory = b.dataset.category;
        renderEvents();
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/public/events");
        events = await res.json();
    } catch (err) {
        console.error("Failed to load events:", err);
    }
    renderCategories();
    renderEvents();

    $("#searchInput").addEventListener("input", e => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderEvents();
    });
});
