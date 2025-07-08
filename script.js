const vocabList = JSON.parse(localStorage.getItem("vocabList") || "[]");
renderTable();

// 🌐 Dịch tiếng Anh sang tiếng Việt
async function translateToVietnamese(text) {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
    const data = await res.json();
    return data.responseData.translatedText;
  } catch (e) {
    return text;
  }
}

// 🧠 Tạo ví dụ nếu không có sẵn
function generateExample(word, type) {
  if (type.includes("verb")) {
    return `She decided to ${word} everything before moving.`;
  } else if (type.includes("noun")) {
    return `The ${word} was discussed at the meeting.`;
  } else {
    return `This phrase: "${word}" is often used in English.`;
  }
}

// 📥 Khi blur ô nhập từ
document.getElementById("word").addEventListener("blur", async function () {
  const word = this.value.trim();
  if (!word) return;

  const typeInput = document.getElementById("type");
  const meaningInput = document.getElementById("meaning");
  const exampleInput = document.getElementById("example");

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      const first = data[0];
      const partOfSpeech = first.meanings[0]?.partOfSpeech || "phrase";
      const definition = first.meanings[0]?.definitions[0]?.definition || word;
      const example = first.meanings[0]?.definitions[0]?.example || generateExample(word, partOfSpeech);

      typeInput.value = partOfSpeech;
      meaningInput.value = await translateToVietnamese(definition);
      exampleInput.value = example;
    } else {
      // ❗ Không có trong dictionary → tự sinh
      typeInput.value = "phrase";
      meaningInput.value = await translateToVietnamese(word);
      exampleInput.value = generateExample(word, "phrase");
    }
  } catch (e) {
    // ❗ Có lỗi → fallback luôn
    typeInput.value = "phrase";
    meaningInput.value = await translateToVietnamese(word);
    exampleInput.value = generateExample(word, "phrase");
  }
});

// ➕ Thêm từ
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

  document.getElementById("word").value = "";
  document.getElementById("type").value = "";
  document.getElementById("meaning").value = "";
  document.getElementById("example").value = "";

  renderTable();
});

// 🧾 Hiển thị bảng từ
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
      <td><button onclick="removeWord(${index})">❌</button></td>
    `;
    tbody.appendChild(row);
  });

  const message = document.getElementById("story-message");
  message.innerHTML = vocabList.length === 0
    ? `<div class="message">Bạn chưa có từ nào để luyện tập.</div>`
    : "";
}

// ❌ Xoá từ
function removeWord(index) {
  vocabList.splice(index, 1);
  localStorage.setItem("vocabList", JSON.stringify(vocabList));
  renderTable();
}

// ✍️ Tạo đoạn văn học thuật
document.getElementById("generate-story").addEventListener("click", function () {
  if (vocabList.length === 0) {
    alert("Bạn chưa có từ nào để luyện tập.");
    return;
  }

  const words = vocabList.map(item => item.word);
  const story = `In modern academic discussions, terms like ${words.join(", ")} are frequently used to convey complex ideas in concise ways.`;

  const highlighted = words.reduce((text, w) => {
    const regex = new RegExp(`\\b(${w})\\b`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  }, story);

  document.getElementById("story-output").innerHTML = highlighted;
});
