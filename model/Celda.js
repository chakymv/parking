const supabase = require('./../supabaseClient');
const { normalizeTexto } = require('./../utils/normalizer');

class Celda {
  constructor(id_celda = null, tipo = null, estado = 'disponible', zona_id = null) {
    this.id_celda = Number(id_celda);
    this.tipo = normalizeTexto(tipo);
    this.estado = normalizeTexto(estado);
    this.zona_id = Number(zona_id);
  }

  toJSON() {
    return {
      id_celda: this.id_celda,
      tipo: this.tipo,
      estado: this.estado,
      zona_id: this.zona_id
    };
  }

  _fromDbRow(row) {
    this.id_celda = row.id;
    this.tipo = normalizeTexto(row.tipo);
    this.estado = normalizeTexto(row.estado);
    this.zona_id = Number(row.zona_id);
    return this;
  }

  static async findAll(filters = {}) {
    let query = supabase.from('celda').select('*');
    if (filters.estado) query = query.eq('estado', normalizeTexto(filters.estado));
    if (filters.tipo) query = query.eq('tipo', normalizeTexto(filters.tipo));
    if (filters.zona_id) query = query.eq('zona_id', Number(filters.zona_id));

    const { data, error } = await query;
    if (error) throw new Error(`Error encontrando celdas: ${error.message}`);
    return (data || []).map(row => new Celda()._fromDbRow(row));
  }

  static async findById(id) {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error(`ID inválido proporcionado a findById: ${id}`);

    const { data, error } = await supabase
      .from('celda')
      .select('*')
      .eq('id', idNum)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error encontrando celda por ID: ${error.message}`);
    }

    return data ? new Celda()._fromDbRow(data) : null;
  }

  async save() {
    return this.id_celda ? this._update() : this._create();
  }

  async _create() {
    const { data, error } = await supabase
      .from('celda')
      .insert({
        tipo: this.tipo,
        estado: this.estado,
        zona_id: this.zona_id
      })
      .select()
      .single();

    if (error) throw new Error(`Error creando celda: ${error.message}`);
    return this._fromDbRow(data);
  }

  async _update() {
    if (!this.id_celda || isNaN(this.id_celda)) {
      throw new Error('ID inválido para actualizar celda');
    }

    const { data, error } = await supabase
      .from('celda')
      .update({
        tipo: this.tipo,
        estado: this.estado,
        zona_id: this.zona_id
      })
      .eq('id', this.id_celda)
      .select()
      .single();

    if (error) throw new Error(`Error actualizando celda: ${error.message}`);
    return this._fromDbRow(data);
  }

  async delete() {
    if (!this.id_celda || isNaN(this.id_celda)) {
      throw new Error('ID inválido para eliminar celda');
    }

    const { error } = await supabase
      .from('celda')
      .delete()
      .eq('id', this.id_celda);

    if (error) throw new Error(`Error eliminando celda: ${error.message}`);
    return true;
  }
}

module.exports = Celda;
