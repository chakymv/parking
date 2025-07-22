
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

console.log('DEBUG: SUPABASE_URL cargada:', supabaseUrl ? 'Sí' : 'No');
console.log('DEBUG: SUPABASE_KEY cargada:', supabaseKey ? 'Sí' : 'No');

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Las variables de entorno SUPABASE_URL o SUPABASE_KEY no están definidas. Supabase no se inicializará correctamente.');
    throw new Error('Falta configuración de Supabase. Verifica las variables de entorno.');
    } else {    

    console.log('DEBUG: Supabase configurado correctamente con las variables de entorno proporcionadas.');
    console.log('DEBUG: Supabase URL:', supabaseUrl);
    console.log('DEBUG: Supabase Key:', supabaseKey.length > 10 ? 'Definida' : 'No definida (posiblemente una clave de prueba)');
    console.log('DEBUG: Supabase Key Length:', supabaseKey.length);
    console.log('DEBUG: Supabase Key Hash:', supabaseKey.length > 10 ? supabaseKey.slice(0, 10) + '...' : 'No definida');

    
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = { supabase };
