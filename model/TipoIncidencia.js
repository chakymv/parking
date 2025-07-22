const { supabase } = require('../supabaseClient');
const { normalizeTexto } = require('../utils/normalizer');

class TipoIncidencia {
  constructor(id = null, nombre = null) {
    this._id = Number(id);
    this._nombre = nombre ? normalizeTexto(nombre) : null;
  }

  async create() {
    if (!this._nombre) throw new Error('Nombre requerido para crear tipo');

    const { data, error } = await supabase
      .from('incidencia')
      .insert([{ nombre: this._nombre }])
      .select()
      .single();

    if (error) throw new Error(`Error creando tipo: ${error.message}`);
    this._id = data.id;
    return this;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('incidencia')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw new Error(`Error obteniendo tipos: ${error.message}`);
    return data.map(row => new TipoIncidencia(row.id, row.nombre));
  }

  async update() {
    if (!this._id || !this._nombre) throw new Error('Datos inválidos para actualizar tipo');

    const { error } = await supabase
      .from('incidencia')
      .update({ nombre: this._nombre })
      .eq('id', this._id);

    if (error) throw new Error(`Error actualizando tipo: ${error.message}`);
  }

  async delete() {
    if (!this._id) throw new Error('ID inválido para eliminar tipo');

    const { error } = await supabase
      .from('incidencia')
      .delete()
      .eq('id', this._id);

    if (error) throw new Error(`Error eliminando tipo: ${error.message}`);
  }

  toJSON() {
    return { id: this._id, nombre: this._nombre };
  }
}

module.exports = TipoIncidencia;
