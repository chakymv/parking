// utils/normalizer.js

const normalizePlaca = (str) => {
    str = str?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
    return str.length === 6 ? str.slice(0, 3) + '-' + str.slice(3) : str;
};

const normalizeDocumento = (str) =>
    str?.trim().replace(/\D/g, '') || '';

const normalizeCorreo = (str) =>
    str?.trim().toLowerCase() || '';

const normalizeTexto = (str) => {
    if (str === null || typeof str === 'undefined') {
        return null;
    }
    let resultado = String(str).trim().toLowerCase();
    resultado = resultado.replace(/\s+/g, ' ');
    return resultado;
};

const normalizeFecha = (str) => {
    const fecha = new Date(str);
    return isNaN(fecha.getTime()) ? null : fecha.toISOString();
};

module.exports = {
    normalizePlaca,
    normalizeDocumento,
    normalizeCorreo,
    normalizeTexto,
    normalizeFecha,
};
