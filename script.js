const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2etvQL1nvRL8I4bgWqPVQT9cGq1BVWI1qtSz_nKISApN2-hIv7NQ9v7WA5OianKW0Ig/exec";

const studentsByClass = {
  "Lớp Nền Tảng Vững": [
    "Lê Văn Minh Tấn",
    "Lê Đào Gia Linh",
    "Hứa Gia Hưng"
  ],
  "Lớp Bứt Phá Nâng Cao": [
    "Hà Nguyễn Quỳnh Anh",
    "Nguyễn Ngọc Hồng Linh",
    "Huỳnh Tấn Phát",
    "Đặng Hữu Thịnh",
    "Vũ Đức Hải",
    "Trần Hoài Bảo",
    "Mai Trần Trọng Nhân",
    "Phạm Thanh Phong",
    "Nguyễn Mậu Nhật Nam",
    "Chu Thị Trâm Anh",
    "Nguyễn Trần Duy Ân",
    "Lương Đức Anh",
    "Nguyễn Cửu Nam Anh"
  ]
};

const form = document.querySelector("#paymentForm");
const classSelect = document.querySelector("#className");
const studentSelect = document.querySelector("#studentName");
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
  setStatus("", "");
});

studentSelect.addEventListener("change", () => {
  updateTransferContent();
  setStatus("", "");
});

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", "");

  if (!form.reportValidity()) return;

  toggleSubmitting(true);
  try {
    const payload = {
      className: classSelect.value,
      studentName: studentSelect.value
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.message || "Không thể ghi nhận học phí.");

    setStatus("Đã ghi nhận học phí thành công. Cảm ơn phụ huynh!", "success");
    form.reset();
    studentSelect.disabled = true;
    studentSelect.innerHTML = '<option value="">— Vui lòng chọn lớp trước —</option>';
    contentBox.hidden = true;
  } catch (error) {
    setStatus(error.message || "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ thầy.", "error");
  } finally {
    toggleSubmitting(false);
  }
});

function toggleSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.querySelector("span").textContent = isSubmitting
    ? "Đang ghi nhận..."
    : "Xác nhận đã đóng học phí";
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type || ""}`;
}
