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

function detenerSimulacion() {
    clearInterval(intervaloSimulacion);

    const esperaProm = historialEspera.length > 0
        ? (historialEspera.reduce((a, b) => a + b, 0) / historialEspera.length).toFixed(2) : 0;

    const ocupacion = ((tiempoTrabajoTotal / (cajeros.length * reloj)) * 100).toFixed(2);

    document.getElementById('resTiempo').innerText = reloj.toFixed(1) + " min";
    document.getElementById('resEspera').innerText = esperaProm + " min";
    document.getElementById('resOcupacion').innerText = ocupacion + "%";
    document.getElementById('resAtendidos').innerText = clientesAtendidos;
    document.getElementById('resAbandonos').innerText = clientesAbandonan;

    document.getElementById('panelInforme').style.display = 'block';

    document.getElementById('panelInforme').scrollIntoView({ behavior: 'smooth' });
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