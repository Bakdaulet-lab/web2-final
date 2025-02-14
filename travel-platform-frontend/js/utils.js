class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static validateForm(formData, rules) {
        const errors = {};
        for (const [field, value] of Object.entries(formData)) {
            if (rules[field]) {
                const fieldErrors = rules[field]
                    .map(rule => rule(value))
                    .filter(error => error);
                if (fieldErrors.length) {
                    errors[field] = fieldErrors;
                }
            }
        }
        return errors;
    }
}