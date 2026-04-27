const form = document.getElementById("taskForm");
const lista = document.getElementById("taskList");
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoLimpar = document.getElementById("botaoLimpar");
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let editandoIndex = null;
const categoriaLabels = {
    eletronicos: "Eletrônicos",
    roupas: "Roupas e Acessórios",
    alimentos: "Alimentos e Bebidas",
    moveis: "Móveis e Decoração",
    livros: "Livros e Mídia",
    esportes: "Esportes e Lazer",
    outros: "Outros"
};

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario();
    renderizarTabela();
    adicionarRipple();
    contadorDescricao();
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validarFormulario()) {
        showSnackbar("Corrija os erros antes de salvar.", "erro");
        return;
    }

    const titulo    = document.getElementById("titulo").value.trim();
    const codigo    = document.getElementById("codigo").value.trim().toUpperCase();
    const categoria = document.getElementById("categoria").value;
    const preco     = parseFloat(document.getElementById("preco").value);
    const descricao = document.getElementById("descricao").value.trim();
    const canais    = [...document.querySelectorAll("input[name='canais']:checked")]
                        .map(c => c.value);

    const item = { titulo, codigo, categoria, preco, descricao, canais };

    if (editandoIndex !== null) {
        tarefas[editandoIndex] = item;
        editandoIndex = null;
        botaoSalvar.innerHTML = '<span class="material-icons">save</span> Salvar';
        showSnackbar("Item atualizado com sucesso!");
    } else {
        tarefas.push(item);
        showSnackbar("Item cadastrado com sucesso!");
    }

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    renderizarTabela();
    form.reset();
    limparErros();
});

botaoLimpar.addEventListener("click", function () {
    editandoIndex = null;
    botaoSalvar.innerHTML = '<span class="material-icons">save</span> Salvar';
    limparErros();

});

function setErro(campoId, msg) {
    const campo = document.getElementById(campoId);
    const helper = document.getElementById(campoId + "-helper");
    if (campo)  campo.classList.add("erro");
    if (helper) { helper.textContent = msg; helper.classList.add("erro"); }
}


function limparErro(campoId) {
    const campo = document.getElementById(campoId);
    const helper = document.getElementById(campoId + "-helper");
    if (campo)  campo.classList.remove("erro");
    if (helper) { helper.textContent = ""; helper.classList.remove("erro"); }
}

function limparErros() {
    ["titulo", "codigo", "categoria", "preco", "descricao"].forEach(limparErro);
    const canaisHelper = document.getElementById("canais-helper");
    if (canaisHelper) { canaisHelper.textContent = ""; canaisHelper.classList.remove("erro"); }
}

function validarFormulario() {
    limparErros();
    let valido = true;

    const titulo    = document.getElementById("titulo").value.trim();
    const codigo    = document.getElementById("codigo").value.trim();
    const categoria = document.getElementById("categoria").value;
    const precoStr  = document.getElementById("preco").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const canais    = document.querySelectorAll("input[name='canais']:checked");

    if (!validarTexto(titulo, "titulo", "Título")) valido = false;
    if (!validarTexto(descricao, "descricao", "Descrição")) valido = false;

    if (codigo === "") {
        setErro("codigo", "O código do item é obrigatório.");
        valido = false;
    } else if (!/^[A-Za-z0-9\-]+$/.test(codigo)) {
        setErro("codigo", "Use apenas letras, números e hífens.");
        valido = false;
    }

    if (categoria === "") {
        setErro("categoria", "Selecione uma categoria.");
        valido = false;
    }
    if (precoStr === "") {
        setErro("preco", "Informe o preço do item.");
        valido = false;
    } else {
        const preco = parseFloat(precoStr);
        if (isNaN(preco) || preco < 0) {
            setErro("preco", "O preço deve ser um valor numérico positivo.");
            valido = false;
        } else if (preco === 0) {
            setErro("preco", "O preço deve ser maior que zero.");
            valido = false;
        }
    }

    if (canais.length === 0) {
        const helper = document.getElementById("canais-helper");
        helper.textContent = "Selecione ao menos um canal de venda.";
        helper.classList.add("erro");
        valido = false;
    }

    return valido;
}

function validarTexto(valor, campoId, nomeCampo) {
    if (typeof valor !== "string") {
        setErro(campoId, `${nomeCampo} deve ser um texto.`);
        return false;
    }

    if (valor === "") {
        setErro(campoId, `${nomeCampo} não pode ficar vazio.`);
        return false;
    }

    if (/^\d+$/.test(valor)) {
        setErro(campoId, `${nomeCampo} não pode conter apenas números.`);
        return false;
    }

    if (valor.length < 3) {
        setErro(campoId, `${nomeCampo} deve ter ao menos 3 caracteres.`);
        return false;
    }

    return true;
}

