const form = document.getElementById('vocab-form');
const tableBody = document.querySelector('#vocab-table tbody');
const storyOutput = document.getElementById('story-output');

// Load từ vựng từ localStorage
let vocabList = JSON.parse(localStorage.getItem('vocabList')) || [];
renderTable();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const word = document.getElementById('word').value;
  const type = document.getElementById('type').value;
  const meaning = document.getElementById('meaning').value;
  const example = document.getElementById('example').value;

  vocabList.push({ word, type, meaning, example });
  localStorage.setItem('vocabList', JSON.stringify(vocabList));
  form.reset();
  renderTable();
});

function renderTable() {
  tableBody.innerHTML = '';
  vocabList.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.word}</td>
      <td>${item.type}</td>
      <td>${item.meaning}</td>
      <td>${item.example}</td>
      <td><button onclick="deleteWord(${index})">❌</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteWord(index) {
  vocabList.splice(index, 1);
  localStorage.setItem('vocabList', JSON.stringify(vocabList));
  renderTable();
}

// Tạo đoạn văn ngắn
document.getElementById('generate-story').addEventListener('click', () => {
  if (vocabList.length === 0) {
    storyOutput.innerText = 'Bạn chưa có từ nào để luyện tập.';
    return;
  }

  const selectedWords = vocabList.slice(0, 5);
  const story = `Hôm nay chúng ta cùng ôn lại: ${selectedWords.map(w => `"${w.word}" (${w.type}): ${w.meaning}`).join(', ')}. 
  Ví dụ: ${selectedWords.map(w => w.example).join(' ')}`;

  storyOutput.innerText = story;
});
