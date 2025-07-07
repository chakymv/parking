class Celda {
  constructor(id = null, tipo = null, estado = null, zona = null, nivel = null) {
    this._id = id;
    this._tipo = tipo;
    this._estado = estado;
    this._zona = zona;
    this._nivel = nivel;
  }

  // Getters
  get id() { return this._id; }
  get tipo() { return this._tipo; }
  get estado() { return this._estado; }
  get zona() { return this._zona; }
  get nivel() { return this._nivel; }

  // Setters
  set id(val) { this._id = val; }
  set tipo(val) { this._tipo = val; }
  set estado(val) { this._estado = val; }
  set zona(val) { this._zona = val; }
  set nivel(val) { this._nivel = val; }

  // … continúa igual para findById, findAll, etc.

  async save() {
    const celdaData = {
      tipo: this._tipo,
      estado: this._estado,
      zona: this._zona,
      nivel: this._nivel
    };

    if (this._id) {
      const { data, error } = await supabase
        .from('celda')
        .update(celdaData)
        .eq('id', this._id)
        .select()
        .single();
      if (error) throw new Error(`Error actualizando celda: ${error.message}`);
      this._mapFromRow(data);
    } else {
      const { data, error } = await supabase
        .from('celda')
        .insert([celdaData])
        .select()
        .single();
      if (error) throw new Error(`Error creando celda: ${error.message}`);
      this._mapFromRow(data);
    }
    return this;
  }

  _mapFromRow(row) {
    this._id = row.id;
    this._tipo = row.tipo;
    this._estado = row.estado;
    this._zona = row.zona;
    this._nivel = row.nivel;
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
      nivel: this._nivel
    };
  }
}
