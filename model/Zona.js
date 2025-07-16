const supabase = require('./../supabaseClient');
const { normalizeTexto } = require('./../utils/normalizer'); // ← si decidís usarlo

class Zona {
  constructor(id = null, nombre = null, descripcion = null) {
    this.id = Number(id);
    this.nombre = nombre?.trim();
    this.descripcion = descripcion?.trim();
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('zona')
      .select('*')
      .order('nombre');

    if (error) throw new Error(`Error obteniendo zonas: ${error.message}`);
    return (data || []).map(z => new Zona(z.id, z.nombre, z.descripcion));
  }

  static async findById(id) {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error(`ID inválido proporcionado a findById: ${id}`);

    const { data, error } = await supabase
      .from('zona')
      .select('*')
      .eq('id', idNum)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error buscando zona por ID: ${error.message}`);
    }

    return data ? new Zona(data.id, data.nombre, data.descripcion) : null;
  }

  async save() {
    const nombreLimpio = normalizeTexto(this.nombre);
    const descripcionLimpia = normalizeTexto(this.descripcion);

    const record = {
      nombre: nombreLimpio,
      descripcion: descripcionLimpia
    };

    const query = this.id
      ? supabase.from('zona').update(record).eq('id', this.id)
      : supabase.from('zona').insert(record);

    const { data, error } = await query.select().single();

    if (error) throw new Error(`Error guardando zona: ${error.message}`);
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    return this;
  }

  async delete() {
    if (!this.id || isNaN(this.id)) {
      throw new Error('ID inválido. No se puede eliminar una zona sin ID válido.');
    }

    const { error } = await supabase
      .from('zona')
      .delete()
      .eq('id', this.id);

    if (error) throw new Error(`Error eliminando zona: ${error.message}`);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion
    };
  }
}

module.exports = Zona;
