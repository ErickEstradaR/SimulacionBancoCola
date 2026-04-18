let simulacionActiva = false;
let reloj = 0;
let colaClientes = [];
let cajeros = [];
let clientesAtendidos = 0;
let clientesRechazados = 0;
let intervaloSimulacion;

let miGrafica;
let datosCola = [];
let etiquetasTiempo = [];
let historialEspera = [];
let tiempoTrabajoTotal = 0;
let clientesAbandonan = 0;

const TIEMPO_SIMULACION = 60;
let lambdaMinuto, muMinuto, probabilidadAbandono;
const PASO_TIEMPO = 0.1;
let proximaLlegada = 0;
let ultimoIdCliente = 0;

function generarTiempoExponencial(tasa) {
    return -Math.log(1 - Math.random()) / tasa;
}

function inicializarGrafica() {
    const canvas = document.getElementById('graficaCola');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (miGrafica) miGrafica.destroy();

    miGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetasTiempo,
            datasets: [{
                label: 'Clientes en Cola',
                data: datosCola,
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { title: { display: true, text: 'Minutos' } },
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function configurarSimulacion() {
    if (intervaloSimulacion) clearInterval(intervaloSimulacion);

    const clientesHora = parseFloat(document.getElementById('inputLambda').value);
    const tiempoAtencion = parseFloat(document.getElementById('inputMu').value);
    const impaciencia = parseFloat(document.getElementById('inputPaciencia').value);

    lambdaMinuto = clientesHora / 60;
    muMinuto = 1 / (tiempoAtencion || 1);
    probabilidadAbandono = impaciencia / 100;

    reloj = 0;
    colaClientes = [];
    clientesAtendidos = 0;
    clientesRechazados = 0;
    clientesAbandonan = 0;
    ultimoIdCliente = 0;
    historialEspera = [];
    tiempoTrabajoTotal = 0;
    datosCola = [];
    etiquetasTiempo = [];

    // --- CORRECCIÓN: Crear los cajeros antes de empezar ---
    const numCajeros = parseInt(document.getElementById('inputCajeros').value) || 3;
    cajeros = [];
    for (let i = 0; i < numCajeros; i++) {
        cajeros.push({
            id: i + 1,
            ocupado: false,
            clienteActual: null,
            tiempoFinServicio: 0
        });
    }

    proximaLlegada = generarTiempoExponencial(lambdaMinuto);

    dibujarCajerosUI();
    inicializarGrafica();

    simulacionActiva = true;
    intervaloSimulacion = setInterval(procesarPaso, 10);
}

function procesarPaso() {
    reloj += PASO_TIEMPO;

    if (reloj >= proximaLlegada) {
        ultimoIdCliente++;
        const nuevoCliente = { id: ultimoIdCliente, llegada: reloj };

        if (colaClientes.length >= 10) {
            if (Math.random() < probabilidadAbandono) {
                clientesAbandonan++;
            } else {
                colaClientes.push(nuevoCliente);
            }
        } else {
            colaClientes.push(nuevoCliente);
        }
        proximaLlegada = reloj + generarTiempoExponencial(lambdaMinuto);
    }

    cajeros.forEach(cajero => {
        if (cajero.ocupado && reloj >= cajero.tiempoFinServicio) {
            cajero.ocupado = false;
            cajero.clienteActual = null;
            clientesAtendidos++;
        }
        if (!cajero.ocupado && colaClientes.length > 0) {
            const cliente = colaClientes.shift();
            historialEspera.push(reloj - cliente.llegada);
            // --- CORRECCIÓN: mu -> muMinuto ---
            const duracion = generarTiempoExponencial(muMinuto);
            tiempoTrabajoTotal += duracion;
            cajero.ocupado = true;
            cajero.clienteActual = cliente;
            cajero.tiempoFinServicio = reloj + duracion;
        }
    });

    if (Math.floor(reloj) > (etiquetasTiempo[etiquetasTiempo.length - 1] ?? -1)) {
        if (reloj <= TIEMPO_SIMULACION) {
            etiquetasTiempo.push(Math.floor(reloj));
            datosCola.push(colaClientes.length);
            if (miGrafica) miGrafica.update('none');
        }
    }

    actualizarUI();

    if (reloj >= TIEMPO_SIMULACION) {
        detenerSimulacion();
    }
}
function detenerSimulacion() {
    clearInterval(intervaloSimulacion);
    const esperaProm = historialEspera.length > 0
        ? (historialEspera.reduce((a,b)=>a+b,0)/historialEspera.length).toFixed(2) : 0;

    const ocupacion = ((tiempoTrabajoTotal / (cajeros.length * reloj)) * 100).toFixed(2);

    alert(`Informe Final de Operaciones
    ---------------------------------
    Tiempo Total: ${reloj.toFixed(1)} min
    Espera Promedio: ${esperaProm} min
    Ocupación Promedio: ${ocupacion}%
    Clientes Atendidos: ${clientesAtendidos}
    Abandonos por Fila Larga: ${clientesAbandonan}`);
}

function dibujarCajerosUI() {
    const area = document.getElementById('cajerosArea');
    if (!area) return;
    area.innerHTML = '';
    cajeros.forEach(c => {
        const div = document.createElement('div');
        div.id = `cajero-${c.id}`;
        div.className = 'cajero';
        div.innerHTML = `<b>Cajero ${c.id}</b><small id="estado-${c.id}">Libre</small>`;
        area.appendChild(div);
    });
}

function actualizarUI() {
    document.getElementById('txtReloj').innerText = reloj.toFixed(1) + " min";
    document.getElementById('txtCola').innerText = colaClientes.length;
    document.getElementById('txtAtendidos').innerText = clientesAtendidos;
    document.getElementById('txtRechazados').innerText = clientesRechazados;
    document.getElementById('txtAbandonos').innerText = clientesAbandonan;
    const colaArea = document.getElementById('colaArea');
    colaArea.innerHTML = '';
    colaClientes.forEach(c => {
        const div = document.createElement('div');
        div.className = 'cliente';
        div.innerText = c.id;
        colaArea.appendChild(div);
    });

    cajeros.forEach(c => {
        const div = document.getElementById(`cajero-${c.id}`);
        const txt = document.getElementById(`estado-${c.id}`);
        if (c.ocupado) {
            div.classList.add('ocupado');
            txt.innerText = `Atendiendo ID:${c.clienteActual.id}`;
        } else {
            div.classList.remove('ocupado');
            txt.innerText = 'Libre';
        }
    });
}