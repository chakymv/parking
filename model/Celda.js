const supabase = require('../supabaseClient');

class Celda {
  constructor(
    id = null,
    tipo = null,
    estado = null
  ) {
    this._id = id;
    this._tipo = tipo;
    this._estado = estado;
  }

  get id() { return this._id; }
  get tipo() { return this._tipo; }
  get estado() { return this._estado; }

  set id(value) { this._id = value; }
  set tipo(value) { this._tipo = value; }
  set estado(value) { this._estado = value; }

  async create() {
    const { data, error } = await supabase.from('celda').insert([{ tipo: this._tipo, estado: this._estado }]).select().single();
    if (error) throw new Error(`Error creating Celda: ${error.message}`);
    this._mapRowToObject(data);
    return this;
  }

  async findById(id) {
    const { data, error } = await supabase.from('celda').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding Celda: ${error.message}`);
    }
    if (data) {
      this._mapRowToObject(data);
      return this;
    }
    return null;
  }

  static async findAll() {
    const { data, error } = await supabase.from('celda').select('*');
    if (error) throw new Error(`Error finding all Celda: ${error.message}`);
    return (data || []).map(row => {
      const celda = new Celda();
      celda._mapRowToObject(row);
      return celda;
    });
  }

  async update() {
    const updateObj = {
      tipo: this._tipo,
      estado: this._estado
    };
    const { error } = await supabase.from('celda').update(updateObj).eq('id', this._id);
    if (error) throw new Error(`Error updating Celda: ${error.message}`);
    return this;
  }

  async delete() {
    const { error } = await supabase.from('celda').delete().eq('id', this._id);
    if (error) throw new Error(`Error deleting Celda: ${error.message}`);
    return true;
  }

  _mapRowToObject(row) {
    this._id = row.id;
    this._tipo = row.tipo;
    this._estado = row.estado;
  }

  toJSON() {
    return {
      id: this._id,
      tipo: this._tipo,
      estado: this._estado
    };
  }
}

module.exports = Celda;