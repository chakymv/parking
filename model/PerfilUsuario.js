const { supabase } = require('../supabaseClient');

class PerfilUsuario {
  constructor(
    id = null,
    nombre = null,
    descripcion = null
  ) {
    this._id = id;
    this._nombre = nombre;
    this._descripcion = descripcion;
  }

  get id() { return this._id; }
  get nombre() { return this._nombre; }
  get descripcion() { return this._descripcion; }

  set id(value) { this._id = value; }
  set nombre(value) { this._nombre = value; }
  set descripcion(value) { this._descripcion = value; }

  async create() {
    const insertObj = {
      nombre: this._nombre,
      descripcion: this._descripcion
    };
    const { data, error } = await supabase.from('perfil_usuario').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating PerfilUsuario: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const { data, error } = await supabase.from('perfil_usuario').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding PerfilUsuario: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('perfil_usuario').select('*');
    if (error) throw new Error(`Error finding all PerfilUsuario: ${error.message}`);
    return (data || []).map(row => {
      const perfil = new PerfilUsuario();
      perfil._mapRowToObject(row);
      return perfil;
    });
  }

  async update() {
    const updateObj = {
      nombre: this._nombre,
      descripcion: this._descripcion
    };
    const { error } = await supabase.from('perfil_usuario').update(updateObj).eq('id', this._id);
    if (error) throw new Error(`Error updating PerfilUsuario: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('perfil_usuario').delete().eq('id', this._id);
    if (error) throw new Error(`Error deleting PerfilUsuario: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._nombre = row.nombre;
    this._descripcion = row.descripcion;
  }

  toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      descripcion: this._descripcion
    };
  }
}

module.exports = PerfilUsuario;