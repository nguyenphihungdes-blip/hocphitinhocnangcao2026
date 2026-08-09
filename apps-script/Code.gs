const CONFIG = Object.freeze({
  SHEET_NAME: 'Học phí tháng 8/2026',
  AMOUNT: 500000,
  CLASSES: Object.freeze({
    'Lớp Nền Tảng Vững': Object.freeze([
      'Lê Văn Minh Tấn',
      'Lê Đào Gia Linh',
      'Hứa Gia Hưng'
    ]),
    'Lớp Bứt Phá Nâng Cao': Object.freeze([
      'Hà Nguyễn Quỳnh Anh',
      'Nguyễn Ngọc Hồng Linh',
      'Huỳnh Tấn Phát',
      'Đặng Hữu Thịnh',
      'Vũ Đức Hải',
      'Trần Hoài Bảo',
      'Mai Trần Trọng Nhân',
      'Phạm Thanh Phong',
      'Nguyễn Mậu Nhật Nam',
      'Chu Thị Trâm Anh',
      'Nguyễn Trần Duy Ân',
      'Lương Đức Anh',
      'Nguyễn Cửu Nam Anh'
    ])
  })
});

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Xác nhận học phí Tin học tháng 8/2026',
    message: 'Hệ thống đang hoạt động.'
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);

    const data = parseRequest_(event);
    const className = cleanText_(data.className || data.lop);
    const studentName = cleanText_(data.studentName || data.ten);
    validateSelection_(className, studentName);

    const sheet = getOrCreatePaymentSheet_();
    if (findStudentRow_(sheet, className, studentName)) {
      return jsonResponse_({
        ok: false,
        code: 'DUPLICATE',
        message: 'Học sinh này đã được xác nhận học phí.'
      });
    }

    const transferContent = `${studentName.toUpperCase()} - ${className.toUpperCase()} - HOC PHI`;
    sheet.appendRow([
      new Date(),
      safeCellText_(className),
      safeCellText_(studentName),
      CONFIG.AMOUNT,
      safeCellText_(transferContent),
      'Đã xác nhận'
    ]);
    formatNewRow_(sheet, sheet.getLastRow());

    return jsonResponse_({
      ok: true,
      message: 'Đã ghi nhận học phí thành công.'
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      message: error && error.message
        ? error.message
        : 'Không thể ghi nhận học phí.'
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {
      console.warn(releaseError);
    }
  }
}

function parseRequest_(event) {
  if (!event) throw new Error('Không nhận được dữ liệu gửi lên.');

  if (event.postData && event.postData.contents) {
    try {
      return JSON.parse(event.postData.contents);
    } catch (error) {
      // Hỗ trợ biểu mẫu cũ gửi dữ liệu theo event.parameter.
    }
  }

  return event.parameter || {};
}

function validateSelection_(className, studentName) {
  const roster = CONFIG.CLASSES[className];
  if (!roster) throw new Error('Lớp học được chọn chưa hợp lệ.');

  const isListed = roster.some(function (name) {
    return normalize_(name) === normalize_(studentName);
  });
  if (!isListed) throw new Error('Tên học sinh không thuộc lớp đã chọn.');
}

function getOrCreatePaymentSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Thời gian xác nhận',
      'Lớp',
      'Tên học sinh',
      'Số tiền',
      'Nội dung chuyển khoản',
      'Trạng thái'
    ]);
    styleHeader_(sheet);
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, 6, 160);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 220);
    sheet.setColumnWidth(5, 360);
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

  for (let index = 0; index < values.length; index += 1) {
    if (
      normalize_(values[index][0]) === targetClass &&
      normalize_(values[index][1]) === targetStudent
    ) {
      return index + 2;
    }
  }
  return 0;
}

function styleHeader_(sheet) {
  sheet
    .getRange(1, 1, 1, 6)
    .setBackground('#7d5f3d')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 36);
}

function formatNewRow_(sheet, row) {
  sheet.getRange(row, 1, 1, 6).setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(row, 4).setNumberFormat('#,##0 "đ"');
  sheet.getRange(row, 6)
    .setBackground('#e7f4ec')
    .setFontColor('#2f7d55')
    .setFontWeight('bold');
}

function cleanText_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

function normalize_(value) {
  return cleanText_(value)
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function safeCellText_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
