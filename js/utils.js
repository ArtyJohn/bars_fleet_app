// js/utils.js - Утилиты
const Utils = {
    generateId: () => Date.now(),
    
    formatDate: (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('ru-RU');
    },
    
    formatPhone: (input) => {
        let value = input.value.replace(/\D/g, '');
        if (value.startsWith('8')) value = '7' + value.slice(1);
        if (!value.startsWith('7')) value = '7' + value;
        if (value.length > 11) value = value.slice(0, 11);
        let formatted = '+7';
        if (value.length > 1) formatted += ' (' + value.slice(1, 4);
        if (value.length > 4) formatted += ') ' + value.slice(4, 7);
        if (value.length > 7) formatted += '-' + value.slice(7, 9);
        if (value.length > 9) formatted += '-' + value.slice(9, 11);
        input.value = formatted;
    },
    
    validateRequired: (value, fieldName) => {
        if (!value || !value.trim()) {
            return `${fieldName} обязательно для заполнения`;
        }
        return null;
    },
    
    validateNumber: (value, fieldName, min = 0) => {
        const num = parseInt(value);
        if (isNaN(num) || num < min) {
            return `${fieldName} должно быть числом не менее ${min}`;
        }
        return null;
    },
    
    validateRegNumber: (value) => {
        const pattern = /^[А-ЯA-Z]{1,3}\d{3}[А-ЯA-Z]{2,3}\d{2,3}$/;
        if (!pattern.test(value.toUpperCase())) {
            return 'Неверный формат регистрационного номера';
        }
        return null;
    },
    
    showValidationError: (element, message) => {
        const errorEl = element.parentElement.querySelector('.validation-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            element.classList.add('error');
        }
    },
    
    clearValidationErrors: (container) => {
        container.querySelectorAll('.validation-error').forEach(el => el.classList.remove('show'));
        container.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    },
    
    downloadFile: (data, filename, mimeType) => {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    showToast: (message, type = '') => {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    openModal: (html) => {
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalOverlay').classList.add('active');
    },
    
    closeModal: () => {
        document.getElementById('modalOverlay').classList.remove('active');
    }
};

// Глобальный доступ
window.Utils = Utils;