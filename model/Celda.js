const supabase = require('./../supabaseClient');
const { normalizeTexto } = require('./../utils/normalizer');

class Celda {
    constructor(id_celda = null, numero = null, tipo = null, estado = 'disponible', zona_id = null, parqueadero_id = null, parqueadero_nombre = null, zona_nombre = null) {
        this.id_celda = Number(id_celda);
        this.numero = numero;
        this.tipo = normalizeTexto(tipo);
        this.estado = normalizeTexto(estado);
        this.zona_id = Number(zona_id);
        this.parqueadero_id = Number(parqueadero_id);
        this.parqueadero_nombre = parqueadero_nombre;
        this.zona_nombre = zona_nombre;
    }

    toJSON() {
        return {
            id_celda: this.id_celda,
            numero: this.numero,
            tipo: this.tipo,
            estado: this.estado,
            zona_id: this.zona_id,
            parqueadero_id: this.parqueadero_id,
            parqueadero_nombre: this.parqueadero_nombre,
            zona_nombre: this.zona_nombre
        };
    }

    _fromDbRow(row) {
        this.id_celda = row.id;
        this.numero = row.numero;
        this.tipo = normalizeTexto(row.tipo);
        this.estado = normalizeTexto(row.estado);
        this.zona_id = Number(row.zona_id);
        this.parqueadero_id = Number(row.parqueadero_id);
        this.parqueadero_nombre = row.parqueadero?.nombre || null;
        this.zona_nombre = row.zona?.nombre || null;
        return this;
    }

    static async findAll(filters = {}) {
        let query = supabase.from('celda').select('*, parqueadero (nombre), zona (nombre)'); 
        
        if (filters.estado) query = query.eq('estado', normalizeTexto(filters.estado));
        if (filters.tipo) query = query.eq('tipo', normalizeTexto(filters.tipo));
        if (filters.zona_id) query = query.eq('zona_id', Number(filters.zona_id));
        if (filters.parqueadero_id) query = query.eq('parqueadero_id', Number(filters.parqueadero_id));

        const { data, error } = await query;
        if (error) throw new Error(`Error encontrando celdas: ${error.message}`);
        return (data || []).map(row => new Celda()._fromDbRow(row));
    }

    static async findById(id) {
        const idNum = Number(id);
        if (isNaN(idNum)) throw new Error(`ID inválido proporcionado a findById: ${id}`);

        const { data, error } = await supabase
            .from('celda')
            .select('*, parqueadero (nombre), zona (nombre)')
            .eq('id', idNum)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error encontrando celda por ID: ${error.message}`);
        }

        return data ? new Celda()._fromDbRow(data) : null;
    }

    async save() {
        return this.id_celda ? this._update() : this._create();
    }

    async _create() {
        const { data, error } = await supabase
            .from('celda')
            .insert({
                numero: this.numero,
                tipo: this.tipo,
                estado: this.estado,
                zona_id: this.zona_id,
                parqueadero_id: this.parqueadero_id
            })
            .select('*, parqueadero (nombre), zona (nombre)')
            .single();

        if (error) throw new Error(`Error creando celda: ${error.message}`);
        return this._fromDbRow(data);
    }

    async _update() {
        if (!this.id_celda || isNaN(this.id_celda)) {
            throw new Error('ID inválido para actualizar celda');
        }

        const { data, error } = await supabase
            .from('celda')
            .update({
                numero: this.numero,
                tipo: this.tipo,
                estado: this.estado,
                zona_id: this.zona_id,
                parqueadero_id: this.parqueadero_id
            })
            .eq('id', this.id_celda)
            .select('*, parqueadero (nombre), zona (nombre)')
            .single();

        if (error) throw new Error(`Error actualizando celda: ${error.message}`);
        return this._fromDbRow(data);
    }

    async delete() {
        if (!this.id_celda || isNaN(this.id_celda)) {
            throw new Error('ID inválido para eliminar celda');
        }

        const { error } = await supabase
            .from('celda')
            .delete()
            .eq('id', this.id_celda);

        if (error) throw new Error(`Error eliminando celda: ${error.message}`);
        return true;
    }
}

module.exports = Celda;