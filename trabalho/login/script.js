document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const campoLogin = document.getElementById("ilogin");
    const campoSenha = document.getElementById("isenha");
    const lembrar = document.getElementById("lembrar");

    const lembrarSalvo = localStorage.getItem("lembrarSenha") === "true";
    const emailSalvo = localStorage.getItem("emailSalvo") || "";
    const senhaSalva = localStorage.getItem("senhaSalva") || "";

    if (lembrarSalvo) {
        lembrar.checked = true;
        campoLogin.value = emailSalvo;
        campoSenha.value = senhaSalva;
    } else {
        lembrar.checked = false;
        emailSalvo.value = "";
        campoSenha.value = "";
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const usuario = campoLogin.value.trim();
        const senha = campoSenha.value;

        if (usuario === "" || senha === "") {
            alert("Preencha e-mail e senha.");
            return;
        }

        sessionStorage.setItem("usuarioLogado", usuario);

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