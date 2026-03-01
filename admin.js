// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyAlAUnyCLOnTCMJoW3Ruix17gNDqAdzUhM",
    authDomain: "berbeltattoo.firebaseapp.com",
    projectId: "berbeltattoo",
    storageBucket: "berbeltattoo.firebasestorage.app",
    messagingSenderId: "805157565248",
    appId: "1:805157565248:web:1c9b455be4350baa5940a5"
};

let db = null;
let usuariosData = [];
let videosData = [];

// Base de datos estática
const staticData = [
    { id: 1, nombre: "Thanos", img: "./img/001.png" }, { id: 2, nombre: "Iron Man", img: "./img/002.png" },
    { id: 3, nombre: "Loki", img: "./img/003.png" }, { id: 4, nombre: "Spiderman", img: "./img/004.png" },
    { id: 5, nombre: "Dr. Strange", img: "./img/005.png" }, { id: 6, nombre: "Black Panther", img: "./img/006.png" },
    { id: 7, nombre: "Thor", img: "./img/007.png" }, { id: 8, nombre: "Deadpool", img: "./img/008.png" },
    { id: 9, nombre: "Inazuma", img: "./img/009.png" }, { id: 10, nombre: "Zoro", img: "./img/010.png" },
    { id: 11, nombre: "Shin Chan", img: "./img/011.png" }, { id: 12, nombre: "Gyarados", img: "./img/012.png" },
    { id: 13, nombre: "Naruto", img: "./img/013.png" }, { id: 14, nombre: "Dragon Ball", img: "./img/014.png" },
    { id: 15, nombre: "Kitsune", img: "./img/015.png" }, { id: 16, nombre: "One Piece", img: "./img/016.png" },
    { id: 17, nombre: "Rey León", img: "./img/017.png" }, { id: 18, nombre: "Mickey", img: "./img/018.png" },
    { id: 19, nombre: "Totoro", img: "./img/019.png" }, { id: 20, nombre: "Bella y bestia", img: "./img/020.png" },
    { id: 21, nombre: "Campanilla", img: "./img/021.png" }, { id: 22, nombre: "Toy Story", img: "./img/022.png" },
    { id: 23, nombre: "Tiguer", img: "./img/023.png" }, { id: 24, nombre: "Stitch", img: "./img/024.png" }
];
let tattoosCloud = {};

window.onload = function() {
    lucide.createIcons();
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // SISTEMA DE SEGURIDAD
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            db.collection('usuarios').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().rol === 'admin') {
                    document.getElementById('pantalla-bloqueo').classList.add('hidden');
                    iniciarPanel();
                } else {
                    document.getElementById('error-acceso').classList.remove('hidden');
                    document.getElementById('btn-volver').classList.remove('hidden');
                }
            }).catch(error => {
                console.error("Error validando admin:", error);
            });
        } else {
            document.getElementById('error-acceso').innerText = "NO HAY SESIÓN ACTIVA.";
            document.getElementById('error-acceso').classList.remove('hidden');
            document.getElementById('btn-volver').classList.remove('hidden');
        }
    });
};

function iniciarPanel() {
    db.collection('usuarios').onSnapshot(snapshot => {
        usuariosData = [];
        snapshot.forEach(doc => usuariosData.push({ uid: doc.id, ...doc.data() }));
        renderizarUsuarios();
    });

    db.collection('inventario').doc('main').onSnapshot(doc => {
        if (doc.exists) {
            tattoosCloud = doc.data();
            renderizarTatuajesAdmin();
        }
    });

    db.collection('videos').orderBy('fecha', 'desc').onSnapshot(snapshot => {
        videosData = [];
        snapshot.forEach(doc => videosData.push({ id: doc.id, ...doc.data() }));
        renderizarVideosAdmin();
    });
}

function cambiarTab(tab) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn px-4 py-2 text-xs font-bold uppercase transition-all ' + 
        (btn.id === `tab-btn-${tab}` ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white');
    });
}

function renderizarUsuarios() {
    const tbody = document.getElementById('lista-usuarios');
    const search = document.getElementById('buscador-usuarios').value.toLowerCase();
    tbody.innerHTML = '';
    
    const filtrados = usuariosData.filter(u => 
        (u.nombre && u.nombre.toLowerCase().includes(search)) || 
        (u.email && u.email.toLowerCase().includes(search))
    );

    filtrados.forEach(u => {
        const isJefe = u.rol === 'admin';
        const monedas = u.jimmyCoins || 0;
        
        let premiosHTML = '';
        if (u.ruleta) {
            for (const [categoria, premio] of Object.entries(u.ruleta)) {
                let etiqueta = categoria === 'all' ? 'RULETA RUSA' : categoria.toUpperCase();
                premiosHTML += `<span class="inline-block bg-red-900/50 border border-red-700 text-red-100 text-[9px] px-2 py-0.5 rounded mr-1 mt-2 tracking-widest">${etiqueta}: ${premio.nombre}</span>`;
            }
        }
        
        tbody.innerHTML += `
        <tr class="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
            <td class="p-4 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase">${u.nombre ? u.nombre.charAt(0) : '?'}</div>
                <div>
                    <p class="font-bold text-sm text-white">${u.nombre || 'Sin Nombre'} ${isJefe ? '<span class="text-[8px] bg-red-600 text-white px-1 rounded ml-1">ADMIN</span>' : ''}</p>
                </div>
            </td>
            <td class="p-4">
                <p class="text-xs text-zinc-400 font-mono">${u.email}</p>
                <div>${premiosHTML}</div>
            </td>
            <td class="p-4 text-center">
                <span class="text-xl font-black text-red-500 italic">${monedas}</span>
            </td>
            <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="cambiarMonedas('${u.uid}', -50)" class="w-8 h-8 bg-zinc-900 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-500 rounded font-bold transition-all" title="Quitar 50">-</button>
                    <button onclick="cambiarMonedas('${u.uid}', 50)" class="w-8 h-8 bg-zinc-900 border border-zinc-700 hover:border-green-500 text-zinc-400 hover:text-green-500 rounded font-bold transition-all" title="Añadir 50">+</button>
                    <button onclick="cambiarMonedasCustom('${u.uid}')" class="px-3 h-8 bg-zinc-900 border border-zinc-700 hover:text-white text-xs font-bold rounded transition-all uppercase">Editar</button>
                </div>
            </td>
        </tr>`;
    });
}

