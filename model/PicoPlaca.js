const supabase = require('../supabaseClient');

class PicoPlaca {
  constructor(
    id = null,
    placa = null,
    dia = null,
    hora_inicio = null,
    hora_fin = null
  ) {
    this._id = id;
    this._placa = placa;
    this._dia = dia;
    this._hora_inicio = hora_inicio;
    this._hora_fin = hora_fin;
  }

  get id() { return this._id; }
  get placa() { return this._placa; }
  get dia() { return this._dia; }
  get hora_inicio() { return this._hora_inicio; }
  get hora_fin() { return this._hora_fin; }

  set id(value) { this._id = value; }
  set placa(value) { this._placa = value; }
  set dia(value) { this._dia = value; }
  set hora_inicio(value) { this._hora_inicio = value; }
  set hora_fin(value) { this._hora_fin = value; }

  async create() {
    const insertObj = {
      placa: this._placa,
      dia: this._dia,
      hora_inicio: this._hora_inicio,
      hora_fin: this._hora_fin
    };
    const { data, error } = await supabase.from('pico_placa').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating PicoPlaca: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const { data, error } = await supabase.from('pico_placa').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding PicoPlaca: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('pico_placa').select('*');
    if (error) throw new Error(`Error finding all PicoPlaca: ${error.message}`);
    return (data || []).map(row => {
      const pico = new PicoPlaca();
      pico._mapRowToObject(row);
      return pico;
    });
  }

  async update() {
    const updateObj = {
      placa: this._placa,
      dia: this._dia,
      hora_inicio: this._hora_inicio,
      hora_fin: this._hora_fin
    };
    const { error } = await supabase.from('pico_placa').update(updateObj).eq('id', this._id);
    if (error) throw new Error(`Error updating PicoPlaca: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('pico_placa').delete().eq('id', this._id);
    if (error) throw new Error(`Error deleting PicoPlaca: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._placa = row.placa;
    this._dia = row.dia;
    this._hora_inicio = row.hora_inicio;
    this._hora_fin = row.hora_fin;
  }

  toJSON() {
    return {
      id: this._id,
      placa: this._placa,
      dia: this._dia,
      hora_inicio: this._hora_inicio,
      hora_fin: this._hora_fin
    };
  }
}

module.exports = PicoPlaca;