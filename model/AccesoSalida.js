// model/AccesoSalida.js
const { supabase } = require('../supabaseClient');
const { normalizeFecha, normalizeTexto } = require('./../utils/normalizer');

class AccesoSalida {
    constructor(
        id = null,
        movimiento = null,
        fecha_hora = null,
        puerta = null,
        tiempo_estadia = null,
        vehiculo_id = null
    ) {
        this._id = Number(id);
        this._movimiento = normalizeTexto(movimiento);
        this._fecha_hora = normalizeFecha(fecha_hora);
        this._puerta = normalizeTexto(puerta);
        this._tiempo_estadia = Number(tiempo_estadia);
        this._vehiculo_id = Number(vehiculo_id);
    }

    // Getters
    get id() { return this._id; }
    get movimiento() { return this._movimiento; }
    get fecha_hora() { return this._fecha_hora; }
    get puerta() { return this._puerta; }
    get tiempo_estadia() { return this._tiempo_estadia; }
    get vehiculo_id() { return this._vehiculo_id; }

    // Setters
    set id(value) { this._id = Number(value); }
    set movimiento(value) { this._movimiento = normalizeTexto(value); }
    set fecha_hora(value) { this._fecha_hora = normalizeFecha(value); }
    set puerta(value) { this._puerta = normalizeFecha(value); } // Corregido: debería ser normalizeFecha
    set tiempo_estadia(value) { this._tiempo_estadia = Number(value); }
    set vehiculo_id(value) { this._vehiculo_id = Number(value); }

    // CREATE
    async create() {
        if (isNaN(this._vehiculo_id)) {
            throw new Error('ID de vehículo inválido para crear AccesoSalida');
        }

        const insertObj = {
            movimiento: this._movimiento,
            fecha_hora: this._fecha_hora,
            puerta: this._puerta,
            tiempo_estadia: this._tiempo_estadia,
            vehiculo_id: this._vehiculo_id
        };

        const { data, error } = await supabase
            .from('acceso_salida')
            .insert([insertObj])
            .select()
            .single();

        if (error) throw new Error(`Error creando AccesoSalida: ${error.message}`);
        this._mapRowToObject(data);
        return this;
    }

    // READ by ID
    static async findById(id) {
        const idNum = Number(id);
        if (isNaN(idNum)) throw new Error(`ID inválido proporcionado a findById: ${id}`);

        const { data, error } = await supabase
            .from('acceso_salida')
            .select('*')
            .eq('id', idNum)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error buscando AccesoSalida: ${error.message}`);
        }

        if (data) {
            const acceso = new AccesoSalida(); // Crear una nueva instancia para el resultado
            acceso._mapRowToObject(data);
            return acceso;
        }
        return null;
    }

    // READ all
    static async findAll() {
        const { data, error } = await supabase
            .from('acceso_salida')
            .select('*')
            .order('fecha_hora', { ascending: false });

        if (error) throw new Error(`Error obteniendo accesos/salidas: ${error.message}`);
        return (data || []).map(row => {
            const acceso = new AccesoSalida();
            acceso._mapRowToObject(row);
            return acceso;
        });
    }

    // UPDATE
    async update() {
        if (isNaN(this._id)) {
            throw new Error('ID inválido para actualizar AccesoSalida');
        }

        const updateObj = {
            movimiento: this._movimiento,
            fecha_hora: this._fecha_hora,
            puerta: this._puerta,
            tiempo_estadia: this._tiempo_estadia,
            vehiculo_id: this._vehiculo_id
        };

        const { error } = await supabase
            .from('acceso_salida')
            .update(updateObj)
            .eq('id', this._id);

        if (error) throw new Error(`Error actualizando AccesoSalida: ${error.message}`);
        return this;
    }

    // DELETE
    async delete() {
        if (!this._id || isNaN(this._id)) {
            throw new Error('ID inválido para eliminar AccesoSalida');
        }

        const { error } = await supabase
            .from('acceso_salida')
            .delete()
            .eq('id', this._id);

        if (error) throw new Error(`Error eliminando AccesoSalida: ${error.message}`);
        return true;
    }

    // Mapper
    _mapRowToObject(row) {
        this._id = row.id;
        this._movimiento = normalizeTexto(row.movimiento);
        this._fecha_hora = normalizeFecha(row.fecha_hora);
        this._puerta = normalizeTexto(row.puerta);
        this._tiempo_estadia = Number(row.tiempo_estadia);
        this._vehiculo_id = Number(row.vehiculo_id);
    }

    // Export JSON
    toJSON() {
        return {
            id: this._id,
            movimiento: this._movimiento,
            fecha_hora: this._fecha_hora,
            puerta: this._puerta,
            tiempo_estadia: this._tiempo_estadia,
            vehiculo_id: this._vehiculo_id
        };
    }
}

module.exports = AccesoSalida;
