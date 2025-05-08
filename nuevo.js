// Inicialización del Canvas y Contexto
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Referencia al div del texto para animar su aparición
const textoDiv = document.querySelector('.texto');

// Array para almacenar los corazones
const hearts = [];
// Colores para los corazones (puedes añadir más si quieres)
const heartColors = [
    "#ff4d6d", "#ffccd5", "#ff85a1", "#ff99aa", "#ff6382",
    "#e05d6d", "#f08080", "#ffb6c1", "#ffc0cb", "#ff69b4",
    "#ff1493", "#db7093", "#c71585", "#FF007F", "#FF69B4" // Algunos colores adicionales
];

// Variables para controlar la animación de aparición inicial (build-up)
let startTime = null;
const totalBuildUpDuration = 5000; // Duración total de la animación inicial en ms (ajusta a tu gusto)

// --- Función para dibujar un solo corazón ---
// Esta función ya estaba bien y no necesita cambios
function drawHeart(x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    // Escalar el corazón. El tamaño base para dibujar el path es fijo.
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -3, -5, 0);
    ctx.bezierCurveTo(-5, 3, 0, 6, 0, 8);
    ctx.bezierCurveTo(0, 6, 5, 3, 5, 0);
    ctx.bezierCurveTo(5, -3, 0, -3, 0, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

// --- Función para crear los datos de los corazones (posiciones, etc.) ---
function createHearts() {
    const centerX = canvas.width / 2;
    // topY controla la posición vertical del "centro superior" del follaje de corazón
    const topY = canvas.height / 2 + 0; // <<--- Ajusta este valor (un número mayor lo baja)
    const scale = 10; // Escala general de la forma del corazón (ajusta si es muy grande/pequeña)
    const heartCount = 15000; // Cantidad de corazones (la que tú usaste)

    hearts.length = 0; // Limpiar el array antes de llenarlo

    // Duración que tarda un corazón individual en hacer fade in una vez que empieza
    const fadeDurationPerHeart = 800; // en ms

    for (let i = 0; i < heartCount; i++) {
        // Generar un valor 't' aleatorio para obtener la dirección en la curva del corazón
        const t = Math.random() * 2 * Math.PI;

        // Calcular las coordenadas de un punto EN LA CURVA del corazón (relativo al centro 0,0)
        const curveX = scale * (16 * Math.pow(Math.sin(t), 3));
        const curveY = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); // Nota el '-' en Y

        // --- Lógica para rellenar el corazón ---
        // Generar un factor aleatorio entre 0 y 1 para mover el punto hacia adentro desde la curva
        const fillFactor = Math.random();

        // Calcular las coordenadas finales del corazón (relativo al centro 0,0) usando el factor de relleno
        const heartX = curveX * fillFactor;
        const heartY = curveY * fillFactor;

        // Añadir un pequeño jitter (dispersión aleatoria) a la posición final en el canvas
        const finalX = centerX + heartX + (Math.random() - 0.5) * 15; // Ajusta el '15' para la dispersión
        const finalY = topY + heartY + (Math.random() - 0.5) * 15; // Ajusta el '15' para la dispersión

        // --- Lógica para la animación de aparición inicial ---
        // Calcular el retraso de aparición para este corazón.
        // Basado en el índice (i) para que aparezcan escalonadamente, con algo de aleatoriedad.
        const animationDelay = (i / heartCount) * (totalBuildUpDuration - fadeDurationPerHeart) + Math.random() * (totalBuildUpDuration / heartCount) * 2;
         // Asegurarse de que el retraso no exceda la duración total de construcción
         const finalAnimationDelay = Math.min(animationDelay, totalBuildUpDuration - fadeDurationPerHeart);


        hearts.push({
            x: finalX,
            y: finalY,
            size: Math.random() * 0.8 + 0.3, // Rango de tamaños de los corazones individuales
            color: heartColors[Math.floor(Math.random() * heartColors.length)], // Selecciona un color aleatorio

            initialY: finalY, // Guardar la posición Y inicial para la animación sutil
            speed: Math.random() * 0.5 + 0.2, // Propiedad no usada en la animación actual, pero puede servir
            offset: Math.random() * 100, // Offset para la animación sutil (vertical y fade)

            alpha: 0, // ¡Empieza invisible!
            animationDelay: finalAnimationDelay // Retraso antes de que empiece a aparecer
        });
    }
     console.log(`Creados ${hearts.length} corazones.`); // Mensaje de depuración
}

