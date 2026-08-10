const firebaseConfig={apiKey:"AIzaSyAlAUnyCLOnTCMJoW3Ruix17gNDqAdzUhM",authDomain:"berbeltattoo.firebaseapp.com",projectId:"berbeltattoo",storageBucket:"berbeltattoo.firebasestorage.app",messagingSenderId:"805157565248",appId:"1:805157565248:web:1c9b455be4350baa5940a5"};
const staticData=[
  {id:1,nombre:"Thanos",cat:"Marvel",img:"img/001.png"},{id:2,nombre:"Iron Man",cat:"Marvel",img:"img/002.png"},{id:3,nombre:"Loki",cat:"Marvel",img:"img/003.png"},{id:4,nombre:"Spiderman",cat:"Marvel",img:"img/004.png"},{id:5,nombre:"Dr. Strange",cat:"Marvel",img:"img/005.png"},{id:6,nombre:"Black Panther",cat:"Marvel",img:"img/006.png"},{id:7,nombre:"Thor",cat:"Marvel",img:"img/007.png"},{id:8,nombre:"Deadpool",cat:"Marvel",img:"img/008.png"},
  {id:9,nombre:"Inazuma",cat:"Anime",img:"img/009.png"},{id:10,nombre:"Zoro",cat:"Anime",img:"img/010.png"},{id:11,nombre:"Shin Chan",cat:"Anime",img:"img/011.png"},{id:12,nombre:"Gyarados",cat:"Anime",img:"img/012.png"},{id:13,nombre:"Naruto",cat:"Anime",img:"img/013.png"},{id:14,nombre:"Dragon Ball",cat:"Anime",img:"img/014.png"},{id:15,nombre:"Kitsune",cat:"Anime",img:"img/015.png"},{id:16,nombre:"One Piece",cat:"Anime",img:"img/016.png"},
  {id:17,nombre:"Rey León",cat:"Disney",img:"img/017.png"},{id:18,nombre:"Mickey",cat:"Disney",img:"img/018.png"},{id:19,nombre:"Totoro",cat:"Disney",img:"img/019.png"},{id:20,nombre:"La Bella y la Bestia",cat:"Disney",img:"img/020.png"},{id:21,nombre:"Campanilla",cat:"Disney",img:"img/021.png"},{id:22,nombre:"Toy Story",cat:"Disney",img:"img/022.png"},{id:23,nombre:"Tigger",cat:"Disney",img:"img/023.png"},{id:24,nombre:"Stitch",cat:"Disney",img:"img/024.png"}
];
let db=null,currentAdmin=null,usuariosData=[],videosData=[],tattoosCloud={},statusFilter="todos",panelStarted=false,unsubscribers=[],editingUserUid=null,pointsBusy=new Set();
const $=id=>document.getElementById(id);

document.addEventListener("DOMContentLoaded",()=>{
  if(typeof firebase==="undefined"){mostrarAcceso("login");toast("No se pudo conectar con Google");return;}
  try{firebase.initializeApp(firebaseConfig);db=firebase.firestore();firebase.auth().onAuthStateChanged(validarAcceso);}
  catch(error){console.error(error);mostrarAcceso("login");}
});

async function validarAcceso(user){
  if(!user){currentAdmin=null;detenerPanel();mostrarAcceso("login");return;}
  try{
    const doc=await db.collection("usuarios").doc(user.uid).get();
    if(doc.exists&&doc.data().rol==="admin"){
      currentAdmin=user;mostrarPanel();iniciarPanel();
    }else{detenerPanel();$("denied-email").textContent=user.email||"Cuenta sin permiso";mostrarAcceso("denied");}
  }catch(error){console.error(error);$("denied-email").textContent="No se pudo comprobar el permiso.";mostrarAcceso("denied");}
}
function mostrarAcceso(view){
  $("access-screen").classList.remove("hidden");$("admin-app").classList.add("hidden");
  $("access-loading").classList.add("hidden");$("access-login").classList.toggle("hidden",view!=="login");$("access-denied").classList.toggle("hidden",view!=="denied");
}
function mostrarPanel(){
  $("access-screen").classList.add("hidden");$("admin-app").classList.remove("hidden");
  $("admin-name").textContent=currentAdmin.displayName||"Administrador";$("admin-email").textContent=currentAdmin.email||"";$("admin-avatar").src=currentAdmin.photoURL||"img/logo w.png";
}
function loginAdmin(){firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(()=>toast("No se pudo iniciar sesión"));}
function cambiarCuenta(){firebase.auth().signOut().then(loginAdmin);}
function logoutAdmin(){firebase.auth().signOut().then(()=>location.href="index.html");}

