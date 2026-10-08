
        let lista_aparatos = {};
        let lista_aparatos2 = {};
        let aparatos = {};


        function montecarlo() {
            aparatos = lista_aparatos2;
                const CONSUMO_TOTAL_REAL = 1000;
                const ITERACIONES = 20;// 500000;
                const MARGEN_ERROR = 400;    // Tolerancia entre 9900 y 10100 Wh)
                let combinacionesExitosas = [];

                    let totales = {};

                    console.log("totales iniciales:", totales);
                    console.log("aparatos a evaluar>>", aparatos);
                    for (let aparato in aparatos) {
                        totales[aparato] = 0;
                    }
                    console.log("contadores totales inicializados:", totales);

                    for (let i = 0; i < ITERACIONES; i++) {
                        // PASO A: Generar un tiempo aleatorio lógico para cada aparato
                        let tiemposSimulados = {};
                        for (let nombre in aparatos) {
                            let config = aparatos[nombre];
                            tiemposSimulados[nombre] = Math.random() * (config.maxHours - config.minHours) + config.minHours;
                        }
                        let consumoSimulado = 0;
                        for (let nombre in aparatos) {
                            consumoSimulado += tiemposSimulados[nombre] * aparatos[nombre].power;
                            
                        }

                        if (Math.abs(consumoSimulado - CONSUMO_TOTAL_REAL) <= MARGEN_ERROR) {
                            combinacionesExitosas.push(tiemposSimulados);
                            
                            for (let aparato in aparatos) {
                                totales[aparato] = Number(totales[aparato]) + Number(tiemposSimulados[aparato]);
                            }
                        }
                    }

                    // --- 3. CONSOLIDACIÓN Y RESULTADOS ---
                    const totalExitos = combinacionesExitosas.length;

                    if (totalExitos === 0) {
                        console.log("No se encontraron combinaciones válidas. Intenta aumentar el MARGEN_ERROR o revisa si los rangos de horas configurados pueden sumar matemáticamente tu consumo real.");
                        return;
                    }

                    console.log(`\n=== RESULTADOS DE LA SIMULACIÓN DE MONTECARLO ===`);
                    console.log(`Se encontraron ${totalExitos.toLocaleString()} combinaciones válidas de uso diario.`);
                    console.log(`Para un consumo total de: ${CONSUMO_TOTAL_REAL} Wh\n`);
                    console.log(`Tiempo estimado de encendido por aparato:`);

                    let s ="";
                    console.log("totales>>", totales);
                    for (let aparato in aparatos) {
                        // Promediamos el tiempo de todas las soluciones que fueron válidas
                        console.log("aparato>>", totales[aparato],"nombre:", aparato, "totalExitos>>", totalExitos);
                        let horasPromedio = totales[aparato] / totalExitos;
                        
                        // Convertir la parte decimal a minutos para que sea más legible
                        let horasEnteras = Math.floor(horasPromedio);
                        let minutos = Math.round((horasPromedio - horasEnteras) * 60);

                        console.log(`- ${aparato.padEnd(12)}: ~ ${horasEnteras}h ${minutos}m al día.`);
                        s+=`- ${aparato.padEnd(12)}: ~ ${horasEnteras}h ${minutos}m al día.\n`;
                    }
                    alert(s);
                    
                        }

        function calcular(){
            console.log("__________________________________________________");
            console.log("lista:", aparatos);
            console.log("iniciando calculo montecarlo:...");
            montecarlo();
            console.log("__________________________________________________");
            document.querySelector(".sidebar")
            generarDesglose(lista_aparatos2).style.display = "none";

            document.querySelector(".workspace")
                .style.display = "none";

            document.getElementById("resultsView")
                .classList.add("visible");
                }

        



        function editCard(cardId) {
            alert("Editar tarjeta: " + cardId);
            const card = document.getElementById(cardId);
            if (!card) return;

            // Extraer los datos actuales de la tarjeta
            const title = card.querySelector('.card-title').textContent;
            const category = card.querySelector('.card-category').textContent;
            const power = card.querySelector('.card-power').textContent.replace(' W', '');
            const minHours = card.querySelector('.min-hours').textContent.replace(' h', '');
            const maxHours = card.querySelector('.max-hours').textContent.replace(' h', '');

            document.getElementById('appName').value = title;
            document.getElementById('appCategory').value = category;
            document.getElementById('appPower').value = power;
            document.getElementById('appMinHours').value = minHours;
            document.getElementById('appMaxHours').value = maxHours;
        }

        
        let contadores = [{id:0,valor:0}]; 

        function newCopyElem(elem){
            var numElem =1;
            var elemento = elem.cloneNode(true);
            var button_plus = document.createElement('button');
            var button_minus = document.createElement('button');
            button_plus.textContent = "+1";
            button_minus.textContent = "-1";
            contadores.push({id:elem.id,valor:0});
            button_plus.addEventListener('click', () => {
                // alert()
                //numElem = contadores.find(c => c.id === elem.id).valor++;
                numElem++;
                span.textContent = "Cantidad: " + numElem;
                addToList(elem.id);
            });
            button_minus.addEventListener('click', () => {
                if (numElem > 1) {
                    numElem--;
                    removeFromList(elem.id);
                    span.textContent = "Cantidad: " + numElem;
                }
            });
            var span = document.createElement('span');
            span.textContent = "Cantidad: " + numElem;
            elemento.appendChild(span);
            elemento.appendChild(button_plus);
            elemento.appendChild(button_minus);
            addToList(elem.id);
            return elemento;
        }

        let contador_lista = 0; // Contador para el objeto lista_aparatos2

        function addToList(id){
            lista_aparatos2[id+contador_lista] = lista_aparatos[id];
            contador_lista++;
            console.log("id elementos arrastrados:",lista_aparatos2);

        }
        function removeFromList(id){
             const llaves = Object.keys(lista_aparatos2);
             if (llaves.length > 0) {
                const ultimaLlave = llaves[llaves.length - 1];
             
        // 3. Borramos el elemento del objeto
        delete lista_aparatos2[ultimaLlave];// error
             }
            console.log("id elementos arrastrados:",lista_aparatos2);
            // según el id proporcionado.
        }

        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('applianceForm');
            const zoneA = document.getElementById('zoneA');
            const zoneB = document.getElementById('zoneB');
            let cardCounter = 0;

            // Manejador del envío del formulario
            form.addEventListener('submit', (e) => {
                e.preventDefault(); // Evita que la página se recargue

                // 1. Obtener valores del formulario
                const name = document.getElementById('appName').value.trim();
                const category = document.getElementById('appCategory').value;
                const power = document.getElementById('appPower').value;
                const minHours = document.getElementById('appMinHours').value;
                const maxHours = document.getElementById('appMaxHours').value;

                // Validación simple de horas
                if (parseInt(minHours) > parseInt(maxHours)) {
                    alert('El uso mínimo no puede ser mayor al uso máximo.');
                    return;
                }

                // 2. Crear la tarjeta
                cardCounter++;
                const card = document.createElement('div');
                card.classList.add('card');
                card.draggable = true;
                card.id = `app-card-${cardCounter}`;

                // 3. Construir el HTML interno de la tarjeta con los datos
                card.innerHTML = `
                    <div class="card-header">
                        <span class="card-title">${name}</span>
                        <span class="card-category">${category}</span>
                    </div>
                    <div class="card-body">
                        <div class="data-point">
                            <span class="data-label">Potencia</span>
                            <span class="card-power">${power} W</span>
                        </div>
                        <div class="data-point">
                            <span class="data-label">Uso Mín.</span>
                            <span class="min-hours">${minHours} h</span>
                        </div>
                        <div class="data-point">
                            <span class="data-label">Uso Máx.</span>
                            <span class="max-hours">${maxHours} h</span>
                        </div>
                        <div>
                            <button onclick="editCard('${card.id}')">Editar</button>
                            </div>

                    </div>
                `;
                lista_aparatos[card.id] = { name, category, power, minHours, maxHours };
                console.log("Aparato agregado a la lista:", lista_aparatos);
                

                // 4. Configurar eventos de Drag & Drop para esta tarjeta específica
                card.addEventListener('dragstart', handleDragStart);
                card.addEventListener('dragend', handleDragEnd);

                // 5. Agregar la tarjeta al Cuadro A y resetear el formulario
                zoneA.appendChild(card);
                form.reset();
                document.getElementById('appName').focus();
            });
            

            // --- Lógica de Drag and Drop ---

            function handleDragStart(e) {
                // Guardamos el ID del elemento arrastrado
                e.dataTransfer.setData('text/plain', e.target.id);
                e.dataTransfer.effectAllowed = 'move';
                
                // Usamos setTimeout para que la clase se aplique después de que el navegador 
                // haya tomado la "foto" del elemento arrastrado.
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            }

            function handleDragEnd(e) {
                e.target.classList.remove('dragging');
            }

            // Configurar los contenedores (Zonas) para recibir elementos
            const dropZones = [zoneA, zoneB];

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necesario para permitir el drop
                    e.dataTransfer.dropEffect = 'move';
                    zone.classList.add('drag-over');
                });

                zone.addEventListener('dragleave', (e) => {
                    zone.classList.remove('drag-over');
                });

                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('drag-over');

                    // Recuperar el ID del elemento arrastrado
                    const draggedId = e.dataTransfer.getData('text/plain');
                    const draggedElement = document.getElementById(draggedId);

                    

                    if (draggedElement) {
                        // Mover el elemento al nuevo contenedor
                        // Nota: El cambio de color se maneja automáticamente mediante CSS 
                        // utilizando selectores descendentes (#zoneB .card)
                        if (zone.id === 'zoneB') {
                            const clonedElement = newCopyElem(draggedElement);
                            clonedElement.id = draggedId + '_copia_' + Date.now();
                            clonedElement.addEventListener('dragstart', handleDragStart);
                            clonedElement.addEventListener('dragend', handleDragEnd);
                            clonedElement.classList.remove('dragging');
                            zone.appendChild(clonedElement);
                            
                            

                        } 
                        else if(zone.id === 'zoneA' && draggedElement.parentElement.id === 'zoneB') {
                            // Si se suelta en la Zona A, simplemente mover el elemento original
                            draggedElement.remove();
                        }
                        
                        else{
                            zone.appendChild(draggedElement);
                        } 
                    }
                });
            });
        });
       

        //---delete 01
        function volverAlPanel() {

    document
        .getElementById("resultsView")
        .classList.remove("visible");

    document.querySelector(".sidebar")
        .style.display = "";

    document.querySelector(".workspace")
        .style.display = "";

}