function cambiarMonedas(uid, cantidad) {
    const user = usuariosData.find(u => u.uid === uid);
    let nuevasMonedas = (user.jimmyCoins || 0) + cantidad;
    if (nuevasMonedas < 0) nuevasMonedas = 0;
    db.collection('usuarios').doc(uid).update({ jimmyCoins: nuevasMonedas });
}

function cambiarMonedasCustom(uid) {
    const user = usuariosData.find(u => u.uid === uid);
    const num = prompt(`Monedas actuales de ${user.nombre}: ${user.jimmyCoins || 0}\nIngresa el NUEVO TOTAL de monedas:`);
    if (num !== null && !isNaN(num) && num.trim() !== "") {
        db.collection('usuarios').doc(uid).update({ jimmyCoins: parseInt(num) });
    }
}

function renderizarTatuajesAdmin() {
    const grid = document.getElementById('grid-admin-tattoos');
    grid.innerHTML = '';
    
    staticData.forEach(t => {
        const estadoActual = tattoosCloud[t.id]?.estado || 'disponible';
        const precioActual = tattoosCloud[t.id]?.precio || 130;
        const esVendido = estadoActual === 'vendido';
        
        grid.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-2 text-center relative ${esVendido ? 'opacity-50' : ''}">
            <img src="${t.img}" class="w-full h-24 object-cover bg-black mb-2" onerror="this.style.display='none'">
            <p class="text-[10px] font-bold truncate mb-2 uppercase text-white">${t.id}. ${t.nombre}</p>
            
            <div class="flex items-center bg-black border border-zinc-800 mb-2">
                <span class="text-[10px] text-zinc-500 pl-2">€</span>
                <input type="number" value="${precioActual}" onchange="guardarPrecioTattoo(${t.id}, this.value)" class="w-full bg-transparent p-1 text-xs text-center text-white outline-none">
            </div>
            
            <button onclick="toggleEstadoTattoo(${t.id}, '${estadoActual}')" class="w-full py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all ${esVendido ? 'border-green-900 text-green-500 hover:bg-green-900/30' : 'border-red-900 text-red-500 hover:bg-red-900/30'}">
                ${esVendido ? 'Reactivar' : 'Vender'}
            </button>
        </div>`;
    });
}

function guardarPrecioTattoo(id, nuevoPrecio) {
    db.collection('inventario').doc('main').set({
        [id]: { precio: parseInt(nuevoPrecio) }
    }, { merge: true });
}

function toggleEstadoTattoo(id, estadoActual) {
    db.collection('inventario').doc('main').set({
        [id]: { estado: estadoActual === 'disponible' ? 'vendido' : 'disponible' }
    }, { merge: true });
}

function guardarVideo(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Guardando...";
    
    db.collection('videos').add({
        url: document.getElementById('vid-url').value,
        titulo: document.getElementById('vid-titulo').value,
        descripcion: document.getElementById('vid-desc').value,
        fecha: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('form-video').reset();
        btn.innerText = "Publicar Video";
    }).catch(error => {
        console.error("Error subiendo video:", error);
        alert("Error al subir el video.");
        btn.innerText = "Publicar Video";
    });
}

function renderizarVideosAdmin() {
    const lista = document.getElementById('lista-admin-videos');
    lista.innerHTML = '';
    
    videosData.forEach(v => {
        lista.innerHTML += `
        <div class="bg-black border border-zinc-800 p-4 flex justify-between items-center gap-4">
            <div class="truncate">
                <p class="font-bold text-sm text-white uppercase italic">${v.titulo}</p>
                <p class="text-[10px] text-zinc-500 font-mono truncate">${v.url}</p>
            </div>
            <button onclick="borrarVideo('${v.id}')" class="text-zinc-600 hover:text-red-500 transition-colors p-2 bg-zinc-900 rounded"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>`;
    });
    lucide.createIcons();
}

function borrarVideo(id) {
    if(confirm("¿Estás seguro de que quieres borrar este video de la web?")) {
        db.collection('videos').doc(id).delete();
    }
}