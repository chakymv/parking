const supabase = require('./../supabaseClient');
const { normalizePlaca } = require('./../utils/normalizer');

class Vehiculo {
    constructor(id = null, placa = null, color = null, modelo = null, marca = null, tipo = null, usuario_id_usuario = null) {
        this.id = id;
        this.placa = normalizePlaca(placa);
        this.color = color;
        this.modelo = modelo;
        this.marca = marca;
        this.tipo = tipo;
        this.usuario_id_usuario = usuario_id_usuario;
    }

    toJSON() {
        return {
            id: this.id,
            placa: this.placa,
            color: this.color,
            modelo: this.modelo,
            marca: this.marca,
            tipo: this.tipo,
            usuario_id_usuario: this.usuario_id_usuario
        };
    }

    _fromDbRow(row) {
        this.id = row.id;
        this.placa = row.placa;
        this.color = row.color;
        this.modelo = row.modelo;
        this.marca = row.marca;
        this.tipo = row.tipo;
        this.usuario_id_usuario = row.usuario_id_usuario;
        return this;
    }

    static async findById(id) {
        const idNum = Number(id);
        if (isNaN(idNum)) {
            throw new Error(`ID inválido proporcionado a findById: ${id}`);
        }

        const { data, error } = await supabase
            .from('vehiculo')
            .select('*')
            .eq('id', idNum)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error encontrando vehículo por ID: ${error.message}`);
        }

        return data ? new Vehiculo()._fromDbRow(data) : null;
    }

    static async findByPlaca(placa) {
        const placaNormalizada = normalizePlaca(placa);
        console.log(`DEBUG: Buscando vehículo con placa normalizada: ${placaNormalizada}`);
        if (!placaNormalizada || placaNormalizada.length < 6) {
            throw new Error('Placa proporcionada es inválida o vacía después de la normalización.');
        }

        const { data, error } = await supabase
            .from('vehiculo')
            .select('*')
            .eq('placa', placaNormalizada)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error buscando vehículo por placa: ${error.message}`);
        }
        console.log(`DEBUG: Resultado findByPlaca para ${placaNormalizada}:`, data ? 'Encontrado' : 'No encontrado');
        return data ? new Vehiculo()._fromDbRow(data) : null;
    }

    static async findAll() {
        const { data, error } = await supabase.from('vehiculo').select('*');
        if (error) {
            throw new Error(`Error encontrando todos los vehículos: ${error.message}`);
        }
        return data.map(row => new Vehiculo()._fromDbRow(row));
    }

    async save() {
        const placaLimpia = normalizePlaca(this.placa);

        if (!placaLimpia || placaLimpia.length < 6) {
            throw new Error('Placa inválida. No se puede guardar el vehículo.');
        }

        const record = {
            placa: placaLimpia,
            color: this.color,
            modelo: this.modelo,
            marca: this.marca,
            tipo: this.tipo,
            usuario_id_usuario: this.usuario_id_usuario
        };

        const query = this.id
            ? supabase.from('vehiculo').update(record).eq('id', this.id)
            : supabase.from('vehiculo').insert(record);

        const { data, error } = await query.select().single();
        if (error) {
            throw new Error(`Error guardando vehículo: ${error.message}`);
        }

        return this._fromDbRow(data);
    }

    async delete() {
        if (!this.id || isNaN(this.id)) {
            throw new Error('ID inválido. No se puede eliminar un vehículo sin ID válido.');
        }

        const { error } = await supabase
            .from('vehiculo')
            .delete()
            .eq('id', this.id);

        if (error) {
            throw new Error(`Error eliminando vehículo: ${error.message}`);
        }

        return true;
    }
}

module.exports = Vehiculo;
