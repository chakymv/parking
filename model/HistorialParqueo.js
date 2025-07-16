const supabase = require('./../supabaseClient');
const { normalizeFecha } = require('./../utils/normalizer');

class HistorialParqueo {
  constructor(celda_id = null, vehiculo_id = null, fecha_hora = null) {
    this._celda_id = Number(celda_id);
    this._vehiculo_id = Number(vehiculo_id);
    this._fecha_hora = normalizeFecha(fecha_hora);
  }

  get celda_id() { return this._celda_id; }
  get vehiculo_id() { return this._vehiculo_id; }
  get fecha_hora() { return this._fecha_hora; }

  set celda_id(value) { this._celda_id = Number(value); }
  set vehiculo_id(value) { this._vehiculo_id = Number(value); }
  set fecha_hora(value) { this._fecha_hora = normalizeFecha(value); }

  async create() {
    if (isNaN(this._celda_id) || isNaN(this._vehiculo_id)) {
      throw new Error('IDs inválidos para crear HistorialParqueo.');
    }

    const insertObj = {
      celda_id: this._celda_id,
      vehiculo_id: this._vehiculo_id,
      fecha_hora: this._fecha_hora
    };

    const { data, error } = await supabase
      .from('historial_parqueo')
      .insert([insertObj])
      .select()
      .single();

    if (error) throw new Error(`Error creando HistorialParqueo: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(celda_id, vehiculo_id) {
    const celdaNum = Number(celda_id);
    const vehiculoNum = Number(vehiculo_id);
    if (isNaN(celdaNum) || isNaN(vehiculoNum)) {
      throw new Error('IDs inválidos para búsqueda en HistorialParqueo.');
    }

    const { data, error } = await supabase
      .from('historial_parqueo')
      .select('*')
      .eq('celda_id', celdaNum)
      .eq('vehiculo_id', vehiculoNum)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error buscando HistorialParqueo por ID: ${error.message}`);
    }

    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('historial_parqueo')
      .select('*');

    if (error) throw new Error(`Error obteniendo historial completo: ${error.message}`);
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

    const { error } = await supabase
      .from('historial_parqueo')
      .update(updateObj)
      .eq('celda_id', this._celda_id)
      .eq('vehiculo_id', this._vehiculo_id);

    if (error) throw new Error(`Error actualizando HistorialParqueo: ${error.message}`);
    return this;
  }

  async delete() {
    if (isNaN(this._celda_id) || isNaN(this._vehiculo_id)) {
      throw new Error('IDs inválidos para eliminar HistorialParqueo.');
    }

    const { error } = await supabase
      .from('historial_parqueo')
      .delete()
      .eq('celda_id', this._celda_id)
      .eq('vehiculo_id', this._vehiculo_id);

    if (error) throw new Error(`Error eliminando HistorialParqueo: ${error.message}`);
    return true;
  }

  static async findAllWithVehicleDetails() {
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
      console.error("HistorialParqueo.findAllWithVehicleDetails error:", error);
      throw new Error('Error obteniendo historial detallado de parqueo.');
    }

    return (data || []).map(row => {
      const { vehiculo, ...historialData } = row;
      return { ...historialData, ...(vehiculo || {}) };
    });
  }

  static async findByVehicleId(vehiculo_id) {
    const vehiculoNum = Number(vehiculo_id);
    if (isNaN(vehiculoNum)) {
      throw new Error(`ID inválido proporcionado a findByVehicleId: ${vehiculo_id}`);
    }

    const { data, error } = await supabase
      .from('historial_parqueo')
      .select('*')
      .eq('vehiculo_id', vehiculoNum)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error buscando historial por vehículo: ${error.message}`);
    }

    return data
      ? new HistorialParqueo(data.celda_id, data.vehiculo_id, data.fecha_hora)
      : null;
  }

  _mapRowToObject(row) {
    this._celda_id = row.celda_id;
    this._vehiculo_id = row.vehiculo_id;
    this._fecha_hora = normalizeFecha(row.fecha_hora);
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
