if (usuarioLogado()) location.href = "BemVindo.html";

const msg = document.getElementById("msg");
const campoCpf = document.getElementById("cpf");
aplicarMascara(campoCpf, mascaraCpf);

document.getElementById("form").addEventListener("submit", async e => {
    e.preventDefault();
    const cpf = soDigitos(campoCpf.value);
    const senha = document.getElementById("senha").value;

    if (!cpfValido(cpf)) return mostrarMsg(msg, "Informe um CPF válido.");

    try {
        const res = await fetch(`${API}?cpf=${cpf}&senha=${encodeURIComponent(senha)}`);
        const lista = await res.json();
        if (!lista.length) return mostrarMsg(msg, "CPF ou senha incorretos.");
        localStorage.setItem("usuario", JSON.stringify(lista[0]));
        location.href = "BemVindo.html";
    } catch {
        mostrarMsg(msg, "Não foi possível conectar ao servidor.");
    }
});
