const supabase = require('../supabaseClient');

class Celda {
  constructor(id_celda = null, tipo = null, estado = 'disponible', zona_id = null, nivel_id = null) {
    this.id_celda = id_celda;
    this.tipo = tipo;
    this.estado = estado;
    this.zona_id = zona_id;
    this.nivel_id = nivel_id;
  }

  toJSON() {
    return {
      id_celda: this.id_celda,
      tipo: this.tipo,
      estado: this.estado,
      zona_id: this.zona_id,
      nivel_id: this.nivel_id,
    };
  }

  // Mapea datos desde Supabase a una instancia
  _fromDbRow(row) {
    this.id_celda = row.id;
    this.tipo = row.tipo;
    this.estado = row.estado;
    this.zona_id = row.zona_id;
    this.nivel_id = row.nivel_id;
    return this;
  }

  // 🔍 Consulta con filtros opcionales
  static async findAll(filters = {}) {
    let query = supabase.from('celda').select('*');
    if (filters.estado) query = query.eq('estado', filters.estado);
    if (filters.tipo) query = query.eq('tipo', filters.tipo);
    if (filters.zona_id) query = query.eq('zona_id', filters.zona_id);
    if (filters.nivel_id) query = query.eq('nivel_id', filters.nivel_id);

    const { data, error } = await query;
    if (error) throw new Error(`Error encontrando celdas: ${error.message}`);
    return data.map(row => new Celda(row.id, row.tipo, row.estado, row.zona_id, row.nivel_id));
  }

  // 🔍 Busca celda específica por ID
  static async findById(id) {
    const { data, error } = await supabase.from('celda').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new Error(`Error encontrando celda por ID: ${error.message}`);
    return data ? new Celda(data.id, data.tipo, data.estado, data.zona_id, data.nivel_id) : null;
  }

  // 🧠 Guarda (create o update según existencia de ID)
  async save() {
    return this.id_celda ? this._update() : this._create();
  }

  // 📥 Inserta nueva celda
  async _create() {
    const { data, error } = await supabase
      .from('celda')
      .insert({ tipo: this.tipo, estado: this.estado, zona_id: this.zona_id, nivel_id: this.nivel_id })
      .select()
      .single();
    if (error) throw new Error(`Error creando celda: ${error.message}`);
    return this._fromDbRow(data);
  }

  // ✏️ Actualiza celda existente
  async _update() {
    const { data, error } = await supabase
      .from('celda')
      .update({ tipo: this.tipo, estado: this.estado, zona_id: this.zona_id, nivel_id: this.nivel_id })
      .eq('id', this.id_celda)
      .select()
      .single();
    if (error) throw new Error(`Error actualizando celda: ${error.message}`);
    return this._fromDbRow(data);
  }

  // ❌ Elimina celda por ID
  async delete() {
    if (!this.id_celda) throw new Error('No se puede eliminar una celda sin ID.');
    const { error } = await supabase.from('celda').delete().eq('id', this.id_celda);
    if (error) throw new Error(`Error eliminando celda: ${error.message}`);
    return true;
  }
}

module.exports = Celda;
