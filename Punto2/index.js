let tablero = ["", "", "", "", "", "", "", "", ""];

const JUGADOR = "❎"
const MAQUINA = "⭕"
const mensaje = document.getElementById("mensaje");

let juegoTerminado = false;

const combinacionesGanadoras = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const celdas = document.querySelectorAll(".celda");
const botonReiniciar = document.getElementById("reiniciar");
const dificultad = document.getElementById("dificultad");
dificultad.addEventListener("change", reiniciarJuego);

celdas.forEach(function (celda) {
  celda.setAttribute("aria-label", "Casilla " + (Number(celda.dataset.indice) + 1));
  celda.addEventListener("click", function () {
    jugarTurnoUsuario(celda);
  });
});

botonReiniciar.addEventListener("click", reiniciarJuego);

function jugarTurnoUsuario(celda) {
  const indice = celda.getAttribute("data-indice");

  // Si el juego terminó o la celda ya tiene algo, no hacemos nada
  if (juegoTerminado || tablero[indice] !== "") {
    return;
  }

  // Guardamos la jugada del usuario en el tablero y la mostramos en pantalla
  realizarJugada(indice, JUGADOR);

  // Si con esa jugada el usuario ganó o hubo empate, terminamos ahí
  if (revisarFinDeJuego(JUGADOR)) {
    return;
  }

  // Le toca a la máquina: mostramos el mensaje y la dejamos "pensar" un momento
  jugarTurnoMaquina();
}

function jugarTurnoMaquina() {
  // Buscamos todas las celdas vacías del tablero
  const celdasVacias = [];
  tablero.forEach(function (valor, indice) {
    if (valor === "") {
      celdasVacias.push(indice);
    }
  });

  // Si no hay celdas vacías, no hacemos nada (por las dudas)
  if (celdasVacias.length === 0) {
    return;
  }

  // La máquina elige una celda vacía al azar
  const indiceElegido = elegirJugada(celdasVacias);

  realizarJugada(indiceElegido, MAQUINA);

  // Si con esa jugada la máquina ganó o hubo empate, revisarFinDeJuego se encarga del mensaje
  if (revisarFinDeJuego(MAQUINA)) {
    return;
  }

}




function realizarJugada(indice, jugador) {
  tablero[indice] = jugador;
  celdas[indice].textContent = jugador;
  celdas[indice].disabled = true;
  celdas[indice].setAttribute("aria-label", "Casilla " + (Number(indice) + 1) + ": " + jugador);
}

function revisarFinDeJuego(jugador) {
  if (hayGanador()) {
    mensaje.textContent =
      jugador === JUGADOR ? "¡Ganaste! 🎉" : "Ganó la máquina 🤖";
    juegoTerminado = true;
    return true;
  }

  if (!tablero.includes("")) {
    mensaje.textContent = "¡Empate!";
    juegoTerminado = true;
    return true;
  }

  return false;
}

function hayGanador() {
  // Recorremos cada combinación posible y vemos si las 3 celdas coinciden
  return combinacionesGanadoras.some(function (combinacion) {
    const [a, b, c] = combinacion;
    return (
      tablero[a] !== "" &&
      tablero[a] === tablero[b] &&
      tablero[a] === tablero[c]
    );
  });
}

function reiniciarJuego() {
  tablero = ["", "", "", "", "", "", "", "", ""];
  juegoTerminado = false;
  mensaje.textContent = "Tu turno (❎)";

  celdas.forEach(function (celda) {
    celda.textContent = "";
    celda.disabled = false;
    celda.setAttribute("aria-label", "Casilla " + (Number(celda.dataset.indice) + 1));
  });
}

// Nivel medio: primero intenta ganar y después bloquear al jugador.
function buscarJugadaGanadora(jugador, vacias) {
  for (const indice of vacias) {
    tablero[indice] = jugador;
    const gana = hayGanador();
    tablero[indice] = "";
    if (gana) return indice;
  }
  return undefined;
}

function elegirJugada(vacias) {
  if (dificultad.value === "dificil") {
    let mejorPuntaje = -Infinity;
    let mejorIndice = vacias[0];
    for (const indice of vacias) {
      tablero[indice] = MAQUINA;
      const puntaje = minimax(false, 0);
      tablero[indice] = "";
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejorIndice = indice;
      }
    }
    return mejorIndice;
  }
  if (dificultad.value === "medio") {
    const tactica = buscarJugadaGanadora(MAQUINA, vacias) ?? buscarJugadaGanadora(JUGADOR, vacias);
    if (tactica !== undefined) return tactica;
  }
  return vacias[Math.floor(Math.random() * vacias.length)];
}

// Explora las respuestas de ambos jugadores sin modificar la pantalla.
function minimax(turnoMaquina, profundidad) {
  if (hayGanador()) return turnoMaquina ? profundidad - 10 : 10 - profundidad;
  if (!tablero.includes("")) return 0;
  let mejor = turnoMaquina ? -Infinity : Infinity;
  for (let indice = 0; indice < tablero.length; indice++) {
    if (tablero[indice] !== "") continue;
    tablero[indice] = turnoMaquina ? MAQUINA : JUGADOR;
    const puntaje = minimax(!turnoMaquina, profundidad + 1);
    tablero[indice] = "";
    mejor = turnoMaquina ? Math.max(mejor, puntaje) : Math.min(mejor, puntaje);
  }
  return mejor;
}
