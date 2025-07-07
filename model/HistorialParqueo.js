const supabase = require('../supabaseClient');

class HistorialParqueo {
  constructor(
    celda_id = null,
    vehiculo_id = null,
    fecha_hora = null
  ) {
    this._celda_id = celda_id;
    this._vehiculo_id = vehiculo_id;
    this._fecha_hora = fecha_hora;
  }

  get celda_id() { return this._celda_id; }
  get vehiculo_id() { return this._vehiculo_id; }
  get fecha_hora() { return this._fecha_hora; }

  set celda_id(value) { this._celda_id = value; }
  set vehiculo_id(value) { this._vehiculo_id = value; }
  set fecha_hora(value) { this._fecha_hora = value; }

  async create() {
    const insertObj = {
      celda_id: this._celda_id,
      vehiculo_id: this._vehiculo_id,
      fecha_hora: this._fecha_hora
    };
    const { data, error } = await supabase.from('historial_parqueo').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating HistorialParqueo: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(celda_id, vehiculo_id) {
    const { data, error } = await supabase.from('historial_parqueo').select('*').eq('celda_id', celda_id).eq('vehiculo_id', vehiculo_id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding HistorialParqueo: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('historial_parqueo').select('*');
    if (error) throw new Error(`Error finding all HistorialParqueo: ${error.message}`);
    return (data || []).map(row => {
      const historial = new HistorialParqueo();
      historial._mapRowToObject(row);
      return historial;
    });
  }

  async update() {
    const updateObj = {
      fecha_hora: this._fecha_hora
    };
    const { error } = await supabase.from('historial_parqueo').update(updateObj).eq('celda_id', this._celda_id).eq('vehiculo_id', this._vehiculo_id);
    if (error) throw new Error(`Error updating HistorialParqueo: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('historial_parqueo').delete().eq('celda_id', this._celda_id).eq('vehiculo_id', this._vehiculo_id);
    if (error) throw new Error(`Error deleting HistorialParqueo: ${error.message}`);
    return true;
  }

  /**
   * Busca todos los registros del historial y los une con los detalles del vehículo usando Supabase.
   * Devuelve un array de objetos planos listos para ser enviados como JSON.
   */
  static async findAllWithVehicleDetails() {
    // Supabase permite hacer "joins" especificando las relaciones en el select.
    // 'vehiculo(*)' le dice a Supabase que traiga todas las columnas de la tabla 'vehiculo' relacionada.
    // Esto asume que tienes una relación de clave foránea configurada en Supabase.
    const { data, error } = await supabase
      .from('historial_parqueo')
      .select(`
        celda_id,
        fecha_hora,
        vehiculo (
          placa,
          marca,
          modelo,
          color,
          tipo
        )
      `)
      .order('fecha_hora', { ascending: false });

    if (error) {
      console.error("Error en HistorialParqueo.findAllWithVehicleDetails:", error);
      throw new Error('Error al obtener el historial detallado del parqueo desde Supabase.');
    }
    
    // Aplanamos el resultado para que sea más fácil de usar en el frontend.
    return (data || []).map(row => {
      const { vehiculo, ...historialData } = row;
      return { ...historialData, ...(vehiculo || {}) };
    });
  }

  /**
   * Busca un registro de parqueo activo por el ID del vehículo.
   * Se asume que un vehículo solo puede tener un registro activo a la vez.
   * @param {number} vehiculo_id - El ID del vehículo a buscar.
   * @returns {Promise<HistorialParqueo|null>} Una instancia del registro o null si no se encuentra.
   */
  static async findByVehicleId(vehiculo_id) {
    const { data, error } = await supabase
      .from('historial_parqueo')
      .select('*')
      .eq('vehiculo_id', vehiculo_id)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found, not an error in this context.
      throw new Error(`Error buscando historial por ID de vehículo: ${error.message}`);
    }

    return data ? new HistorialParqueo(data.celda_id, data.vehiculo_id, data.fecha_hora) : null;
  }

  _mapRowToObject(row) {
    this._celda_id = row.celda_id;
    this._vehiculo_id = row.vehiculo_id;
    this._fecha_hora = row.fecha_hora;
  }

  toJSON() {
    return {
      celda_id: this._celda_id,
      vehiculo_id: this._vehiculo_id,
      fecha_hora: this._fecha_hora
    };
  }
}

module.exports = HistorialParqueo;