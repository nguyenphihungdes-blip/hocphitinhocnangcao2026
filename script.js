const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const studentsByClass = {
  "Lớp 1": [
    "Lê Văn Minh Tấn",
    "Đỗ Nguyên Ngọc Huyền",
    "Hà Nguyễn Quỳnh Anh",
    "Lương Đức Anh",
    "Nguyễn Minh Phương",
    "Hứa Gia Hưng",
    "Nguyễn Ngọc Hồng Linh",
    "Đặng Hữu Thịnh",
    "Mạch Thị Ngọc Hà",
    "Phạm Thanh Phong",
    "Huỳnh Tấn Phát"
  ],
  "Lớp 2": [
    "Hồ Nguyên Gia Phúc",
    "Phạm Thị Ngọc Hân",
    "Mai Trần Trọng Nhân",
    "Trần Hoài Bảo",
    "Nguyễn Trần Duy Ân",
    "Chu Thị Trâm Anh",
    "Bùi Tuệ Gia Linh",
    "Nguyễn Mậu Nhật Nam",
    "Vũ Đức Hải",
    "Nguyễn Cửu Nam Anh"
  ]
};

const form = document.querySelector("#paymentForm");
const classSelect = document.querySelector("#className");
const studentSelect = document.querySelector("#studentName");
const proofInput = document.querySelector("#proofImage");
const preview = document.querySelector("#preview");
const statusMessage = document.querySelector("#statusMessage");
const submitButton = document.querySelector("#submitButton");
const contentBox = document.querySelector("#transferContentBox");
const contentText = document.querySelector("#transferContent");

classSelect.addEventListener("change", () => {
  const list = studentsByClass[classSelect.value] || [];
  studentSelect.innerHTML = '<option value="">— Chọn học sinh —</option>';
  list.forEach((student) => {
    const option = document.createElement("option");
    option.value = student;
    option.textContent = student;
    studentSelect.appendChild(option);
  });
  studentSelect.disabled = list.length === 0;
  updateTransferContent();
});

studentSelect.addEventListener("change", updateTransferContent);

function updateTransferContent() {
  if (!classSelect.value || !studentSelect.value) {
    contentBox.hidden = true;
    return;
  }
  contentText.textContent = `${studentSelect.value.toUpperCase()} - ${classSelect.value.toUpperCase()} - HOC PHI`;
  contentBox.hidden = false;
}

document.querySelector("#copyContent").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(contentText.textContent);
    setStatus("Đã sao chép nội dung chuyển khoản.", "success");
  } catch {
    setStatus("Không thể sao chép tự động. Vui lòng giữ để chọn và sao chép.", "error");
  }
});

proofInput.addEventListener("change", () => {
  const file = proofInput.files[0];
  preview.hidden = true;
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) {
    proofInput.value = "";
    setStatus("Ảnh vượt quá 8 MB. Vui lòng chọn ảnh nhỏ hơn.", "error");
    return;
  }
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  setStatus("", "");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", "");

  if (APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    setStatus("Trang chưa được cấu hình địa chỉ Google Apps Script.", "error");
    return;
  }
  if (!form.reportValidity()) return;

  const file = proofInput.files[0];
  if (!file || file.size > MAX_FILE_SIZE) {
    setStatus("Vui lòng chọn ảnh biên lai hợp lệ, tối đa 8 MB.", "error");
    return;
  }

  toggleSubmitting(true);
  try {
    const imageData = await fileToBase64(file);
    const payload = {
      className: classSelect.value,
      studentName: studentSelect.value,
      amount: 500000,
      transferContent: contentText.textContent,
      fileName: file.name,
      mimeType: file.type,
      imageData
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.message || "Không thể gửi xác nhận.");

    setStatus("Đã gửi xác nhận thành công. Cảm ơn phụ huynh!", "success");
    form.reset();
    studentSelect.disabled = true;
    studentSelect.innerHTML = '<option value="">— Vui lòng chọn lớp trước —</option>';
    preview.hidden = true;
    preview.removeAttribute("src");
    contentBox.hidden = true;
  } catch (error) {
    setStatus(error.message || "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ thầy.", "error");
  } finally {
    toggleSubmitting(false);
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Không đọc được ảnh đã chọn."));
    reader.readAsDataURL(file);
  });
}

function toggleSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.querySelector("span").textContent = isSubmitting ? "Đang gửi..." : "Gửi xác nhận học phí";
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type || ""}`;
}
