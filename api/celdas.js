class Celda {
  constructor(id = null, tipo = null, estado = null, zona = null) {
    this._id = id;
    this._tipo = tipo;
    this._estado = estado;
    this._zona = zona;
   
  }

  // Getters
  get id() { return this._id; }
  get tipo() { return this._tipo; }
  get estado() { return this._estado; }
  get zona() { return this._zona; }


  // Setters
  set id(val) { this._id = val; }
  set tipo(val) { this._tipo = val; }
  set estado(val) { this._estado = val; }
  set zona(val) { this._zona = val; }


  // … continúa igual para findById, findAll, etc.

async delete() {
  if (!this._id) throw new Error('No se puede eliminar una celda sin ID.');
  const { error } = await supabase
    .from('celda')
    .delete()
    .eq('id', this._id);
  if (error) throw new Error(`Error eliminando celda: ${error.message}`);
  return true;
}


  async save() {
    const celdaData = {
      tipo: this._tipo,
      estado: this._estado,
      zona: this._zona,
      
    };

      let query, action;
  if (this._id) {
    // Actualizar celda existente
    query = supabase.from('celda').update(celdaData).eq('id', this._id).select().single();
    action = 'actualizando';
  } else {
    // Crear nueva celda
    query = supabase.from('celda').insert([celdaData]).select().single();
    action = 'creando';
  }

  const { data, error } = await query;
  if (error) throw new Error(`Error ${action} celda: ${error.message}`);

  this._mapFromRow(data);
  return this;
}

  _mapFromRow(row) {
    this._id = row.id;
    this._tipo = row.tipo;
    this._estado = row.estado;
    this._zona = row.zona;
    this._vehiculo = row.vehiculo || null;
  }

  static _fromRow(row) {
    const celda = new Celda();
    celda._mapFromRow(row);
    return celda;
  }

  toJSON() {
    return {
      id: this._id,
      tipo: this._tipo,
      estado: this._estado,
      zona: this._zona,
       vehiculo: this._vehiculo
    };
  }
}
