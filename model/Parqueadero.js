const supabase = require('../supabaseClient');

class Parqueadero {
  constructor(id = null, nombre = null, codigo = null, tipo = null, capacidad = null, creado_por = null, fecha_creacion = null) {
    this.id = id;
    this.nombre = nombre;
    this.codigo = codigo;
    this.tipo = tipo;
    this.capacidad = capacidad;
    this.creado_por = creado_por;
    this.fecha_creacion = fecha_creacion;
  }

  static async findAll() {
    const { data, error } = await supabase.from('parqueadero').select('*').order('nombre');
    if (error) throw new Error(error.message);
    return data.map(p => new Parqueadero(p.id, p.nombre, p.codigo, p.tipo, p.capacidad, p.creado_por, p.fecha_creacion));
  }

  static async findById(id) {
    const { data, error } = await supabase.from('parqueadero').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? new Parqueadero(data.id, data.nombre, data.codigo, data.tipo, data.capacidad, data.creado_por, data.fecha_creacion) : null;
  }

  async save() {
    const record = {
      nombre: this.nombre,
      codigo: this.codigo,
      tipo: this.tipo,
      capacidad: this.capacidad,
      creado_por: this.creado_por
    };
    let query;
    if (this.id) {
      query = supabase.from('parqueadero').update(record).eq('id', this.id);
    } else {
      query = supabase.from('parqueadero').insert(record);
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    this.id = data.id;
    this.fecha_creacion = data.fecha_creacion;
    return this;
  }

  async delete() {
    const { error } = await supabase.from('parqueadero').delete().eq('id', this.id);
    if (error) throw new Error(error.message);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      codigo: this.codigo,
      tipo: this.tipo,
      capacidad: this.capacidad,
      creado_por: this.creado_por,
      fecha_creacion: this.fecha_creacion
    };
  }
}

module.exports = Parqueadero;