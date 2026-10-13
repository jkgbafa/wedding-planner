// Wedding planner storage in your Google Drive.
// Paste this into a new project at https://script.google.com, then
// Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
// The planner is kept in a file called "Wedding planner data.json" in your Drive.
// Drive keeps earlier versions of that file under File → Manage versions.
var FILE_NAME = 'Wedding planner data.json';

function file_() {
  var id = PropertiesService.getScriptProperties().getProperty('fileId');
  if (id) { try { return DriveApp.getFileById(id); } catch (e) {} }
  return null;
}
function read_() {
  var f = file_();
  return f ? JSON.parse(f.getBlob().getDataAsString()) : {board: null, version: 0};
}
function out_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return out_(read_()); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var text = e.postData && e.postData.contents || '';
    if (text.length > 3000000) return out_({error: 'The planner is too large to save.', status: 400});
    var body = JSON.parse(text);
    if (!body.board || !Array.isArray(body.board.items) || typeof body.version !== 'number') return out_({error: 'Invalid planner data.', status: 400});
    var current = read_();
    if (body.version !== current.version) return out_({error: 'The planner was changed on another device. Refresh before saving; your draft is kept.', status: 409});
    var next = {board: body.board, version: current.version + 1, updatedAt: new Date().toISOString(), updatedBy: 'Google Drive', migrations: body.migrations || current.migrations || []};
    var json = JSON.stringify(next), f = file_();
    if (f) f.setContent(json);
    else PropertiesService.getScriptProperties().setProperty('fileId', DriveApp.createFile(FILE_NAME, json, 'application/json').getId());
    return out_(next);
  } finally { lock.releaseLock(); }
}
