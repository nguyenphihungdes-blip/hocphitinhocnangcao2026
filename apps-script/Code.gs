const CONFIG = {
  DRIVE_FOLDER_ID: '1LcA6Vjyuoz8O8PEVCxasaJFW_EcrBZvj',
  SPREADSHEET_NAME: 'Tổng hợp học phí Tin học hè 2026',
  SHEET_NAME: 'Đã đóng học phí',
  AMOUNT: 500000,
  ALLOWED_CLASSES: ['Lớp 1', 'Lớp 2'],
  MAX_BYTES: 8 * 1024 * 1024
};

function doGet() {
  return jsonResponse_({
    ok: true,
    message: 'Hệ thống xác nhận học phí đang hoạt động.'
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Không nhận được dữ liệu gửi lên.');
    }

    const data = JSON.parse(e.postData.contents);
    validatePayload_(data);

    const sheet = getOrCreateSheet_();
    const duplicateRow = findStudentRow_(sheet, data.className, data.studentName);
    if (duplicateRow) {
      return jsonResponse_({
        ok: false,
        code: 'DUPLICATE',
        message: 'Học sinh này đã có xác nhận học phí. Nếu cần thay ảnh, vui lòng liên hệ thầy Nguyễn Phi Hùng.'
      });
    }

    const bytes = Utilities.base64Decode(data.imageData);
    if (bytes.length > CONFIG.MAX_BYTES) {
      throw new Error('Ảnh vượt quá dung lượng 8 MB.');
    }

    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const safeName = sanitizeFileName_(`${data.className}_${data.studentName}_${new Date().getTime()}`);
    const extension = extensionFromMime_(data.mimeType);
    const blob = Utilities.newBlob(bytes, data.mimeType, `${safeName}.${extension}`);
    const file = folder.createFile(blob);

    sheet.appendRow([
      new Date(),
      data.className,
      data.studentName,
      CONFIG.AMOUNT,
      data.transferContent,
      file.getName(),
      file.getUrl(),
      'Đã xác nhận'
    ]);

    formatNewRow_(sheet, sheet.getLastRow());

    return jsonResponse_({
      ok: true,
      message: 'Đã lưu xác nhận học phí.',
      fileUrl: file.getUrl()
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : 'Có lỗi xảy ra khi xử lý dữ liệu.'
    });
  } finally {
    lock.releaseLock();
  }
}

function validatePayload_(data) {
  if (!data) throw new Error('Dữ liệu không hợp lệ.');
  if (!CONFIG.ALLOWED_CLASSES.includes(data.className)) throw new Error('Lớp không hợp lệ.');
  if (!data.studentName || String(data.studentName).trim().length < 2) throw new Error('Tên học sinh không hợp lệ.');
  if (!data.imageData) throw new Error('Chưa có ảnh xác nhận.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(data.mimeType)) {
    throw new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
  }
}

function getOrCreateSheet_() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const files = folder.getFilesByName(CONFIG.SPREADSHEET_NAME);
  let spreadsheet;

  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    const createdFile = DriveApp.getFileById(spreadsheet.getId());
    folder.addFile(createdFile);
    try {
      DriveApp.getRootFolder().removeFile(createdFile);
    } catch (err) {
      // Một số tài khoản Workspace không cho phép removeFile; có thể bỏ qua.
    }
  }

  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Thời gian gửi',
      'Lớp',
      'Tên học sinh',
      'Số tiền',
      'Nội dung chuyển khoản',
      'Tên ảnh',
      'Link ảnh Drive',
      'Trạng thái'
    ]);
    styleHeader_(sheet);
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, 8, 150);
    sheet.setColumnWidth(3, 220);
    sheet.setColumnWidth(5, 300);
    sheet.setColumnWidth(7, 320);
    sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange('D:D').setNumberFormat('#,##0 "đ"');
  }

  return sheet;
}

function findStudentRow_(sheet, className, studentName) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const values = sheet.getRange(2, 2, lastRow - 1, 2).getDisplayValues();
  const targetClass = normalize_(className);
  const targetStudent = normalize_(studentName);

  for (let i = 0; i < values.length; i++) {
    if (normalize_(values[i][0]) === targetClass && normalize_(values[i][1]) === targetStudent) {
      return i + 2;
    }
  }
  return 0;
}

function styleHeader_(sheet) {
  const header = sheet.getRange(1, 1, 1, 8);
  header.setBackground('#7d5f3d');
  header.setFontColor('#ffffff');
  header.setFontWeight('bold');
  header.setHorizontalAlignment('center');
  header.setVerticalAlignment('middle');
  header.setWrap(true);
  sheet.setRowHeight(1, 36);
}

function formatNewRow_(sheet, row) {
  const range = sheet.getRange(row, 1, 1, 8);
  range.setVerticalAlignment('middle');
  range.setWrap(true);
  sheet.getRange(row, 4).setNumberFormat('#,##0 "đ"');
  sheet.getRange(row, 7).setFormula(`=HYPERLINK("${sheet.getRange(row, 7).getValue()}","Mở ảnh")`);
  sheet.getRange(row, 8).setBackground('#e7f4ec').setFontColor('#2f7d55').setFontWeight('bold');
}

function extensionFromMime_(mimeType) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

function sanitizeFileName_(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalize_(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/\s+/g, ' ');
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
