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
    iniciarFloatingLabels();
});

function iniciarFloatingLabels() {
    document.querySelectorAll(".field-group .field-input").forEach(function(input) {
        atualizarLabel(input);

        input.addEventListener("input",  function() { atualizarLabel(input); });
        input.addEventListener("change", function() { atualizarLabel(input); });
        input.addEventListener("focus",  function() { atualizarLabel(input); });
    });
}

function atualizarLabel(input) {
    var group = input.closest(".field-group");
    if (!group) return;

    var temValor = input.value.trim() !== "";
    if (temValor) {
        group.classList.add("preenchido");
    } else {
        group.classList.remove("preenchido");
    }
}

function atualizarTodosLabels() {
    document.querySelectorAll(".field-group .field-input").forEach(atualizarLabel);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo    = document.getElementById("titulo").value.trim();
    const codigo    = document.getElementById("codigo").value.trim();
    const categoria = document.getElementById("categoria").value;
    const preco     = document.getElementById("preco").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const canais    = [...document.querySelectorAll("input[name='canais']:checked")].map(c => c.value);

    if (!validarTexto(titulo, "Título")) return;
    if (!validarTexto(descricao, "Descrição")) return;

    if (preco !== "" && (isNaN(parseFloat(preco)) || parseFloat(preco) <= 0)) {
        alert("Preço deve ser um valor maior que zero.");
        return;
    }

    const item = { titulo, codigo, categoria, preco, descricao, canais };

    if (editandoIndex !== null) {
        tarefas[editandoIndex] = item;
        editandoIndex = null;
        botaoSalvar.textContent = "Salvar";
    } else {
        tarefas.push(item);
    }

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    renderizarTabela();
    form.reset();

    setTimeout(atualizarTodosLabels, 0);
});

botaoLimpar.addEventListener("click", function () {
    editandoIndex = null;
    botaoSalvar.textContent = "Salvar";
    setTimeout(atualizarTodosLabels, 0);
});

function validarTexto(valor, nomeCampo) {
    if (typeof valor !== "string") {
        alert(nomeCampo + " deve ser um texto.");
        return false;
    }
    if (valor === "") {
        alert(nomeCampo + " não pode ficar vazio.");
        return false;
    }
    if (/^\d+$/.test(valor)) {
        alert(nomeCampo + " deve conter texto e não apenas números.");
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
    const item = tarefas[index];

    document.getElementById("titulo").value    = item.titulo;
    document.getElementById("codigo").value    = item.codigo    || "";
    document.getElementById("categoria").value = item.categoria || "";
    document.getElementById("preco").value     = item.preco     || "";
    document.getElementById("descricao").value = item.descricao;

    document.querySelectorAll("input[name='canais']").forEach(c => {
        c.checked = item.canais && item.canais.includes(c.value);
    });

    editandoIndex = index;
    botaoSalvar.textContent = "Atualizar";

    atualizarTodosLabels();

    document.getElementById("form").scrollIntoView({ behavior: "smooth" });
}