const { supabase } = require('../supabaseClient');
const { normalizePlaca, normalizeTexto } = require('./../utils/normalizer');

class PicoPlaca {
  constructor(id = null, placa = null, dia = null, hora_inicio = null, hora_fin = null) {
    this._id = Number(id);
    this._placa = normalizePlaca(placa);
    this._dia = normalizeTexto(dia);
    this._hora_inicio = normalizeTexto(hora_inicio);
    this._hora_fin = normalizeTexto(hora_fin);
  }

  get id() { return this._id; }
  get placa() { return this._placa; }
  get dia() { return this._dia; }
  get hora_inicio() { return this._hora_inicio; }
  get hora_fin() { return this._hora_fin; }

  set id(value) { this._id = Number(value); }
  set placa(value) { this._placa = normalizePlaca(value); }
  set dia(value) { this._dia = normalizeTexto(value); }
  set hora_inicio(value) { this._hora_inicio = normalizeTexto(value); }
  set hora_fin(value) { this._hora_fin = normalizeTexto(value); }

  async create() {
    if (!this._placa || !this._dia || !this._hora_inicio || !this._hora_fin) {
      throw new Error('Datos incompletos para registrar pico y placa');
    }

    const insertObj = {
      placa: this._placa,
      dia: this._dia,
      hora_inicio: this._hora_inicio,
      hora_fin: this._hora_fin
    };

    const { data, error } = await supabase
      .from('pico_placa')
      .insert([insertObj])
      .select()
      .single();

    if (error) throw new Error(`Error creando PicoPlaca: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error(`ID inválido: ${id}`);

    const { data, error } = await supabase
      .from('pico_placa')
      .select('*')
      .eq('id', idNum)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error buscando PicoPlaca: ${error.message}`);
    }

    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('pico_placa')
      .select('*')
      .order('dia');

    if (error) throw new Error(`Error obteniendo lista PicoPlaca: ${error.message}`);
    return (data || []).map(row => new PicoPlaca(
      row.id,
      row.placa,
      row.dia,
      row.hora_inicio,
      row.hora_fin
    ));
  }

  async update() {
    if (isNaN(this._id)) throw new Error('ID inválido para actualizar PicoPlaca');

    const updateObj = {
      placa: this._placa,
      dia: this._dia,
      hora_inicio: this._hora_inicio,
      hora_fin: this._hora_fin
    };

    const { error } = await supabase
      .from('pico_placa')
      .update(updateObj)
      .eq('id', this._id);

    if (error) throw new Error(`Error actualizando PicoPlaca: ${error.message}`);
    return this;
  }

  async delete() {
    if (!this._id || isNaN(this._id)) {
      throw new Error('ID inválido para eliminar PicoPlaca');
    }

    const { error } = await supabase
      .from('pico_placa')
      .delete()
      .eq('id', this._id);

    if (error) throw new Error(`Error eliminando PicoPlaca: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._placa = normalizePlaca(row.placa);
    this._dia = normalizeTexto(row.dia);
    this._hora_inicio = normalizeTexto(row.hora_inicio);
    this._hora_fin = normalizeTexto(row.hora_fin);
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
