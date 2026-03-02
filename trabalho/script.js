let tarefas = [];

document.getElementById("taskForm").addEventListener("submit", function(e){
    e.preventDefault();

    const id = document.getElementById("taskId").value;
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;

    if(id){
        tarefas[id] = { titulo, descricao };
    } else {
        tarefas.push({ titulo, descricao });
    }

    this.reset();
    document.getElementById("taskId").value = "";
    listarTarefas();
});

function listarTarefas(){
    const lista = document.getElementById("taskList");
    lista.innerHTML = "";

    tarefas.forEach((tarefa, index) => {
        lista.innerHTML += `
            <tr>
                <td>${tarefa.titulo}</td>
                <td>${tarefa.descricao}</td>
                <td>
                    <button onclick="editar(${index})">Editar</button>
                    <button onclick="excluir(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function editar(index){
    document.getElementById("taskId").value = index;
    document.getElementById("titulo").value = tarefas[index].titulo;
    document.getElementById("descricao").value = tarefas[index].descricao;
}

function excluir(index){
    tarefas.splice(index, 1);
    listarTarefas();
}