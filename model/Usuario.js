const supabase = require('../supabaseClient');

class Usuario {
  constructor(
    id_usuario = null,
    tipo_documento = null,
    numero_documento = null,
    primer_nombre = null,
    segundo_nombre = null,
    primer_apellido = null,
    segundo_apellido = null,
    direccion_correo = null,
    numero_celular = null,
    foto_perfil = null,
    estado = null,
    clave = null,
    perfil_usuario_id = null
  ) {
    this._id_usuario = id_usuario;
    this._tipo_documento = tipo_documento;
    this._numero_documento = numero_documento;
    this._primer_nombre = primer_nombre;
    this._segundo_nombre = segundo_nombre;
    this._primer_apellido = primer_apellido;
    this._segundo_apellido = segundo_apellido;
    this._direccion_correo = direccion_correo;
    this._numero_celular = numero_celular;
    this._foto_perfil = foto_perfil;
    this._estado = estado;
    this._clave = clave;
    this._perfil_usuario_id = perfil_usuario_id;
  }

  // Getters
  get id_usuario() { return this._id_usuario; }
  get tipo_documento() { return this._tipo_documento; }
  get numero_documento() { return this._numero_documento; }
  get primer_nombre() { return this._primer_nombre; }
  get segundo_nombre() { return this._segundo_nombre; }
  get primer_apellido() { return this._primer_apellido; }
  get segundo_apellido() { return this._segundo_apellido; }
  get direccion_correo() { return this._direccion_correo; }
  get numero_celular() { return this._numero_celular; }
  get foto_perfil() { return this._foto_perfil; }
  get estado() { return this._estado; }
  get clave() { return this._clave; }
  get perfil_usuario_id() { return this._perfil_usuario_id; }

  // Setters
  set id_usuario(value) { this._id_usuario = value; }
  set tipo_documento(value) { this._tipo_documento = value; }
  set numero_documento(value) { this._numero_documento = value; }
  set primer_nombre(value) { this._primer_nombre = value; }
  set segundo_nombre(value) { this._segundo_nombre = value; }
  set primer_apellido(value) { this._primer_apellido = value; }
  set segundo_apellido(value) { this._segundo_apellido = value; }
  set direccion_correo(value) { this._direccion_correo = value; }
  set numero_celular(value) { this._numero_celular = value; }
  set foto_perfil(value) { this._foto_perfil = value; }
  set estado(value) { this._estado = value; }
  set clave(value) { this._clave = value; }
  set perfil_usuario_id(value) { this._perfil_usuario_id = value; }

  // CREATE - Insert new user
  async create() {
    const insertObj = {
      tipo_documento: this._tipo_documento,
      numero_documento: this._numero_documento,
      primer_nombre: this._primer_nombre,
      segundo_nombre: this._segundo_nombre,
      primer_apellido: this._primer_apellido,
      segundo_apellido: this._segundo_apellido,
      direccion_correo: this._direccion_correo,
      numero_celular: this._numero_celular,
      foto_perfil: this._foto_perfil,
      estado: this._estado,
      clave: this._clave,
      perfil_usuario_id: this._perfil_usuario_id
    };
    const { data, error } = await supabase.from('usuario').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating Usuario: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  // READ - Get user by ID
  async findById(id) {
    const { data, error } = await supabase.from('usuario').select('*').eq('id_usuario', id).single();
    if (error) throw new Error(`Error finding Usuario: ${error.message}`);
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  // READ - Get all users
  static async findAll() {
    const { data, error } = await supabase.from('usuario').select('*');
    if (error) throw new Error(`Error finding all Usuario: ${error.message}`);
    return (data || []).map(row => {
      const usuario = new Usuario();
      usuario._mapRowToObject(row);
      return usuario;
    });
  }

  // READ - Find by document number
  async findByDocument(numero_documento) {
    const { data, error } = await supabase.from('usuario').select('*').eq('numero_documento', numero_documento).single();
    if (error) throw new Error(`Error finding Usuario by document: ${error.message}`);
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  // UPDATE - Update user
  async update() {
    const updateObj = {
      tipo_documento: this._tipo_documento,
      numero_documento: this._numero_documento,
      primer_nombre: this._primer_nombre,
      segundo_nombre: this._segundo_nombre,
      primer_apellido: this._primer_apellido,
      segundo_apellido: this._segundo_apellido,
      direccion_correo: this._direccion_correo,
      numero_celular: this._numero_celular,
      foto_perfil: this._foto_perfil,
      estado: this._estado,
      clave: this._clave,
      perfil_usuario_id: this._perfil_usuario_id
    };
    const { error } = await supabase.from('usuario').update(updateObj).eq('id_usuario', this._id_usuario);
    if (error) throw new Error(`Error updating Usuario: ${error.message}`);
    return this;
  }

  // DELETE - Delete user
  async delete() {
    const { error } = await supabase.from('usuario').delete().eq('id_usuario', this._id_usuario);
    if (error) throw new Error(`Error deleting Usuario: ${error.message}`);
    return true;
  }

  // Helper method to map database row to object properties
  _mapRowToObject(row) {
    this._id_usuario = row.id_usuario;
    this._tipo_documento = row.tipo_documento;
    this._numero_documento = row.numero_documento;
    this._primer_nombre = row.primer_nombre;
    this._segundo_nombre = row.segundo_nombre;
    this._primer_apellido = row.primer_apellido;
    this._segundo_apellido = row.segundo_apellido;
    this._direccion_correo = row.direccion_correo;
    this._numero_celular = row.numero_celular;
    this._foto_perfil = row.foto_perfil;
    this._estado = row.estado;
    this._clave = row.clave;
    this._perfil_usuario_id = row.perfil_usuario_id;
  }

  // Convert to JSON
  toJSON() {
    return {
      id_usuario: this._id_usuario,
      tipo_documento: this._tipo_documento,
      numero_documento: this._numero_documento,
      primer_nombre: this._primer_nombre,
      segundo_nombre: this._segundo_nombre,
      primer_apellido: this._primer_apellido,
      segundo_apellido: this._segundo_apellido,
      direccion_correo: this._direccion_correo,
      numero_celular: this._numero_celular,
      foto_perfil: this._foto_perfil,
      estado: this._estado,
      clave: this._clave,
      perfil_usuario_id: this._perfil_usuario_id
    };
  }
}

module.exports = Usuario;

