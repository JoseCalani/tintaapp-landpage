
var state = {
    inventory: [
        { id: "inv_1", name: "Refrigerador", category: "Línea Blanca", power: 180, minHours: 24, maxHours: 24, icon: "🧊" },
        { id: "inv_2", name: "Aire Acondicionado", category: "Climatización", power: 1200, minHours: 4, maxHours: 8, icon: "❄️" },
        { id: "inv_3", name: "Smart TV 22\"", category: "Entretenimiento", power: 110, minHours: 3, maxHours: 6, icon: "📺" },
        { id: "inv_4", name: "Foco LED 10W", category: "Iluminación", power: 10, minHours: 5, maxHours: 8, icon: "💡" },
        { id: "inv_5", name: "Laptop Gamer", category: "Informática", power: 230, minHours: 2, maxHours: 7, icon: "💻" }
    ],
   
    
    homeDevices: [],
    uploadedImageBase64: null,
    editingInventoryId: null
};

var categoryIcons = {
    "Línea Blanca": "🧺",
    "Climatización": "🌡️",
    "Entretenimiento": "🎮",
    "Iluminación": "💡",
    "Informática": "🖥️"
};


function setElementText(id, text) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}


function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document.addEventListener("DOMContentLoaded", function() {
    initImageUpload();
    initForm();
    initSearch();
    initDragAndDrop();
    render();

    var tariffInput = document.getElementById("tariffRate");
    if (tariffInput) {
        tariffInput.addEventListener("input", function() {
            if (state.homeDevices.length > 0) {
                calcular();
            }
        });
    }
});