function generarDesglose(devices) {

    const container =
        document.getElementById("resultDevices");

    container.innerHTML = "";

    const maxConsumption =
        Math.max(
            ...devices.map(
                d => d.dailyAvg
            )
        );


    devices.forEach(device => {

        const card =
            device.card;

        const name =
            card.dataset.deviceName ||
            "Dispositivo";

        const category =
            card.querySelector(
                ".card-category"
            )?.textContent ||
            "Sin categoría";


        const percentage =
            maxConsumption > 0
                ? (device.dailyAvg / maxConsumption) * 100
                : 0;


        const element =
            document.createElement("div");

        element.className =
            "device-result";


        element.innerHTML = `

            <div class="device-result-icon">
                ⚡
            </div>

            <div class="device-result-info">

                <strong>
                    ${escapeHtml(name)}
                </strong>

                <small>
                    ${escapeHtml(category)}
                    · ${device.power} W
                    · ${device.minHours}–${device.maxHours} h/día
                </small>

                <div class="energy-bar">

                    <div
                        style="width:${percentage}%">
                    </div>

                </div>

            </div>

            <div class="device-result-kwh">

                <strong>
                    ${device.dailyAvg.toFixed(2)}
                </strong>

                <small>
                    kWh/día
                </small>

            </div>

        `;


        container.appendChild(element);

    });

}