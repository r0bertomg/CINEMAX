const usuario = exigirLogin();
const admin = usuario.perfil === "admin";

document.getElementById("titulo").textContent = `Bem Vindo, ${usuario.nome}`;
document.getElementById("menu").innerHTML =
    (admin ? '<a href="admin.html">Administração</a>' : "") + '<a href="#" id="sair">Sair</a>';
document.getElementById("sair").addEventListener("click", e => {
    e.preventDefault();
    sair();
});
