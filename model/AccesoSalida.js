const supabase = require('../supabaseClient');

class AccesoSalida {
  constructor(
    id = null,
    movimiento = null,
    fecha_hora = null,
    puerta = null,
    tiempo_estadia = null,
    vehiculo_id = null
  ) {
    this._id = id;
    this._movimiento = movimiento;
    this._fecha_hora = fecha_hora;
    this._puerta = puerta;
    this._tiempo_estadia = tiempo_estadia;
    this._vehiculo_id = vehiculo_id;
  }

  get id() { return this._id; }
  get movimiento() { return this._movimiento; }
  get fecha_hora() { return this._fecha_hora; }
  get puerta() { return this._puerta; }
  get tiempo_estadia() { return this._tiempo_estadia; }
  get vehiculo_id() { return this._vehiculo_id; }

  set id(value) { this._id = value; }
  set movimiento(value) { this._movimiento = value; }
  set fecha_hora(value) { this._fecha_hora = value; }
  set puerta(value) { this._puerta = value; }
  set tiempo_estadia(value) { this._tiempo_estadia = value; }
  set vehiculo_id(value) { this._vehiculo_id = value; }

  async create() {
    const insertObj = {
      movimiento: this._movimiento,
      fecha_hora: this._fecha_hora,
      puerta: this._puerta,
      tiempo_estadia: this._tiempo_estadia,
      vehiculo_id: this._vehiculo_id
    };
    const { data, error } = await supabase.from('acceso_salida').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating AccesoSalida: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const { data, error } = await supabase.from('acceso_salida').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding AccesoSalida: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('acceso_salida').select('*');
    if (error) throw new Error(`Error finding all AccesoSalida: ${error.message}`);
    return (data || []).map(row => {
      const acceso = new AccesoSalida();
      acceso._mapRowToObject(row);
      return acceso;
    });
  }

  async update() {
    const updateObj = {
      movimiento: this._movimiento,
      fecha_hora: this._fecha_hora,
      puerta: this._puerta,
      tiempo_estadia: this._tiempo_estadia,
      vehiculo_id: this._vehiculo_id
    };
    const { error } = await supabase.from('acceso_salida').update(updateObj).eq('id', this._id);
    if (error) throw new Error(`Error updating AccesoSalida: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('acceso_salida').delete().eq('id', this._id);
    if (error) throw new Error(`Error deleting AccesoSalida: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._movimiento = row.movimiento;
    this._fecha_hora = row.fecha_hora;
    this._puerta = row.puerta;
    this._tiempo_estadia = row.tiempo_estadia;
    this._vehiculo_id = row.vehiculo_id;
  }

  toJSON() {
    return {
      id: this._id,
      movimiento: this._movimiento,
      fecha_hora: this._fecha_hora,
      puerta: this._puerta,
      tiempo_estadia: this._tiempo_estadia,
      vehiculo_id: this._vehiculo_id
    };
  }
}

module.exports = AccesoSalida;