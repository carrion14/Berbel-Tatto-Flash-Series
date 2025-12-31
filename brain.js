// --- CONFIGURACIÓN DE FIREBASE ---
        const firebaseConfig = {
            apiKey: "AIzaSyAlAUnyCLOnTCMJoW3Ruix17gNDqAdzUhM",
            authDomain: "berbeltattoo.firebaseapp.com",
            projectId: "berbeltattoo",
            storageBucket: "berbeltattoo.firebasestorage.app",
            messagingSenderId: "805157565248",
            appId: "1:805157565248:web:1c9b455be4350baa5940a5",
            measurementId: "G-71J3P635LN"
        };

        let db = null;
        let appId = "berbel-live-final"; 
        
        const staticData = [
            { id: 1, nombre: "Thanos", cat: "marvel", img: "./img/001.png", pass: "M-TH82" },
            { id: 2, nombre: "Iron Man", cat: "marvel", img: "./img/002.png", pass: "M-IR99" },
            { id: 3, nombre: "Loki", cat: "marvel", img: "./img/003.png", pass: "M-LK44" },
            { id: 4, nombre: "Spiderman", cat: "marvel", img: "./img/004.png", pass: "M-SP12" },
            { id: 5, nombre: "Dr. Strange", cat: "marvel", img: "./img/005.png", pass: "M-DR77" },
            { id: 6, nombre: "Black Panther", cat: "marvel", img: "./img/006.png", pass: "M-BP55" },
            { id: 7, nombre: "Thor", cat: "marvel", img: "./img/007.png", pass: "M-TH11" },
            { id: 8, nombre: "Deadpool", cat: "marvel", img: "./img/008.png", pass: "M-DP69" },
            { id: 9, nombre: "Inazuma", cat: "anime", img: "./img/009.png", pass: "A-IN01" },
            { id: 10, nombre: "Zoro", cat: "anime", img: "./img/010.png", pass: "A-ZR33" },
            { id: 11, nombre: "Shin Chan", cat: "anime", img: "./img/011.png", pass: "A-SC55" },
            { id: 12, nombre: "Gyarados", cat: "anime", img: "./img/012.png", pass: "A-GY22" },
            { id: 13, nombre: "Naruto", cat: "anime", img: "./img/013.png", pass: "A-NA88" },
            { id: 14, nombre: "Dragon Ball", cat: "anime", img: "./img/014.png", pass: "A-DB07" },
            { id: 15, nombre: "Kitsune", cat: "anime", img: "./img/015.png", pass: "A-KI91" },
            { id: 16, nombre: "One Piece", cat: "anime", img: "./img/016.png", pass: "A-OP10" },
            { id: 17, nombre: "Rey León", cat: "disney", img: "./img/017.png", pass: "D-RL30" },
            { id: 18, nombre: "Mickey", cat: "disney", img: "./img/018.png", pass: "D-MK01" },
            { id: 19, nombre: "Totoro", cat: "disney", img: "./img/019.png", pass: "D-TO44" },
            { id: 20, nombre: "La Bella y la bestia", cat: "disney", img: "./img/020.png", pass: "D-RS22" },
            { id: 21, nombre: "Campanilla", cat: "disney", img: "./img/021.png", pass: "D-CP88" },
            { id: 22, nombre: "Toy Story", cat: "disney", img: "./img/022.png", pass: "D-ST66" },
            { id: 23, nombre: "Tiguer", cat: "disney", img: "./img/023.png", pass: "D-AL99" },
            { id: 24, nombre: "Stitch", cat: "disney", img: "./img/024.png", pass: "D-CS00" }
        ];

        let tattoos = [...staticData.map(t => ({...t, estado: 'disponible', precio: 130}))];
        let isAdmin = false;
        let filtroActual = 'todos';
        let catRandomSelect = 'marvel';
        let mensajeActual = "";

        window.onload = function() {
            lucide.createIcons();
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebase.auth().signInAnonymously();
            
            const docRef = db.collection('inventario').doc('main');
            docRef.onSnapshot(doc => {
                if (doc.exists) {
                    const cloud = doc.data();
                    tattoos = staticData.map(t => ({
                        ...t,
                        estado: cloud[t.id]?.estado || 'disponible',
                        precio: cloud[t.id]?.precio || 130
                    }));
                    renderizarCatalogo();
                } else {
                    const init = {}; tattoos.forEach(t => init[t.id] = { estado: 'disponible', precio: 130 });
                    docRef.set(init);
                }
            });
            actualizarEstadoBotonesRandom();
        };

        function renderizarCatalogo() {
            const grid = document.getElementById('grid-tattoos');
            const search = document.getElementById('buscador').value.toLowerCase();
            grid.innerHTML = '';
            const filtrados = tattoos.filter(t => (filtroActual === 'todos' || t.cat === filtroActual) && t.nombre.toLowerCase().includes(search));
            
            filtrados.forEach(t => {
                const esVendido = t.estado === 'vendido';
                let ctrls = isAdmin ? `
                    <div class="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                        <div class="flex justify-between items-center">
                            <label class="text-[10px] font-bold">PRECIO</label>
                            <input type="number" value="${t.precio}" onchange="guardarPrecio(${t.id}, this)" class="w-16 bg-black border border-zinc-800 text-right text-xs p-1 text-white focus:border-red-600 outline-none">
                        </div>
                        <div class="bg-zinc-950 p-1 text-[10px] font-mono text-zinc-500">#${t.pass}</div>
                        <button onclick="toggleEstado(${t.id})" class="w-full py-2 text-[10px] font-black border uppercase tracking-widest transition-all ${esVendido ? 'border-green-900 text-green-500 hover:bg-green-900/20' : 'border-red-900 text-red-500 hover:bg-red-900/20'}">
                            ${esVendido ? 'Reactivar' : 'Marcar Vendido'}
                        </button>
                    </div>` : 
                    (esVendido ? `<div class="mt-4 w-full py-3 bg-red-600 text-white font-black text-center text-xs tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.4)] uppercase">Vendido</div>` : `<button onclick="abrirModalReserva(${t.id}, '${t.nombre}', ${t.precio}, null)" class="mt-4 w-full py-3 bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group hover:bg-red-600 hover:text-white transition-all">Reservar <i data-lucide="arrow-right" class="w-3 h-3 group-hover:translate-x-1 transition-transform"></i></button>`);
                
                grid.innerHTML += `<div class="bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-all duration-300 relative ${esVendido && !isAdmin ? 'opacity-50 grayscale' : ''} shadow-lg"><div class="h-64 bg-black relative overflow-hidden flex items-center justify-center"><img src="${t.img}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div class="hidden flex items-center justify-center font-black text-red-900/10 text-6xl italic">BT</div><span class="absolute top-0 right-0 bg-black text-white text-[10px] px-3 py-1 font-mono border-l border-b border-zinc-800 z-10 opacity-30">#${t.id.toString().padStart(3,'0')}</span>${esVendido ? `<div class="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20"><span class="text-3xl font-black text-red-600 uppercase border-4 border-red-600 px-6 py-2 -rotate-12 shadow-2xl">Vendido</span></div>` : ''}</div><div class="p-6 text-left"><h3 class="text-xl font-black text-white uppercase italic truncate mb-2">${t.nombre}</h3><div class="flex justify-between items-center border-b border-zinc-800 pb-4 mb-2"><span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">${t.cat}</span>${!isAdmin ? `<span class="text-lg font-bold text-red-500 italic">${t.precio}€</span>` : ''}</div>${ctrls}</div></div>`;
            });
            lucide.createIcons();
        }

        function updateCloud(id, data) {
            const state = {};
            state[id] = { 
                estado: data.estado !== undefined ? data.estado : tattoos.find(t => t.id === id).estado,
                precio: data.precio !== undefined ? data.precio : tattoos.find(t => t.id === id).precio
            };
            db.collection('inventario').doc('main').set(state, {merge:true});
        }
        function toggleEstado(id) { const t = tattoos.find(t => t.id === id); updateCloud(id, { estado: t.estado === 'disponible' ? 'vendido' : 'disponible' }); }
        function guardarPrecio(id, el) { updateCloud(id, { precio: parseInt(el.value) }); el.classList.add('saved-flash'); setTimeout(()=>el.classList.remove('saved-flash'), 1000); }
        function gestionarAccesoAdmin() { if(isAdmin) { isAdmin = false; document.getElementById('admin-badge').classList.add('hidden'); document.getElementById('btn-admin-lock').classList.remove('text-red-500'); renderizarCatalogo(); } else { document.getElementById('modal-login').classList.remove('hidden'); document.getElementById('admin-pass').value = ''; document.getElementById('login-error').classList.add('hidden'); document.getElementById('admin-pass').focus(); } }
        
        function procesarLogin() { 
            if(document.getElementById('admin-pass').value === 'Vs2!3%95^2UhgKLavyRCSkWm$*vW6b') { 
                isAdmin = true; 
                cerrarModal('modal-login'); 
                document.getElementById('admin-badge').classList.remove('hidden'); 
                document.getElementById('btn-admin-lock').classList.add('text-red-500'); 
                renderizarCatalogo(); 
                cambiarVista('home'); 
            } else {
                document.getElementById('login-error').classList.remove('hidden'); 
            }
        }

        function manejarClickRuleta(modo) {
            const saved = localStorage.getItem(modo === 'all' ? 'berbel_res_all' : `berbel_res_cat_${catRandomSelect}`);
            if(saved) { const d = JSON.parse(saved); mostrarResultado(d.id, d.price, d.pass); } else iniciarRuleta(modo);
        }
        function iniciarRuleta(modo) {
            const pool = tattoos.filter(t => t.estado === 'disponible');
            const final = modo === 'cat' ? pool.filter(t => t.cat === catRandomSelect) : pool;
            if(final.length === 0) { alert("No hay diseños libres."); return; }
            document.getElementById('random-options').classList.add('hidden');
            document.getElementById('random-loading').classList.remove('hidden');
            setTimeout(() => {
                const g = final[Math.floor(Math.random() * final.length)];
                const p = modo === 'all' ? 80 : 100;
                localStorage.setItem(modo === 'all' ? 'berbel_res_all' : `berbel_res_cat_${catRandomSelect}`, JSON.stringify({id: g.id, price: p, pass: g.pass}));
                mostrarResultado(g.id, p, g.pass);
            }, 2000);
        }
        function mostrarResultado(id, p, pass) {
            document.getElementById('random-loading').classList.add('hidden');
            document.getElementById('random-options').classList.add('hidden');
            document.getElementById('random-result').classList.remove('hidden');
            const g = tattoos.find(t => t.id === id);
            document.getElementById('res-nombre').innerText = g.nombre;
            document.getElementById('res-precio').innerText = p + "€";
            document.getElementById('res-pass').innerText = pass;
            const img = document.getElementById('res-img');
            if(g.img) { img.src = g.img; img.classList.remove('hidden'); document.getElementById('res-placeholder').classList.add('hidden'); }
            document.getElementById('btn-res-claim').onclick = () => abrirModalReserva(g.id, g.nombre, p, pass);
            actualizarEstadoBotonesRandom();
        }
        function actualizarEstadoBotonesRandom() {
            if(localStorage.getItem('berbel_res_all')) {
                const btn = document.getElementById('btn-spin-all');
                btn.classList.add('border-green-500');
                document.getElementById('txt-spin-all-title').innerText = "Premio Asignado";
                document.getElementById('txt-spin-all-title').classList.add('text-green-500');
                document.getElementById('txt-spin-all-desc').innerText = "Haz click para ver tu premio.";
            }
            seleccionarCatRandom(catRandomSelect);
        }
        function seleccionarCatRandom(c) {
            catRandomSelect = c;
            document.querySelectorAll('.cat-rand-btn').forEach(b => b.className = b.id === `btn-rand-${c}` ? 'cat-rand-btn py-4 text-xs font-black tracking-widest uppercase rounded border-2 border-red-600 bg-black text-white shadow-xl' : 'cat-rand-btn py-4 text-xs font-black tracking-widest uppercase rounded border-2 border-transparent bg-black text-zinc-500 hover:text-white transition-all');
            const btn = document.getElementById('btn-spin-cat');
            const saved = localStorage.getItem(`berbel_res_cat_${c}`);
            if(saved) { btn.innerText = "VER MI PREMIO"; btn.className = "w-full bg-zinc-900 border border-green-500 text-green-500 font-black py-5 rounded tracking-widest transition-all"; }
            else { btn.innerText = "JUGAR AHORA"; btn.className = "w-full bg-white text-black font-black py-5 rounded hover:bg-red-600 hover:text-white uppercase tracking-widest transition-all"; }
        }
        function volverMenuRandom() { document.getElementById('random-options').classList.remove('hidden'); document.getElementById('random-result').classList.add('hidden'); document.getElementById('random-loading').classList.add('hidden'); actualizarEstadoBotonesRandom(); }

        function cambiarVista(v) {
            document.getElementById('vista-home').className = v === 'home' ? 'fade-in' : 'hidden'; 
            document.getElementById('vista-random').className = v === 'random' ? 'fade-in' : 'hidden';
            document.getElementById('btn-home').className = v === 'home' ? 'px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase text-white bg-red-700 shadow-lg' : 'px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all';
            document.getElementById('btn-random').className = v === 'random' ? 'px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase text-white bg-red-700 shadow-lg' : 'px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all';
            if(v === 'random') volverMenuRandom(); else renderizarCatalogo();
        }
        function filtrarCategoria(c) { filtroActual = c; document.querySelectorAll('.filter-btn').forEach(b => b.className = b.dataset.cat === c ? 'filter-btn px-4 md:px-6 py-2 md:py-3 border border-zinc-800 text-[10px] md:text-xs font-black uppercase bg-white text-black' : 'filter-btn px-4 md:px-6 py-2 md:py-3 border border-zinc-800 text-[10px] md:text-xs font-black uppercase text-zinc-500 hover:text-white bg-zinc-900 transition-all'); renderizarCatalogo(); }
        function cerrarModal(id) { document.getElementById(id).classList.add('hidden'); }
        
        function abrirModalReserva(id, n, p, pass) {
            mensajeActual = pass ? `Hola Berbel! Me ha tocado el tatuaje de ${n}, pedido con código secreto ${pass} por ${p}€.` : `Hola Berbel! Quiero reservar el diseño "${n}" (ID: ${id}) por ${p}€.`;
            document.getElementById('modal-mensaje').innerText = mensajeActual;
            document.getElementById('btn-copiar').innerHTML = `<i data-lucide="copy" class="w-4 h-4"></i> <span>Copiar Mensaje</span>`;
            document.getElementById('modal-reserva').classList.remove('hidden');
            lucide.createIcons();
        }
        function copiarMensaje() { navigator.clipboard.writeText(mensajeActual).then(() => { document.getElementById('btn-copiar').innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> <span>¡Copiado!</span>`; lucide.createIcons(); }); }