function initImageUpload() {
    var input = document.getElementById("appIcon");
    if (!input) return;

    input.addEventListener("change", function(e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                state.uploadedImageBase64 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function initForm() {
    var form = document.getElementById("applianceForm");
    if (!form) return;

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        var nameEl = document.getElementById("appName");
        var categoryEl = document.getElementById("appCategory");
        var powerEl = document.getElementById("appPower");
        var minHoursEl = document.getElementById("appMinHours");
        var maxHoursEl = document.getElementById("appMaxHours");

        var name = nameEl ? nameEl.value.trim() : "";
        var category = categoryEl ? categoryEl.value : "";
        var power = powerEl ? parseFloat(powerEl.value) || 0 : 0;
        var minHours = minHoursEl ? parseFloat(minHoursEl.value) || 0 : 0;
        var maxHours = maxHoursEl ? parseFloat(maxHoursEl.value) || 0 : 0;

        if (minHours > maxHours) {
            alert("El mínimo de horas no puede ser mayor al máximo.");
            return;
        }

        
        if (state.editingInventoryId) {
            for (var i = 0; i < state.inventory.length; i++) {
                if (state.inventory[i].id === state.editingInventoryId) {
                    state.inventory[i].name = name;
                    state.inventory[i].category = category;
                    state.inventory[i].power = power;
                    state.inventory[i].minHours = minHours;
                    state.inventory[i].maxHours = maxHours;
                    if (state.uploadedImageBase64) {
                        state.inventory[i].icon = state.uploadedImageBase64;
                    }
                    break;
                }
            }
            state.editingInventoryId = null;
        } 
        
        
        else {
            var defaultIcon = categoryIcons[category] || "⚡";
            var newAppliance = {
                id: "inv_" + Date.now(),
                name: name,
                category: category,
                power: power,
                minHours: minHours,
                maxHours: maxHours,
                icon: state.uploadedImageBase64 || defaultIcon
            };
            state.inventory.push(newAppliance);
        }

        state.uploadedImageBase64 = null;
        form.reset();
        render();
    });
}

function editCard(id) {
    var item = null;
    for (var i = 0; i < state.inventory.length; i++) {
        if (state.inventory[i].id === id) {
            item = state.inventory[i];
            break;
        }
    }
    if (!item) return;

    var nameEl = document.getElementById("appName");
    var categoryEl = document.getElementById("appCategory");
    var powerEl = document.getElementById("appPower");
    var minHoursEl = document.getElementById("appMinHours");
    var maxHoursEl = document.getElementById("appMaxHours");

    if (nameEl) nameEl.value = item.name;
    if (categoryEl) categoryEl.value = item.category;
    if (powerEl) powerEl.value = item.power;
    if (minHoursEl) minHoursEl.value = item.minHours;
    if (maxHoursEl) maxHoursEl.value = item.maxHours;

    state.editingInventoryId = id;
}



function initSearch() {
    var searchInput = document.getElementById("inventorySearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", function(e) {
        var query = e.target.value.toLowerCase();
        var cards = document.querySelectorAll("#zoneA .card");
        for (var i = 0; i < cards.length; i++) {
            var titleEl = cards[i].querySelector(".card-title");
            var title = titleEl ? titleEl.textContent.toLowerCase() : "";
            cards[i].style.display = title.indexOf(query) !== -1 ? "block" : "none";
        }
    });
}


function addToHome(inventoryId) {
    var invItem = null;
    for (var i = 0; i < state.inventory.length; i++) {
        if (state.inventory[i].id === inventoryId) {
            invItem = state.inventory[i];
            break;
        }
    }
    if (!invItem) return;

    var existingInHome = null;
    for (var j = 0; j < state.homeDevices.length; j++) {
        if (state.homeDevices[j].originalId === inventoryId) {
            existingInHome = state.homeDevices[j];
            break;
        }
    }

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
    var index = -1;
    for (var i = 0; i < state.homeDevices.length; i++) {
        if (state.homeDevices[i].instanceId === instanceId) {
            index = i;
            break;
        }
    }
    if (index === -1) return;

    state.homeDevices[index].quantity += delta;

    if (state.homeDevices[index].quantity <= 0) {
        state.homeDevices.splice(index, 1);
    }
    render();
}

function removeFromHome(instanceId) {
    var newHomeDevices = [];
    for (var i = 0; i < state.homeDevices.length; i++) {
        if (state.homeDevices[i].instanceId !== instanceId) {
            newHomeDevices.push(state.homeDevices[i]);
        }
    }
    state.homeDevices = newHomeDevices;
    render();
}


function initDragAndDrop() {
    var zoneA = document.getElementById("zoneA");
    var zoneB = document.getElementById("zoneB");
    var zones = [];
    if (zoneA) zones.push(zoneA);
    if (zoneB) zones.push(zoneB);

    for (var i = 0; i < zones.length; i++) {
        (function(zone) {
            zone.addEventListener("dragover", function(e) {
                e.preventDefault();
                zone.classList.add("drag-over");
            });

            zone.addEventListener("dragleave", function() {
                zone.classList.remove("drag-over");
            });

            zone.addEventListener("drop", function(e) {
                e.preventDefault();
                zone.classList.remove("drag-over");

                var draggedData = e.dataTransfer.getData("text/plain");
                if (!draggedData) return;

                var parts = draggedData.split(":");
                var sourceZone = parts[0];
                var itemId = parts[1];

                if (zone.id === "zoneB" && sourceZone === "zoneA") {
                    addToHome(itemId);
                } else if (zone.id === "zoneA" && sourceZone === "zoneB") {
                    removeFromHome(itemId);
                }
            });
        })(zones[i]);
    }
}



function render() {
    var zoneA = document.getElementById("zoneA");
    var zoneB = document.getElementById("zoneB");

    if (zoneA) zoneA.innerHTML = "";
    if (zoneB) zoneB.innerHTML = "";

    var totalPowerHome = 0;
    var countHomeTotalItems = 0;

    // 1. Renderizar Inventario (Zona A)
    for (var i = 0; i < state.inventory.length; i++) {
        var itemA = state.inventory[i];
        var cardA = createInventoryCard(itemA);
        if (zoneA) zoneA.appendChild(cardA);
    }

    // 2. Renderizar Mi Hogar (Zona B)
    for (var j = 0; j < state.homeDevices.length; j++) {
        var itemB = state.homeDevices[j];
        var cardB = createHomeCard(itemB);
        if (zoneB) zoneB.appendChild(cardB);

        totalPowerHome += (itemB.power * itemB.quantity);
        countHomeTotalItems += itemB.quantity;
    }

    // 3. Actualizar Contadores del DOM
    setElementText("totalCount", state.inventory.length + countHomeTotalItems);
    setElementText("inventoryCount", state.inventory.length);
    setElementText("homeCount", countHomeTotalItems);
    setElementText("homeCountSide", countHomeTotalItems);
    setElementText("powerCount", totalPowerHome + " W");
}

function createInventoryCard(item) {
    var card = document.createElement("div");
    card.className = "card";
    card.draggable = true;

    card.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", "zoneA:" + item.id);
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", function() {
        card.classList.remove("dragging");
    });

    var isImage = typeof item.icon === "string" && item.icon.indexOf("data:image") === 0;
    var iconHtml = isImage 
        ? '<img src="' + item.icon + '" class="card-img-preview" alt="icon">' 
        : '<div class="card-img-preview">' + (item.icon || "⚡") + '</div>';

    card.innerHTML = 
        '<div class="card-header">' +
            iconHtml +
            '<div>' +
                '<div class="card-title">' + escapeHtml(item.name) + '</div>' +
                '<div class="card-category">' + escapeHtml(item.category) + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="card-body-mini">' +
            '<div class="data-point"><span class="data-label">Watts</span><span class="data-value">' + item.power + 'W</span></div>' +
            '<div class="data-point"><span class="data-label">Mín h</span><span class="data-value">' + item.minHours + 'h</span></div>' +
            '<div class="data-point"><span class="data-label">Máx h</span><span class="data-value">' + item.maxHours + 'h</span></div>' +
        '</div>' +
        '<div class="card-actions" style="margin-top: 8px;">' +
            '<button type="button" class="btn-edit" onclick="editCard(\'' + item.id + '\')">Editar</button>' +
            '<button type="button" class="btn-add" onclick="addToHome(\'' + item.id + '\')">Agregar +</button>' +
        '</div>';

    return card;
}

