const supabase = require('./../supabaseClient');
const bcrypt = require('bcryptjs');
const { hashPassword } = require('./hash');
const { normalizeDocumento, normalizeCorreo } = require('./../utils/normalizer');

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
    estado = 'activo',
    clave = null,
    perfil_usuario_id = null
  ) {
    this._id_usuario = Number(id_usuario);
    this._tipo_documento = tipo_documento?.trim();
    this._numero_documento = normalizeDocumento(numero_documento);
    this._primer_nombre = primer_nombre?.trim();
    this._segundo_nombre = segundo_nombre?.trim() || '';
    this._primer_apellido = primer_apellido?.trim();
    this._segundo_apellido = segundo_apellido?.trim() || '';
    this._direccion_correo = normalizeCorreo(direccion_correo);
    this._numero_celular = numero_celular?.trim();
    this._foto_perfil = foto_perfil?.trim() || '';
    this._estado = estado?.trim().toLowerCase();
    this._clave = clave;
    this._perfil_usuario_id = Number(perfil_usuario_id);
  }

  // Getters y setters → igual a tu versión original, sin cambios

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

  set id_usuario(value) { this._id_usuario = Number(value); }
  set tipo_documento(value) { this._tipo_documento = value?.trim(); }
  set numero_documento(value) { this._numero_documento = normalizeDocumento(value); }
  set primer_nombre(value) { this._primer_nombre = value?.trim(); }
  set segundo_nombre(value) { this._segundo_nombre = value?.trim() || ''; }
  set primer_apellido(value) { this._primer_apellido = value?.trim(); }
  set segundo_apellido(value) { this._segundo_apellido = value?.trim() || ''; }
  set direccion_correo(value) { this._direccion_correo = normalizeCorreo(value); }
  set numero_celular(value) { this._numero_celular = value?.trim(); }
  set foto_perfil(value) { this._foto_perfil = value?.trim() || ''; }
  set estado(value) { this._estado = value?.trim().toLowerCase(); }
  set clave(value) { this._clave = value; }
  set perfil_usuario_id(value) { this._perfil_usuario_id = Number(value); }

  // Create
  async create() {
    if (this._clave) {
      this._clave = await hashPassword(this._clave);
    }
    const insertObj = this.toJSON(true); // true = incluir clave

    const { data, error } = await supabase
      .from('usuario')
      .insert([insertObj])
      .select()
      .single();

    if (error) throw new Error(`Error creating Usuario: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  // Find methods
  static async findAll() {
    const { data, error } = await supabase.from('usuario').select('*');
    if (error) throw new Error(`Error retrieving usuarios: ${error.message}`);
    return (data || []).map(row => {
      const usuario = new Usuario();
      usuario._mapRowToObject(row);
      return usuario;
    });
  }

  static async findById(id) {
    const idNum = Number(id);
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id_usuario', idNum)
      .single();
    if (error) throw new Error(`Error finding Usuario by ID: ${error.message}`);
    if (!data) return null;
    const usuario = new Usuario();
    usuario._mapRowToObject(data);
    return usuario;
  }

  static async findByEmail(email) {
    const emailNorm = normalizeCorreo(email);
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('direccion_correo', emailNorm)
      .single();
    if (error) throw new Error(`Error finding Usuario by email: ${error.message}`);
    if (!data) return null;
    const usuario = new Usuario();
    usuario._mapRowToObject(data);
    return usuario;
  }

  static async findByDocument(numero_documento) {
    const doc = normalizeDocumento(numero_documento);
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('numero_documento', doc)
      .single();
    if (error) throw new Error(`Error finding Usuario by document: ${error.message}`);
    if (!data) return null;
    const usuario = new Usuario();
    usuario._mapRowToObject(data);
    return usuario;
  }

  // Update
  async update() {
    if (this._clave && !this._clave.startsWith('$2a$')) {
      this._clave = await hashPassword(this._clave);
    }

    const updateObj = this.toJSON(true);
    const { error } = await supabase
      .from('usuario')
      .update(updateObj)
      .eq('id_usuario', this._id_usuario);
    if (error) throw new Error(`Error updating Usuario: ${error.message}`);
    return this;
  }

  // Delete
  async delete() {
    const { error } = await supabase
      .from('usuario')
      .delete()
      .eq('id_usuario', this._id_usuario);
    if (error) throw new Error(`Error deleting Usuario: ${error.message}`);
    return true;
  }

  // Password comparison
  async comparePassword(plainPassword) {
    if (!this._clave || !plainPassword) return false;
    return bcrypt.compare(plainPassword, this._clave);
  }

  // Utilidad
  _mapRowToObject(row) {
    this._id_usuario = row.id_usuario;
    this._tipo_documento = row.tipo_documento;
    this._numero_documento = row.numero_documento;
    this._primer_nombre = row.primer_nombre;
    this._segundo_nombre = row.segundo_nombre || '';
    this._primer_apellido = row.primer_apellido;
    this._segundo_apellido = row.segundo_apellido || '';
    this._direccion_correo = row.direccion_correo;
    this._numero_celular = row.numero_celular;
    this._foto_perfil = row.foto_perfil || '';
    this._estado = row.estado;
    this._clave = row.clave;
    this._perfil_usuario_id = row.perfil_usuario_id;
  }

  toJSON(includeClave = false) {
    const json = {
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
      perfil_usuario_id: this._perfil_usuario_id
    };
    if (includeClave) json.clave = this._clave;
    return json;
  }
}

module.exports = Usuario;
