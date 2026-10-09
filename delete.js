/* ==========================================================================
   TINTA APP - LÓGICA DE INTERACCIÓN, ARRASTRE Y CÁLCULOS
   ========================================================================== */

// Estado global de la aplicación
const state = {
    appliances: [
        { id: "1", name: "Refrigerador No Frost", category: "Línea Blanca", power: 180, minHours: 24, maxHours: 24, icon: "🧊", zone: "zoneA" },
        { id: "2", name: "Aire Acondicionado 12000 BTU", category: "Climatización", power: 1200, minHours: 4, maxHours: 8, icon: "❄️", zone: "zoneA" },
        { id: "3", name: "Smart TV 55\"", category: "Entretenimiento", power: 110, minHours: 3, maxHours: 6, icon: "📺", zone: "zoneA" },
        { id: "4", name: "Foco LED 10W", category: "Iluminación", power: 10, minHours: 5, maxHours: 8, icon: "💡", zone: "zoneA" },
        { id: "5", name: "Laptop Gamer", category: "Informática", power: 230, minHours: 2, maxHours: 7, icon: "💻", zone: "zoneA" }
    ],
    uploadedImageBase64: null
};

// Íconos por defecto según categoría
const categoryIcons = {
    "Línea Blanca": "🧺",
    "Climatización": "🌡️",
    "Entretenimiento": "🎮",
    "Iluminación": "💡",
    "Informática": "🖥️"
};

// Inicialización cuando carga el DOM
document.addEventListener("DOMContentLoaded", () => {
    initImageUpload();
    initForm();
    initSearch();
    initDragAndDrop();
    render();

    // Evento para actualizar cálculos en tiempo real al cambiar tarifa
    document.getElementById("tariffRate")?.addEventListener("input", () => {
        calcular();
    });
});

/* ==========================================================================
   MANEJO DE IMAGEN Y FORMULARIO
   ========================================================================== */
function initImageUpload() {
    const input = document.getElementById("appIcon");
    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.uploadedImageBase64 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function initForm() {
    const form = document.getElementById("applianceForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("appName").value.trim();
        const category = document.getElementById("appCategory").value;
        const power = parseFloat(document.getElementById("appPower").value);
        const minHours = parseFloat(document.getElementById("appMinHours").value);
        const maxHours = parseFloat(document.getElementById("appMaxHours").value);

        if (minHours > maxHours) {
            alert("El mínimo de horas no puede ser mayor al máximo.");
            return;
        }

        const newAppliance = {
            id: Date.now().toString(),
            name,
            category,
            power,
            minHours,
            maxHours,
            icon: state.uploadedImageBase64 || categoryIcons[category] || "⚡",
            zone: "zoneA"
        };

        state.appliances.push(newAppliance);
        state.uploadedImageBase64 = null;
        form.reset();
        render();
    });
}

/* ==========================================================================
   BÚSQUEDA Y FILTRADO
   ========================================================================== */
function initSearch() {
    const searchInput = document.getElementById("inventorySearch");
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll("#zoneA .card");
        cards.forEach(card => {
            const title = card.querySelector(".card-title").textContent.toLowerCase();
            card.style.display = title.includes(query) ? "block" : "none";
        });
    });
}

/* ==========================================================================
   ARRASTRE Y SOLTADO (DRAG & DROP)
   ========================================================================== */
function initDragAndDrop() {
    const zones = [document.getElementById("zoneA"), document.getElementById("zoneB")];

    zones.forEach(zone => {
        zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            zone.classList.add("drag-over");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("drag-over");
        });

        zone.addEventListener("drop", (e) => {
            e.preventDefault();
            zone.classList.remove("drag-over");
            const id = e.dataTransfer.getData("text/plain");
            const item = state.appliances.find(a => a.id === id);
            if (item) {
                item.zone = zone.id;
                render();
            }
        });
    });
}

/* ==========================================================================
   RENDERIZADO DÍNÁMICO
   ========================================================================== */
function render() {
    const zoneA = document.getElementById("zoneA");
    const zoneB = document.getElementById("zoneB");

    zoneA.innerHTML = "";
    zoneB.innerHTML = "";

    let totalPowerHome = 0;
    let countHome = 0;
    let countInventory = 0;

    state.appliances.forEach(app => {
        const card = createCardElement(app);

        if (app.zone === "zoneA") {
            zoneA.appendChild(card);
            countInventory++;
        } else {
            zoneB.appendChild(card);
            countHome++;
            totalPowerHome += app.power;
        }
    });

    // Actualizar contadores del DOM
    document.getElementById("totalCount").textContent = state.appliances.length;
    document.getElementById("inventoryCount").textContent = countInventory;
    document.getElementById("homeCount").textContent = countHome;
    document.getElementById("homeCountSide").textContent = countHome;
    document.getElementById("powerCount").textContent = `${totalPowerHome} W`;
}

function createCardElement(app) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;

    card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", app.id);
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });

    const isImage = app.icon.startsWith("data:image");
    const iconHtml = isImage 
        ? `<img src="${app.icon}" class="card-img-preview" alt="icon">` 
        : `<div class="card-img-preview">${app.icon}</div>`;

    card.innerHTML = `
        <div class="card-header">
            ${iconHtml}
            <div>
                <div class="card-title">${app.name}</div>
                <div class="card-category">${app.category}</div>
            </div>
        </div>
        <div class="card-body-mini">
            <div class="data-point">
                <span class="data-label">Watts</span>
                <span class="data-value">${app.power}W</span>
            </div>
            <div class="data-point">
                <span class="data-label">Mín h</span>
                <span class="data-value">${app.minHours}h</span>
            </div>
            <div class="data-point">
                <span class="data-label">Máx h</span>
                <span class="data-value">${app.maxHours}h</span>
            </div>
        </div>
    `;

    return card;
}

