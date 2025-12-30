// --- DATA ---
        // Añado propiedad 'pass' (contraseña) a cada tatuaje.
        let tattoos = [
            // Marvel
            { id: 1, nombre: "Thanos", cat: "marvel", estado: "disponible", precio: 130, img: "./img/001.png", pass: "M-TH82" },
            { id: 2, nombre: "Iron Man", cat: "marvel", estado: "disponible", precio: 130, img: "./img/002.png", pass: "M-IR99" },
            { id: 3, nombre: "Loki", cat: "marvel", estado: "disponible", precio: 130, img: "./img/003.png", pass: "M-LK44" },
            { id: 4, nombre: "Spiderman", cat: "marvel", estado: "disponible", precio: 130, img: "./img/004.png", pass: "M-SP12" },
            { id: 5, nombre: "Dr. Strange", cat: "marvel", estado: "disponible", precio: 130, img: "./img/005.png", pass: "M-DR77" },
            { id: 6, nombre: "Black Panther", cat: "marvel", estado: "disponible", precio: 130, img: "./img/006.png", pass: "M-BP55" },
            { id: 7, nombre: "Thor", cat: "marvel", estado: "disponible", precio: 130, img: "./img/007.png", pass: "M-TH11" },
            { id: 8, nombre: "Deadpool", cat: "marvel", estado: "disponible", precio: 130, img: "./img/008.png", pass: "M-DP69" },
            // Anime
            { id: 9, nombre: "Inazuma", cat: "anime", estado: "disponible", precio: 130, img: "./img/009.png", pass: "A-IN01" },
            { id: 10, nombre: "Zoro", cat: "anime", estado: "disponible", precio: 130, img: "./img/010.png", pass: "A-ZR33" },
            { id: 11, nombre: "Shin Chan", cat: "anime", estado: "disponible", precio: 130, img: "./img/011.png", pass: "A-SC55" },
            { id: 12, nombre: "Gyarados", cat: "anime", estado: "disponible", precio: 130, img: "./img/012.png", pass: "A-GY22" },
            { id: 13, nombre: "Naruto", cat: "anime", estado: "disponible", precio: 130, img: "./img/013.png", pass: "A-NA88" },
            { id: 14, nombre: "Dragon Ball", cat: "anime", estado: "disponible", precio: 130, img: "./img/014.png", pass: "A-DB07" },
            { id: 15, nombre: "Kitsune", cat: "anime", estado: "disponible", precio: 130, img: "./img/015.png", pass: "A-KI91" },
            { id: 16, nombre: "One Piece", cat: "anime", estado: "disponible", precio: 130, img: "./img/016.png", pass: "A-OP10" },
            // Disney
            { id: 17, nombre: "Rey León", cat: "disney", estado: "disponible", precio: 130, img: "./img/017.png", pass: "D-RL30" },
            { id: 18, nombre: "Mickey", cat: "disney", estado: "disponible", precio: 130, img: "./img/018.png", pass: "D-MK01" },
            { id: 19, nombre: "Totoro", cat: "disney", estado: "disponible", precio: 130, img: "./img/019.png", pass: "D-TO44" },
            { id: 20, nombre: "La bella y la bestia", cat: "disney", estado: "disponible", precio: 130, img: "./img/020.png", pass: "D-RS22" },
            { id: 21, nombre: "Campanilla", cat: "disney", estado: "disponible", precio: 130, img: "./img/021.png", pass: "D-CP88" },
            { id: 22, nombre: "Toy Story", cat: "disney", estado: "disponible", precio: 130, img: "./img/022.png", pass: "D-ST66" },
            { id: 23, nombre: "Tiguer", cat: "disney", estado: "disponible", precio: 130, img: "./img/023.png", pass: "D-AL99" },
            { id: 24, nombre: "Stitch", cat: "disney", estado: "disponible", precio: 130, img: "./img/024.png", pass: "D-CS00" },
        ];

        let isAdmin = false;
        let filtroActual = 'todos';
        let catRandomSelect = 'marvel';

        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            renderizarCatalogo();
            actualizarEstadoBotonesRandom(); // Chequear estado inicial
        });

        // --- CATALOGO Y ADMIN ---
        function renderizarCatalogo() {
            const grid = document.getElementById('grid-tattoos');
            const busqueda = document.getElementById('buscador').value.toLowerCase();
            grid.innerHTML = '';

            const filtrados = tattoos.filter(t => {
                const matchCat = filtroActual === 'todos' || t.cat === filtroActual;
                const matchSearch = t.nombre.toLowerCase().includes(busqueda);
                return matchCat && matchSearch;
            });

            if(filtrados.length === 0) {
                grid.innerHTML = `<div class="col-span-full text-center py-20 opacity-50"><p>No hay diseños.</p></div>`;
                return;
            }

            filtrados.forEach(t => {
                const esVendido = t.estado === 'vendido';
                let controls = '';
                
                if (isAdmin) {
                    controls = `
                        <div class="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                            <div class="flex justify-between items-center mb-2">
                                <label class="text-[10px] uppercase text-zinc-500 font-bold">Precio</label>
                                <input type="number" value="${t.precio}" onchange="guardarPrecio(${t.id}, this)" class="w-16 bg-black border border-zinc-800 text-right text-xs p-1 focus:border-red-600 outline-none">
                            </div>
                            <div class="flex justify-between items-center mb-2 bg-zinc-950 p-1 rounded">
                                <span class="text-[10px] text-zinc-500 font-mono">PASS: ${t.pass}</span>
                            </div>
                            <button onclick="toggleEstado(${t.id})" class="w-full py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${esVendido ? 'border-green-900 text-green-500 hover:bg-green-900/20' : 'border-red-900 text-red-500 hover:bg-red-900/20'}">
                                ${esVendido ? 'Reactivar' : 'Marcar Vendido'}
                            </button>
                        </div>
                    `;
                } else {
                    if(esVendido) {
                        controls = `
                            <div class="mt-4 w-full py-3 bg-red-600 text-white font-black text-center text-xs tracking-[0.2em] shadow-[0_0_15px_rgba(220,38,38,0.5)] cursor-not-allowed">
                                VENDIDO
                            </div>
                        `;
                    } else {
                        // En reserva normal, no pasamos contraseña especial, solo ID.
                        controls = `
                            <button onclick="abrirModalReserva(${t.id}, '${t.nombre}', ${t.precio}, null)" class="mt-4 w-full py-3 bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 group">
                                Reservar <i data-lucide="arrow-right" class="w-3 h-3 group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        `;
                    }
                }

                let initial = t.cat.charAt(0).toUpperCase();
                let initialColor = t.cat === 'marvel' ? 'text-red-900' : (t.cat === 'anime' ? 'text-yellow-900' : 'text-blue-900');

                grid.innerHTML += `
                    <div class="bg-zinc-900 group border border-zinc-800 hover:border-red-600/50 transition-all duration-300 relative ${esVendido && !isAdmin ? 'opacity-50 grayscale' : ''}">
                        <div class="h-64 bg-black relative overflow-hidden flex items-center justify-center">
                             <img src="${t.img}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                                  onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" alt="${t.nombre}">
                             <span class="hidden ${initialColor} font-black text-8xl opacity-20">${initial}</span>
                             <span class="absolute top-0 right-0 bg-black text-white text-[10px] px-3 py-1 font-mono border-l border-b border-zinc-800 z-10">#${t.id.toString().padStart(3,'0')}</span>
                             ${esVendido ? `<div class="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20"><span class="text-3xl font-black text-red-600 uppercase tracking-widest border-4 border-red-600 px-6 py-2 -rotate-12 shadow-[0_0_30px_rgba(220,38,38,0.5)]">Vendido</span></div>` : ''}
                        </div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-black text-white uppercase italic truncate pr-2">${t.nombre}</h3>
                            </div>
                            <div class="flex justify-between items-center border-b border-zinc-800 pb-4 mb-2">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">${t.cat}</span>
                                ${!isAdmin ? `<span class="text-lg font-bold text-red-500">${t.precio}€</span>` : ''}
                            </div>
                            ${controls}
                        </div>
                    </div>
                `;
            });
            lucide.createIcons();
        }

        function cambiarVista(vista) {
            document.getElementById('vista-home').classList.add('hidden');
            document.getElementById('vista-random').classList.add('hidden');
            
            const btnHome = document.getElementById('btn-home');
            const btnRandom = document.getElementById('btn-random');
            btnHome.className = "px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all text-zinc-400 hover:text-white hover:bg-zinc-800";
            btnRandom.className = "px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all text-zinc-400 hover:text-white hover:bg-zinc-800";

            if(vista === 'home') {
                document.getElementById('vista-home').classList.remove('hidden');
                btnHome.className = "px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all text-white bg-red-700 shadow-lg shadow-red-900/20";
                renderizarCatalogo();
            } else {
                document.getElementById('vista-random').classList.remove('hidden');
                btnRandom.className = "px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all text-white bg-red-700 shadow-lg shadow-red-900/20";
                volverMenuRandom();
                actualizarEstadoBotonesRandom();
            }
        }

        function filtrarCategoria(cat) {
            filtroActual = cat;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if(btn.dataset.cat === cat) btn.className = "filter-btn px-6 py-3 border border-zinc-800 text-xs font-black uppercase tracking-widest hover:border-red-600 transition-all bg-white text-black";
                else btn.className = "filter-btn px-6 py-3 border border-zinc-800 text-xs font-black uppercase tracking-widest hover:border-red-600 transition-all text-zinc-500 hover:text-white bg-zinc-900";
            });
            renderizarCatalogo();
        }

        function gestionarAccesoAdmin() {
            if (isAdmin) {
                isAdmin = false;
                document.getElementById('admin-badge').classList.add('hidden');
                document.getElementById('btn-admin-lock').classList.remove('text-red-500');
                renderizarCatalogo();
                alert("Sesión Cerrada");
            } else {
                document.getElementById('modal-login').classList.remove('hidden');
                document.getElementById('admin-pass').value = '';
                document.getElementById('login-error').classList.add('hidden');
                document.getElementById('admin-pass').focus();
            }
        }

        function procesarLogin() {
            if (document.getElementById('admin-pass').value === 'Vs2!3%95^2UhgKLavyRCSkWm$*vW6b') {
                isAdmin = true;
                cerrarModal('modal-login');
                document.getElementById('admin-badge').classList.remove('hidden');
                document.getElementById('btn-admin-lock').classList.add('text-red-500');
                cambiarVista('home');
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        }

        function toggleEstado(id) {
            const idx = tattoos.findIndex(t => t.id === id);
            if(idx !== -1) {
                tattoos[idx].estado = tattoos[idx].estado === 'disponible' ? 'vendido' : 'disponible';
                renderizarCatalogo();
            }
        }

        function guardarPrecio(id, el) {
            const idx = tattoos.findIndex(t => t.id === id);
            if(idx !== -1) {
                tattoos[idx].precio = el.value;
                el.classList.add('saved-flash');
                setTimeout(()=>el.classList.remove('saved-flash'), 1000);
            }
        }

        // --- LÓGICA MEMORIA & RANDOM ---
        
        // Función central para gestionar clicks en botones de jugar
        function manejarClickRuleta(modo) {
            // Verificar si ya tiene un resultado guardado
            let savedResult = null;
            if (modo === 'all') {
                const data = localStorage.getItem('berbel_result_all');
                if (data) savedResult = JSON.parse(data);
            } else {
                const data = localStorage.getItem(`berbel_result_cat_${catRandomSelect}`);
                if (data) savedResult = JSON.parse(data);
            }

            if (savedResult) {
                // Si ya tiene premio, mostrarlo directamente (Memoria)
                mostrarPantallaResultado(savedResult.tattooId, savedResult.price, savedResult.pass);
            } else {
                // Si no, iniciar ruleta nueva
                iniciarRuleta(modo);
            }
        }

        function actualizarEstadoBotonesRandom() {
            // Revisar Global (Ruleta Rusa)
            const resultAll = localStorage.getItem('berbel_result_all');
            const btnAll = document.getElementById('btn-spin-all');
            const titleAll = document.getElementById('txt-spin-all-title');
            const descAll = document.getElementById('txt-spin-all-desc');

            if (resultAll) {
                // Modo "Ver Premio"
                btnAll.classList.remove('btn-disabled'); // Asegurarnos que sea clickeable
                btnAll.classList.add('border-green-500'); // Diferenciar visualmente
                titleAll.innerText = "PREMIO ASIGNADO";
                titleAll.classList.add('text-green-500');
                titleAll.classList.remove('text-white');
                descAll.innerText = "Haz click para ver tu tatuaje ganado.";
            } else {
                // Modo Normal
                btnAll.classList.remove('border-green-500');
                titleAll.innerText = "RULETA RUSA";
                titleAll.classList.remove('text-green-500');
                titleAll.classList.add('text-white');
                descAll.innerText = "Cualquier diseño del catálogo completo.";
            }

            // Revisar Categoría Actual
            seleccionarCatRandom(catRandomSelect);
        }

        function seleccionarCatRandom(cat) {
            catRandomSelect = cat;
            
            // Tabs visuales
            document.querySelectorAll('.cat-rand-btn').forEach(btn => {
                btn.className = "cat-rand-btn py-4 text-xs font-black tracking-widest uppercase rounded border-2 border-transparent bg-black text-zinc-500 hover:text-white hover:border-zinc-700 transition-all";
            });
            const selected = document.getElementById(`btn-rand-${cat}`);
            if(selected) selected.className = "cat-rand-btn py-4 text-xs font-black tracking-widest uppercase rounded border-2 border-red-600 bg-black text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]";

            // Verificar estado botón Jugar
            const btnPlayCat = document.getElementById('btn-spin-cat');
            const resultCat = localStorage.getItem(`berbel_result_cat_${cat}`);

            if (resultCat) {
                btnPlayCat.innerText = "VER MI PREMIO";
                btnPlayCat.className = "w-full bg-zinc-900 border border-green-500 text-green-500 font-black py-5 rounded hover:bg-green-900/20 transition-all uppercase tracking-[0.2em] shadow-lg";
            } else {
                btnPlayCat.innerText = "JUGAR AHORA";
                btnPlayCat.className = "w-full bg-white text-black font-black py-5 rounded hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-lg";
            }
        }

        function iniciarRuleta(modo) {
            const options = document.getElementById('random-options');
            const loading = document.getElementById('random-loading');
            
            let pool = tattoos.filter(t => t.estado === 'disponible');
            if(modo === 'cat') pool = pool.filter(t => t.cat === catRandomSelect);

            if(pool.length === 0) {
                alert("No hay diseños disponibles.");
                return;
            }

            options.classList.add('hidden');
            loading.classList.remove('hidden');

            setTimeout(() => {
                const ganador = pool[Math.floor(Math.random() * pool.length)];
                const precio = modo === 'all' ? 80 : 100;
                
                // GUARDAR RESULTADO EN MEMORIA
                const resultData = { tattooId: ganador.id, price: precio, pass: ganador.pass };
                if (modo === 'all') {
                    localStorage.setItem('berbel_result_all', JSON.stringify(resultData));
                } else {
                    localStorage.setItem(`berbel_result_cat_${catRandomSelect}`, JSON.stringify(resultData));
                }

                mostrarPantallaResultado(ganador.id, precio, ganador.pass);
                actualizarEstadoBotonesRandom(); // Actualizar botones por detrás
            }, 2500);
        }

        function mostrarPantallaResultado(id, precio, pass) {
            const loading = document.getElementById('random-loading');
            const options = document.getElementById('random-options');
            const result = document.getElementById('random-result');
            const ganador = tattoos.find(t => t.id === id);

            loading.classList.add('hidden');
            options.classList.add('hidden');
            result.classList.remove('hidden');
            
            document.getElementById('res-nombre').innerText = ganador.nombre;
            document.getElementById('res-precio').innerText = precio + "€";
            document.getElementById('res-pass').innerText = pass; // Mostrar pass en pantalla
            document.getElementById('btn-res-claim').onclick = () => abrirModalReserva(ganador.id, ganador.nombre, precio, pass);
            
            const img = document.getElementById('res-img');
            const ph = document.getElementById('res-placeholder');
            
            if(ganador.img && !ganador.img.includes('placeholder')) {
                img.src = ganador.img;
                img.classList.remove('hidden');
                ph.classList.add('hidden');
            } else {
                img.classList.add('hidden');
                ph.classList.remove('hidden');
            }
            lucide.createIcons();
        }

        function volverMenuRandom() {
            document.getElementById('random-options').classList.remove('hidden');
            document.getElementById('random-result').classList.add('hidden');
            document.getElementById('random-loading').classList.add('hidden');
            actualizarEstadoBotonesRandom();
        }

        // Modales
        function abrirModalReserva(id, nombre, precio, pass) {
            let texto = "";
            if (pass) {
                // Mensaje con contraseña (Premio Aleatorio)
                texto = `Hola, me ha tocado el tatuaje de ${nombre}, pedido ${pass} (contraseña) por ${precio}€.`;
            } else {
                // Mensaje normal (Catálogo)
                texto = `Hola! Quiero reservar el diseño "${nombre}" (ID: ${id}) por ${precio}€.`;
            }

            mensajeActual = texto;
            document.getElementById('modal-mensaje').innerText = mensajeActual;
            
            const btn = document.getElementById('btn-copiar');
            btn.innerHTML = `<i data-lucide="copy" class="w-4 h-4"></i> <span>Copiar Mensaje</span>`;
            btn.classList.remove('bg-green-600', 'border-green-600');
            btn.classList.add('bg-zinc-900', 'border-zinc-800');

            document.getElementById('modal-reserva').classList.remove('hidden');
            lucide.createIcons();
        }

        function cerrarModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        let mensajeActual = "";
        function copiarMensaje() {
            navigator.clipboard.writeText(mensajeActual).then(() => {
                const btn = document.getElementById('btn-copiar');
                btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> <span>¡Copiado!</span>`;
                btn.classList.remove('bg-zinc-900', 'border-zinc-800');
                btn.classList.add('bg-green-900', 'border-green-600', 'text-green-400');
                lucide.createIcons();
            });
        }