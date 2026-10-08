/* ==========================================================================
   TINTA APP - ARQUITECTURA UNIFICADA (INVENTARIO, MONTECARLO Y DASHBOARD)
   ========================================================================== */

// 1. ESTADO GLOBAL DE LA APLICACIÓN
const state = {
    // Zona A (Inventario / lista_aparatos)
    inventory: [
        { id: "inv_1", name: "Refrigerador No Frost", category: "Línea Blanca", power: 180, minHours: 24, maxHours: 24, icon: "🧊" },
        { id: "inv_2", name: "Aire Acondicionado 12000 BTU", category: "Climatización", power: 1200, minHours: 4, maxHours: 8, icon: "❄️" },
        { id: "inv_3", name: "Smart TV 55\"", category: "Entretenimiento", power: 110, minHours: 3, maxHours: 6, icon: "📺" },
        { id: "inv_4", name: "Foco LED 10W", category: "Iluminación", power: 10, minHours: 5, maxHours: 8, icon: "💡" },
        { id: "inv_5", name: "Laptop Gamer", category: "Informática", power: 230, minHours: 2, maxHours: 7, icon: "💻" }
    ],
    // Zona B (Mi Hogar / lista_aparatos2: dispositivos seleccionados con cantidad)
    homeDevices: [], // Contendrá objetos { instanceId, originalId, name, category, power, minHours, maxHours, icon, quantity, dailyAvg, monthlyAvg }
    uploadedImageBase64: null,
    editingInventoryId: null
};

// Íconos por defecto según categoría
const categoryIcons = {
    "Línea Blanca": "🧺",
    "Climatización": "🌡️",
    "Entretenimiento": "🎮",
    "Iluminación": "💡",
    "Informática": "🖥️"
};

// Helper seguro para asignar texto en el DOM
function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Helper para evitar XSS
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==========================================================================
   INICIALIZACIÓN DE EVENTOS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initImageUpload();
    initForm();
    initSearch();
    initDragAndDrop();
    render();

    // Recalcular dinámicamente si se modifica la tarifa mientras se ven los resultados
    document.getElementById("tariffRate")?.addEventListener("input", () => {
        if (state.homeDevices.length > 0) {
            calcular();
        }
    });
});

/* ==========================================================================
   MANEJO DE FORMULARIO, IMAGEN Y EDICIÓN (ZONA A)
   ========================================================================== */
function initImageUpload() {
    const input = document.getElementById("appIcon");
    if (!input) return;

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
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("appName")?.value.trim();
        const category = document.getElementById("appCategory")?.value;
        const power = parseFloat(document.getElementById("appPower")?.value) || 0;
        const minHours = parseFloat(document.getElementById("appMinHours")?.value) || 0;
        const maxHours = parseFloat(document.getElementById("appMaxHours")?.value) || 0;

        if (minHours > maxHours) {
            alert("El mínimo de horas no puede ser mayor al máximo.");
            return;
        }

        // MODO EDICIÓN
        if (state.editingInventoryId) {
            const item = state.inventory.find(i => i.id === state.editingInventoryId);
            if (item) {
                item.name = name;
                item.category = category;
                item.power = power;
                item.minHours = minHours;
                item.maxHours = maxHours;
                if (state.uploadedImageBase64) item.icon = state.uploadedImageBase64;
            }
            state.editingInventoryId = null;
        } 
        // MODO CREACIÓN
        else {
            const newAppliance = {
                id: "inv_" + Date.now(),
                name,
                category,
                power,
                minHours,
                maxHours,
                icon: state.uploadedImageBase64 || categoryIcons[category] || "⚡"
            };
            state.inventory.push(newAppliance);
        }

        state.uploadedImageBase64 = null;
        form.reset();
        render();
    });
}

function editCard(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    document.getElementById("appName").value = item.name;
    document.getElementById("appCategory").value = item.category;
    document.getElementById("appPower").value = item.power;
    document.getElementById("appMinHours").value = item.minHours;
    document.getElementById("appMaxHours").value = item.maxHours;

    state.editingInventoryId = id;
}

/* ==========================================================================
   BÚSQUEDA Y FILTRADO (ZONA A)
   ========================================================================== */
function initSearch() {
    const searchInput = document.getElementById("inventorySearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll("#zoneA .card");
        cards.forEach(card => {
            const title = card.querySelector(".card-title")?.textContent.toLowerCase() || "";
            card.style.display = title.includes(query) ? "block" : "none";
        });
    });
}

