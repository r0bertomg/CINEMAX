const msg = document.getElementById("msg");
document.getElementById("campos").innerHTML = camposHTML("c_");
ativarMascaras("c_");

document.getElementById("c_cep").addEventListener("blur", async () => {
    const cep = soDigitos(document.getElementById("c_cep").value);
    if (cep.length !== 8) return;
    try {
        const dados = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r => r.json());
        if (dados.erro) return;
        document.getElementById("c_rua").value = dados.logradouro || "";
        document.getElementById("c_cidade").value = dados.localidade || "";
        document.getElementById("c_estado").value = dados.uf || "";
    } catch {}
});

document.getElementById("form").addEventListener("submit", async e => {
    e.preventDefault();
    const dados = lerCampos("c_");
    dados.perfil = "cliente";

    if (!cpfValido(dados.cpf)) return mostrarMsg(msg, "CPF inválido.");
    if (dados.cep.length !== 8) return mostrarMsg(msg, "CEP deve ter 8 dígitos.");
    if (dados.telefone.length < 10) return mostrarMsg(msg, "Telefone inválido.");
    if (dados.estado.length !== 2) return mostrarMsg(msg, "Estado deve ter 2 letras (ex.: SP).");
    if (dados.senha.length < 6) return mostrarMsg(msg, "A senha deve ter ao menos 6 caracteres.");

    try {
        const erro = await cpfOuEmailEmUso(dados);
        if (erro) return mostrarMsg(msg, erro);

        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error();

        mostrarMsg(msg, "Cadastrado com sucesso! Redirecionando...", true);
        setTimeout(() => { location.href = "index.html"; }, 1200);
    } catch {
        mostrarMsg(msg, "Erro ao cadastrar. Verifique o servidor.");
    }
});
