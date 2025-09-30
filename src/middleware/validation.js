const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para usuarios
const validateUsuario = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('rol')
    .optional()
    .isIn(['usuario', 'administrador'])
    .withMessage('El rol debe ser "usuario" o "administrador"'),
  
  handleValidationErrors
];

// Validaciones para préstamos
const validatePrestamo = [
  body('monto')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 1000, max: 10000000 })
    .withMessage('El monto debe ser entre $1,000 y $10,000,000'),
  
  body('plazo_meses')
    .isInt({ min: 1, max: 360 })
    .withMessage('El plazo debe ser entre 1 y 360 meses'),
  
  body('calendario')
    .isIn(['mensual', 'quincenal', 'semanal'])
    .withMessage('El calendario debe ser mensual, quincenal o semanal'),
  
  body('tipo_prestamo')
    .isIn(['personal', 'hipotecario', 'auto'])
    .withMessage('El tipo debe ser personal, hipotecario o auto'),
  
  handleValidationErrors
];

// Validaciones para pagos
const validatePago = [
  body('monto_total')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 1 })
    .withMessage('El monto debe ser mayor a $0'),
  
  body('referencia')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('La referencia debe tener entre 3 y 50 caracteres'),
  
  handleValidationErrors
];

// Validaciones para parámetros UUID
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  
  handleValidationErrors
];

// Validaciones para paginación
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100'),
  
  handleValidationErrors
];

// Validaciones para búsqueda
const validateSearch = [
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres'),
  
  query('fecha_inicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida (ISO 8601)'),
  
  query('fecha_fin')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida (ISO 8601)'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUsuario,
  validatePrestamo,
  validatePago,
  validateUUID,
  validatePagination,
  validateSearch
};