function createHomeCard(item) {
    var card = document.createElement("div");
    card.className = "card card-home";
    card.draggable = true;

    card.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", "zoneB:" + item.instanceId);
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", function() {
        card.classList.remove("dragging");
    });

    var isImage = typeof item.icon === "string" && item.icon.indexOf("data:image") === 0;
    var iconHtml = isImage 
        ? '<img src="' + item.icon + '" class="card-img-preview" alt="icon">' 
        : '<div class="card-img-preview">' + (item.icon || "⚡") + '</div>';

    card.innerHTML = 
        '<div class="card-header">' +
            iconHtml +
            '<div>' +
                '<div class="card-title">' + escapeHtml(item.name) + '</div>' +
                '<div class="card-category">' + escapeHtml(item.category) + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="card-body-mini">' +
            '<div class="data-point"><span class="data-label">Watts</span><span class="data-value">' + item.power + 'W</span></div>' +
            '<div class="data-point"><span class="data-label">Uso</span><span class="data-value">' + item.minHours + '-' + item.maxHours + 'h</span></div>' +
        '</div>' +
        '<div class="card-controls" style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">' +
            '<button type="button" onclick="updateQuantity(\'' + item.instanceId + '\', -1)">-1</button>' +
            '<span><strong>Cant: ' + item.quantity + '</strong></span>' +
            '<button type="button" onclick="updateQuantity(\'' + item.instanceId + '\', 1)">+1</button>' +
        '</div>';

    return card;
}
//new montecarlo

