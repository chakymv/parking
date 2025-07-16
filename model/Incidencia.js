const supabase = require('./../supabaseClient');
const { normalizeTexto, normalizeFecha } = require('./../utils/normalizer');

class Incidencia {
  constructor(id = null, nombre = null, fecha = null, usuario_id = null) {
    this._id = Number(id);
    this._nombre = nombre ? normalizeTexto(nombre) : null;
    this._fecha = fecha ? normalizeFecha(fecha) : null;
    this._usuario_id = usuario_id != null ? Number(usuario_id) : null;
  }

  // Getters
  get id() { return this._id; }
  get nombre() { return this._nombre; }
  get fecha() { return this._fecha; }
  get usuario_id() { return this._usuario_id; }

  // Setters
  set id(value) { this._id = Number(value); }
  set nombre(value) {
    this._nombre = value ? normalizeTexto(value) : null;
  }
  set fecha(value) {
    this._fecha = value ? normalizeFecha(value) : null;
  }
  set usuario_id(value) {
    this._usuario_id = value != null ? Number(value) : null;
  }

  // Crear incidencia completa (requiere todos los campos)
  async create() {
    if (!this._nombre || !this._fecha || !Number.isInteger(this._usuario_id) || this._usuario_id <= 0) {
      throw new Error('Datos inválidos para crear incidencia');
    }

    const { data, error } = await supabase
      .from('incidencia')
      .insert([{
        nombre: this._nombre,
        fecha: this._fecha,
        usuario_id: this._usuario_id
      }])
      .select();

    if (error) throw new Error(`Error creando incidencia: ${error.message}`);
    this._mapRowToObject(data[0]);
    return this;
  }

  // Buscar por ID
  async findById(id) {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error(`ID inválido: ${id}`);

    const { data, error } = await supabase
      .from('incidencia')
      .select('*')
      .eq('id', idNum)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error buscando incidencia: ${error.message}`);
    }

    if (data) {
      this._mapRowToObject(data);
      return this;
    }

    return null;
  }

  // Obtener todas
  static async findAll() {
    const { data, error } = await supabase
      .from('incidencia')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw new Error(`Error obteniendo incidencias: ${error.message}`);
    return (data || []).map(row =>
      new Incidencia(row.id, row.nombre, row.fecha, row.usuario_id)
    );
  }

  // Actualizar
  async update() {
    if (isNaN(this._id) || this._id <= 0) {
      throw new Error('ID inválido para actualizar incidencia');
    }

    const { error } = await supabase
      .from('incidencia')
      .update({
        nombre: this._nombre,
        fecha: this._fecha,
        usuario_id: this._usuario_id
      })
      .eq('id', this._id);

    if (error) throw new Error(`Error actualizando incidencia: ${error.message}`);
    return this;
  }

  // Eliminar
  async delete() {
    if (!this._id || isNaN(this._id)) {
      throw new Error('ID inválido para eliminar incidencia');
    }

    const { error } = await supabase
      .from('incidencia')
      .delete()
      .eq('id', this._id);

    if (error) throw new Error(`Error eliminando incidencia: ${error.message}`);
    return true;
  }

  // Utilidades
  _mapRowToObject(row) {
    this._id = row.id;
    this._nombre = normalizeTexto(row.nombre);
    this._fecha = normalizeFecha(row.fecha);
    this._usuario_id = Number(row.usuario_id);
  }

  toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      fecha: this._fecha,
      usuario_id: this._usuario_id
    };
  }
}

module.exports = Incidencia;
