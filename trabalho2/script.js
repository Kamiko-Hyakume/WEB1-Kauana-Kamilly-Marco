const form = document.getElementById("taskForm");
const lista = document.getElementById("taskList");
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoLimpar = document.getElementById("botaoLimpar");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
// Aqui o código pega do localStorage a lista de tarefas já salva.

let editandoIndex = null;
// Cria uma variável para saber se o usuário está editando algum item.

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario(); 
    // chama a função para mostrar o nome do usuário logado.

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

    const titulo = document.getElementById("titulo").value.trim();
    // pega o valor do campo de título e remove os espaços em branco no início e no final.

    const descricao = document.getElementById("descricao").value.trim();
    const canais    = [...document.querySelectorAll("input[name='canais']:checked")].map(c => c.value);

    if (!validarTexto(titulo, "Título")) return;
    // Chama a função validarTexto para verificar se o título é válido.

    if (!validarTexto(descricao, "Descrição")) return;

    if (preco !== "" && (isNaN(parseFloat(preco)) || parseFloat(preco) <= 0)) {
        alert("Preço deve ser um valor maior que zero.");
        return;
    }

    const item = { titulo, codigo, categoria, preco, descricao, canais };

    if (editandoIndex !== null) {
        tarefas[editandoIndex] = { 
            titulo, 
            descricao,
            data: tarefas[editandoIndex].data || new Date().toLocaleDateString()
        };
        // Se estiver editando, atualiza o item mantendo a data original (ou cria se não existir)

        editandoIndex = null;
        botaoSalvar.textContent = "Salvar";

    } else {
        tarefas.push({ 
            titulo, 
            descricao,
            data: new Date().toLocaleDateString()
        });
        // Se não estiver editando, adiciona um novo item à lista de tarefas com data
    }

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    // Salva a lista de tarefas atualizada no localStorage.

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

function renderizarTabela(){
    lista.innerHTML = "";
    // Cria a função que monta a tabela

    tarefas.forEach((tarefa, index) =>{

        const novaLinha = document.createElement("tr");
        // Para cada item da lista de tarefas, cria uma nova linha na tabela.

        // checkbox
        const tdCheck = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        tdCheck.appendChild(checkbox);
        // Cria o campo de seleção (checkbox) para cada item.

        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = tarefa.titulo;
        // Cria um campo para o título e preenche com o título da tarefa.

        const tdDescricao = document.createElement("td");
        tdDescricao.textContent = tarefa.descricao;
        // Cria um campo para a descrição e preenche com a descrição da tarefa.

        // Data
        const tdData = document.createElement("td");
        tdData.textContent = tarefa.data || new Date().toLocaleDateString();
        // Cria um campo para a data de cadastro. Se não existir, usa a data atual.

        // Status
        const tdStatus = document.createElement("td");
        const statusSpan = document.createElement("span");
        statusSpan.className = "status ativo";
        statusSpan.textContent = "Ativo";
        tdStatus.appendChild(statusSpan);
        // Cria um campo de status do item.

        const tdAcoes = document.createElement("td");
        // Cria um campo para as ações (editar e excluir).

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "btn-icon";
        botaoEditar.addEventListener("click", function (){
            editarItem(index);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "btn-icon";
        botaoExcluir.addEventListener("click", function () {
            excluirItem(index);
        });

        tdAcoes.appendChild(botaoEditar);
        tdAcoes.appendChild(botaoExcluir);
        // coloca os botões de editar e excluir dentro de cada coluna.

        // Ordem igual ao th
        novaLinha.appendChild(tdCheck);
        novaLinha.appendChild(tdTitulo);
        novaLinha.appendChild(tdDescricao);
        novaLinha.appendChild(tdData);
        novaLinha.appendChild(tdStatus);
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