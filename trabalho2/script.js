document.addEventListener("DOMContentLoaded", () => {

  // ─── Estado da aplicação ─────────────────────────────────────────────────────

  const state = {
    tarefas: JSON.parse(localStorage.getItem("tarefas")) || [],
    editandoId: null,        // ID único do item em edição (não índice de página)
    paginaAtual: 1,
    itensPorPagina: 5,
    pesquisa: "",
    ordenacao: { coluna: null, ascendente: true },
  };

  // ─── Referências ao DOM ───────────────────────────────────────────────────────
  // Todas as referências ficam aqui dentro, garantindo que o DOM já foi carregado.

  const els = {
    form:           document.getElementById("taskForm"),
    lista:          document.getElementById("taskList"),
    searchInput:    document.getElementById("searchInput"),
    paginationInfo: document.getElementById("paginationInfo"),
    currentPage:    document.getElementById("currentPage"),
    prevPage:       document.getElementById("prevPage"),
    nextPage:       document.getElementById("nextPage"),
    botaoSalvar:    document.getElementById("botaoSalvar"),
    botaoLimpar:    document.getElementById("botaoLimpar"),
    secaoForm:      document.getElementById("form"),
  };

  // ─── Migração: garante que itens antigos (sem id) ganhem um ID ───────────────

  (function migrarDadosAntigos() {
    let precisaSalvar = false;
    state.tarefas.forEach((item) => {
      if (!item.id) {
        item.id = gerarId();
        precisaSalvar = true;
      }
    });
    if (precisaSalvar) salvarDados();
  })();

  // ─── Inicialização ────────────────────────────────────────────────────────────

  renderizarTabela();

  document.querySelectorAll("select.field-select").forEach((sel) => {
    updateSelectState(sel);
    sel.addEventListener("change", () => updateSelectState(sel));
  });

  ["titulo", "codigo", "categoria", "preco"].forEach((id) => {
    const el = document.getElementById(id);
    const limparErro = function () { this.closest(".field-group").classList.remove("field-error"); };
    el.addEventListener("input", limparErro);
    el.addEventListener("change", limparErro);
  });

  // ─── Persistência ─────────────────────────────────────────────────────────────

  function salvarDados() {
    localStorage.setItem("tarefas", JSON.stringify(state.tarefas));
  }

  // ─── Formulário ───────────────────────────────────────────────────────────────

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario()) return;

    const dadosFormulario = lerFormulario();

    if (state.editandoId !== null) {
      atualizarTarefa(state.editandoId, dadosFormulario);
    } else {
      adicionarTarefa(dadosFormulario);
    }

    resetarFormulario();
    salvarDados();
    renderizarTabela();
  });

  // O botão "Limpar" é type="reset" (limpa os campos nativamente),
  // mas precisamos também resetar o estado de edição manualmente.
  els.botaoLimpar.addEventListener("click", () => {
    resetarFormulario();
  });

  /** Valida os campos obrigatórios e marca visualmente os inválidos. */
  function validarFormulario() {
    const campos = [
      { el: document.getElementById("titulo"),    check: (v) => v.trim() !== "" },
      { el: document.getElementById("codigo"),    check: (v) => v.trim() !== "" },
      { el: document.getElementById("categoria"), check: (v) => v !== "" },
      { el: document.getElementById("preco"),     check: (v) => v !== "" && parseFloat(v) > 0 },
    ];

    let valido = true;
    campos.forEach(({ el, check }) => {
      const grupo = el.closest(".field-group");
      if (!check(el.value)) {
        grupo.classList.add("field-error");
        valido = false;
      } else {
        grupo.classList.remove("field-error");
      }
    });
    return valido;
  }

  /** Lê e retorna os valores atuais do formulário. */
  function lerFormulario() {
    return {
      titulo:    document.getElementById("titulo").value.trim(),
      codigo:    document.getElementById("codigo").value.trim(),
      categoria: document.getElementById("categoria").value,
      preco:     document.getElementById("preco").value,
      descricao: document.getElementById("descricao").value.trim(),
      canais:    [...document.querySelectorAll("input[name='canais']:checked")]
                   .map((c) => c.value),
    };
  }

  /** Adiciona uma nova tarefa ao array com status e data de cadastro. */
  function adicionarTarefa(dados) {
    state.tarefas.push({
      ...dados,
      id: gerarId(),
      status: "ativo",
      dataCadastro: new Date().toLocaleDateString("pt-BR"),
    });
  }

  /**
   * Atualiza a tarefa pelo ID único, preservando id, status e dataCadastro.
   *
   * CORREÇÃO: antes o código usava o índice relativo da página como chave
   * de busca no array global, o que causava criação de item duplicado
   * quando a paginação estava ativa. Agora usamos um ID único e estável.
   */
  function atualizarTarefa(id, novosDados) {
    const indexReal = state.tarefas.findIndex((t) => t.id === id);
    if (indexReal === -1) return;

    state.tarefas[indexReal] = {
      ...state.tarefas[indexReal], // preserva id, status, dataCadastro
      ...novosDados,               // sobrescreve apenas os campos editáveis
    };
  }

  /** Gera um ID simples baseado em timestamp + random. */
  function gerarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Adiciona/remove .has-value no <select> conforme o valor atual. */
  function updateSelectState(sel) {
    sel.classList.toggle("has-value", !!sel.value);
  }

  /** Limpa o formulário, desmarca checkboxes e restaura o botão "Salvar". */
  function resetarFormulario() {
    els.form.reset();
    document.querySelectorAll("input[name='canais']").forEach((c) => (c.checked = false));
    document.querySelectorAll("select.field-select").forEach(updateSelectState);
    document.querySelectorAll(".field-group.field-error").forEach((g) => g.classList.remove("field-error"));
    els.botaoSalvar.textContent = "Salvar";
    state.editandoId = null;
  }

  // ─── Ações da tabela ──────────────────────────────────────────────────────────

  /**
   * Preenche o formulário com os dados do item e entra em modo de edição.
   * Exposta no window para funcionar nos onclick gerados dinamicamente no HTML.
   */
  window.editarItem = function (id) {
    const item = state.tarefas.find((t) => t.id === id);
    if (!item) return;

    document.getElementById("titulo").value    = item.titulo;
    document.getElementById("codigo").value    = item.codigo;
    document.getElementById("categoria").value = item.categoria;
    updateSelectState(document.getElementById("categoria"));
    document.getElementById("preco").value     = item.preco;
    document.getElementById("descricao").value = item.descricao;

    document.querySelectorAll("input[name='canais']").forEach((c) => {
      c.checked = item.canais.includes(c.value);
    });

    state.editandoId = item.id;
    els.botaoSalvar.textContent = "Atualizar";

    // Rola até a section com id="form" (não o <form> em si)
    els.secaoForm.scrollIntoView({ behavior: "smooth" });
  };

  /** Remove definitivamente um item pelo ID. Exposta no window pelo mesmo motivo. */
  window.excluirItem = function (id) {
    state.tarefas = state.tarefas.filter((t) => t.id !== id);
    salvarDados();
    renderizarTabela();
  };

  // ─── Renderização da tabela ───────────────────────────────────────────────────

  function renderizarTabela() {
    els.lista.innerHTML = "";

    const dadosFiltrados          = filtrar(state.tarefas, state.pesquisa);
    const dadosOrdenados          = ordenar(dadosFiltrados, state.ordenacao);
    const { pagina, totalPaginas } = paginar(dadosOrdenados);

    pagina.forEach((item) => els.lista.appendChild(criarLinha(item)));

    atualizarPaginacao(dadosFiltrados.length, totalPaginas);
  }

  /** Filtra por título, código ou categoria. */
  function filtrar(dados, pesquisa) {
    if (!pesquisa) return dados;
    const termo = pesquisa.toLowerCase();
    return dados.filter(
      (item) =>
        item.titulo.toLowerCase().includes(termo) ||
        item.codigo.toLowerCase().includes(termo) ||
        item.categoria.toLowerCase().includes(termo)
    );
  }

  /** Ordena pelo campo configurado no estado. */
  function ordenar(dados, { coluna, ascendente }) {
    if (!coluna) return dados;
    return [...dados].sort((a, b) => {
      let valA = typeof a[coluna] === "string" ? a[coluna].toLowerCase() : a[coluna];
      let valB = typeof b[coluna] === "string" ? b[coluna].toLowerCase() : b[coluna];
      if (valA < valB) return ascendente ? -1 : 1;
      if (valA > valB) return ascendente ? 1 : -1;
      return 0;
    });
  }

  /** Fatia o array para a página atual e retorna também o total de páginas. */
  function paginar(dados) {
    const totalPaginas = Math.ceil(dados.length / state.itensPorPagina);
    const inicio       = (state.paginaAtual - 1) * state.itensPorPagina;
    const pagina       = dados.slice(inicio, inicio + state.itensPorPagina);
    return { pagina, totalPaginas };
  }

  /** Cria e retorna um <tr> para o item recebido. */
  function criarLinha(item) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${item.titulo}</td>
      <td>${item.codigo}</td>
      <td>${item.categoria}</td>
      <td>R$ ${parseFloat(item.preco || 0).toFixed(2)}</td>
      <td>
        <div class="canais">
          ${item.canais.map((canal) => `<span class="canal-chip">${canal}</span>`).join("")}
        </div>
      </td>
      <td>${item.descricao}</td>
      <td><span class="status ativo">Ativo</span></td>
      <td>${item.dataCadastro}</td>
      <td class="acoes">
        <button class="btn-icon" onclick="editarItem('${item.id}')">Editar</button>
        <button class="btn-icon" onclick="excluirItem('${item.id}')">Excluir</button>
      </td>
    `;
    return tr;
  }

  /** Atualiza textos e botões de paginação. */
  function atualizarPaginacao(totalItens, totalPaginas) {
    els.paginationInfo.textContent = `${totalItens} itens`;
    els.currentPage.textContent    = state.paginaAtual;
    els.prevPage.disabled          = state.paginaAtual === 1;
    els.nextPage.disabled          = state.paginaAtual >= totalPaginas || totalPaginas === 0;
  }

  // ─── Eventos: pesquisa, paginação e ordenação ─────────────────────────────────

  els.searchInput.addEventListener("input", () => {
    state.pesquisa    = els.searchInput.value.toLowerCase();
    state.paginaAtual = 1;
    renderizarTabela();
  });

  els.prevPage.addEventListener("click", () => {
    if (state.paginaAtual > 1) {
      state.paginaAtual--;
      renderizarTabela();
    }
  });

  els.nextPage.addEventListener("click", () => {
    const totalPaginas = Math.ceil(
      filtrar(state.tarefas, state.pesquisa).length / state.itensPorPagina
    );
    if (state.paginaAtual < totalPaginas) {
      state.paginaAtual++;
      renderizarTabela();
    }
  });

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const campo = th.dataset.sort;
      if (state.ordenacao.coluna === campo) {
        state.ordenacao.ascendente = !state.ordenacao.ascendente;
      } else {
        state.ordenacao.coluna     = campo;
        state.ordenacao.ascendente = true;
      }
      renderizarTabela();
    });
  });

}); // fim do DOMContentLoaded