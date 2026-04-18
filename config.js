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