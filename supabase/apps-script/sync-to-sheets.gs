/**
 * XV Karen — Apps Script Web App que recibe el webhook de Supabase
 * (trigger + pg_net, ver supabase/schema.sql, PARTE C) y escribe cada
 * insert en la pestaña correspondiente de esta Sheet. Portado de
 * xv-andrea-carolina.
 *
 * NO pegar el secreto acá como texto plano. Configurarlo una sola vez:
 *   Editor de Apps Script > (⚙️) Configuración del proyecto >
 *   Propiedades del script > Agregar propiedad:
 *     SYNC_SECRET = <un valor largo y aleatorio, NUEVO para esta invitación>
 * Ese mismo valor va en el query param `?secret=...` de la URL que se
 * pega en supabase/schema.sql (PARTE C). El secreto NUNCA se commitea.
 *
 * Gotcha operativo: guardar (💾) en el editor NO actualiza el deployment
 * publicado (/exec). Para aplicar un cambio sin generar una URL nueva:
 *   Implementar > Gestionar implementaciones > editar (✏️) la activa >
 *   Versión: "Nueva versión" > Implementar.
 */

// Zona horaria del evento: Bolivia.
var EVENT_TIMEZONE = 'America/La_Paz';

// Nombre de tabla (tal como llega en TG_TABLE_NAME) -> pestaña de la Sheet.
var TABLE_TO_SHEET = {
  invitados_karen: 'RSVP',
  musica_karen: 'Musica',
  fotos_galeria_karen: 'Galeria',
};

// Encabezados por pestaña, en el mismo orden en que appendRow_ escribe.
var SHEET_HEADERS = {
  RSVP: ['Fecha', 'Nombre', 'Asistencia'],
  Musica: ['Fecha', 'Canción'],
  Galeria: ['Fecha', 'URL foto'],
};

function doPost(e) {
  try {
    var expectedSecret = PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
    var receivedSecret = e && e.parameter ? e.parameter.secret : null;

    if (!expectedSecret || receivedSecret !== expectedSecret) {
      return jsonResponse_({ ok: false, error: 'unauthorized' });
    }

    var payload = JSON.parse(e.postData.contents);
    var table = payload.table;
    var record = payload.record || {};

    var sheetName = TABLE_TO_SHEET[table];
    if (!sheetName) {
      return jsonResponse_({ ok: false, error: 'tabla desconocida: ' + table });
    }

    var sheet = getOrCreateSheet_(sheetName);
    var createdAt = record.created_at
      ? Utilities.formatDate(new Date(record.created_at), EVENT_TIMEZONE, 'dd/MM/yyyy HH:mm:ss')
      : '';

    appendRow_(sheet, sheetName, createdAt, record);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function appendRow_(sheet, sheetName, createdAt, record) {
  if (sheetName === 'RSVP') {
    var asistencia = record.asistencia === 'si' ? 'Sí asiste' : record.asistencia === 'no' ? 'No asiste' : '';
    sheet.appendRow([createdAt, record.nombre || '', asistencia]);
  } else if (sheetName === 'Musica') {
    sheet.appendRow([createdAt, record.cancion || '']);
  } else if (sheetName === 'Galeria') {
    sheet.appendRow([createdAt, record.url_foto || '']);
  }
}

function getOrCreateSheet_(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = SHEET_HEADERS[sheetName];
    if (headers) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
