/**
 * Partner2Impact — contact form backend
 *
 * Receives the "15-minute data health check up" form from partner2impact.com,
 * appends one row per submission to a Google Sheet, and emails a notification.
 *
 * ---------------------------------------------------------------------------
 * SETUP
 * ---------------------------------------------------------------------------
 * 1. Open the Google Sheet that should collect the submissions.
 * 2. Extensions -> Apps Script. Delete whatever is in Code.gs and paste this
 *    file in its place.
 * 3. Deploy -> New deployment -> gear icon -> Web app.
 *      Description:      Partner2Impact contact form
 *      Execute as:       Me
 *      Who has access:   Anyone            <- must be "Anyone", not
 *                                             "Anyone with Google account",
 *                                             or visitors get a login page
 *                                             instead of the form working.
 * 4. Authorize when prompted. The warning screen is expected for an unverified
 *    personal script: Advanced -> Go to <project name> (unsafe) -> Allow.
 * 5. Copy the Web app URL. It ends in /exec — the /dev URL only works while
 *    signed in, so it is not the one to use.
 *
 * The header row is written automatically on the first submission, so there is
 * nothing to set up inside the sheet itself.
 *
 * After changing this file you must run Deploy -> Manage deployments -> edit ->
 * Version: New version. Saving alone does not update the live web app.
 */

/** Who gets told about a new submission. Empty list disables notifications. */
var NOTIFY_EMAILS = [
  'eduardo@generedge.com',
  'tracey@generedge.com'
];

/** Tab that receives the rows. Created automatically if it does not exist. */
var SHEET_NAME = 'Leads';

/**
 * Only needed if this script is NOT bound to the sheet — that is, if it was
 * created from script.google.com rather than from Extensions -> Apps Script.
 * Paste the long id from the sheet URL between /d/ and /edit.
 */
var SPREADSHEET_ID = '';

/** Column order. Changing this row changes the sheet layout on a fresh tab. */
var COLUMNS = [
  { header: 'Timestamp',         field: null },
  { header: 'Name',              field: 'name' },
  { header: 'Organization',      field: 'organization' },
  { header: 'Email',             field: 'email' },
  { header: 'Phone',             field: 'phone' },
  { header: 'CRM',               field: 'crm' },
  { header: 'Primary challenge', field: 'challenge' },
  { header: 'Message',           field: 'message' },
  { header: 'Consent',           field: 'consent' },
  { header: 'Source page',       field: 'page' }
];

/* -------------------------------------------------------------------------
   Entry points
   ------------------------------------------------------------------------- */

function doPost(e) {
  try {
    var data = (e && e.parameter) || {};

    // Honeypot: a hidden field no person ever fills in. Report success so the
    // bot moves on, but write nothing.
    if (data.company_website) {
      return json({ result: 'success' });
    }

    if (!data.name || !data.email) {
      return json({ result: 'error', message: 'Name and email are required.' }, 400);
    }

    // Two submissions arriving at once would otherwise race for the same row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = getSheet();
      sheet.appendRow(buildRow(data));
    } finally {
      lock.releaseLock();
    }

    notify(data);
    return json({ result: 'success' });

  } catch (err) {
    // Logged to Executions in the Apps Script editor, so a failed submission
    // can be traced without the visitor seeing anything internal.
    console.error(err);
    return json({ result: 'error', message: 'Could not save the submission.' }, 500);
  }
}

/** Visiting the /exec URL in a browser — a quick "is it deployed?" check. */
function doGet() {
  return json({ result: 'ok', message: 'Partner2Impact form endpoint is live.' });
}

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

function getSheet() {
  var book = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!book) {
    throw new Error(
      'No spreadsheet found. Either bind this script to a sheet via ' +
      'Extensions -> Apps Script, or set SPREADSHEET_ID above.'
    );
  }

  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    var headers = COLUMNS.map(function (c) { return c.header; });
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function buildRow(data) {
  return COLUMNS.map(function (column) {
    if (column.field === null) return new Date();
    if (column.field === 'consent') return data.consent ? 'Yes' : 'No';

    var value = data[column.field];
    // A leading =, + or - makes Sheets treat the cell as a formula. Prefixing
    // an apostrophe keeps visitor text as text.
    if (value && /^[=+\-@]/.test(value)) return "'" + value;
    return value || '';
  });
}

function notify(data) {
  if (!NOTIFY_EMAILS || !NOTIFY_EMAILS.length) return;

  var who = data.organization || data.name;
  var body = COLUMNS
    .filter(function (c) { return c.field && c.field !== 'consent'; })
    .map(function (c) { return c.header + ': ' + (data[c.field] || '—'); })
    .join('\n');

  // A failed notification must not lose the row that was already saved.
  try {
    MailApp.sendEmail({
      // Everyone on the list is a recipient, so hitting Reply answers the
      // visitor rather than the other people who were notified.
      to: NOTIFY_EMAILS.join(','),
      replyTo: data.email,
      subject: 'New data health check up request — ' + who,
      body: body + '\n\n— partner2impact.com'
    });
  } catch (err) {
    console.error('Row saved but notification failed: ' + err);
  }
}

function json(payload, status) {
  // Apps Script web apps always answer 200; the status is carried in the body
  // so the site can tell success from failure.
  payload.status = status || 200;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
