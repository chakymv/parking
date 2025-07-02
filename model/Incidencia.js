const supabase = require('../supabaseClient');

class Incidencia {
  constructor(
    id = null,
    descripcion = null,
    fecha = null,
    usuario_id = null
  ) {
    this._id = id;
    this._descripcion = descripcion;
    this._fecha = fecha;
    this._usuario_id = usuario_id;
  }

  get id() { return this._id; }
  get descripcion() { return this._descripcion; }
  get fecha() { return this._fecha; }
  get usuario_id() { return this._usuario_id; }

  set id(value) { this._id = value; }
  set descripcion(value) { this._descripcion = value; }
  set fecha(value) { this._fecha = value; }
  set usuario_id(value) { this._usuario_id = value; }

  async create() {
    const insertObj = {
      descripcion: this._descripcion,
      fecha: this._fecha,
      usuario_id: this._usuario_id
    };
    const { data, error } = await supabase.from('incidencia').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating Incidencia: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const { data, error } = await supabase.from('incidencia').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding Incidencia: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('incidencia').select('*');
    if (error) throw new Error(`Error finding all Incidencia: ${error.message}`);
    return (data || []).map(row => {
      const incidencia = new Incidencia();
      incidencia._mapRowToObject(row);
      return incidencia;
    });
  }

  async update() {
    const updateObj = {
      descripcion: this._descripcion,
      fecha: this._fecha,
      usuario_id: this._usuario_id
    };
    const { error } = await supabase.from('incidencia').update(updateObj).eq('id', this._id);
    if (error) throw new Error(`Error updating Incidencia: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('incidencia').delete().eq('id', this._id);
    if (error) throw new Error(`Error deleting Incidencia: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._descripcion = row.descripcion;
    this._fecha = row.fecha;
    this._usuario_id = row.usuario_id;
  }

  toJSON() {
    return {
      id: this._id,
      descripcion: this._descripcion,
      fecha: this._fecha,
      usuario_id: this._usuario_id
    };
  }
}

module.exports = Incidencia;