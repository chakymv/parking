const supabase = require('./../../supabaseClient');
const bcrypt = require('bcryptjs');

class Usuarios {
  /**
   * Crear un nuevo usuario normal o visitante
   * @param {Object} datos - Datos del usuario
   */
  static async crear(datos) {
    const camposObligatorios = [
      'tipo_documento', 'numero_documento', 'primer_nombre', 'primer_apellido',
      'direccion_correo', 'numero_celular', 'clave', 'perfil_usuario_id'
    ];

    for (const campo of camposObligatorios) {
      if (!datos[campo]) {
        throw new Error(`El campo ${campo} es obligatorio.`);
      }
    }

    // Verificar duplicados por documento o correo
    const { data: existentes, error: busquedaError } = await supabase
      .from('usuario')
      .select('id')
      .or(`numero_documento.eq.${datos.numero_documento},direccion_correo.eq.${datos.direccion_correo}`);

    if (busquedaError) throw new Error('Error al verificar duplicados.');
    if (existentes.length > 0) throw new Error('Ya existe un usuario con ese documento o correo.');

    // Hashear clave
    const claveHash = await bcrypt.hash(datos.clave, 10);
    const nuevoUsuario = { ...datos, clave: claveHash };

    const { error: insercionError } = await supabase
      .from('usuario')
      .insert([nuevoUsuario]);

    if (insercionError) {
      throw new Error(`Error al registrar: ${insercionError.message}`);
    }
  }

  /**
   * Autenticar usuario por correo y clave
   * @param {String} direccion_correo
   * @param {String} clavePlano
   */
  static async login(direccion_correo, clavePlano) {
    if (!direccion_correo || !clavePlano) {
      throw new Error('Correo y clave son obligatorios.');
    }

    const { data: usuario, error } = await supabase
      .from('usuario')
      .select('id, primer_nombre, perfil_usuario_id, clave')
      .eq('direccion_correo', direccion_correo)
      .single();

    if (error || !usuario) throw new Error('Usuario no encontrado.');

    const claveValida = await bcrypt.compare(clavePlano, usuario.clave);
    if (!claveValida) throw new Error('Contraseña incorrecta.');

    const { clave, ...datosSeguros } = usuario;
    return datosSeguros;
  }
}

module.exports = Usuarios;
