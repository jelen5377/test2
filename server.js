import express from "express";
import { JSDOM } from "jsdom";

const app = express();
const port = process.env.PORT || 8787;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

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

function normalizeUrl(value) {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function extractPageText(html) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  document.querySelectorAll("script, style, noscript, svg").forEach((node) => {
    node.remove();
  });

  const title = document.querySelector("title")?.textContent?.trim() ?? "";
  const metaDescription =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      ?.trim() ?? "";

  const main =
    document.querySelector("main")?.textContent ??
    document.querySelector("article")?.textContent ??
    document.body?.textContent ??
    "";

  return [title, metaDescription, main]
    .filter(Boolean)
    .join("\n\n")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
}

function getTopWords(text) {
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

app.post("/api/analyze", async (req, res) => {
  const normalizedUrl = normalizeUrl(req.body?.url ?? "");

  if (!normalizedUrl) {
    return res.status(400).json({ error: "Zadej platnou URL adresu." });
  }

  try {
    const pageResponse = await fetch(normalizedUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; URLAnalyzerBot/1.0)"
      }
    });

    if (!pageResponse.ok) {
      return res.status(400).json({
        error: `Stranku se nepodarilo nacist. HTTP ${pageResponse.status}.`
      });
    }

    const html = await pageResponse.text();
    const pageText = extractPageText(html);

    if (!pageText) {
      return res.status(400).json({
        error: "Na strance se nepodarilo najit dostatek textu pro analyzu."
      });
    }

    const topWords = getTopWords(pageText);

    if (!topWords.length) {
      return res.status(400).json({
        error: "Na strance neni dost vhodnych slov pro frekvencni analyzu."
      });
    }

    return res.json({
      url: normalizedUrl,
      topWords
    });
  } catch (error) {
    return res.status(500).json({
      error: "Analyzu se nepodarilo vytvorit.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.listen(port, () => {
  console.log(`URL analyzer listening on http://localhost:${port}`);
});
