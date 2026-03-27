const textForm = document.getElementById("text-form");
const fetchButton = document.getElementById("fetch-button");
const urlInput = document.getElementById("url-input");
const textInput = document.getElementById("text-input");
const statusText = document.getElementById("status-text");
const summaryOutput = document.getElementById("summary-output");

const stopWords = new Set([
  "a", "aby", "aj", "ale", "anebo", "ani", "ano", "asi", "az", "bez", "by", "byl",
  "byla", "byli", "bylo", "byt", "ci", "clanek", "co", "dalsi", "do", "ho", "i",
  "jak", "jako", "je", "jeho", "jej", "jejich", "jen", "jenom", "ji", "jine",
  "jiz", "jsme", "jsou", "jste", "k", "kam", "kazdy", "kde", "kdy", "ktera",
  "ktere", "ktery", "ma", "mate", "me", "mezi", "mi", "mit", "mne", "mu", "na",
  "nad", "nam", "nas", "nasi", "ne", "nebo", "nez", "nic", "nich", "nim", "nove",
  "o", "od", "po", "pod", "podle", "pokud", "pro", "proto", "protoze", "prvni",
  "pred", "pres", "pri", "s", "se", "si", "stranka", "stranky", "svych", "ta",
  "tak", "take", "takze", "tam", "ten", "tento", "teto", "tim", "to", "tohle",
  "tom", "tomto", "tu", "tuto", "ty", "tyto", "u", "uz", "v", "vam", "vas", "ve",
  "vice", "vsak", "z", "za", "zde", "ze", "zejmena",
  "the", "and", "are", "but", "for", "from", "has", "have", "into", "its", "not",
  "that", "their", "them", "they", "this", "was", "were", "what", "when", "which",
  "with", "you", "your"
]);

function extractTopWords(text) {
  const counts = new Map();
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-zA-Z]{3,}/g) ?? [];

  for (const word of words) {
    if (stopWords.has(word)) {
      continue;
    }

    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0], "cs");
    })
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function renderWords(words) {
  if (!words.length) {
    summaryOutput.innerHTML = "<li>V textu neni dost vhodnych slov pro analyzu.</li>";
    return;
  }

  summaryOutput.innerHTML = words
    .map((item) => `<li><strong>${item.word}</strong> (${item.count})</li>`)
    .join("");
}

textForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = textInput.value.trim();

  if (!text) {
    statusText.textContent = "Nejdriv vloz text pro analyzu.";
    summaryOutput.innerHTML = "<li>Chybi text.</li>";
    return;
  }

  const words = extractTopWords(text);
  renderWords(words);
  statusText.textContent = "Hotovo.";
});

fetchButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();

  if (!url) {
    statusText.textContent = "Zadej URL adresu.";
    return;
  }

  statusText.textContent = "Zkousim nacist obsah z URL...";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("script, style, noscript, svg").forEach((node) => node.remove());
    const text = [
      doc.querySelector("title")?.textContent ?? "",
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      doc.body?.textContent ?? ""
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    textInput.value = text;
    statusText.textContent = "Obsah se podarilo nacist. Ted ho muzes rovnou analyzovat.";
  } catch {
    statusText.textContent = "Nacitani URL browser zablokoval nebo ho web nepovoluje. Vloz text rucne do pole niz.";
  }
});
