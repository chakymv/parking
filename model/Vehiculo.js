const { supabase } = require('../supabaseClient');

class Vehiculo {
    constructor(id, placa, color, modelo, marca, tipo, usuario_id_usuario) {
        this.id = id;
        this.placa = placa;
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
            usuario_id_usuario: typeof this.usuario_id_usuario === 'object' && this.usuario_id_usuario !== null
                ? {
                    id_usuario: this.usuario_id_usuario.id_usuario,
                    primer_nombre: this.usuario_id_usuario.primer_nombre,
                    primer_apellido: this.usuario_id_usuario.primer_apellido,
                    numero_documento: this.usuario_id_usuario.numero_documento
                }
                : this.usuario_id_usuario
        };
    }

    static async create({ placa, color, modelo, marca, tipo, usuario_id_usuario }) {
        const { data, error } = await supabase
            .from('vehiculo')
            .insert([{ placa, color, modelo, marca, tipo, usuario_id_usuario }])
            .select();

        if (error) {
            throw new Error(error.message);
        }
        return new Vehiculo(data[0].id, data[0].placa, data[0].color, data[0].modelo, data[0].marca, data[0].tipo, data[0].usuario_id_usuario);
    }

    static async findAll() {
        const { data, error } = await supabase
            .from('vehiculo')
            .select(`
                id,
                placa,
                color,
                modelo,
                marca,
                tipo,
                usuario_id_usuario (
                    id_usuario,
                    primer_nombre,
                    primer_apellido,
                    numero_documento
                )
            `);

        if (error) {
            throw new Error(error.message);
        }
        return data.map(v => new Vehiculo(
            v.id,
            v.placa,
            v.color,
            v.modelo,
            v.marca,
            v.tipo,
            v.usuario_id_usuario
        ));
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('vehiculo')
            .select(`
                id,
                placa,
                color,
                modelo,
                marca,
                tipo,
                usuario_id_usuario (
                    id_usuario,
                    primer_nombre,
                    primer_apellido,
                    numero_documento
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }
        return new Vehiculo(
            data.id,
            data.placa,
            data.color,
            data.modelo,
            data.marca,
            data.tipo,
            data.usuario_id_usuario
        );
    }

    static async findByPlaca(placa) {
        const { data, error } = await supabase
            .from('vehiculo')
            .select(`
                id,
                placa,
                color,
                modelo,
                marca,
                tipo,
                usuario_id_usuario (
                    id_usuario,
                    primer_nombre,
                    segundo_nombre,
                    primer_apellido,
                    segundo_apellido,
                    numero_documento,
                    direccion_correo,
                    numero_celular
                )
            `)
            .ilike('placa', placa)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }
        return new Vehiculo(
            data.id,
            data.placa,
            data.color,
            data.modelo,
            data.marca,
            data.tipo,
            data.usuario_id_usuario
        );
    }

    async update() {
        const userIdToUpdate = typeof this.usuario_id_usuario === 'object' && this.usuario_id_usuario !== null
                               ? this.usuario_id_usuario.id_usuario
                               : this.usuario_id_usuario;

        const { data, error } = await supabase
            .from('vehiculo')
            .update({
                placa: this.placa,
                color: this.color,
                modelo: this.modelo,
                marca: this.marca,
                tipo: this.tipo,
                usuario_id_usuario: userIdToUpdate
            })
            .eq('id', this.id)
            .select();

        if (error) {
            throw new Error(error.message);
        }
        return this;
    }

    static async delete(id) {
        const { error: historialError } = await supabase
            .from('historial_parqueo')
            .delete()
            .eq('vehiculo_id', id);

        if (historialError) {
            throw new Error(`Error eliminando historiales de parqueo: ${historialError.message}`);
        }

        const { error: vehiculoError } = await supabase
            .from('vehiculo')
            .delete()
            .eq('id', id);

        if (vehiculoError) {
            throw new Error(`Error eliminando vehículo: ${vehiculoError.message}`);
        }
        return true;
    }
}

module.exports = Vehiculo;
