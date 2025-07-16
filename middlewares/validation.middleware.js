const { body, validationResult } = require('express-validator');

/**
 * Middleware para manejar los errores de validación detectados por express-validator.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Reglas de validación para la creación de un nuevo usuario.
 */
const validateCreateUser = [
  body('tipo_documento').notEmpty().withMessage('El tipo de documento es obligatorio.'),
  body('numero_documento').notEmpty().withMessage('El número de documento es obligatorio.'),
  body('primer_nombre').notEmpty().withMessage('El primer nombre es obligatorio.'),
  body('primer_apellido').notEmpty().withMessage('El primer apellido es obligatorio.'),
  body('direccion_correo')
    .isEmail()
    .withMessage('Debe proporcionar una dirección de correo electrónico válida.'),
  body('clave')
    .isLength({ min: 6 })
    .withMessage('La clave debe tener al menos 6 caracteres.'),
  body('perfil_usuario_id').isInt({ gt: 0 }).withMessage('El ID del perfil de usuario debe ser un número válido.'),
];

/**
 * Reglas de validación para la actualización de un usuario.
 * Son más flexibles ya que no todos los campos son obligatorios en una actualización.
 */
const validateUpdateUser = [
  body('direccion_correo').optional().isEmail().withMessage('Debe proporcionar una dirección de correo electrónico válida.'),
  body('clave').optional().isLength({ min: 6 }).withMessage('La clave debe tener al menos 6 caracteres.'),
  body('perfil_usuario_id').optional().isInt({ gt: 0 }).withMessage('El ID del perfil de usuario debe ser un número válido.'),
];

/**
 * Reglas de validación para la creación de un nuevo vehículo.
 */
const validateCreateVehiculo = [
  body('placa').trim().notEmpty().withMessage('La placa es obligatoria.'),
  body('tipo').isIn(['Carro', 'Moto']).withMessage('El tipo de vehículo debe ser "Carro" o "Moto".'),
  body('usuario_id_usuario').isInt({ gt: 0 }).withMessage('El ID del usuario es obligatorio y debe ser un número válido.'),
];

/**
 * Reglas de validación para la actualización de un vehículo.
 */
const validateUpdateVehiculo = [
  body('placa').optional().trim().notEmpty().withMessage('La placa no puede estar vacía.'),
  body('tipo').optional().isIn(['Carro', 'Moto']).withMessage('El tipo de vehículo debe ser "Carro" o "Moto".'),
  body('usuario_id_usuario').optional().isInt({ gt: 0 }).withMessage('El ID del usuario debe ser un número válido.'),
];

module.exports = {
  handleValidationErrors,
  validateCreateUser,
  validateUpdateUser,
  validateCreateVehiculo,
  validateUpdateVehiculo,
};