const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones para crear/actualizar categorías
const categoryValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('tipo')
    .isIn(['gasto', 'ingreso'])
    .withMessage('El tipo debe ser "gasto" o "ingreso"'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres')
];

const updateCategoryValidation = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
  
  body('activa')
    .optional()
    .isBoolean()
    .withMessage('El campo activa debe ser un booleano')
];

/**
 * @route GET /api/categories
 * @desc Obtener todas las categorías
 * @access Private
 * @query tipo (opcional: 'gasto' o 'ingreso')
 */
router.get('/', categoryController.getCategories);

/**
 * @route GET /api/categories/stats
 * @desc Obtener estadísticas de uso de categorías
 * @access Private
 * @query tipo (opcional: 'gasto' o 'ingreso')
 */
router.get('/stats', categoryController.getCategoryStats);

/**
 * @route GET /api/categories/:id
 * @desc Obtener una categoría específica por ID
 * @access Private
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route POST /api/categories
 * @desc Crear una nueva categoría (solo administradores)
 * @access Private (Admin only)
 */
router.post('/', categoryValidation, categoryController.createCategory);

/**
 * @route PUT /api/categories/:id
 * @desc Actualizar una categoría existente (solo administradores)
 * @access Private (Admin only)
 */
router.put('/:id', updateCategoryValidation, categoryController.updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Eliminar una categoría (solo administradores)
 * @access Private (Admin only)
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