function montecarlo() {
    var aparatos = state.homeDevices;
    
    if (!aparatos || aparatos.length === 0) {
        return 0;
    }

    var realConsumptionInput = document.getElementById("realConsumption");
    var CONSUMO_TOTAL_REAL = 20; // Valor por defecto de seguridad
    
    if (realConsumptionInput && realConsumptionInput.value !== "") {
        var parsedValue = parseFloat(realConsumptionInput.value);
        if (!isNaN(parsedValue) && parsedValue > 0) {
            CONSUMO_TOTAL_REAL = parsedValue*1000;
        }
    }
    alert("Consumo total de referencia: " + CONSUMO_TOTAL_REAL + " Wh");
    var ITERACIONES = 50000;       // Número de pruebas masivas (aumentado para garantizar éxito)
    var MARGEN_ERROR = 400;        // Tolerancia en Wh
    var combinacionesExitosas = [];

    // Inicializar contadores de totales por instancia de aparato
    var totales = {};
    for (var i = 0; i < aparatos.length; i++) {
        totales[aparatos[i].instanceId] = 0;
    }

    // Bucle principal de Montecarlo
    for (var i = 0; i < ITERACIONES; i++) {
        var tiemposSimulados = {};
        var consumoSimulado = 0;

        // PASO A: Generar un tiempo aleatorio lógico para cada aparato en esta iteración
        for (var j = 0; j < aparatos.length; j++) {
            var item = aparatos[j];
            var minH = item.minHours;
            var maxH = item.maxHours;
            
            // Horas aleatorias dentro del rango configurado
            var horasAleatorias = Math.random() * (maxH - minH) + minH;
            tiemposSimulados[item.instanceId] = horasAleatorias;
            
            // Consumo en Wh = Horas * Potencia (W) * Cantidad
            consumoSimulado += horasAleatorias * item.power * item.quantity;
        }

        // PASO B: Filtrar si el consumo simulado entra dentro del margen de error del objetivo
        if (Math.abs(consumoSimulado - CONSUMO_TOTAL_REAL) <= MARGEN_ERROR) {
            combinacionesExitosas.push(tiemposSimulados);

            // Acumular los tiempos de las combinaciones exitosas
            for (var j = 0; j < aparatos.length; j++) {
                var id = aparatos[j].instanceId;
                totales[id] = Number(totales[id]) + Number(tiemposSimulados[id]);
            }
        }
    }

    var totalExitos = combinacionesExitosas.length;
    var totalDailyAvgKwh = 0;

    // --- 3. CONSOLIDACIÓN Y MANEJO DE RESULTADOS ---
    if (totalExitos === 0) {
        console.warn("No se encontraron combinaciones válidas con el consumo objetivo de " + CONSUMO_TOTAL_REAL + " Wh. Aplicando promedio base...");
        
        // Fallback de seguridad: si el margen o el objetivo no coinciden con los rangos mínimos/máximos,
        // calculamos un promedio simple para que la app no se quede en cero.
        for (var j = 0; j < aparatos.length; j++) {
            var item = aparatos[j];
            var avgHours = (item.minHours + item.maxHours) / 2;
            item.dailyAvg = (item.power * avgHours * item.quantity) / 1000; // Convertido a kWh
            item.monthlyAvg = item.dailyAvg * 30;
            totalDailyAvgKwh += item.dailyAvg;
        }
        return totalDailyAvgKwh;
    }

    console.log("=== RESULTADOS DE MONTECARLO ===");
    console.log("Combinaciones exitosas encontradas: " + totalExitos.toLocaleString());

    // Calcular las horas promedio óptimas para cada aparato basándose en las combinaciones exitosas
    for (var j = 0; j < aparatos.length; j++) {
        var item = aparatos[j];
        var id = item.instanceId;
        
        var horasPromedio = totales[id] / totalExitos;
        
        // Conversión a kWh diarios: (Potencia W * Horas * Cantidad) / 1000
        item.dailyAvg = (item.power * horasPromedio * item.quantity) / 1000;
        item.monthlyAvg = item.dailyAvg * 30;
        
        totalDailyAvgKwh += item.dailyAvg;
    }

    return totalDailyAvgKwh;
}

// function montecarlo() {
//     var ITERACIONES = 10000;
//     var totalDailyAvgKwh = 0;

//     for (var i = 0; i < state.homeDevices.length; i++) {
//         var item = state.homeDevices[i];
//         var powerKW = item.power / 1000.0;
//         var minH = item.minHours;
//         var maxH = item.maxHours;
//         var cantidad = item.quantity;

//         var sumaSimulada = 0;

//         for (var iter = 0; iter < ITERACIONES; iter++) {
//             var horasAleatorias = Math.random() * (maxH - minH) + minH;
//             sumaSimulada += (powerKW * horasAleatorias * cantidad);
//         }

//         item.dailyAvg = sumaSimulada / ITERACIONES;
//         item.monthlyAvg = item.dailyAvg * 30;
//         totalDailyAvgKwh += item.dailyAvg;
//     }

//     return totalDailyAvgKwh;
// }