/* ==========================================================================
   CÁLCULOS Y DESPLIEGUE DEL PANEL DE RESULTADOS
   ========================================================================== */
function calcular() {
    const selectedDevices = state.appliances.filter(a => a.zone === "zoneB");

    if (selectedDevices.length === 0) {
        alert("Arrastra al menos un dispositivo a 'Mi Hogar' para realizar los cálculos.");
        return;
    }

    const rate = parseFloat(document.getElementById("tariffRate").value) || 0.15;

    let totalDailyKwh = 0;
    let topDevice = null;
    let maxDeviceKwh = 0;
    const categoryTotals = {};

    const tableBody = document.getElementById("detailTableBody");
    tableBody.innerHTML = "";

    selectedDevices.forEach(device => {
        const avgHours = (device.minHours + device.maxHours) / 2;
        const dailyKwh = (device.power * avgHours) / 1000;
        const monthlyCost = dailyKwh * 30 * rate;

        totalDailyKwh += dailyKwh;

        if (dailyKwh > maxDeviceKwh) {
            maxDeviceKwh = dailyKwh;
            topDevice = device;
        }

        categoryTotals[device.category] = (categoryTotals[device.category] || 0) + dailyKwh;
    });

    // Rellenar tabla
    selectedDevices.forEach(device => {
        const avgHours = (device.minHours + device.maxHours) / 2;
        const dailyKwh = (device.power * avgHours) / 1000;
        const monthlyCost = dailyKwh * 30 * rate;
        const impact = totalDailyKwh > 0 ? ((dailyKwh / totalDailyKwh) * 100).toFixed(1) : 0;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${device.name}</strong></td>
            <td>${device.category}</td>
            <td>${device.power} W</td>
            <td>${avgHours.toFixed(1)} hrs</td>
            <td>${dailyKwh.toFixed(2)} kWh</td>
            <td>$${monthlyCost.toFixed(2)}</td>
            <td><span class="impact-badge">${impact}%</span></td>
        `;
        tableBody.appendChild(row);
    });

    // Actualizar KPIs
    const monthlyCostTotal = totalDailyKwh * 30 * rate;
    const annualCostTotal = totalDailyKwh * 365 * rate;

    document.getElementById("kpiDailyKwh").textContent = `${totalDailyKwh.toFixed(2)} kWh`;
    document.getElementById("kpiDailyCost").textContent = `$${(totalDailyKwh * rate).toFixed(2)} / día`;

    document.getElementById("kpiMonthlyCost").textContent = `$${monthlyCostTotal.toFixed(2)}`;
    document.getElementById("kpiMonthlyKwh").textContent = `${(totalDailyKwh * 30).toFixed(1)} kWh / mes`;

    document.getElementById("kpiAnnualCost").textContent = `$${annualCostTotal.toFixed(2)}`;
    document.getElementById("kpiAnnualKwh").textContent = `${(totalDailyKwh * 365).toFixed(0)} kWh / año`;

    if (topDevice) {
        const topShare = ((maxDeviceKwh / totalDailyKwh) * 100).toFixed(0);
        document.getElementById("kpiTopDevice").textContent = topDevice.name;
        document.getElementById("kpiTopDeviceShare").textContent = `${topShare}% del consumo total`;
    }

    // Renderizar Barras por Categoría
    const barsContainer = document.getElementById("categoryBars");
    barsContainer.innerHTML = "";
    Object.keys(categoryTotals).forEach(cat => {
        const kwh = categoryTotals[cat];
        const pct = ((kwh / totalDailyKwh) * 100).toFixed(1);
        barsContainer.innerHTML += `
            <div class="cat-bar-item">
                <div class="cat-bar-label">
                    <span>${cat}</span>
                    <span>${pct}% (${kwh.toFixed(2)} kWh/día)</span>
                </div>
                <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    });

    // Eco-Tips personalizados
    const tipsList = document.getElementById("tipsList");
    tipsList.innerHTML = "";
    if (topDevice) {
        tipsList.innerHTML += `<li>💡 Su equipo con mayor gasto es <strong>${topDevice.name}</strong>. Revisa regular su mantenimiento o desconéctalo en horas pico.</li>`;
    }
    if (totalDailyKwh * 30 > 300) {
        tipsList.innerHTML += `<li>⚠️ Su consumo supera los 300 kWh/mes. Considere reemplazar artefactos antiguos por equipos con certificación A+++.</li>`;
    } else {
        tipsList.innerHTML += `<li>🌱 ¡Excelente! Su perfil energético está dentro de los rangos moderados de eficiencia.</li>`;
    }

    // Alternar vistas
    document.getElementById("workspaceContent").classList.add("hidden");
    document.getElementById("resultsView").classList.remove("hidden");
}

function volverAlWorkspace() {
    document.getElementById("resultsView").classList.add("hidden");
    document.getElementById("workspaceContent").classList.remove("hidden");
}