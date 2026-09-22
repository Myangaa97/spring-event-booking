/* ========================================
   KiloE - Landing Page Logic (REST API)
   ======================================== */

// ---------- STATE ----------

let events = [];
let venues = [];
let activeCategory = "all";
let searchQuery = "";


// ---------- DOM HELPERS ----------

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function formatPrice(price) {
    return Number(price).toLocaleString("mn-MN") + " ₮";
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const months = ["1", "2", "3", "4", "5", "6",
                    "7", "8", "9", "10", "11", "12"];
    return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
}

function ticketPercentage(event) {
    return Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);
}

function ticketStatusClass(event) {
    const pct = ticketPercentage(event);
    if (pct >= 90) return "badge badge-red";
    if (pct >= 70) return "badge badge-orange";
    return "badge badge-green";
}


// ---------- RENDER CATEGORY BUTTONS ----------

function renderCategories() {
    const container = $("#categoryFilters");
    // "All" товч нь HTML-д байгаа, зөвхөн category-уудыг нэмнэ
    const categoryIds = new Set(events.map(ev => ev.category?.id));
    events.forEach(ev => {
        if (!categoryIds.has(ev.category?.id) || !ev.category) return;
        categoryIds.delete(ev.category.id);
        const btn = document.createElement("button");
        btn.dataset.category = ev.category.id;
        btn.className = "chip";
        btn.textContent = ev.category.name;
        container.appendChild(btn);
    });
}


// ---------- RENDER EVENTS ----------

function getFilteredEvents() {
    return events.filter(ev => {
        const matchCategory = activeCategory === "all" || String(ev.category?.id) === String(activeCategory);
        const matchSearch = searchQuery === "" ||
            ev.title.toLowerCase().includes(searchQuery) ||
            (ev.description || "").toLowerCase().includes(searchQuery) ||
            ev.venue.name.toLowerCase().includes(searchQuery);
        return matchCategory && matchSearch;
    });
}

function renderEvents() {
    const grid = $("#eventsGrid");
    const empty = $("#emptyState");
    const filtered = getFilteredEvents();

    grid.innerHTML = "";

    if (filtered.length === 0) {
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    filtered.forEach(ev => {
        const statusText = ev.availableTickets <= 0 ? "Sold out" :
                           ev.availableTickets <= 50 ? "Only a few left!" : `${ev.availableTickets} tickets left`;

        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-card-image">
                <img src="${ev.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop'}" alt="${ev.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop'">
                <div class="image-badge-top">
                    <span class="badge badge-white">${ev.category.name}</span>
                </div>
                <div class="image-badge-bottom">
                    <span class="${ticketStatusClass(ev)}">${statusText}</span>
                </div>
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
                        <span>${ev.venue.name}</span>
                    </div>
                </div>
                <div class="event-card-footer">
                    <div>
                        <p class="price">${formatPrice(ev.ticketPrice)}</p>
                        <p class="price-note">per ticket</p>
                    </div>
                    <button class="btn btn-primary btn-sm" style="padding: 10px 20px;" data-id="${ev.id}">
                        Details
                    </button>
                </div>
            </div>
        `;
        card.addEventListener("click", () => openModal(ev.id));
        grid.appendChild(card);
    });
}


// ---------- VENUES ----------

function renderVenues() {
    const grid = $("#venuesGrid");
    grid.innerHTML = "";
    venues.forEach(v => {
        const card = document.createElement("div");
        card.className = "venue-card";
        card.innerHTML = `
            <div class="venue-card-inner">
                <div class="venue-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div>
                    <h3 class="venue-name">${v.name}</h3>
                    <p class="venue-address">${v.address}</p>
                    <div class="venue-capacity">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>${Number(v.capacity).toLocaleString()} capacity</span>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}


// ---------- MODAL ----------

function openModal(eventId) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    const sold = ticketPercentage(ev);
    const canBook = ev.availableTickets > 0;

    const content = `
        <img src="${ev.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop'}" alt="${ev.title}" class="modal-image"
             onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop'">
        <div class="modal-body">
            <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                <span class="badge badge-yellow">${ev.category.name}</span>
                <span class="${ticketStatusClass(ev)}">${ev.availableTickets} tickets left</span>
            </div>
            <h2 class="modal-title">${ev.title}</h2>
            <p style="color: var(--gray-600); line-height: 1.6; margin-bottom: 20px;">${ev.description || ""}</p>

            <div class="two-col" style="margin-bottom: 24px;">
                <div class="info-box">
                    <p class="info-label">Date / Time</p>
                    <p class="info-value">${formatDate(ev.eventDate)}</p>
                    <p class="info-sub">${ev.startTime}</p>
                </div>
                <div class="info-box">
                    <p class="info-label">Venue</p>
                    <p class="info-value">${ev.venue.name}</p>
                    <p class="info-sub">${ev.venue.address}</p>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <div class="progress-meta">
                    <span>Tickets sold</span>
                    <span style="font-weight: 700;">${sold}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${sold}%"></div>
                </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--gray-100);">
                <div>
                    <p class="total-price">${formatPrice(ev.ticketPrice)}</p>
                    <p class="price-note">per ticket</p>
                </div>
                ${canBook
                    ? `<a href="/events/${ev.id}" class="btn btn-accent" style="padding: 12px 32px;">Book Now</a>`
                    : `<button disabled class="btn" style="padding: 12px 32px;">Sold Out</button>`
                }
            </div>
        </div>
    `;

    $("#modalContent").innerHTML = content;
    $("#eventModal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    $("#eventModal").classList.add("hidden");
    document.body.style.overflow = "";
}


// ---------- STATS COUNTER ANIMATION ----------

function animateStats(elId, target) {
    const el = $(elId);
    if (!el) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current.toLocaleString("mn-MN") + "+";
    }, 30);
}


// ---------- EVENT LISTENERS ----------

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [eventsRes, venuesRes] = await Promise.all([
            fetch("/api/public/events"),
            fetch("/api/public/venues"),
        ]);
        events = await eventsRes.json();
        venues = await venuesRes.json();
    } catch (err) {
        console.error("Failed to load data:", err);
    }

    renderCategories();
    renderEvents();
    renderVenues();

    animateStats("#statEvents", events.filter(e => e.published).length);
    animateStats("#statVenues", venues.length);

    // Category filter
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#categoryFilters .chip");
        if (!btn) return;
        $$("#categoryFilters .chip").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.category;
        renderEvents();
    });

    // Search
    const searchInput = $("#searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderEvents();
        });
    }

    // Modal
    $("#modalOverlay").addEventListener("click", closeModal);
    $("#modalClose").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
});
