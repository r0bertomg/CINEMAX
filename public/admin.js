const logado = exigirLogin();
if (logado.perfil !== "admin") location.href = "BemVindo.html";

const lista = document.getElementById("lista");
const msg = document.getElementById("msg");
const msgEdicao = document.getElementById("msgEdicao");
const dlg = document.getElementById("dlg");
const campoBusca = document.getElementById("cpfBusca");
let editandoId = null;
let cache = [];

document.getElementById("camposEdicao").innerHTML = camposHTML("e_");
ativarMascaras("e_");
aplicarMascara(campoBusca, mascaraCpf);
document.getElementById("sair").addEventListener("click", e => {
    e.preventDefault();
    sair();
});

function render(usuarios) {
    cache = usuarios;
    if (!usuarios.length) {
        lista.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum usuário encontrado.</td></tr>';
        return;
    }
    lista.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.nome} ${u.sobrenome}</td>
            <td>${mascaraCpf(u.cpf)}</td>
            <td>${u.email}</td>
            <td>${mascaraTelefone(u.telefone)}</td>
            <td>${u.cidade}/${u.estado}</td>
            <td>${u.perfil || "cliente"}</td>
            <td>
                <button data-editar="${u.id}">Editar</button>
                <button class="sec" data-apagar="${u.id}">Apagar</button>
            </td>
        </tr>`).join("");
}

async function carregar(cpf = "") {
    try {
        const res = await fetch(cpf ? `${API}?cpf=${cpf}` : API);
        render(await res.json());
    } catch {
        mostrarMsg(msg, "Não foi possível conectar ao servidor.");
    }
}

document.getElementById("busca").addEventListener("submit", e => {
    e.preventDefault();
    carregar(soDigitos(campoBusca.value));
});

document.getElementById("limpar").addEventListener("click", () => {
    campoBusca.value = "";
    carregar();
});

lista.addEventListener("click", async e => {
    const idEditar = e.target.dataset.editar;
    const idApagar = e.target.dataset.apagar;

    if (idEditar) {
        const u = cache.find(x => String(x.id) === idEditar);
        editandoId = u.id;
        CAMPOS.forEach(([id]) => { document.getElementById("e_" + id).value = u[id]; });
        document.getElementById("e_cpf").value = mascaraCpf(u.cpf);
        document.getElementById("e_cep").value = mascaraCep(u.cep);
        document.getElementById("e_telefone").value = mascaraTelefone(u.telefone);
        msgEdicao.style.display = "none";
        dlg.showModal();
    }

    if (idApagar) {
        if (String(logado.id) === idApagar) return mostrarMsg(msg, "Você não pode apagar a si mesmo.");
        if (!confirm("Apagar este usuário?")) return;
        const res = await fetch(`${API}/${idApagar}`, { method: "DELETE" });
        if (res.ok) {
            mostrarMsg(msg, "Usuário apagado.", true);
            carregar();
        } else {
            mostrarMsg(msg, "Erro ao apagar.");
        }
    }
});

document.getElementById("cancelar").addEventListener("click", () => dlg.close());

document.getElementById("formEdicao").addEventListener("submit", async e => {
    e.preventDefault();
    const dados = lerCampos("e_");

    if (!cpfValido(dados.cpf)) return mostrarMsg(msgEdicao, "CPF inválido.");
    if (dados.cep.length !== 8) return mostrarMsg(msgEdicao, "CEP deve ter 8 dígitos.");
    if (dados.telefone.length < 10) return mostrarMsg(msgEdicao, "Telefone inválido.");
    if (dados.estado.length !== 2) return mostrarMsg(msgEdicao, "Estado deve ter 2 letras.");

    try {
        const erro = await cpfOuEmailEmUso(dados, editandoId);
        if (erro) return mostrarMsg(msgEdicao, erro);

        const res = await fetch(`${API}/${editandoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error();

        if (editandoId === logado.id) localStorage.setItem("usuario", JSON.stringify({ ...logado, ...dados }));
        dlg.close();
        mostrarMsg(msg, "Usuário atualizado.", true);
        carregar();
    } catch {
        mostrarMsg(msgEdicao, "Erro ao atualizar.");
    }
});

carregar();
