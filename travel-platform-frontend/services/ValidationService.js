class ValidationService {
    static validators = {
        required: (value) => value?.trim() ? null : 'This field is required',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email format',
        minLength: (length) => (value) => 
            value.length >= length ? null : `Minimum length is ${length} characters`,
        maxLength: (length) => (value) => 
            value.length <= length ? null : `Maximum length is ${length} characters`,
        number: (value) => !isNaN(value) ? null : 'Must be a number',
        date: (value) => !isNaN(Date.parse(value)) ? null : 'Invalid date'
    }

    static validateForm(formData, rules) {
        const errors = {};
        for (const [field, fieldRules] of Object.entries(rules)) {
            const fieldErrors = [];
            for (const rule of fieldRules) {
                const error = this.validators[rule](formData[field]);
                if (error) fieldErrors.push(error);
            }
            if (fieldErrors.length) errors[field] = fieldErrors;
        }
        return errors;
    }
}