/* ==========================================================================
   GESTIÓN DE ZONA B (lista_aparatos2) Y CANTIDADES
   ========================================================================== */
function addToHome(inventoryId) {
    const invItem = state.inventory.find(i => i.id === inventoryId);
    if (!invItem) return;

    // Buscar si ya existe una copia de este equipo en Zona B
    const existingInHome = state.homeDevices.find(h => h.originalId === inventoryId);

    if (existingInHome) {
        existingInHome.quantity += 1;
    } else {
        state.homeDevices.push({
            instanceId: "home_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            originalId: invItem.id,
            name: invItem.name,
            category: invItem.category,
            power: invItem.power,
            minHours: invItem.minHours,
            maxHours: invItem.maxHours,
            icon: invItem.icon,
            quantity: 1,
            dailyAvg: 0
        });
    }
    render();
}

function updateQuantity(instanceId, delta) {
    const index = state.homeDevices.findIndex(h => h.instanceId === instanceId);
    if (index === -1) return;

    state.homeDevices[index].quantity += delta;

    if (state.homeDevices[index].quantity <= 0) {
        state.homeDevices.splice(index, 1);
    }
    render();
}

function removeFromHome(instanceId) {
    state.homeDevices = state.homeDevices.filter(h => h.instanceId !== instanceId);
    render();
}

/* ==========================================================================
   ARRASTRE Y SOLTADO (DRAG & DROP)
   ========================================================================== */
function initDragAndDrop() {
    const zoneA = document.getElementById("zoneA");
    const zoneB = document.getElementById("zoneB");
    const zones = [zoneA, zoneB].filter(Boolean);

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

            const draggedData = e.dataTransfer.getData("text/plain");
            if (!draggedData) return;

            const [sourceZone, itemId] = draggedData.split(":");

            // Arrastrar de Inventario (Zona A) a Mi Hogar (Zona B)
            if (zone.id === "zoneB" && sourceZone === "zoneA") {
                addToHome(itemId);
            }
            // Arrastrar de Mi Hogar (Zona B) de regreso a Inventario (Zona A) -> Elimina de Zona B
            else if (zone.id === "zoneA" && sourceZone === "zoneB") {
                removeFromHome(itemId);
            }
        });
    });
}

/* ==========================================================================
   RENDERIZADO DE ZONA A Y ZONA B
   ========================================================================== */
function render() {
    const zoneA = document.getElementById("zoneA");
    const zoneB = document.getElementById("zoneB");

    if (zoneA) zoneA.innerHTML = "";
    if (zoneB) zoneB.innerHTML = "";

    let totalPowerHome = 0;
    let countHomeTotalItems = 0;

    // 1. Renderizar Inventario (Zona A)
    state.inventory.forEach(item => {
        const card = createInventoryCard(item);
        if (zoneA) zoneA.appendChild(card);
    });

    // 2. Renderizar Mi Hogar (Zona B - lista_aparatos2)
    state.homeDevices.forEach(item => {
        const card = createHomeCard(item);
        if (zoneB) zoneB.appendChild(card);

        totalPowerHome += (item.power * item.quantity);
        countHomeTotalItems += item.quantity;
    });

    // 3. Actualizar Contadores del DOM
    setElementText("totalCount", state.inventory.length + countHomeTotalItems);
    setElementText("inventoryCount", state.inventory.length);
    setElementText("homeCount", countHomeTotalItems);
    setElementText("homeCountSide", countHomeTotalItems);
    setElementText("powerCount", `${totalPowerHome} W`);
}

function createInventoryCard(item) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;

    card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", `zoneA:${item.id}`);
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });

    const isImage = typeof item.icon === "string" && item.icon.startsWith("data:image");
    const iconHtml = isImage 
        ? `<img src="${item.icon}" class="card-img-preview" alt="icon">` 
        : `<div class="card-img-preview">${item.icon || "⚡"}</div>`;

    card.innerHTML = `
        <div class="card-header">
            ${iconHtml}
            <div>
                <div class="card-title">${escapeHtml(item.name)}</div>
                <div class="card-category">${escapeHtml(item.category)}</div>
            </div>
        </div>
        <div class="card-body-mini">
            <div class="data-point"><span class="data-label">Watts</span><span class="data-value">${item.power}W</span></div>
            <div class="data-point"><span class="data-label">Mín h</span><span class="data-value">${item.minHours}h</span></div>
            <div class="data-point"><span class="data-label">Máx h</span><span class="data-value">${item.maxHours}h</span></div>
        </div>
        <div class="card-actions" style="margin-top: 8px;">
            <button type="button" class="btn-edit" onclick="editCard('${item.id}')">Editar</button>
            <button type="button" class="btn-add" onclick="addToHome('${item.id}')">Agregar +</button>
        </div>
    `;

    return card;
}

