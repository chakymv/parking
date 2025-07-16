const supabase = require('./../supabaseClient');

class ReporteIncidencia {
  constructor(vehiculo_id, tipo_incidencia_id, fecha_hora) {
    this.vehiculo_id = Number(vehiculo_id);
    this.tipo_incidencia_id = Number(tipo_incidencia_id);
    this.fecha_hora = fecha_hora;
  }

  async create() {
    if (
      !Number.isInteger(this.vehiculo_id) ||
      !Number.isInteger(this.tipo_incidencia_id) ||
      !this.fecha_hora
    ) {
      throw new Error('Datos inválidos para crear reporte');
    }

    // Validación previa: evita duplicados (si aplica)
    const { data: existente } = await supabase
      .from('reporte_incidencia')
      .select('id')
      .eq('vehiculo_id', this.vehiculo_id)
      .eq('tipo_incidencia_id', this.tipo_incidencia_id)
      .eq('fecha_hora', this.fecha_hora)
      .maybeSingle();

    if (existente) {
      throw new Error('Ya existe un reporte con esta combinación');
    }

    const { error } = await supabase
      .from('reporte_incidencia')
      .insert([{
        vehiculo_id: this.vehiculo_id,
        tipo_incidencia_id: this.tipo_incidencia_id,
        fecha_hora: this.fecha_hora
      }]);

    if (error) throw new Error(`Error al crear reporte: ${error.message}`);
  }

  static async delete(id) {
    const { error } = await supabase
      .from('reporte_incidencia')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar reporte: ${error.message}`);
  }

  static async findAllExtendido() {
    const { data, error } = await supabase
      .rpc('reporte_incidencias_extendidas'); 

    if (error) throw new Error(`Error al obtener reportes: ${error.message}`);
    return data;
  }
}

module.exports = ReporteIncidencia;
