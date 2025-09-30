const express = require('express');
const { body } = require('express-validator');
const incomeController = require('../controllers/incomeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones para crear/actualizar ingresos
const incomeValidation = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  
  body('categoria_id')
    .isUUID()
    .withMessage('El ID de categoría debe ser un UUID válido'),
  
  body('monto')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0'),
  
  body('fecha_ingreso')
    .isISO8601()
    .withMessage('La fecha de ingreso debe ser una fecha válida')
    .toDate()
];

// Validaciones para actualizar (campos opcionales)
const updateIncomeValidation = [
  body('descripcion')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  
  body('categoria_id')
    .optional()
    .isUUID()
    .withMessage('El ID de categoría debe ser un UUID válido'),
  
  body('monto')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0'),
  
  body('fecha_ingreso')
    .optional()
    .isISO8601()
    .withMessage('La fecha de ingreso debe ser una fecha válida')
    .toDate()
];

/**
 * @route GET /api/income
 * @desc Obtener todos los ingresos del usuario autenticado
 * @access Private
 * @query page, limit, search, category, start_date, end_date
 */
router.get('/', incomeController.getIncomes);

/**
 * @route GET /api/income/stats
 * @desc Obtener estadísticas de ingresos del usuario
 * @access Private
 * @query start_date, end_date
 */
router.get('/stats', incomeController.getIncomeStats);

/**
 * @route GET /api/income/:id
 * @desc Obtener un ingreso específico por ID
 * @access Private
 */
router.get('/:id', incomeController.getIncomeById);

/**
 * @route POST /api/income
 * @desc Crear un nuevo ingreso
 * @access Private
 */
router.post('/', incomeValidation, incomeController.createIncome);

/**
 * @route PUT /api/income/:id
 * @desc Actualizar un ingreso existente
 * @access Private
 */
router.put('/:id', updateIncomeValidation, incomeController.updateIncome);

/**
 * @route DELETE /api/income/:id
 * @desc Eliminar un ingreso (soft delete)
 * @access Private
 */
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
