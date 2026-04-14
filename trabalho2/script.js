const form = document.getElementById("taskForm");
const lista = document.getElementById("taskList");
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoLimpar = document.getElementById("botaoLimpar");
// pegar os elementos da tela

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
// Aqui o código pega do localStorage a lista de tarefas já salva.
let editandoIndex = null;
// Cria uma variável para saber se o usuário está editando algum item.
document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario(); 
    // chama a função para mostrar o nome do usuário logado.
    renderizarTabela();
    // chama a função para mostrar os itens cadastrados na tabela.
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    // pega o valor do campo de título e remove os espaços em branco no início e no final.
    const descricao = document.getElementById("descricao").value.trim();
    // pega o valor do campo de descrição.

    if (!validarTexto(titulo, "Título")) return;
    // Chama a função validarTexto para verificar se o título é válido.
    if (!validarTexto(descricao, "Descrição")) return;

    if (editandoIndex !== null) {
        tarefas[editandoIndex] = { titulo, descricao };
        editandoIndex = null;
        botaoSalvar.textContent = "Salvar";
        // Verifica se está editando ou cadastrando novo item. Se estiver editando, atualiza o item na lista na mesma posição.
    } else {
        tarefas.push({ titulo, descricao });
        // Se não estiver editando, adiciona um novo item à lista de tarefas.
    }

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    // Salva a lista de tarefas atualizada no localStorage.
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
    // Verifica se o valor é uma string. Se não for, exibe um alerta e retorna false.

    if (valor === "") {
        alert(`${nomeCampo} não pode ficar vazio.`);
        return false;
    }
    // Verifica se o valor é uma string vazia. Se for, exibe um alerta e retorna false.

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
// pega o nome do usuário logado da sessão. Se não houver um usuário logado, exibe "Visitante". Caso contrário, exibe o nome do usuário.


function renderizarTabela() {
    lista.innerHTML = "";
// Cria a função que monta a tabela
    tarefas.forEach((tarefa, index) => {
        const novaLinha = document.createElement("tr");
// Para cada item da lista de tarefas, cria uma nova linha na tabela.
        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = tarefa.titulo;
// Cria um campo para o título e preenche com o título da tarefa.
        const tdDescricao = document.createElement("td");
        tdDescricao.textContent = tarefa.descricao;
// Cria um campo para a descrição e preenche com a descrição da tarefa.
        const tdAcoes = document.createElement("td");
// Cria um campo para as ações (editar e excluir).
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
// coloca os botões de editar e excluir dentro de cada coluna.
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