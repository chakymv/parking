// model/HistorialParqueo.js
const { supabase } = require('../supabaseClient');
const { normalizeFecha } = require('./../utils/normalizer');

class HistorialParqueo {
    constructor(id = null, celda_id = null, vehiculo_id = null, entrada = null, salida = null, estado = null) {
        this._id = Number(id);
        this._celda_id = Number(celda_id);
        this._vehiculo_id = Number(vehiculo_id);
        this._entrada = normalizeFecha(entrada);
        this._salida = normalizeFecha(salida);
        this._estado = estado;
    }

    get id() { return this._id; }
    get celda_id() { return this._celda_id; }
    get vehiculo_id() { return this._vehiculo_id; }
    get entrada() { return this._entrada; }
    get salida() { return this._salida; }
    get estado() { return this._estado; }

    set id(value) { this._id = Number(value); }
    set celda_id(value) { this._celda_id = Number(value); }
    set vehiculo_id(value) { this._vehiculo_id = Number(value); }
    set entrada(value) { this._entrada = normalizeFecha(value); }
    set salida(value) { this._salida = normalizeFecha(value); }
    set estado(value) { this._estado = value; }

    async create() {
        if (isNaN(this._celda_id) || isNaN(this._vehiculo_id)) {
            throw new Error('IDs inválidos para crear HistorialParqueo.');
        }

        const insertObj = {
            celda_id: this._celda_id,
            vehiculo_id: this._vehiculo_id,
            entrada: this._entrada || new Date().toISOString(),
            estado: this._estado || 'activo'
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

    static async findById(id) {
        const idNum = Number(id);
        if (isNaN(idNum)) throw new Error(`ID inválido proporcionado a findById: ${id}`);

        const { data, error } = await supabase
            .from('historial_parqueo')
            .select('id, celda_id, vehiculo_id, entrada, salida, estado')
            .eq('id', idNum)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error buscando HistorialParqueo por ID: ${error.message}`);
        }

        if (data) {
            const historial = new HistorialParqueo();
            historial._mapRowToObject(data);
            return historial;
        }
        return null;
    }

    static async findAll() {
        const { data, error } = await supabase
            .from('historial_parqueo')
            .select('id, celda_id, vehiculo_id, entrada, salida, estado')
            .order('entrada', { ascending: false });

        if (error) throw new Error(`Error obteniendo historial completo: ${error.message}`);
        return (data || []).map(row => {
            const historial = new HistorialParqueo();
            historial._mapRowToObject(row);
            return historial;
        });
    }

    async update() {
        if (isNaN(this._id)) {
            throw new Error('ID inválido para actualizar HistorialParqueo');
        }

        const updateObj = {
            celda_id: this._celda_id,
            vehiculo_id: this._vehiculo_id,
            entrada: this._entrada,
            salida: this._salida,
            estado: this._estado
        };

        const { error } = await supabase
            .from('historial_parqueo')
            .update(updateObj)
            .eq('id', this._id);

        if (error) throw new Error(`Error actualizando HistorialParqueo: ${error.message}`);
        return this;
    }

    async delete() {
        if (!this._id || isNaN(this._id)) {
            throw new Error('ID inválido para eliminar HistorialParqueo.');
        }

        const { error } = await supabase
            .from('historial_parqueo')
            .delete()
            .eq('id', this._id);

        if (error) throw new Error(`Error eliminando HistorialParqueo: ${error.message}`);
        return true;
    }

    async marcarComoFinalizado(salidaHora) {
        const { error } = await supabase
            .from('historial_parqueo')
            .update({
                salida: salidaHora,
                estado: 'finalizado'
            })
            .eq('id', this.id);

        if (error) {
            console.error(`Error al marcar historial ${this.id} como finalizado:`, error);
            throw new Error(`Error al marcar historial como finalizado: ${error.message}`);
        }
        this.salida = salidaHora;
        this.estado = 'finalizado';
    }

    static async findByVehicleId(vehiculoId) {
        const vehiculoNum = Number(vehiculoId);
        if (isNaN(vehiculoNum)) {
            throw new Error(`ID de vehículo inválido proporcionado a findByVehicleId: ${vehiculoId}`);
        }

        const { data, error } = await supabase
            .from('historial_parqueo')
            .select('id, celda_id, vehiculo_id, entrada, salida, estado')
            .eq('vehiculo_id', vehiculoNum)
            .eq('estado', 'activo')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error buscando historial activo por vehículo: ${error.message}`);
        }

        return data
            ? new HistorialParqueo(data.id, data.celda_id, data.vehiculo_id, data.entrada, data.salida, data.estado)
            : null;
    }

    _mapRowToObject(row) {
        this._id = row.id;
        this._celda_id = row.celda_id;
        this._vehiculo_id = row.vehiculo_id;
        this._entrada = normalizeFecha(row.entrada);
        this._salida = normalizeFecha(row.salida);
        this._estado = row.estado;
    }

    toJSON() {
        return {
            id: this._id,
            celda_id: this._celda_id,
            vehiculo_id: this._vehiculo_id,
            entrada: this._entrada,
            salida: this._salida,
            estado: this._estado
        };
    }
}

module.exports = HistorialParqueo;
