const firebaseConfig={apiKey:"AIzaSyAlAUnyCLOnTCMJoW3Ruix17gNDqAdzUhM",authDomain:"berbeltattoo.firebaseapp.com",projectId:"berbeltattoo",storageBucket:"berbeltattoo.firebasestorage.app",messagingSenderId:"805157565248",appId:"1:805157565248:web:1c9b455be4350baa5940a5",measurementId:"G-71J3P635LN"};

const staticData=[
  {id:1,nombre:"Thanos",cat:"marvel",img:"img/001.png",pass:"M-TH82"},{id:2,nombre:"Iron Man",cat:"marvel",img:"img/002.png",pass:"M-IR99"},{id:3,nombre:"Loki",cat:"marvel",img:"img/003.png",pass:"M-LK44"},{id:4,nombre:"Spiderman",cat:"marvel",img:"img/004.png",pass:"M-SP12"},{id:5,nombre:"Dr. Strange",cat:"marvel",img:"img/005.png",pass:"M-DR77"},{id:6,nombre:"Black Panther",cat:"marvel",img:"img/006.png",pass:"M-BP55"},{id:7,nombre:"Thor",cat:"marvel",img:"img/007.png",pass:"M-TH11"},{id:8,nombre:"Deadpool",cat:"marvel",img:"img/008.png",pass:"M-DP69"},
  {id:9,nombre:"Inazuma",cat:"anime",img:"img/009.png",pass:"A-IN01"},{id:10,nombre:"Zoro",cat:"anime",img:"img/010.png",pass:"A-ZR33"},{id:11,nombre:"Shin Chan",cat:"anime",img:"img/011.png",pass:"A-SC55"},{id:12,nombre:"Gyarados",cat:"anime",img:"img/012.png",pass:"A-GY22"},{id:13,nombre:"Naruto",cat:"anime",img:"img/013.png",pass:"A-NA88"},{id:14,nombre:"Dragon Ball",cat:"anime",img:"img/014.png",pass:"A-DB07"},{id:15,nombre:"Kitsune",cat:"anime",img:"img/015.png",pass:"A-KI91"},{id:16,nombre:"One Piece",cat:"anime",img:"img/016.png",pass:"A-OP10"},
  {id:17,nombre:"Rey León",cat:"disney",img:"img/017.png",pass:"D-RL30"},{id:18,nombre:"Mickey",cat:"disney",img:"img/018.png",pass:"D-MK01"},{id:19,nombre:"Totoro",cat:"disney",img:"img/019.png",pass:"D-TO44"},{id:20,nombre:"La Bella y la Bestia",cat:"disney",img:"img/020.png",pass:"D-RS22"},{id:21,nombre:"Campanilla",cat:"disney",img:"img/021.png",pass:"D-CP88"},{id:22,nombre:"Toy Story",cat:"disney",img:"img/022.png",pass:"D-ST66"},{id:23,nombre:"Tigger",cat:"disney",img:"img/023.png",pass:"D-AL99"},{id:24,nombre:"Stitch",cat:"disney",img:"img/024.png",pass:"D-CS00"}
];

let tattoos=staticData.map(t=>({...t,estado:"disponible",precio:130}));
let videos=[],filtroActual="todos",catRandomSelect="marvel",mensajeActual="",db=null,currentUser=null,userData=null,unsubscribeUser=null,randomBusy=false,rouletteTimer=null;
const $=id=>document.getElementById(id);

document.addEventListener("DOMContentLoaded",()=>{
  $("year").textContent=new Date().getFullYear();
  renderizarCatalogo();
  iniciarFirebase();
  document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal:not(.hidden)").forEach(m=>m.classList.add("hidden"));});
  document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.add("hidden");}));
});

function iniciarFirebase(){
  if(typeof firebase==="undefined")return;
  try{
    firebase.initializeApp(firebaseConfig);db=firebase.firestore();
    firebase.auth().onAuthStateChanged(user=>{
      if(unsubscribeUser){unsubscribeUser();unsubscribeUser=null;}
      currentUser=user&&!user.isAnonymous?user:null;
      $("btn-login").classList.toggle("hidden",!!currentUser);$("user-info").classList.toggle("hidden",!currentUser);
      if(!currentUser){userData=null;$("admin-link").classList.add("hidden");return;}
      $("user-name").textContent=(currentUser.displayName||"Mi cuenta").split(" ")[0];
      $("user-pic").src=currentUser.photoURL||"img/logo w.png";
      const ref=db.collection("usuarios").doc(currentUser.uid);
      unsubscribeUser=ref.onSnapshot(doc=>{
        if(doc.exists){userData=doc.data();$("user-coins").textContent=userData.jimmyCoins||0;$("admin-link").classList.toggle("hidden",userData.rol!=="admin");actualizarEstadoBotonesRandom();}
        else ref.set({nombre:currentUser.displayName||"Sin nombre",email:currentUser.email||"",jimmyCoins:0,rol:"cliente",fechaRegistro:firebase.firestore.FieldValue.serverTimestamp()});
      });
    });
    db.collection("inventario").doc("main").onSnapshot(doc=>{
      if(!doc.exists)return;const cloud=doc.data();tattoos=staticData.map(t=>({...t,estado:cloud[t.id]?.estado||"disponible",precio:cloud[t.id]?.precio||130}));renderizarCatalogo();
    });
    db.collection("videos").orderBy("fecha","desc").onSnapshot(snapshot=>{videos=[];snapshot.forEach(doc=>videos.push({id:doc.id,...doc.data()}));renderizarVideos();},()=>renderizarVideos());
  }catch(error){console.warn("La sincronización en tiempo real no está disponible.",error);}
}

