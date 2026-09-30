// --- 1. CONFIGURACIÓN DEL PROBLEMA ---

// Consumo real medido que queremos descifrar (en Watts-hora, ej: 10 kWh)
const CONSUMO_TOTAL_REAL = 10000; 

// Lista de aparatos con su potencia (Watts) y límites lógicos de horas al día [mínimo, máximo]
const aparatos = {
    nevera:        { potencia: 150,  horasMin: 10, horasMax: 24 }, 
    aireAcond:     { potencia: 1200, horasMin: 2,  horasMax: 8  }, 
    televisor:     { potencia: 100,  horasMin: 1,  horasMax: 6  },
    lavadora:      { potencia: 500,  horasMin: 0,  horasMax: 2  }, 
    microondas:    { potencia: 800,  horasMin: 0.1,horasMax: 0.5}  
};

// --- 2. CONFIGURACIÓN DE MONTECARLO ---
const ITERACIONES = 500000; // Cuántas combinaciones al azar probaremos
const MARGEN_ERROR = 100;    // Tolerancia en Wh (aceptamos combinaciones que sumen entre 9900 y 10100 Wh)

function simularConsumoHogar() {
    // Aquí guardaremos las combinaciones que logren sumar el consumo real
    let combinacionesExitosas = [];

    // Inicializamos contadores para promediar los tiempos al final
    let totales = { nevera: 0, aireAcond: 0, televisor: 0, lavadora: 0, microondas: 0 };

    for (let i = 0; i < ITERACIONES; i++) {
        // PASO A: Generar un tiempo aleatorio lógico para cada aparato
        let tiemposSimulados = {};
        for (let nombre in aparatos) {
            let config = aparatos[nombre];
            // Elige un número decimal al azar entre el mínimo y máximo de horas de ese aparato
            tiemposSimulados[nombre] = Math.random() * (config.horasMax - config.horasMin) + config.horasMin;
        }

        // PASO B: Calcular el consumo total de esta combinación aleatoria
        let consumoSimulado = 0;
        for (let nombre in aparatos) {
            consumoSimulado += tiemposSimulados[nombre] * aparatos[nombre].potencia;
        }

        // PASO C: Filtrar. ¿Esta combinación aleatoria se acerca al consumo real?
        if (Math.abs(consumoSimulado - CONSUMO_TOTAL_REAL) <= MARGEN_ERROR) {
            combinacionesExitosas.push(tiemposSimulados);
            
            // Sumar al acumulador para el promedio posterior
            for (let nombre in aparatos) {
                totales[nombre] += tiemposSimulados[nombre];
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

    for (let nombre in aparatos) {
        // Promediamos el tiempo de todas las soluciones que fueron válidas
        let horasPromedio = totales[nombre] / totalExitos;
        
        // Convertir la parte decimal a minutos para que sea más legible
        let horasEnteras = Math.floor(horasPromedio);
        let minutos = Math.round((horasPromedio - horasEnteras) * 60);

        console.log(`- ${nombre.padEnd(12)}: ~ ${horasEnteras}h ${minutos}m al día.`);
    }
}

// Ejecutar el simulador
simularConsumoHogar();