function iniciarPanel(){
  if(panelStarted)return;panelStarted=true;
  unsubscribers.push(db.collection("usuarios").onSnapshot(snapshot=>{usuariosData=[];snapshot.forEach(doc=>usuariosData.push({uid:doc.id,...doc.data()}));usuariosData.sort((a,b)=>(a.nombre||a.email||"").localeCompare(b.nombre||b.email||"","es"));renderizarUsuarios();},()=>toast("No se pudieron cargar las cuentas")));
  unsubscribers.push(db.collection("inventario").doc("main").onSnapshot(doc=>{tattoosCloud=doc.exists?doc.data():{};renderizarTatuajesAdmin();actualizarEstadisticas();},()=>{tattoosCloud={};renderizarTatuajesAdmin();toast("Inventario sin conexión: se muestran los valores base");}));
  unsubscribers.push(db.collection("videos").onSnapshot(snapshot=>{videosData=[];snapshot.forEach(doc=>videosData.push({id:doc.id,...doc.data()}));videosData.sort((a,b)=>(b.fecha?.seconds||0)-(a.fecha?.seconds||0));renderizarVideosAdmin();},()=>toast("No se pudieron cargar los vídeos")));
}
function detenerPanel(){unsubscribers.forEach(unsub=>{try{unsub();}catch(e){}});unsubscribers=[];panelStarted=false;}

function cambiarTab(tab){
  document.querySelectorAll(".panel-section").forEach(section=>section.classList.toggle("hidden",section.id!==`tab-${tab}`));
  document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.tab===tab));
  window.scrollTo({top:0,behavior:"smooth"});
}
function filtrarEstado(status){statusFilter=status;document.querySelectorAll("[data-status]").forEach(button=>button.classList.toggle("active",button.dataset.status===status));renderizarTatuajesAdmin();}
function getTattoo(item){const cloud=tattoosCloud[item.id]||{};return{...item,precio:Number.isFinite(Number(cloud.precio))?Number(cloud.precio):130,estado:cloud.estado==="vendido"?"vendido":"disponible"};}
function renderizarTatuajesAdmin(){
  const grid=$("design-grid");if(!grid)return;const term=($("design-search")?.value||"").trim().toLocaleLowerCase("es");
  const items=staticData.map(getTattoo).filter(t=>(statusFilter==="todos"||t.estado===statusFilter)&&t.nombre.toLocaleLowerCase("es").includes(term));
  if(!items.length){grid.innerHTML='<p class="empty-copy">No hay diseños que coincidan con este filtro.</p>';return;}
  grid.innerHTML=items.map(t=>`<article class="design-card">
    <div class="design-image"><img src="${t.img}" alt="${escapeHtml(t.nombre)}" loading="lazy"><span class="status-badge ${t.estado==="vendido"?"reserved":""}">${t.estado==="vendido"?"Reservado":"Disponible"}</span></div>
    <div class="design-body"><div class="design-title"><h3>${escapeHtml(t.nombre)}</h3><span>#${String(t.id).padStart(3,"0")} · ${t.cat}</span></div>
      <div class="price-editor"><input id="price-${t.id}" type="number" min="0" max="10000" step="5" value="${t.precio}" aria-label="Precio de ${escapeHtml(t.nombre)}"><span>€</span><button type="button" onclick="guardarPrecioTattoo(${t.id})">Guardar</button></div>
      <button class="state-button ${t.estado==="vendido"?"activate":"reserve"}" type="button" onclick="toggleEstadoTattoo(${t.id},'${t.estado}')">${t.estado==="vendido"?"Volver a poner disponible":"Marcar como reservado"}</button>
    </div></article>`).join("");
}
function actualizarEstadisticas(){
  const items=staticData.map(getTattoo),available=items.filter(t=>t.estado==="disponible").length,reserved=items.length-available,avg=Math.round(items.reduce((sum,t)=>sum+t.precio,0)/items.length);
  $("stat-total").textContent=items.length;$("stat-available").textContent=available;$("stat-reserved").textContent=reserved;$("stat-price").textContent=`${avg} €`;
}
async function guardarPrecioTattoo(id){
  const input=$(`price-${id}`),precio=Number.parseInt(input.value,10);if(!Number.isFinite(precio)||precio<0||precio>10000){toast("Introduce un precio válido");input.focus();return;}
  input.disabled=true;try{await guardarCampoInventario(id,"precio",precio);toast("Precio actualizado");}catch(error){console.error(error);toast("No se pudo cambiar el precio");}finally{input.disabled=false;}
}
async function toggleEstadoTattoo(id,estado){
  const nuevo=estado==="vendido"?"disponible":"vendido";try{await guardarCampoInventario(id,"estado",nuevo);toast(nuevo==="vendido"?"Diseño marcado como reservado":"Diseño disponible de nuevo");}catch(error){console.error(error);toast("No se pudo cambiar el estado");}
}
async function guardarCampoInventario(id,campo,valor){
  const ref=db.collection("inventario").doc("main");
  try{await ref.update({[`${id}.${campo}`]:valor});}catch(error){if(error.code==="not-found")await ref.set({[id]:{[campo]:valor}},{merge:true});else throw error;}
}

