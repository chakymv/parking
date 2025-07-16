const supabase = require('../supabaseClient');

class Nivel {
  constructor(id = null, nombre = null, descripcion = null) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  static async findAll() {
    const { data, error } = await supabase.from('nivel').select('*').order('nombre');
    if (error) throw new Error(error.message);
    return data.map(n => new Nivel(n.id, n.nombre, n.descripcion));
  }

  static async findById(id) {
    const { data, error } = await supabase.from('nivel').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? new Nivel(data.id, data.nombre, data.descripcion) : null;
  }

  async save() {
    const record = { nombre: this.nombre, descripcion: this.descripcion };
    let query;
    if (this.id) {
      query = supabase.from('nivel').update(record).eq('id', this.id);
    } else {
      query = supabase.from('nivel').insert(record);
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    this.id = data.id;
    return this;
  }

  async delete() {
    const { error } = await supabase.from('nivel').delete().eq('id', this.id);
    if (error) throw new Error(error.message);
    return true;
  }

  toJSON() {
    return { id: this.id, nombre: this.nombre, descripcion: this.descripcion };
  }
}

module.exports = Nivel;