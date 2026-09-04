document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#awardApplication");
  if (!form) return;
  const steps = [...form.querySelectorAll(".form-step")];
  const bars = [...form.querySelectorAll(".form-progress span")];
  const next = form.querySelector("#formNext");
  const back = form.querySelector("#formBack");
  const submit = form.querySelector("#submitApplication");
  const printButton = form.querySelector("#printApplication");
  const awardInputs = [...form.querySelectorAll('input[name="awardType"]')];
  let current = 0;

  const field = name => form.elements[name];
  const value = name => field(name)?.value?.trim() || "";
  const selectedAward = () => form.querySelector('input[name="awardType"]:checked')?.value || "";
  const labelForAward = () => ({excellence:"Award for Publication Excellence",citation:"Award for Publication Citation",book:"i-Proclaim Book Award"}[selectedAward()] || "Not selected");

  const evidenceRequired = {
    excellence: ["publicationLinks", "contribution"],
    citation: ["citationScholar", "citations", "hindex", "i10index"],
    book: ["bookTitle", "bookAuthor", "coverLink", "contentLink"]
  };

  function configureAward() {
    const award = selectedAward();
    form.querySelectorAll("[data-evidence]").forEach(panel => panel.hidden = panel.dataset.evidence !== award);
    form.querySelectorAll("[data-reg]").forEach(option => {
      const show = option.dataset.reg === (award === "book" ? "book" : "event");
      option.hidden = !show;
      if (!show) option.querySelector("input").checked = false;
    });
    updateScore();
  }

  function isValidUrl(text) {
    if (!text) return false;
    try { const url = new URL(text); return url.protocol === "http:" || url.protocol === "https:"; }
    catch { return false; }
  }

  function calculateScore() {
    const baseNames = ["applicantName", "email", "whatsapp", "institution", "country", "discipline", "awardType"];
    const base = baseNames.filter(name => value(name)).length / baseNames.length * 38;
    const award = selectedAward();
    let evidence = 0;
    if (award === "excellence") {
      const required = [value("publicationLinks"), value("contribution")].filter(Boolean).length / 2 * 30;
      const profiles = [value("orcid"), value("doi"), value("scholar"), value("scopusWos")].filter(isValidUrl).length / 4 * 17;
      evidence = required + profiles;
    } else if (award === "citation") {
      evidence = (isValidUrl(value("citationScholar")) ? 15 : 0) + (+value("citations") >= 500 ? 10 : 0) + (+value("hindex") >= 5 ? 10 : 0) + (+value("i10index") >= 10 ? 10 : 0) + (isValidUrl(value("citationOrcid")) ? 2 : 0);
    } else if (award === "book") {
      const required = [value("bookTitle"), value("bookAuthor"), value("coverLink"), value("contentLink")].filter(Boolean).length / 4 * 38;
      const record = isValidUrl(value("bookLink")) || field("printOnly")?.checked ? 9 : 0;
      evidence = required + record;
    }
    const registration = form.querySelector("input[name=registration]:checked") ? 10 : 0;
    const declaration = form.querySelector("#accuracy")?.checked ? 5 : 0;
    return Math.min(100, Math.round(base + evidence + registration + declaration));
  }

  function updateScore() {
    const score = calculateScore();
    form.querySelector("#scoreValue").textContent = score;
    form.querySelector("#scoreRing").style.setProperty("--score", `${score}%`);
    const title = form.querySelector("#scoreTitle");
    const message = form.querySelector("#scoreMessage");
    if (selectedAward() === "citation" && value("citationScholar") && (+value("citations") < 500 || +value("hindex") < 5 || +value("i10index") < 10)) {
      title.textContent = "Threshold not yet met";
      message.textContent = "Citation applicants must meet all three minimum figures before submission.";
    } else if (score >= 85) {
      title.textContent = "Application looks ready";
      message.textContent = "Review every detail and working link before submitting for independent verification.";
    } else if (score >= 55) {
      title.textContent = "Good progress";
      message.textContent = "Add the remaining evidence and select the appropriate registration preference.";
    } else {
      title.textContent = "Build your evidence";
      message.textContent = "Complete the applicant details and add verifiable links to improve readiness.";
    }
  }

  function validateCurrent() {
    const inputs = [...steps[current].querySelectorAll("input,select,textarea")].filter(el => !el.closest("[hidden]"));
    if (current === 0 && !selectedAward()) { alert("Please select one award to continue."); return false; }
    if (current === 1) {
      for (const name of ["applicantName", "email", "whatsapp", "institution", "country", "discipline"]) {
        if (!value(name)) { field(name).reportValidity(); return false; }
      }
      if (!field("email").checkValidity()) { field("email").reportValidity(); return false; }
    }
    if (current === 2) {
      const award = selectedAward();
      for (const name of evidenceRequired[award] || []) {
        if (!value(name)) { field(name).focus(); field(name).setCustomValidity("Please complete this required evidence field."); field(name).reportValidity(); field(name).setCustomValidity(""); return false; }
      }
      if (award === "citation") {
        if (!isValidUrl(value("citationScholar")) || +value("citations") < 500 || +value("hindex") < 5 || +value("i10index") < 10) {
          form.querySelector("#applicationStatus");
          alert("Citation Award eligibility requires a public Google Scholar link, at least 500 citations, h-index 5 and i10-index 10.");
          return false;
        }
      }
      if (award === "book" && !isValidUrl(value("coverLink"))) { alert("Please provide a valid shareable link to the book-cover image."); return false; }
    }
    if (current === 3 && !form.querySelector("input[name=registration]:checked")) { alert("Please select a registration preference. No payment is taken now."); return false; }
    return inputs.every(el => el.checkValidity());
  }

  function buildSummary() {
    const registration = form.querySelector("input[name=registration]:checked")?.value || "Not selected";
    const lines = [
      "i-PROCLAIM AWARD APPLICATION SUMMARY",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Award: ${labelForAward()}`,
      `Applicant / nominee: ${value("applicantName")}`,
      `Nominator: ${value("nominatorName") || "Self-nomination"}`,
      `Institution: ${value("institution")}`,
      `Country: ${value("country")}`,
      `Discipline: ${value("discipline")}`,
      `Email: ${value("email")}`,
      `Applicant WhatsApp: ${value("whatsapp")}`,
      "",
      "EVIDENCE"
    ];
    if (selectedAward() === "excellence") lines.push(`Publication links: ${value("publicationLinks")}`, `ORCID: ${value("orcid") || "—"}`, `DOI: ${value("doi") || "—"}`, `Google Scholar: ${value("scholar") || "—"}`, `Scopus/WoS: ${value("scopusWos") || "—"}`, `Contribution: ${value("contribution")}`);
    if (selectedAward() === "citation") lines.push(`Google Scholar: ${value("citationScholar")}`, `Citations: ${value("citations")}`, `h-index: ${value("hindex")}`, `i10-index: ${value("i10index")}`, `ORCID/institutional profile: ${value("citationOrcid") || "—"}`);
    if (selectedAward() === "book") lines.push(`Book: ${value("bookTitle")}`, `Author(s): ${value("bookAuthor")}`, `Publication link: ${value("bookLink") || "Print-only"}`, `Cover: ${value("coverLink")}`, `Content/sample: ${value("contentLink")}`);
    lines.push("", `Registration preference: ${registration}`, `Optional media coverage: ${field("mediaCoverage")?.checked ? "Yes — additional US$500" : "No"}`, `Preliminary readiness score: ${calculateScore()}%`);
    const text = lines.join("\n");
    form.querySelector("#applicationSummary").textContent = text;
    return text;
  }

  function showStep(index) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => step.classList.toggle("active", i === current));
    bars.forEach((bar, i) => bar.classList.toggle("active", i <= current));
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    printButton.hidden = current !== steps.length - 1;
    if (current === 4) buildSummary();
    window.scrollTo({top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth"});
  }

  next.addEventListener("click", () => { if (validateCurrent()) showStep(current + 1); });
  back.addEventListener("click", () => showStep(current - 1));
  printButton.addEventListener("click", () => { buildSummary(); window.print(); });
  awardInputs.forEach(input => input.addEventListener("change", configureAward));
  form.addEventListener("input", updateScore);
  form.addEventListener("change", updateScore);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!field("accuracy").checked) { field("accuracy").reportValidity(); return; }
    const summary = buildSummary();
    const warning = "SECURITY NOTICE ACKNOWLEDGED: I will use WhatsApp messaging only and will not call.";
    const whatsappUrl = `https://wa.me/601156517351?text=${encodeURIComponent(summary + "\n\n" + warning)}`;
    form.querySelector("#applicationStatus").textContent = "Your application summary is ready. WhatsApp is opening in a new tab; press Send there to complete submission.";
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });

  const queryAward = new URLSearchParams(location.search).get("award");
  if (["excellence", "citation", "book"].includes(queryAward)) {
    const target = form.querySelector(`input[name="awardType"][value="${queryAward}"]`);
    if (target) target.checked = true;
  }
  configureAward();
});