function renderizarCatalogo(){
  const grid=$("grid-tattoos");if(!grid)return;
  const term=($("buscador")?.value||"").trim().toLocaleLowerCase("es");
  const items=tattoos.filter(t=>(filtroActual==="todos"||t.cat===filtroActual)&&t.nombre.toLocaleLowerCase("es").includes(term));
  $("catalog-status").textContent=`${items.length} ${items.length===1?"diseño":"diseños"} en esta selección`;
  if(!items.length){grid.innerHTML='<p class="empty-state">No hay diseños que coincidan. Prueba con otra búsqueda.</p>';return;}
  grid.innerHTML=items.map(t=>{
    const sold=t.estado==="vendido";
    return `<article class="tattoo-card">
      <div class="tattoo-image"><img src="${t.img}" alt="Diseño ${escapeHtml(t.nombre)}" loading="lazy"><span class="tattoo-number">N.º ${String(t.id).padStart(3,"0")}</span>${sold?'<div class="sold-mark">Pieza reservada</div>':""}</div>
      <div class="tattoo-info"><div><h3>${escapeHtml(t.nombre)}</h3><p>${nombreCategoria(t.cat)} · diseño único</p></div><span class="tattoo-price">${t.precio} €</span>
      <button class="reserve-button" type="button" ${sold?"disabled":""} onclick="abrirModalReserva(${t.id},'${escapeAttr(t.nombre)}',${t.precio},null)"><span>${sold?"No disponible":"Reservar esta pieza"}</span><span>→</span></button></div>
    </article>`;
  }).join("");
}

