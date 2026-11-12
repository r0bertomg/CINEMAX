const API = '/usuarios';

const CAMPOS = [
    ["nome", "Nome", "text"],
    ["sobrenome", "Sobrenome", "text"],
    ["cpf", "CPF", "text"],
    ["email", "Email", "email"],
    ["senha", "Senha", "password"],
    ["rua", "Rua", "text"],
    ["cep", "CEP", "text"],
    ["cidade", "Cidade", "text"],
    ["estado", "Estado", "text"],
    ["telefone", "Telefone", "tel"]
];

function usuarioLogado() {
    const dados = localStorage.getItem("usuario");
    return dados ? JSON.parse(dados) : null;
}

function exigirLogin() {
    const u = usuarioLogado();
    if (!u) location.href = "index.html";
    return u;
}

function sair() {
    localStorage.removeItem("usuario");
    location.href = "index.html";
}

function mostrarMsg(el, texto, ok = false) {
    el.textContent = texto;
    el.className = ok ? "msg ok" : "msg";
    el.style.display = "block";
}

function soDigitos(v) {
    return v.replace(/\D/g, "");
}

function mascaraCpf(v) {
    const d = soDigitos(v).slice(0, 11);
    return d
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function mascaraCep(v) {
    return soDigitos(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

function mascaraTelefone(v) {
    const d = soDigitos(v).slice(0, 11);
    if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function aplicarMascara(input, funcao) {
    input.addEventListener("input", () => { input.value = funcao(input.value); });
}

function cpfValido(cpf) {
    return soDigitos(cpf).length === 11;
}

function camposHTML(prefixo) {
    return CAMPOS.map(([id, rotulo, tipo]) =>
        `<div class="campo"><label for="${prefixo}${id}">${rotulo}</label><input id="${prefixo}${id}" type="${tipo}" required></div>`
    ).join("");
}

function ativarMascaras(prefixo) {
    aplicarMascara(document.getElementById(prefixo + "cpf"), mascaraCpf);
    aplicarMascara(document.getElementById(prefixo + "cep"), mascaraCep);
    aplicarMascara(document.getElementById(prefixo + "telefone"), mascaraTelefone);
}

function lerCampos(prefixo) {
    const dados = {};
    CAMPOS.forEach(([id]) => { dados[id] = document.getElementById(prefixo + id).value.trim(); });
    dados.cpf = soDigitos(dados.cpf);
    dados.cep = soDigitos(dados.cep);
    dados.telefone = soDigitos(dados.telefone);
    dados.estado = dados.estado.toUpperCase();
    return dados;
}

async function cpfOuEmailEmUso(dados, idIgnorado = null) {
    const [porCpf, porEmail] = await Promise.all([
        fetch(`${API}?cpf=${dados.cpf}`).then(r => r.json()),
        fetch(`${API}?email=${encodeURIComponent(dados.email)}`).then(r => r.json())
    ]);
    const outro = u => String(u.id) !== String(idIgnorado);
    if (porCpf.some(outro)) return "CPF já cadastrado.";
    if (porEmail.some(outro)) return "Email já cadastrado.";
    return null;
}
