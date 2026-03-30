const form = document.getElementById("taskForm");
const lista = document.getElementById("taskList");
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoLimpar = document.getElementById("botaoLimpar");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let editandoIndex = null;

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario();
    renderizarTabela();
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    if (!validarTexto(titulo, "Título")) return;
    if (!validarTexto(descricao, "Descrição")) return;

    if (editandoIndex !== null) {
        tarefas[editandoIndex] = { titulo, descricao };
        editandoIndex = null;
        botaoSalvar.textContent = "Salvar";
    } else {
        tarefas.push({ titulo, descricao });
    }

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    renderizarTabela();
    form.reset();
});

botaoLimpar.addEventListener("click", function () {
    editandoIndex = null;
    botaoSalvar.textContent = "Salvar";
});

function validarTexto(valor, nomeCampo) {
    if (typeof valor !== "string") {
        alert(`${nomeCampo} deve ser um texto.`);
        return false;
    }

    if (valor === "") {
        alert(`${nomeCampo} não pode ficar vazio.`);
        return false;
    }

    // Não permite somente números
    if (/^\d+$/.test(valor)) {
        alert(`${nomeCampo} deve conter texto e não apenas números.`);
        return false;
    }

    return true;
}

function carregarUsuario() {
    const usuario = sessionStorage.getItem("usuarioLogado");

    if (usuario && usuario.trim() !== "") {
        nomeUsuario.textContent = usuario;
    } else {
        nomeUsuario.textContent = "Visitante";
    }
}

function renderizarTabela() {
    lista.innerHTML = "";

    tarefas.forEach((tarefa, index) => {
        const novaLinha = document.createElement("tr");

        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = tarefa.titulo;

        const tdDescricao = document.createElement("td");
        tdDescricao.textContent = tarefa.descricao;

        const tdAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", function () {
            editarItem(index);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", function () {
            excluirItem(index);
        });

        tdAcoes.appendChild(botaoEditar);
        tdAcoes.appendChild(botaoExcluir);

        novaLinha.appendChild(tdTitulo);
        novaLinha.appendChild(tdDescricao);
        novaLinha.appendChild(tdAcoes);

        lista.appendChild(novaLinha);
    });
}

function excluirItem(index) {
    tarefas.splice(index, 1);
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    renderizarTabela();
}

function editarItem(index) {
    document.getElementById("titulo").value = tarefas[index].titulo;
    document.getElementById("descricao").value = tarefas[index].descricao;

    editandoIndex = index;
    botaoSalvar.textContent = "Atualizar";
}