function filtrarCategoria(cat){filtroActual=cat;document.querySelectorAll(".filter-btn").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat));renderizarCatalogo();}
function nombreCategoria(cat){return cat.charAt(0).toUpperCase()+cat.slice(1);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function escapeAttr(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'");}

function renderizarVideos(){
  const grid=$("grid-videos");if(!grid)return;
  if(!videos.length){grid.innerHTML='<p class="empty-state">Próximamente compartiremos nuevos procesos desde el estudio.</p>';return;}
  grid.innerHTML=videos.map(v=>`<article class="video-card"><div class="video-media">${videoSeguro(v.url)}</div><div class="video-copy"><h3>${escapeHtml(v.titulo||"Desde el estudio")}</h3><p>${escapeHtml(v.descripcion||"")}</p></div></article>`).join("");
}
function videoSeguro(url=""){
  const clean=String(url).trim();let embed="";
  try{const u=new URL(clean);if(u.hostname.includes("youtube.com")){const id=u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop();embed=`https://www.youtube.com/embed/${encodeURIComponent(id)}`;}else if(u.hostname==="youtu.be"){embed=`https://www.youtube.com/embed/${encodeURIComponent(u.pathname.slice(1))}`;}}catch(e){}
  if(embed)return `<iframe src="${embed}" title="Vídeo de Berbel Tattoo" loading="lazy" allowfullscreen></iframe>`;
  if(/^https:\/\//i.test(clean))return `<video controls preload="metadata"><source src="${escapeHtml(clean)}" type="video/mp4"></video>`;
  return '<div class="empty-state">Vídeo no disponible</div>';
}

function cambiarVista(v){
  if(v!=="random")return;
  volverMenuRandom();setTimeout(()=>$("vista-random").scrollIntoView({behavior:"smooth"}),20);
}
function loginGoogle(){
  if(!db||typeof firebase==="undefined"){mostrarToast("La cuenta no está disponible en este momento");return;}
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(()=>mostrarToast("No se pudo iniciar sesión. Inténtalo de nuevo."));
}
function logoutGoogle(){if(typeof firebase!=="undefined")firebase.auth().signOut().then(()=>cerrarModal("modal-perfil"));}

function manejarClickRuleta(modo){
  if(randomBusy)return;
  if(!currentUser||!userData){mostrarToast("Inicia sesión para usar la ruleta");loginGoogle();return;}
  const key=modo==="all"?"all":catRandomSelect;
  if(userData.ruleta?.[key]){const d=userData.ruleta[key];mostrarResultado(d.id,d.precio,d.pass);return;}
  iniciarRuleta(modo);
}
function iniciarRuleta(modo){
  const pool=tattoos.filter(t=>t.estado==="disponible"&&(modo==="all"||t.cat===catRandomSelect));
  if(!pool.length){mostrarToast("No quedan diseños disponibles en esta categoría");return;}
  randomBusy=true;
  $("random-options").classList.add("hidden");$("random-loading").classList.remove("hidden");
  iniciarAnimacionRuleta(pool);
  setTimeout(async()=>{
    clearInterval(rouletteTimer);
    const price=modo==="all"?80:100,key=modo==="all"?"all":catRandomSelect;
    try{
      const result=await asignarPremioUnaSolaVez(key,pool,price);
      mostrarResultado(result.id,result.precio,result.pass);
    }catch(error){
      randomBusy=false;volverMenuRandom();mostrarToast("No se pudo guardar el premio. Inténtalo de nuevo.");
    }
  },2250);
}
function iniciarAnimacionRuleta(pool){
  let index=Math.floor(Math.random()*pool.length);const image=$("random-preview-img"),name=$("random-preview-name");
  const show=()=>{const item=pool[index++%pool.length];image.src=item.img;name.textContent=item.nombre;};
  show();rouletteTimer=setInterval(show,105);
}
async function asignarPremioUnaSolaVez(key,pool,price){
  const fallback=()=>{const chosen=pool[Math.floor(Math.random()*pool.length)];return{id:chosen.id,precio:price,pass:chosen.pass,nombre:chosen.nombre};};
  if(!db||!currentUser)return fallback();
  const ref=db.collection("usuarios").doc(currentUser.uid);
  return db.runTransaction(async transaction=>{
    const snapshot=await transaction.get(ref),existing=snapshot.data()?.ruleta?.[key];
    if(existing)return existing;
    const prize=fallback();
    transaction.set(ref,{ruleta:{[key]:prize}},{merge:true});
    return prize;
  });
}
function mostrarResultado(id,price,pass){
  const t=tattoos.find(x=>x.id===id);if(!t)return;
  randomBusy=false;
  $("random-loading").classList.add("hidden");$("random-options").classList.add("hidden");$("random-result").classList.remove("hidden");
  $("res-nombre").textContent=t.nombre;$("res-precio").textContent=`${price} €`;$("res-pass").textContent=pass;$("res-img").src=t.img;
  $("btn-res-claim").onclick=()=>abrirModalReserva(t.id,t.nombre,price,pass);
}
function seleccionarCatRandom(cat){catRandomSelect=cat;document.querySelectorAll(".cat-rand-btn").forEach(b=>b.classList.toggle("active",b.id===`btn-rand-${cat}`));actualizarEstadoBotonesRandom();}
function actualizarEstadoBotonesRandom(){
  if(!$('btn-spin-cat'))return;
  const total=userData?.ruleta?.all;$("txt-spin-all-title").textContent=total?"Ver mi premio":"Ruleta total";$("txt-spin-all-desc").textContent=total?"Tu pieza ya está guardada":"Una pieza sorpresa del catálogo";
  const assigned=userData?.ruleta?.[catRandomSelect];$("btn-spin-cat").textContent=assigned?"Ver mi premio":"Girar la ruleta";
}
function volverMenuRandom(){randomBusy=false;clearInterval(rouletteTimer);$("random-options").classList.remove("hidden");$("random-loading").classList.add("hidden");$("random-result").classList.add("hidden");actualizarEstadoBotonesRandom();}

function abrirModalReserva(id,nombre,precio,pass){
  mensajeActual=pass?`Hola, Berbel. Me ha tocado el diseño “${nombre}” con el código ${pass} por ${precio} €. Me gustaría reservarlo.`:`Hola, Berbel. Quiero reservar el diseño “${nombre}” (n.º ${String(id).padStart(3,"0")}) por ${precio} €. ¿Hablamos de tamaño, zona y disponibilidad?`;
  $("modal-mensaje").textContent=mensajeActual;$("btn-copiar").textContent="Copiar mensaje";$("modal-reserva").classList.remove("hidden");
}
async function copiarMensaje(){
  try{await navigator.clipboard.writeText(mensajeActual);$("btn-copiar").textContent="Mensaje copiado ✓";mostrarToast("Mensaje copiado");}
  catch(e){const range=document.createRange();range.selectNode($("modal-mensaje"));window.getSelection().removeAllRanges();window.getSelection().addRange(range);mostrarToast("Selecciona y copia el mensaje");}
}
function abrirPerfil(){
  if(!currentUser)return;
  $("perfil-modal-pic").src=currentUser.photoURL||"img/logo w.png";$("perfil-modal-nombre").textContent=currentUser.displayName||"Mi cuenta";$("perfil-modal-email").textContent=currentUser.email||"";
  const coins=userData?.jimmyCoins||0,progress=coins%400;$("perfil-modal-coins").textContent=coins;$("perfil-progreso-texto").textContent=`${progress} / 400 para tu descuento`;$("perfil-barra").style.width=`${progress/4}%`;$("modal-perfil").classList.remove("hidden");
}
function cerrarModal(id){$(id)?.classList.add("hidden");}
let toastTimer;function mostrarToast(text){const toast=$("toast");toast.textContent=text;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);}
