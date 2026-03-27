const form = document.getElementById("summary-form");
const statusText = document.getElementById("status-text");
const summaryOutput = document.getElementById("summary-output");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const url = String(formData.get("url") || "").trim();

  statusText.textContent = "Nacitam stranku a pocitam frekvence slov...";
  summaryOutput.innerHTML = "";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analyzu se nepodarilo vytvorit.");
    }

    statusText.textContent = "Hotovo.";
    summaryOutput.innerHTML = data.topWords
      .map((item) => `<li><strong>${item.word}</strong> (${item.count})</li>`)
      .join("");
  } catch (error) {
    statusText.textContent = "Doslo k chybe.";
    const message = error instanceof Error ? error.message : "Neznama chyba.";
    summaryOutput.innerHTML = `<li>${message}</li>`;
  }
});