// --- Función para dibujar el Árbol (Tronco y Ramas Curvas) ---
// Esta función dibuja el árbol, la lógica de aparición (fade in) se manejará en animateHearts
function drawTree() {
    const centerX = canvas.width / 2;
    const baseY = canvas.height;
    const trunkHeight = 150; // Altura del tronco
    const trunkWidth = 25; // Ancho base del tronco

    // Tronco - Usando una forma más robusta o curva
    ctx.beginPath();
    ctx.moveTo(centerX - trunkWidth / 2, baseY);
    ctx.lineTo(centerX - trunkWidth / 4, baseY - trunkHeight / 2); // Curva suave hacia arriba
    ctx.lineTo(centerX, baseY - trunkHeight); // Punto medio superior del tronco
    ctx.lineTo(centerX + trunkWidth / 4, baseY - trunkHeight / 2); // Curva suave hacia arriba
    ctx.lineTo(centerX + trunkWidth / 2, baseY);
    ctx.closePath(); // Cierra la forma del tronco
    ctx.fillStyle = "#8B4513"; // Color de tronco
    ctx.fill(); // Rellena el tronco

    // Punto de partida de las ramas (donde termina el tronco)
    const branchBaseX = centerX;
    const branchBaseY = baseY - trunkHeight;

    ctx.strokeStyle = "#A0522D"; // Color de ramas
    ctx.lineWidth = 8; // Ancho de las ramas
    ctx.lineCap = 'round'; // Extremos redondeados para las ramas

    // Ramas curvas usando curvas cuadráticas.
    // Añade o modifica estas secciones para cambiar el diseño de las ramas.

    // Rama izquierda 1
    ctx.beginPath();
    ctx.moveTo(branchBaseX, branchBaseY);
    ctx.quadraticCurveTo(
        branchBaseX  - 50, branchBaseY  -80, // Punto de control
        branchBaseX - 60, branchBaseY - 150 // Punto final
    );
    ctx.stroke();

    // Rama izquierda 2 (saliendo un poco más abajo y con forma diferente)
    ctx.beginPath();
    ctx.moveTo(branchBaseX, branchBaseY + 10); // Sale un poco más abajo
     ctx.quadraticCurveTo(
        branchBaseX - 70, branchBaseY - 30, // Punto de control
        branchBaseX - 110, branchBaseY - 100 // Punto final
    );
    ctx.stroke();

    // Rama derecha 1 (simétrica a la izquierda 1)
    ctx.beginPath();
    ctx.moveTo(branchBaseX, branchBaseY);
    ctx.quadraticCurveTo(
        branchBaseX + 20, branchBaseY - 70, // Punto de control
        branchBaseX + 50, branchBaseY - 120 // Punto final
    );
    ctx.stroke();

     // Rama derecha 2 (simétrica a la izquierda 2)
     ctx.beginPath();
     ctx.moveTo(branchBaseX, branchBaseY + 10); // Sale un poco más abajo
      ctx.quadraticCurveTo(
         branchBaseX + 70, branchBaseY - 30, // Punto de control
         branchBaseX + 110, branchBaseY - 100 // Punto final
     );
     ctx.stroke();

      // Rama derecha 1 (simétrica a la izquierda 1)
    ctx.beginPath();
    ctx.moveTo(branchBaseX, branchBaseY);
    ctx.quadraticCurveTo(
        branchBaseX + 50, branchBaseY - 80, // Punto de control
        branchBaseX + 90, branchBaseY - 90 // Punto final
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(branchBaseX, branchBaseY);
    ctx.quadraticCurveTo(
        branchBaseX  - 50, branchBaseY  -60, // Punto de control
        branchBaseX - 10, branchBaseY - 120 // Punto final
    );
    ctx.stroke();

  
   
     

     

    // Puedes añadir más ramas aquí duplicando y ajustando los puntos de control y finales.
    // Para sub-ramas, empieza un nuevo beginPath() desde el punto final de una rama existente.
}


// --- Función Principal de Animación (Llamada por requestAnimationFrame) ---
function animateHearts(time) {
    // Limpiar todo el canvas al inicio de cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si es la primera vez que se llama, guardar el tiempo de inicio de la animación completa
    if (startTime === null) {
        startTime = time;
    }

    // Calcular el tiempo transcurrido desde el inicio de la animación completa
    const elapsed = time - startTime;

    // Calcular el progreso general de la fase de construcción inicial (va de 0 a 1)
    // currentBuildUpProgress llega a 1 después de 'totalBuildUpDuration' milisegundos.
    const currentBuildUpProgress = Math.min(elapsed / totalBuildUpDuration, 1);


    // --- Animar la aparición del Texto (en el DOM) ---
    // Establecer la opacidad del div de texto usando el progreso de construcción.
    // Esto hace que el texto haga fade in al mismo tiempo que el canvas.
    textoDiv.style.opacity = currentBuildUpProgress;


    // --- Animar la aparición del Árbol (en Canvas) ---
    // Establecer la transparencia global del contexto del canvas.
    // Todo lo que se dibuje después tendrá esta transparencia.
    ctx.globalAlpha = currentBuildUpProgress;

    // Dibujar el árbol. Su transparencia es controlada por globalAlpha.
    drawTree();

    // Restablecer la transparencia global a 1 antes de dibujar los corazones,
    // para que la transparencia de cada corazón sea controlada individualmente.
    ctx.globalAlpha = 1;


    // Tiempo base para la animación sutil (movimiento vertical y fade sutil de corazones).
    // Usamos el tiempo continuo para esta animación.
    const subtleAnimationTime = time;

    // --- Animar cada Corazón ---
    const fadeDurationPerHeart = 800; // Asegúrate de que coincide con la usada en createHearts si la cambiaste

    for (let heart of hearts) {
        // Calcular cuánto tiempo ha pasado para este corazón específico
        // Considera su retraso de aparición individual.
        const heartElapsedForFade = elapsed - heart.animationDelay;

        // Calcular el progreso del fade in de este corazón (va de 0 a 1)
        // El progreso solo avanza si heartElapsedForFade es >= 0.
        const heartFadeProgress = Math.min(Math.max(0, heartElapsedForFade / fadeDurationPerHeart), 1);

        // --- Lógica de animación sutil existente ---
        // Movimiento vertical arriba y abajo
        const offsetY = Math.sin((subtleAnimationTime + heart.offset) / 300) * 5;
        const currentY = heart.initialY + offsetY;

        // Animación sutil de transparencia (parpadeo suave)
        const subtleAlpha = Math.sin((subtleAnimationTime + heart.offset * 10) / 500) * 0.5 + 0.5;

        // --- Combinar animaciones ---
        // El alpha final del corazón es la combinación del fade in inicial y la animación sutil.
        // Un corazón solo se vuelve visible y hace su animación sutil una vez que su fade-in inicial ha comenzado.
        heart.alpha = heartFadeProgress * subtleAlpha;

        // Asegurarse de que el valor final de alpha esté siempre entre 0 y 1
        heart.alpha = Math.max(0, Math.min(1, heart.alpha));


        // Aplicar la transparencia final calculada para este corazón
        ctx.globalAlpha = heart.alpha;

        // Dibujar el corazón en su posición actual (incluyendo el movimiento vertical)
        drawHeart(heart.x, currentY, heart.size, heart.color);

        // Restablecer globalAlpha a 1. Importante si hubiera más dibujos después de los corazones.
        ctx.globalAlpha = 1;
    }

    // Solicitar el siguiente frame de animación.
    // Esta función se llamará continuamente (~60 veces por segundo) para mantener la animación.
    requestAnimationFrame(animateHearts);
}


// --- Lógica del Contador de Tiempo ---
// Esta parte maneja la actualización del texto del contador en el DOM.

const contador = document.getElementById("contador");
// Ajusta la fecha y hora de inicio de tu relación
// Formato: "AAAA-MM-DDTHH:mm:ss"
const fechaInicio = new Date("2024-02-22T17:00:00"); // <--- ¡Ajusta esto a TU fecha!


function actualizarContador() {
    const ahora = new Date();
    const diferencia = ahora - fechaInicio; // Diferencia en milisegundos

    // Calcular años, meses, días, horas, minutos, segundos
    // Nota: Los cálculos de meses y días pueden ser aproximados debido a la diferente duración de los meses.
    // Para precisión total se necesitaría una librería de fechas más avanzada.

    const segundos = Math.floor(diferencia / 1000) % 60;
    const minutos = Math.floor(diferencia / (1000 * 60)) % 60;
    const horas = Math.floor(diferencia / (1000 * 60 * 60)) % 24;
    // Cálculo de días y meses más robusto considerando días por mes (aún con aproximación)
    // Una forma simple (puede tener ligeras imprecisiones):
    let remaining = diferencia / (1000 * 60 * 60 * 24); // Total de días
    const años = Math.floor(remaining / 365);
    remaining %= 365;
    const meses = Math.floor(remaining / 30.44); // Promedio de días por mes
    remaining %= 30.44;
    const días = Math.floor(remaining);

    // Formatear la salida del texto
    contador.textContent = `${años} años, ${meses} meses, ${días} días, ${horas} hs, ${minutos} min y ${segundos} seg.`;
}

// --- Llamadas Iniciales para empezar todo ---

// Crear los datos de los corazones (solo se llama una vez al inicio)
createHearts();

// Iniciar el bucle principal de animación del canvas.
// La función animateHearts se llamará repetidamente.
requestAnimationFrame(animateHearts);

// Iniciar la actualización del contador cada segundo.
actualizarContador(); // Llamar una vez inmediatamente para mostrar el contador al cargar
setInterval(actualizarContador, 1000); // Luego actualizar cada 1000ms (1 segundo)