function carregarUsuario() {
    const usuario = sessionStorage.getItem("usuarioLogado");
    const nome = (usuario && usuario.trim() !== "") ? usuario : "Visitante";
    nomeUsuario.textContent = nome;
    const avatar = document.getElementById("avatarInicial");
    if (avatar) avatar.textContent = nome.charAt(0).toUpperCase();
}

function renderizarTabela() {
    lista.innerHTML = "";

    if (tarefas.length === 0) {
        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="tabela-vazia">
                        <span class="material-icons">inbox</span>
                        Nenhum item cadastrado ainda.
                    </div>
                </td>
            </tr>`;
        return;
    }

    tarefas.forEach((tarefa, index) => {
        const novaLinha = document.createElement("tr");

        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = tarefa.titulo;

        const tdCodigo = document.createElement("td");
        tdCodigo.textContent = tarefa.codigo || "—";

        const tdCategoria = document.createElement("td");
        tdCategoria.textContent = categoriaLabels[tarefa.categoria] || tarefa.categoria || "—";

        const tdPreco = document.createElement("td");
        tdPreco.textContent = tarefa.preco != null
            ? `R$ ${parseFloat(tarefa.preco).toFixed(2).replace(".", ",")}`
            : "—";

        const tdAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "btn-editar";
        botaoEditar.title = "Editar item";
        botaoEditar.innerHTML = '<span class="material-icons" style="font-size:18px;">edit</span>';
        botaoEditar.addEventListener("click", function () {
            editarItem(index);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "btn-excluir";
        botaoExcluir.title = "Excluir item";
        botaoExcluir.innerHTML = '<span class="material-icons" style="font-size:18px;">delete</span>';
        botaoExcluir.addEventListener("click", function () {
            excluirItem(index);
        });

        tdAcoes.appendChild(botaoEditar);
        tdAcoes.appendChild(botaoExcluir);

        novaLinha.appendChild(tdTitulo);
        novaLinha.appendChild(tdCodigo);
        novaLinha.appendChild(tdCategoria);
        novaLinha.appendChild(tdPreco);
        novaLinha.appendChild(tdAcoes);
        lista.appendChild(novaLinha);
    });
}

function excluirItem(index) {
    if (!confirm(`Excluir o item "${tarefas[index].titulo}"?`)) return;
    tarefas.splice(index, 1);
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    if (editandoIndex === index) {
        editandoIndex = null;
        form.reset();
        limparErros();
        botaoSalvar.innerHTML = '<span class="material-icons">save</span> Salvar';
    }
    renderizarTabela();
    showSnackbar("Item excluído com sucesso!");
}

function editarItem(index) {
    const item = tarefas[index];

    document.getElementById("titulo").value    = item.titulo;
    document.getElementById("codigo").value    = item.codigo || "";
    document.getElementById("categoria").value = item.categoria || "";
    document.getElementById("preco").value     = item.preco || "";
    document.getElementById("descricao").value = item.descricao;

    // Marca os checkboxes corretos
    document.querySelectorAll("input[name='canais']").forEach(c => {
        c.checked = item.canais && item.canais.includes(c.value);
    });

    editandoIndex = index;
    botaoSalvar.innerHTML = '<span class="material-icons">update</span> Atualizar';
    limparErros();

    document.getElementById("form").scrollIntoView({ behavior: "smooth" });
}

function showSnackbar(msg, tipo = "sucesso") {
    const snack = document.getElementById("snackbar");
    const icon  = document.getElementById("snackbar-icon");
    document.getElementById("snackbar-msg").textContent = msg;
    snack.className = `snackbar ${tipo}`;
    icon.textContent = tipo === "sucesso" ? "check_circle" : "error";
    snack.classList.add("show");
    setTimeout(() => snack.classList.remove("show"), 3500);
}

function adicionarRipple() {
    document.querySelectorAll(".btn-contained").forEach(btn => {
        btn.addEventListener("click", function (e) {
            const ripple = document.createElement("span");
            ripple.className = "ripple";
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + "px";
            ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
            ripple.style.top  = (e.clientY - rect.top  - size / 2) + "px";
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function contadorDescricao() {
    const textarea = document.getElementById("descricao");
    const helper   = document.getElementById("descricao-helper");
    textarea.addEventListener("input", function () {
        if (!helper.classList.contains("erro")) {
            helper.textContent = `${this.value.length}/500 caracteres`;
        }
    });
}