function renderizarUsuarios(){
  const list=$("users-list");if(!list)return;const term=($("user-search")?.value||"").trim().toLocaleLowerCase("es");
  const users=usuariosData.filter(u=>`${u.nombre||""} ${u.email||""}`.toLocaleLowerCase("es").includes(term));
  if(!users.length){list.innerHTML='<p class="empty-copy">No hay cuentas que coincidan.</p>';return;}
  list.innerHTML=users.map(u=>{const admin=u.rol==="admin",self=u.uid===currentAdmin.uid,prizes=Object.entries(u.ruleta||{}).sort(([a],[b])=>["all","marvel","anime","disney"].indexOf(a)-["all","marvel","anime","disney"].indexOf(b)).map(([key,p])=>`<span>${key==="all"?"Total":escapeHtml(key)}: ${escapeHtml(p.nombre||"")}</span>`).join("");return `<article class="user-row">
    <div class="user-identity"><span class="user-avatar">${escapeHtml((u.nombre||u.email||"?").charAt(0).toUpperCase())}</span><div><strong>${escapeHtml(u.nombre||"Sin nombre")}</strong><small>${escapeHtml(u.email||"")}</small></div></div>
    <span class="role-badge ${admin?"admin":""}">${admin?"Administrador":"Cliente"}</span><div class="prize-list">${prizes||'<span>Sin premios</span>'}</div>
    <div class="coins-control"><button class="icon-button" type="button" ${pointsBusy.has(u.uid)?"disabled":""} onclick="cambiarMonedas('${u.uid}',-50)">−</button><strong>${Number(u.jimmyCoins)||0}</strong><button class="icon-button" type="button" ${pointsBusy.has(u.uid)?"disabled":""} onclick="cambiarMonedas('${u.uid}',50)">+</button></div>
    <div class="row-actions"><button class="mini-button" type="button" onclick="editarMonedas('${u.uid}')">Editar puntos</button>${self?'<span class="mini-button">Tu cuenta</span>':`<button class="mini-button ${admin?"danger":"promote"}" type="button" onclick="cambiarRol('${u.uid}','${admin?"cliente":"admin"}')">${admin?"Quitar admin":"Dar admin"}</button>`}</div>
  </article>`;}).join("");
}
async function cambiarMonedas(uid,cantidad){
  if(pointsBusy.has(uid))return;const user=usuariosData.find(u=>u.uid===uid);if(!user)return;pointsBusy.add(uid);renderizarUsuarios();
  try{
    await db.runTransaction(async transaction=>{const ref=db.collection("usuarios").doc(uid),snapshot=await transaction.get(ref);if(!snapshot.exists)throw new Error("Usuario no encontrado");const total=Math.max(0,(Number(snapshot.data().jimmyCoins)||0)+cantidad);transaction.update(ref,{jimmyCoins:total});});
    toast("Puntos actualizados");
  }catch(error){console.error(error);toast("No se pudieron actualizar los puntos");}
  finally{pointsBusy.delete(uid);renderizarUsuarios();}
}
function editarMonedas(uid){
  const user=usuariosData.find(u=>u.uid===uid);if(!user)return;editingUserUid=uid;$("points-user-label").textContent=`${user.nombre||"Usuario"} · ${user.email||""}`;$("points-input").value=String(Number(user.jimmyCoins)||0);$("points-modal").classList.remove("hidden");setTimeout(()=>$("points-input").select(),30);
}
function cerrarEditorPuntos(){editingUserUid=null;$("points-modal").classList.add("hidden");}
async function guardarEdicionPuntos(event){
  event.preventDefault();if(!editingUserUid)return;const total=Number.parseInt($("points-input").value,10);if(!Number.isFinite(total)||total<0||total>1000000){toast("Introduce una cantidad válida");return;}
  const uid=editingUserUid,button=$("points-save");button.disabled=true;button.textContent="Guardando…";
  try{await db.collection("usuarios").doc(uid).update({jimmyCoins:total});cerrarEditorPuntos();toast("Puntos actualizados");}
  catch(error){console.error(error);toast("No se pudieron actualizar los puntos");}
  finally{button.disabled=false;button.textContent="Guardar puntos";}
}
function cambiarRol(uid,rol){if(uid===currentAdmin.uid)return;const user=usuariosData.find(u=>u.uid===uid);if(!user)return;const action=rol==="admin"?"dar acceso de administrador a":"retirar el acceso de";if(!confirm(`¿Quieres ${action} ${user.email||user.nombre}?`))return;db.collection("usuarios").doc(uid).update({rol}).then(()=>toast(rol==="admin"?"Administrador añadido":"Acceso retirado")).catch(()=>toast("No se pudo cambiar el permiso"));}

