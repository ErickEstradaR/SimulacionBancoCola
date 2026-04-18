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