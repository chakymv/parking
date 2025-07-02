const supabase = require('../supabaseClient');

class HistorialParqueo {
  constructor(
    celda_id = null,
    vehiculo_id = null,
    fecha_hora = null
  ) {
    this._celda_id = celda_id;
    this._vehiculo_id = vehiculo_id;
    this._fecha_hora = fecha_hora;
  }

  get celda_id() { return this._celda_id; }
  get vehiculo_id() { return this._vehiculo_id; }
  get fecha_hora() { return this._fecha_hora; }

  set celda_id(value) { this._celda_id = value; }
  set vehiculo_id(value) { this._vehiculo_id = value; }
  set fecha_hora(value) { this._fecha_hora = value; }

  async create() {
    const insertObj = {
      celda_id: this._celda_id,
      vehiculo_id: this._vehiculo_id,
      fecha_hora: this._fecha_hora
    };
    const { data, error } = await supabase.from('historial_parqueo').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating HistorialParqueo: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(celda_id, vehiculo_id) {
    const { data, error } = await supabase.from('historial_parqueo').select('*').eq('celda_id', celda_id).eq('vehiculo_id', vehiculo_id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding HistorialParqueo: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('historial_parqueo').select('*');
    if (error) throw new Error(`Error finding all HistorialParqueo: ${error.message}`);
    return (data || []).map(row => {
      const historial = new HistorialParqueo();
      historial._mapRowToObject(row);
      return historial;
    });
  }

  async update() {
    const updateObj = {
      fecha_hora: this._fecha_hora
    };
    const { error } = await supabase.from('historial_parqueo').update(updateObj).eq('celda_id', this._celda_id).eq('vehiculo_id', this._vehiculo_id);
    if (error) throw new Error(`Error updating HistorialParqueo: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('historial_parqueo').delete().eq('celda_id', this._celda_id).eq('vehiculo_id', this._vehiculo_id);
    if (error) throw new Error(`Error deleting HistorialParqueo: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._celda_id = row.celda_id;
    this._vehiculo_id = row.vehiculo_id;
    this._fecha_hora = row.fecha_hora;
  }

  toJSON() {
    return {
      celda_id: this._celda_id,
      vehiculo_id: this._vehiculo_id,
      fecha_hora: this._fecha_hora
    };
  }
}

module.exports = HistorialParqueo;