const form = document.getElementById("taskForm");
const lista = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");

const paginationInfo = document.getElementById("paginationInfo");
const currentPageText = document.getElementById("currentPage");

const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

const botaoSalvar = document.getElementById("botaoSalvar");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

let editandoIndex = null;

let paginaAtual = 1;

const itensPorPagina = 5;

let colunaOrdenacao = null;

let ordemAscendente = true;

document.addEventListener("DOMContentLoaded", () => {
    renderizarTabela();
});

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const titulo =
        document.getElementById("titulo").value.trim();

    const codigo =
        document.getElementById("codigo").value.trim();

    const categoria =
        document.getElementById("categoria").value;

    const preco =
        document.getElementById("preco").value;

    const descricao =
        document.getElementById("descricao").value.trim();

    const canais = [
        ...document.querySelectorAll(
            "input[name='canais']:checked"
        )
    ].map(c => c.value);

    const item = {

        titulo,
        codigo,
        categoria,
        preco,
        descricao,
        canais,

        status: "ativo",

        dataCadastro:
            editandoIndex !== null
            ? tarefas[editandoIndex].dataCadastro
            : new Date().toLocaleDateString("pt-BR")
    };

    if (editandoIndex !== null) {

        tarefas[editandoIndex] = item;

        editandoIndex = null;
    
        console.log("Item atualizado:", item);

        botaoSalvar.textContent = "Salvar";

    }  else {
        tarefas.push(item);
    }

    salvarDados();

    renderizarTabela();

    form.reset();
    document
    .querySelectorAll("input[name='canais']")
    .forEach(c => c.checked = false);
});

function salvarDados() {

    localStorage.setItem(
        "tarefas",
        JSON.stringify(tarefas)
    );
}

function renderizarTabela() {

    lista.innerHTML = "";

    let dados = [...tarefas];

    const pesquisa = searchInput.value.toLowerCase();

    if (pesquisa) {

        dados = dados.filter(item =>
            item.titulo.toLowerCase().includes(pesquisa)
            ||
            item.codigo.toLowerCase().includes(pesquisa)
            ||
            item.categoria.toLowerCase().includes(pesquisa)
        );
    }

    if (colunaOrdenacao) {

        dados.sort((a, b) => {

            let valorA = a[colunaOrdenacao];
            let valorB = b[colunaOrdenacao];

            if (typeof valorA === "string") {

                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }

            if (valorA < valorB)
                return ordemAscendente ? -1 : 1;

            if (valorA > valorB)
                return ordemAscendente ? 1 : -1;

            return 0;
        });
    }

    const totalPaginas =
        Math.ceil(dados.length / itensPorPagina);

    const inicio =
        (paginaAtual - 1) * itensPorPagina;

    const fim =
        inicio + itensPorPagina;

    const itensPagina =
        dados.slice(inicio, fim);

    itensPagina.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>
                <input type="checkbox">
            </td>

            <td>${item.titulo}</td>

            <td>${item.codigo}</td>

            <td>${item.categoria}</td>

            <td>
                R$ ${parseFloat(item.preco || 0).toFixed(2)}
            </td>

            <td>
                <div class="canais">

                    ${item.canais.map(canal => `
                        <span class="canal-chip">
                            ${canal}
                        </span>
                    `).join("")}

                </div>
            </td>

            <td>${item.descricao}</td>

            <td>
                <span class="status ativo">
                    Ativo
                </span>
            </td>

            <td>${item.dataCadastro}</td>

            <td class="acoes">

                <button
                    class="btn-icon"
                    onclick="editarItem(${inicio + index})"
                >
                    Editar
                </button>

                <button
                    class="btn-icon"
                    onclick="excluirItem(${inicio + index})"
                >
                    Excluir
                </button>

            </td>
        `;

        lista.appendChild(tr);
    });

    paginationInfo.textContent =
        `${dados.length} itens`;

    currentPageText.textContent =
        paginaAtual;

    prevPage.disabled = paginaAtual === 1;

    nextPage.disabled =
    paginaAtual >= totalPaginas
    || totalPaginas === 0;
}

function excluirItem(index) {

    tarefas.splice(index, 1);

    salvarDados();

    renderizarTabela();
}

function editarItem(index) {

    const item = tarefas[index];

    if (!item) return;

    document.getElementById("titulo").value =
        item.titulo;

    document.getElementById("codigo").value =
        item.codigo;

    document.getElementById("categoria").value =
        item.categoria;

    document.getElementById("preco").value =
        item.preco;

    document.getElementById("descricao").value =
        item.descricao;

    document.querySelectorAll(
        "input[name='canais']"
    ).forEach(c => {

        c.checked =
            item.canais.includes(c.value);
    });

    editandoIndex = index;

    botaoSalvar.textContent = "Atualizar";

    document.getElementById("form")
        .scrollIntoView({
            behavior: "smooth"
        });
}

searchInput.addEventListener("input", () => {

    paginaAtual = 1;

    renderizarTabela();
});

prevPage.addEventListener("click", () => {

    if (paginaAtual > 1) {

        paginaAtual--;

        renderizarTabela();
    }
});

nextPage.addEventListener("click", () => {

    const totalPaginas =
        Math.ceil(tarefas.length / itensPorPagina);

    if (paginaAtual < totalPaginas) {

        paginaAtual++;

        renderizarTabela();
    }
});

document.querySelectorAll("th[data-sort]")
.forEach(th => {

    th.addEventListener("click", () => {

        const campo =
            th.dataset.sort;

        if (colunaOrdenacao === campo) {

            ordemAscendente =
                !ordemAscendente;

        } else {

            colunaOrdenacao = campo;

            ordemAscendente = true;
        }

        renderizarTabela();
    });
});