async function guardarVideo(event){
  event.preventDefault();const url=$("video-url").value.trim(),title=$("video-title").value.trim(),description=$("video-description").value.trim(),button=$("video-submit");
  if(!/^https:\/\//i.test(url)){toast("El enlace debe empezar por https://");return;}button.disabled=true;button.textContent="Publicando…";
  try{await db.collection("videos").add({url,titulo:title,descripcion:description,fecha:firebase.firestore.FieldValue.serverTimestamp()});event.target.reset();toast("Vídeo publicado");}
  catch(error){console.error(error);toast("No se pudo publicar el vídeo");}finally{button.disabled=false;button.textContent="Publicar vídeo";}
}
function renderizarVideosAdmin(){const list=$("videos-list");if(!list)return;if(!videosData.length){list.innerHTML='<p class="empty-copy">Todavía no hay vídeos publicados.</p>';return;}list.innerHTML=videosData.map(v=>`<article class="video-row"><div><h3>${escapeHtml(v.titulo||"Sin título")}</h3><p>${escapeHtml(v.url||"")}</p></div><button type="button" onclick="borrarVideo('${v.id}')" aria-label="Eliminar ${escapeHtml(v.titulo||"vídeo")}">Eliminar</button></article>`).join("");}
function borrarVideo(id){if(!confirm("¿Eliminar este vídeo de la web?"))return;db.collection("videos").doc(id).delete().then(()=>toast("Vídeo eliminado")).catch(()=>toast("No se pudo eliminar el vídeo"));}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));}
let toastTimer;function toast(message){const el=$("admin-toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2700);}
