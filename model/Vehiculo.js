const supabase = require('../supabaseClient');

class Vehiculo {
  constructor(
    id = null,
    placa = null,
    color = null,
    modelo = null,
    marca = null,
    tipo = null,
    usuario_id_usuario = null
  ) {
    this._id = id;
    this._placa = placa;
    this._color = color;
    this._modelo = modelo;
    this._marca = marca;
    this._tipo = tipo;
    this._usuario_id_usuario = usuario_id_usuario;
  }

  get id() { return this._id; }
  get placa() { return this._placa; }
  get color() { return this._color; }
  get modelo() { return this._modelo; }
  get marca() { return this._marca; }
  get tipo() { return this._tipo; }
  get usuario_id_usuario() { return this._usuario_id_usuario; }

  set id(value) { this._id = value; }
  set placa(value) { this._placa = value; }
  set color(value) { this._color = value; }
  set modelo(value) { this._modelo = value; }
  set marca(value) { this._marca = value; }
  set tipo(value) { this._tipo = value; }
  set usuario_id_usuario(value) { this._usuario_id_usuario = value; }

  async create() {
    const insertObj = {
      placa: this._placa,
      color: this._color,
      modelo: this._modelo,
      marca: this._marca,
      tipo: this._tipo,
      usuario_id_usuario: this._usuario_id_usuario
    };
    const { data, error } = await supabase.from('vehiculo').insert([insertObj]).select().single();
    if (error) throw new Error(`Error creating Vehiculo: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const { data, error } = await supabase.from('vehiculo').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding Vehiculo: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('vehiculo').select('*');
    if (error) throw new Error(`Error finding all Vehiculo: ${error.message}`);
    return (data || []).map(row => {
      const vehiculo = new Vehiculo();
      vehiculo._mapRowToObject(row);
      return vehiculo;
    });
  }

  async findByPlaca(placa) {
    const { data, error } = await supabase.from('vehiculo').select('*').eq('placa', placa).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding Vehiculo by placa: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase.from('vehiculo').select('*').eq('usuario_id_usuario', userId);
    if (error) throw new Error(`Error finding Vehiculo by user ID: ${error.message}`);
    return (data || []).map(row => {
      const vehiculo = new Vehiculo();
      vehiculo._mapRowToObject(row);
      return vehiculo;
    });
  }

  async update() {
    const updateObj = {
      placa: this._placa,
      color: this._color,
      modelo: this._modelo,
      marca: this._marca,
      tipo: this._tipo,
      usuario_id_usuario: this._usuario_id_usuario
    };
    const { error } = await supabase.from('vehiculo').update(updateObj).eq('id', this._id);
    if (error) throw new Error(`Error updating Vehiculo: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('vehiculo').delete().eq('id', this._id);
    if (error) throw new Error(`Error deleting Vehiculo: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._placa = row.placa;
    this._color = row.color;
    this._modelo = row.modelo;
    this._marca = row.marca;
    this._tipo = row.tipo;
    this._usuario_id_usuario = row.usuario_id_usuario;
  }

  toJSON() {
    return {
      id: this._id,
      placa: this._placa,
      color: this._color,
      modelo: this._modelo,
      marca: this._marca,
      tipo: this._tipo,
      usuario_id_usuario: this._usuario_id_usuario
    };
  }
}

module.exports = Vehiculo;