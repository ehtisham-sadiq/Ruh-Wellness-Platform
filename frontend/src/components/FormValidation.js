import { useState, useEffect, useCallback } from 'react';

// Validation rules
export const validationRules = {
  required: (value) => ({
    isValid: value !== null && value !== undefined && value !== '',
    message: 'This field is required'
  }),
  
  email: (value) => ({
    isValid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }),
  
  phone: (value) => ({
    isValid: !value || /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
    message: 'Please enter a valid phone number'
  }),
  
  minLength: (min) => (value) => ({
    isValid: !value || value.length >= min,
    message: `Must be at least ${min} characters long`
  }),
  
  maxLength: (max) => (value) => ({
    isValid: !value || value.length <= max,
    message: `Must be no more than ${max} characters long`
  }),
  
  pattern: (regex, message) => (value) => ({
    isValid: !value || regex.test(value),
    message: message || 'Invalid format'
  }),
  
  date: (value) => ({
    isValid: !value || !isNaN(Date.parse(value)),
    message: 'Please enter a valid date'
  }),
  
  futureDate: (value) => ({
    isValid: !value || new Date(value) > new Date(),
    message: 'Date must be in the future'
  }),
  
  pastDate: (value) => ({
    isValid: !value || new Date(value) < new Date(),
    message: 'Date must be in the past'
  }),
  
  number: (value) => ({
    isValid: !value || !isNaN(Number(value)),
    message: 'Please enter a valid number'
  }),
  
  positiveNumber: (value) => ({
    isValid: !value || (Number(value) > 0),
    message: 'Please enter a positive number'
  }),
  
  url: (value) => ({
    isValid: !value || /^https?:\/\/.+/.test(value),
    message: 'Please enter a valid URL'
  }),
  
  password: (value) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;
    
    const isValid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
    
    return {
      isValid,
      message: 'Password must contain uppercase, lowercase, number, special character, and be at least 8 characters'
    };
  },
  
  confirmPassword: (password) => (confirmPassword) => ({
    isValid: !confirmPassword || password === confirmPassword,
    message: 'Passwords do not match'
  }),
  
  custom: (validator, message) => (value) => ({
    isValid: validator(value),
    message: message || 'Invalid value'
  })
};

// Hook for form validation
export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    if (!validationSchema[name]) return { isValid: true, message: '' };

    const fieldRules = validationSchema[name];
    const fieldValue = value !== undefined ? value : values[name];

    for (const rule of fieldRules) {
      const validation = rule(fieldValue);
      if (!validation.isValid) {
        return validation;
      }
    }

    return { isValid: true, message: '' };
  }, [validationSchema, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const validation = validateField(fieldName);
      if (!validation.isValid) {
        newErrors[fieldName] = validation.message;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [validationSchema, validateField]);

  // Handle field change - optimized to prevent re-renders
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing (but don't validate immediately)
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const validation = validateField(name);
    setErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message
    }));
  }, [validateField]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [initialValues]);

  // Set form values
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
    // Validate after setting values, but debounced
    setTimeout(() => validateForm(), 0);
  }, [validateForm]);

  // Validate only on mount - not on every value change to prevent re-renders
  useEffect(() => {
    validateForm();
  }, []); // Only run on mount

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFormValues,
    setValues,
    setErrors
  };
};

// Form validation component
export const FormValidation = ({ 
  children, 
  initialValues = {}, 
  validationSchema = {}, 
  onSubmit, 
  onValidationError 
}) => {
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm
  } = useFormValidation(initialValues, validationSchema);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(values, resetForm);
    } else {
      onValidationError?.(errors);
    }
  };

  return children({
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  });
};

// Field validation component
export const ValidatedField = ({ 
  name, 
  value, 
  error, 
  touched, 
  onChange, 
  onBlur, 
  children,
  showError = true 
}) => {
  const hasError = touched && error;
  
  return (
    <div className="space-y-1">
      {children({
        name,
        value,
        onChange: (e) => onChange(name, e.target.value),
        onBlur: () => onBlur(name),
        hasError,
        error
      })}
      {showError && hasError && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Validation message component
export const ValidationMessage = ({ error, touched, className = "" }) => {
  if (!touched || !error) return null;
  
  return (
    <p className={`text-sm text-red-600 ${className}`}>
      {error}
    </p>
  );
};

// Form error summary component
export const FormErrorSummary = ({ errors, touched }) => {
  const visibleErrors = Object.keys(errors).filter(key => 
    errors[key] && touched[key]
  );

  if (visibleErrors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <h3 className="text-sm font-medium text-red-800 mb-2">
        Please fix the following errors:
      </h3>
      <ul className="text-sm text-red-700 space-y-1">
        {visibleErrors.map(field => (
          <li key={field}>
            <strong>{field}:</strong> {errors[field]}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Debounced validation hook
export const useDebouncedValidation = (value, validator, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [validation, setValidation] = useState({ isValid: true, message: '' });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  useEffect(() => {
    if (debouncedValue !== undefined) {
      const result = validator(debouncedValue);
      setValidation(result);
    }
  }, [debouncedValue, validator]);

  return validation;
};

export default useFormValidation; 