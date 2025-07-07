const supabase = require('../supabaseClient');

class Vehiculo {
  constructor(id = null, placa = null, color = null, modelo = null, marca = null, tipo = null, usuario_id_usuario = null) {
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
      usuario_id_usuario: this.usuario_id_usuario,
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
    const { data, error } = await supabase.from('vehiculo').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new Error(`Error encontrando vehículo por ID: ${error.message}`);
    return data ? new Vehiculo()._fromDbRow(data) : null;
  }

  static async findByPlaca(placa) {
    const { data, error } = await supabase.from('vehiculo').select('*').eq('placa', placa).single();
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error buscando vehículo por placa: ${error.message}`);
    }
    return data ? new Vehiculo()._fromDbRow(data) : null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('vehiculo').select('*');
    if (error) throw new Error(`Error encontrando todos los vehículos: ${error.message}`);
    return data.map(row => new Vehiculo()._fromDbRow(row));
  }

  async save() {
    const record = {
      placa: this.placa,
      color: this.color,
      modelo: this.modelo,
      marca: this.marca,
      tipo: this.tipo,
      usuario_id_usuario: this.usuario_id_usuario,
    };

    let query;
    if (this.id) {
      // Update
      query = supabase.from('vehiculo').update(record).eq('id', this.id);
    } else {
      // Create
      query = supabase.from('vehiculo').insert(record);
    }

    const { data, error } = await query.select().single();

    if (error) throw new Error(`Error guardando vehículo: ${error.message}`);
    return this._fromDbRow(data);
  }

  async delete() {
    if (!this.id) {
      throw new Error('No se puede eliminar un vehículo sin ID.');
    }
    const { error } = await supabase.from('vehiculo').delete().eq('id', this.id);
    if (error) {
      throw new Error(`Error eliminando vehículo: ${error.message}`);
    }
    return true;
  }
}

module.exports = Vehiculo;