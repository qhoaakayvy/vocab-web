// Lấy danh sách từ đã lưu
const vocabList = JSON.parse(localStorage.getItem("vocabList") || "[]");
renderTable();

// Hàm dịch nghĩa sang tiếng Việt (dùng API miễn phí)
async function translateToVietnamese(text) {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
    const data = await res.json();
    return data.responseData.translatedText;
  } catch (e) {
    return text; // fallback nếu có lỗi
  }
}

// Khi người dùng nhập từ tiếng Anh và chuyển focus
document.getElementById("word").addEventListener("blur", async function () {
  const word = this.value.trim();
  if (!word) return;

  const typeInput = document.getElementById("type");
  const meaningInput = document.getElementById("meaning");
  const exampleInput = document.getElementById("example");

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    const first = data[0];

    const partOfSpeech = first.meanings[0]?.partOfSpeech || "";
    const definition = first.meanings[0]?.definitions[0]?.definition || "";
    const example = first.meanings[0]?.definitions[0]?.example || "";

    typeInput.value = partOfSpeech;
    exampleInput.value = example;
    meaningInput.value = await translateToVietnamese(definition);
  } catch (e) {
    console.log("Không tìm thấy từ.");
  }
});

// Nút "Thêm từ"
document.getElementById("add-btn").addEventListener("click", function () {
  const word = document.getElementById("word").value.trim();
  const type = document.getElementById("type").value.trim();
  const meaning = document.getElementById("meaning").value.trim();
  const example = document.getElementById("example").value.trim();

  if (!word || !type || !meaning) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  vocabList.push({ word, type, meaning, example });
  localStorage.setItem("vocabList", JSON.stringify(vocabList));

  // Xóa input
  document.getElementById("word").value = "";
  document.getElementById("type").value = "";
  document.getElementById("meaning").value = "";
  document.getElementById("example").value = "";

  renderTable();
});

// Hiển thị danh sách từ
function renderTable() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  vocabList.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.word}</td>
      <td>${item.type}</td>
      <td>${item.meaning}</td>
      <td>${item.example}</td>
      <td><button onclick="removeWord(${index})">Xóa</button></td>
    `;
    tbody.appendChild(row);
  });

  const message = document.getElementById("story-message");
  if (vocabList.length === 0) {
    message.innerHTML = `<div class="message">Bạn chưa có từ nào để luyện tập.</div>`;
  } else {
    message.innerHTML = "";
  }
}

// Xóa từ khỏi danh sách
function removeWord(index) {
  vocabList.splice(index, 1);
  localStorage.setItem("vocabList", JSON.stringify(vocabList));
  renderTable();
}

// Tạo đoạn văn học thuật từ các từ đã lưu
document.getElementById("generate-story").addEventListener("click", function () {
  if (vocabList.length === 0) {
    alert("Bạn chưa có từ nào để luyện tập.");
    return;
  }

  const words = vocabList.map(item => item.word);
  const story = `In a distant land, people traded ${words.join(", ")} as if they were treasures. These words carried power, meaning, and stories of cultures long past.`;

  const highlighted = words.reduce((text, w) => {
    const regex = new RegExp(`\\b(${w})\\b`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  }, story);

  document.getElementById("story-output").innerHTML = highlighted;
});
