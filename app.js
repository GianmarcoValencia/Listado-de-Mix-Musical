// CONFIGURACIÓN REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBvimu6IhHf_Dnv18CLD99h_Yyp689Q-jE",
  authDomain: "listado-de-mix-musical.firebaseapp.com",
  projectId: "listado-de-mix-musical",
  storageBucket: "listado-de-mix-musical.firebasestorage.app",
  messagingSenderId: "745129908268",
  appId: "1:745129908268:web:65dc5daf0c466889b69989",
  measurementId: "G-TEYX6X7KKC"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Escuchar cambios en la nube en tiempo real
db.ref("canciones").on("value", (snapshot) => {
    const data = snapshot.val();
    const canciones = [];
    for (let id in data) {
        canciones.push({ id, ...data[id] });
    }
    render(canciones);
});

function render(canciones) {
    // Limpiar todas las listas antes de volver a dibujar
    document.querySelectorAll("ul").forEach(u => u.innerHTML = "");
    let total = 0;
    
    // Objeto para llevar la cuenta individual por cada sección (Niños, Jóvenes, etc.)
    const contadoresPorLista = {};

    canciones.forEach((c) => {
        const listaId = `${c.grupo}-${c.tipo}`;
        let ul = document.querySelector(`#${listaId} ul`);
        
        if (ul) {
            // Inicializar el contador para esta lista específica si es la primera canción
            if (!contadoresPorLista[listaId]) {
                contadoresPorLista[listaId] = 1;
            }

            let li = document.createElement("li");
            // Agregamos el número dinámico usando el contador
            li.innerHTML = `
                <span><strong class="numero-lista">${contadoresPorLista[listaId]}.</strong> ${c.nombre}</span>
                <div class="actions">
                    <button onclick="editar('${c.id}', '${c.nombre}')">✏️</button>
                    <button onclick="eliminar('${c.id}')">🗑</button>
                </div>`;
            
            ul.appendChild(li);
            contadoresPorLista[listaId]++; // Aumentar el número para la siguiente canción de esta lista
            total++;
        }
    });
    document.getElementById("contadorTotal").innerText = "Total canciones: " + total;
    actualizarContadoresInternos();
}

function agregar(grupo, tipo) {
    let input = document.getElementById(`input-${grupo}-${tipo}`);
    let nombre = input.value.trim();
    if (nombre === "") return;
    // Guardar en Firebase
    db.ref("canciones").push({ grupo, tipo, nombre });
    input.value = "";
}

function eliminar(id) {
    if (confirm("¿Borrar canción para todos?")) {
        db.ref("canciones/" + id).remove();
    }
}

function editar(id, nombreActual) {
    let nuevo = prompt("Editar nombre de la canción:", nombreActual);
    if (nuevo && nuevo.trim() !== "") {
        db.ref("canciones/" + id).update({ nombre: nuevo.trim() });
    }
}

function actualizarContadoresInternos() {
    document.querySelectorAll(".playlist").forEach(p => {
        let num = p.querySelectorAll("li").length;
        p.querySelector(".count").innerText = num;
    });
}

function filtrarCategorias() {
    let seleccion = document.getElementById("filtroCategoria").value;
    document.querySelectorAll(".mix").forEach(bloque => {
        let titulo = bloque.querySelector("h2").innerText;
        bloque.style.display = (seleccion === "todos" || titulo === seleccion) ? "block" : "none";
    });
}

document.getElementById("buscador").addEventListener("keyup", function() {
    let texto = this.value.toLowerCase();
    document.querySelectorAll("li").forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(texto) ? "flex" : "none";
    });
});