function calcular() {
    if (state.homeDevices.length === 0) {
        alert("Arrastra o agrega al menos un dispositivo a 'Mi Hogar' para realizar los cálculos.");
        return;
    }

    var totalDailyKwh = montecarlo();

    var tariffInput = document.getElementById("tariffRate");
    var rate = tariffInput ? (parseFloat(tariffInput.value) || 0.15) : 0.15;

    var topDevice = null;
    var maxDeviceKwh = 0;
    var categoryTotals = {};

    var tableBody = document.getElementById("detailTableBody");
    if (tableBody) tableBody.innerHTML = "";

    for (var i = 0; i < state.homeDevices.length; i++) {
        var device = state.homeDevices[i];
        var dailyKwh = device.dailyAvg;
        var monthlyCost = dailyKwh * 30 * rate;
        var avgHours = (device.minHours + device.maxHours) / 2;

        if (dailyKwh > maxDeviceKwh) {
            maxDeviceKwh = dailyKwh;
            topDevice = device;
        }

        if (!categoryTotals[device.category]) {
            categoryTotals[device.category] = 0;
        }
        categoryTotals[device.category] += dailyKwh;

        if (tableBody) {
            var impact = totalDailyKwh > 0 ? ((dailyKwh / totalDailyKwh) * 100).toFixed(1) : 0;
            var row = document.createElement("tr");
            var nameSuffix = device.quantity > 1 ? " (x" + device.quantity + ")" : "";
            row.innerHTML = 
                '<td><strong>' + escapeHtml(device.name) + nameSuffix + '</strong></td>' +
                '<td>' + escapeHtml(device.category) + '</td>' +
                '<td>' + (device.power * device.quantity) + ' W</td>' +
                '<td>' + avgHours.toFixed(1) + ' hrs</td>' +
                '<td>' + dailyKwh.toFixed(2) + ' kWh</td>' +
                '<td> Bs ' + monthlyCost.toFixed(2) + '</td>' +
                '<td><span class="impact-badge">' + impact + '%</span></td>';
            tableBody.appendChild(row);
        }
    }

    var monthlyCostTotal = totalDailyKwh * 30 * rate;
    var annualCostTotal = totalDailyKwh * 365 * rate;

    setElementText("kpiDailyKwh", totalDailyKwh.toFixed(2) + " kWh");
    setElementText("kpiDailyCost", "Bs " + (totalDailyKwh * rate).toFixed(2) + " / día");

    setElementText("kpiMonthlyCost", "Bs " + monthlyCostTotal.toFixed(2));
    setElementText("kpiMonthlyKwh", (totalDailyKwh * 30).toFixed(1) + " kWh / mes");

    setElementText("kpiAnnualCost", "Bs " + annualCostTotal.toFixed(2));
    setElementText("kpiAnnualKwh", (totalDailyKwh * 365).toFixed(0) + " kWh / año"); //corregir

    if (topDevice) {
        var topShare = ((maxDeviceKwh / totalDailyKwh) * 100).toFixed(0);
        setElementText("kpiTopDevice", topDevice.name);
        setElementText("kpiTopDeviceShare", topShare + "% del consumo total");
    }

    var barsContainer = document.getElementById("categoryBars");
    if (barsContainer) {
        barsContainer.innerHTML = "";
        var categories = Object.keys(categoryTotals);
        for (var j = 0; j < categories.length; j++) {
            var cat = categories[j];
            var kwh = categoryTotals[cat];
            var pct = ((kwh / totalDailyKwh) * 100).toFixed(1);
            barsContainer.innerHTML += 
                '<div class="cat-bar-item">' +
                    '<div class="cat-bar-label">' +
                        '<span>' + escapeHtml(cat) + '</span>' +
                        '<span>' + pct + '% (' + kwh.toFixed(2) + ' kWh/día)</span>' +
                    '</div>' +
                    '<div class="cat-bar-track">' +
                        '<div class="cat-bar-fill" style="width: ' + pct + '%"></div>' +
                    '</div>' +
                '</div>';
        }
    }

    var tipsList = document.getElementById("tipsList");
    if (tipsList) {
        tipsList.innerHTML = "";
        if (topDevice) {
            tipsList.innerHTML += '<li>💡 Su equipo con mayor gasto es <strong>' + escapeHtml(topDevice.name) + '</strong>. Revisa su mantenimiento o desconéctalo en horas pico.</li>';
        }
        if (totalDailyKwh * 30 > 300) {
            tipsList.innerHTML += '<li>⚠️ Su consumo supera los 300 kWh/mes.</li>';
        } else {
            tipsList.innerHTML += '<li>🌱 ¡Excelente! consumo moderado de eficiencia.</li>';
        }
    }

    var workspaceContent = document.getElementById("workspaceContent");
    var resultsView = document.getElementById("resultsView");
    var sidebar = document.querySelector(".sidebar");

    if (workspaceContent) workspaceContent.classList.add("hidden");
    if (sidebar) sidebar.style.display = "none";
    if (resultsView) {
        resultsView.classList.remove("hidden");
        resultsView.classList.add("visible");
    }
}

function volverAlWorkspace() {
    var workspaceContent = document.getElementById("workspaceContent");
    var resultsView = document.getElementById("resultsView");
    var sidebar = document.querySelector(".sidebar");

    if (resultsView) {
        resultsView.classList.add("hidden");
        resultsView.classList.remove("visible");
    }
    if (workspaceContent) workspaceContent.classList.remove("hidden");
    if (sidebar) sidebar.style.display = "";
}

function volverAlPanel() {
    volverAlWorkspace();
}