function createHomeCard(item) {
    const card = document.createElement("div");
    card.className = "card card-home";
    card.draggable = true;

    card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", `zoneB:${item.instanceId}`);
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });

    const isImage = typeof item.icon === "string" && item.icon.startsWith("data:image");
    const iconHtml = isImage 
        ? `<img src="${item.icon}" class="card-img-preview" alt="icon">` 
        : `<div class="card-img-preview">${item.icon || "⚡"}</div>`;

    card.innerHTML = `
        <div class="card-header">
            ${iconHtml}
            <div>
                <div class="card-title">${escapeHtml(item.name)}</div>
                <div class="card-category">${escapeHtml(item.category)}</div>
            </div>
        </div>
        <div class="card-body-mini">
            <div class="data-point"><span class="data-label">Watts</span><span class="data-value">${item.power}W</span></div>
            <div class="data-point"><span class="data-label">Uso</span><span class="data-value">${item.minHours}-${item.maxHours}h</span></div>
        </div>
        <div class="card-controls" style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
            <button type="button" onclick="updateQuantity('${item.instanceId}', -1)">-1</button>
            <span><strong>Cant: ${item.quantity}</strong></span>
            <button type="button" onclick="updateQuantity('${item.instanceId}', 1)">+1</button>
        </div>
    `;

    return card;
}

/* ==========================================================================
   MOTOR MONTECARLO (lokitoProcess)
   ========================================================================== */
/**
 * Procesa probabilisticamente los dispositivos de state.homeDevices mediante Montecarlo
 */
function lokitoProcess() {
    const ITERACIONES = 10000;
    let totalDailyAvgKwh = 0;

    console.log(`[lokitoProcess] Ejecutando Simulación Montecarlo (${ITERACIONES} iteraciones)...`);

    state.homeDevices.forEach(item => {
        const powerKW = item.power / 1000.0;
        const minH = item.minHours;
        const maxH = item.maxHours;
        const cantidad = item.quantity;

        let sumaSimulada = 0;

        for (let i = 0; i < ITERACIONES; i++) {
            // Muestreo aleatorio uniforme entre minHours y maxHours
            const horasAleatorias = Math.random() * (maxH - minH) + minH;
            sumaSimulada += (powerKW * horasAleatorias * cantidad);
        }

        item.dailyAvg = sumaSimulada / ITERACIONES;
        item.monthlyAvg = item.dailyAvg * 30;
        totalDailyAvgKwh += item.dailyAvg;
    });

    console.log(`[lokitoProcess] Consumo total diario simulado: ${totalDailyAvgKwh.toFixed(2)} kWh/día`);
    return totalDailyAvgKwh;
}

/* ==========================================================================
   CÁLCULOS GENERALES Y DESPLIEGUE DEL PANEL DE RESULTADOS
   ========================================================================== */
