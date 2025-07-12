const supabase = require('./../supabaseClient');
const { normalizeTexto, normalizeFecha } = require('./../utils/normalizer');

class Parqueadero {
  constructor(
    id = null,
    nombre = null,
    codigo = null,
    tipo = null,
    capacidad = null,
    creado_por = null,
    fecha_creacion = null
  ) {
    this.id = Number(id);
    this.nombre = normalizeTexto(nombre);
    this.codigo = normalizeTexto(codigo);
    this.tipo = normalizeTexto(tipo);
    this.capacidad = Number(capacidad);
    this.creado_por = Number(creado_por);
    this.fecha_creacion = normalizeFecha(fecha_creacion);
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('parqueadero')
      .select('*')
      .order('nombre');

    if (error) throw new Error(`Error obteniendo parqueaderos: ${error.message}`);
    return (data || []).map(p => new Parqueadero(
      p.id,
      p.nombre,
      p.codigo,
      p.tipo,
      p.capacidad,
      p.creado_por,
      p.fecha_creacion
    ));
  }

  static async findById(id) {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error(`ID inválido proporcionado a findById: ${id}`);

    const { data, error } = await supabase
      .from('parqueadero')
      .select('*')
      .eq('id', idNum)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error buscando parqueadero por ID: ${error.message}`);
    }

    return data ? new Parqueadero(
      data.id,
      data.nombre,
      data.codigo,
      data.tipo,
      data.capacidad,
      data.creado_por,
      data.fecha_creacion
    ) : null;
  }

  async save() {
    const record = {
      nombre: this.nombre,
      codigo: this.codigo,
      tipo: this.tipo,
      capacidad: this.capacidad,
      creado_por: this.creado_por
    };

    const query = this.id
      ? supabase.from('parqueadero').update(record).eq('id', this.id)
      : supabase.from('parqueadero').insert(record);

    const { data, error } = await query.select().single();

    if (error) throw new Error(`Error guardando parqueadero: ${error.message}`);
    this.id = data.id;
    this.fecha_creacion = normalizeFecha(data.fecha_creacion);
    return this;
  }

  async delete() {
    if (!this.id || isNaN(this.id)) {
      throw new Error('ID inválido. No se puede eliminar sin un ID válido.');
    }

    const { error } = await supabase
      .from('parqueadero')
      .delete()
      .eq('id', this.id);

    if (error) throw new Error(`Error eliminando parqueadero: ${error.message}`);
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
