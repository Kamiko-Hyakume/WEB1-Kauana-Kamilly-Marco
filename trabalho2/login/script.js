document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const campoLogin = document.getElementById("ilogin");
    const campoSenha = document.getElementById("isenha");
    const lembrar = document.getElementById("lembrar");
// pegar os elementos da tela
    const lembrarSalvo = localStorage.getItem("lembrarSenha") === "true";
    const emailSalvo = localStorage.getItem("emailSalvo") || "";
    const senhaSalva = localStorage.getItem("senhaSalva") || "";
// pegar os dados do localStorage
    if (lembrarSalvo) { 
        // validação e preencher os campos de login e senha se o usuário optou por lembrar
        lembrar.checked = true;
        campoLogin.value = emailSalvo;
        campoSenha.value = senhaSalva;
    } else {
        lembrar.checked = false;
        emailSalvo.value = "";
        campoSenha.value = "";
    }
// Quando clica no botão faz as validações
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
// pegar os valores dos campos de login e senha
        const usuario = campoLogin.value.trim();
        const senha = campoSenha.value;
// validar se os campos de login e senha estão preenchidos
        if (usuario === "" || senha === "") {
            alert("Preencha e-mail e senha.");
            return;
        }
// salvar o usuário logado na sessão
        sessionStorage.setItem("usuarioLogado", usuario);
// salvar ou limpar os dados de login no localStorage
        if (lembrar.checked) {
            localStorage.setItem("lembrarSenha", "true");
            localStorage.setItem("emailSalvo", usuario);
            localStorage.setItem("senhaSalva", senha);
        } else {
            localStorage.setItem("lembrarSenha", "false");
            localStorage.removeItem("emailSalvo");
            localStorage.removeItem("senhaSalva");
        }

        window.location.href = "../index.html";
    });
});