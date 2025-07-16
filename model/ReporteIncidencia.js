const supabase = require('./../supabaseClient');

class ReporteIncidencia {
  constructor(vehiculo_id, incidencia_id, fecha_hora) {
    this.vehiculo_id = Number(vehiculo_id);
    this.incidencia_id = Number(incidencia_id);
    this.fecha_hora = fecha_hora;
  }

  async create() {
    if (
      !Number.isInteger(this.vehiculo_id) ||
      !Number.isInteger(this.incidencia_id) ||
      !this.fecha_hora
    ) {
      throw new Error('Datos inválidos para crear reporte');
    }

    const { error } = await supabase
      .from('reporte_incidencia')
      .insert([{
        vehiculo_id: this.vehiculo_id,
        incidencia_id: this.incidencia_id,
        fecha_hora: this.fecha_hora
      }]);

    if (error) throw new Error(`Error al crear reporte: ${error.message}`);
  }

  static async delete(vehiculo_id, incidencia_id, fecha_hora) {
    const { error } = await supabase
      .from('reporte_incidencia')
      .delete()
      .match({
        vehiculo_id: Number(vehiculo_id),
        incidencia_id: Number(incidencia_id),
        fecha_hora
      });

    if (error) throw new Error(`Error al eliminar reporte: ${error.message}`);
  }

  static async findAllExtendido() {
    const { data, error } = await supabase
      .rpc('reporte_incidencias_extendidas'); // vista o función que traiga placa y nombre

    if (error) throw new Error(`Error al obtener reportes: ${error.message}`);
    return data;
  }
}

module.exports = ReporteIncidencia;
