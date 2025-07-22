const { supabase } = require('../supabaseClient');
const bcrypt = require('bcryptjs');

class Usuario {
    constructor(
        id_usuario, tipo_documento, numero_documento, primer_nombre, segundo_nombre,
        primer_apellido, segundo_apellido, direccion_correo, numero_celular,
        foto_perfil, estado, clave, perfil_usuario_id
    ) {
        this.id_usuario = id_usuario;
        this.tipo_documento = tipo_documento;
        this.numero_documento = numero_documento;
        this.primer_nombre = primer_nombre;
        this.segundo_nombre = segundo_nombre;
        this.primer_apellido = primer_apellido;
        this.segundo_apellido = segundo_apellido;
        this.direccion_correo = direccion_correo;
        this.numero_celular = numero_celular;
        this.foto_perfil = foto_perfil;
        this.estado = estado;
        this.clave = clave;
        this.perfil_usuario_id = perfil_usuario_id;
    }

    toJSON() {
        return {
            id_usuario: this.id_usuario,
            tipo_documento: this.tipo_documento,
            numero_documento: this.numero_documento,
            primer_nombre: this.primer_nombre,
            segundo_nombre: this.segundo_nombre,
            primer_apellido: this.primer_apellido,
            segundo_apellido: this.segundo_apellido,
            direccion_correo: this.direccion_correo,
            numero_celular: this.numero_celular,
            foto_perfil: this.foto_perfil,
            estado: this.estado,
            perfil_usuario_id: this.perfil_usuario_id
        };
    }

    async create() {
        const hashedPassword = await bcrypt.hash(this.clave, 10);

        const { data, error } = await supabase
            .from('usuario')
            .insert([{
                tipo_documento: this.tipo_documento,
                numero_documento: this.numero_documento,
                primer_nombre: this.primer_nombre,
                segundo_nombre: this.segundo_nombre,
                primer_apellido: this.primer_apellido,
                segundo_apellido: this.segundo_apellido,
                direccion_correo: this.direccion_correo,
                numero_celular: this.numero_celular,
                foto_perfil: this.foto_perfil,
                estado: this.estado,
                clave: hashedPassword,
                perfil_usuario_id: this.perfil_usuario_id
            }])
            .select();

        if (error) {
            throw new Error(error.message);
        }
        this.id_usuario = data[0].id_usuario;
        return this;
    }

    static async findAll() {
        const { data, error } = await supabase
            .from('usuario')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }
        return data.map(u => new Usuario(
            u.id_usuario, u.tipo_documento, u.numero_documento, u.primer_nombre, u.segundo_nombre,
            u.primer_apellido, u.segundo_apellido, u.direccion_correo, u.numero_celular,
            u.foto_perfil, u.estado, u.clave, u.perfil_usuario_id
        ));
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }
        return new Usuario(
            data.id_usuario, data.tipo_documento, data.numero_documento, data.primer_nombre, data.segundo_nombre,
            data.primer_apellido, data.segundo_apellido, data.direccion_correo, data.numero_celular,
            data.foto_perfil, data.estado, data.clave, data.perfil_usuario_id
        );
    }

    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('direccion_correo', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }
        return new Usuario(
            data.id_usuario, data.tipo_documento, data.numero_documento, data.primer_nombre, data.segundo_nombre,
            data.primer_apellido, data.segundo_apellido, data.direccion_correo, data.numero_celular,
            data.foto_perfil, data.estado, data.clave, data.perfil_usuario_id
        );
    }

    static async findByDocument(documento) {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('numero_documento', documento)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }
        return new Usuario(
            data.id_usuario, data.tipo_documento, data.numero_documento, data.primer_nombre, data.segundo_nombre,
            data.primer_apellido, data.segundo_apellido, data.direccion_correo, data.numero_celular,
            data.foto_perfil, data.estado, data.clave, data.perfil_usuario_id
        );
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.clave);
    }

    async update() {
        const updateData = {
            tipo_documento: this.tipo_documento,
            numero_documento: this.numero_documento,
            primer_nombre: this.primer_nombre,
            segundo_nombre: this.segundo_nombre,
            primer_apellido: this.primer_apellido,
            segundo_apellido: this.segundo_apellido,
            direccion_correo: this.direccion_correo,
            numero_celular: this.numero_celular,
            foto_perfil: this.foto_perfil,
            estado: this.estado,
            perfil_usuario_id: this.perfil_usuario_id
        };

        if (this.clave && !this.clave.startsWith('$2a$') && !this.clave.startsWith('$2b$')) {
            updateData.clave = await bcrypt.hash(this.clave, 10);
        } else if (this.clave && (this.clave.startsWith('$2a$') || this.clave.startsWith('$2b$'))) {
            delete updateData.clave;
        } else {
            delete updateData.clave;
        }

        const { data, error } = await supabase
            .from('usuario')
            .update(updateData)
            .eq('id_usuario', this.id_usuario)
            .select();

        if (error) {
            throw new Error(error.message);
        }
        return this;
    }

    static async delete(id) {
        const { error } = await supabase
            .from('usuario')
            .delete()
            .eq('id_usuario', id);

        if (error) {
            throw new Error(error.message);
        }
        return true;
    }
}

module.exports = Usuario;