function calcular() {
    if (state.homeDevices.length === 0) {
        alert("Arrastra o agrega al menos un dispositivo a 'Mi Hogar' para realizar los cálculos.");
        return;
    }

    // 1. Ejecutar simulación probabilística Montecarlo
    const totalDailyKwh = lokitoProcess();

    // 2. Obtener tarifa eléctrica
    const tariffInput = document.getElementById("tariffRate");
    const rate = tariffInput ? (parseFloat(tariffInput.value) || 0.15) : 0.15;

    let topDevice = null;
    let maxDeviceKwh = 0;
    const categoryTotals = {};

    const tableBody = document.getElementById("detailTableBody");
    if (tableBody) tableBody.innerHTML = "";

    // 3. Procesar desglose por dispositivo y categoría
    state.homeDevices.forEach(device => {
        const dailyKwh = device.dailyAvg;
        const monthlyCost = dailyKwh * 30 * rate;
        const avgHours = (device.minHours + device.maxHours) / 2;

        if (dailyKwh > maxDeviceKwh) {
            maxDeviceKwh = dailyKwh;
            topDevice = device;
        }

        categoryTotals[device.category] = (categoryTotals[device.category] || 0) + dailyKwh;

        // Rellenar filas de la tabla
        if (tableBody) {
            const impact = totalDailyKwh > 0 ? ((dailyKwh / totalDailyKwh) * 100).toFixed(1) : 0;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${escapeHtml(device.name)} ${device.quantity > 1 ? `(x${device.quantity})` : ''}</strong></td>
                <td>${escapeHtml(device.category)}</td>
                <td>${device.power * device.quantity} W</td>
                <td>${avgHours.toFixed(1)} hrs</td>
                <td>${dailyKwh.toFixed(2)} kWh</td>
                <td>$${monthlyCost.toFixed(2)}</td>
                <td><span class="impact-badge">${impact}%</span></td>
            `;
            tableBody.appendChild(row);
        }
    });

    // 4. Actualizar KPIs Principales
    const monthlyCostTotal = totalDailyKwh * 30 * rate;
    const annualCostTotal = totalDailyKwh * 365 * rate;

    setElementText("kpiDailyKwh", `${totalDailyKwh.toFixed(2)} kWh`);
    setElementText("kpiDailyCost", `$${(totalDailyKwh * rate).toFixed(2)} / día`);

    setElementText("kpiMonthlyCost", `$${monthlyCostTotal.toFixed(2)}`);
    setElementText("kpiMonthlyKwh", `${(totalDailyKwh * 30).toFixed(1)} kWh / mes`);

    setElementText("kpiAnnualCost", `$${annualCostTotal.toFixed(2)}`);
    setElementText("kpiAnnualKwh", `${(totalDailyKwh * 365).toFixed(0)} kWh / año`);

    if (topDevice) {
        const topShare = ((maxDeviceKwh / totalDailyKwh) * 100).toFixed(0);
        setElementText("kpiTopDevice", topDevice.name);
        setElementText("kpiTopDeviceShare", `${topShare}% del consumo total`);
    }

    // 5. Renderizar Barras por Categoría
    const barsContainer = document.getElementById("categoryBars");
    if (barsContainer) {
        barsContainer.innerHTML = "";
        Object.keys(categoryTotals).forEach(cat => {
            const kwh = categoryTotals[cat];
            const pct = ((kwh / totalDailyKwh) * 100).toFixed(1);
            barsContainer.innerHTML += `
                <div class="cat-bar-item">
                    <div class="cat-bar-label">
                        <span>${escapeHtml(cat)}</span>
                        <span>${pct}% (${kwh.toFixed(2)} kWh/día)</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        });
    }

    // 6. Generar Eco-Tips Personalizados
    const tipsList = document.getElementById("tipsList");
    if (tipsList) {
        tipsList.innerHTML = "";
        if (topDevice) {
            tipsList.innerHTML += `<li>💡 Su equipo con mayor gasto es <strong>${escapeHtml(topDevice.name)}</strong>. Revisa regularmente su mantenimiento o desconéctalo en horas pico.</li>`;
        }
        if (totalDailyKwh * 30 > 300) {
            tipsList.innerHTML += `<li>⚠️ Su consumo supera los 300 kWh/mes. Considere reemplazar artefactos antiguos por equipos con certificación A+++.</li>`;
        } else {
            tipsList.innerHTML += `<li>🌱 ¡Excelente! Su perfil energético está dentro de los rangos moderados de eficiencia.</li>`;
        }
    }

    // 7. Alternar Vistas del Workspace y Resultados
    const workspaceContent = document.getElementById("workspaceContent");
    const resultsView = document.getElementById("resultsView");
    const sidebar = document.querySelector(".sidebar");

    if (workspaceContent) workspaceContent.classList.add("hidden");
    if (sidebar) sidebar.style.display = "none";
    if (resultsView) {
        resultsView.classList.remove("hidden");
        resultsView.classList.add("visible");
    }
}

function volverAlWorkspace() {
    const workspaceContent = document.getElementById("workspaceContent");
    const resultsView = document.getElementById("resultsView");
    const sidebar = document.querySelector(".sidebar");

    if (resultsView) {
        resultsView.classList.add("hidden");
        resultsView.classList.remove("visible");
    }
    if (workspaceContent) workspaceContent.classList.remove("hidden");
    if (sidebar) sidebar.style.display = "";
}

// Alias para mantener compatibilidad con ambas firmas
function volverAlPanel() {
    volverAlWorkspace();
}