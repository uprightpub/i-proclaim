document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#awardApplication");
  if (!form) return;
  const next = form.querySelector("#formNext"), back = form.querySelector("#formBack"), submit = form.querySelector("#submitApplication"), printButton = form.querySelector("#printApplication"), progress = form.querySelector(".form-progress");
  let current = 0, activeSteps = [];
  const field = name => form.elements[name];
  const value = name => field(name)?.value?.trim() || "";
  const checked = name => Boolean(field(name)?.checked);
  const award = () => form.querySelector('input[name="awardType"]:checked')?.value || "";
  const awardLabel = () => ({excellence:"Award for Publication Excellence",citation:"Award for Publication Citation",book:"i-Proclaim Book Award"}[award()] || "Not selected");
  const validUrl = text => { try { const url = new URL(text); return ["http:","https:"].includes(url.protocol); } catch { return false; } };
  const stepMap = {
    excellence:["award","applicant","excellence-evidence","registration","declaration","review"],
    citation:["award","applicant","citation-evidence","registration","declaration","review"],
    book:["award","applicant","book-details","book-files","registration","declaration","review"]
  };

  function configureSteps(reset=false) {
    const ids = stepMap[award()] || ["award"];
    activeSteps = ids.map(id => form.querySelector(`[data-step-id="${id}"]`));
    form.querySelectorAll(".form-step").forEach(step => { step.hidden = !ids.includes(step.dataset.stepId); step.classList.remove("active"); });
    if (reset) current = 0;
    current = Math.min(current, activeSteps.length-1);
    progress.innerHTML = activeSteps.map(() => "<span></span>").join("");
    form.querySelectorAll("[data-reg]").forEach(option => {
      const show = option.dataset.reg === (award() === "book" ? "book" : "event");
      option.hidden = !show;
      if (!show) option.querySelector("input").checked = false;
    });
    showStep(current,false); updateScores();
  }

  function requiredForAward() {
    const common = ["awardType","applicantName","email","whatsapp","institution","country","address","discipline","scientistCategory","registration","accuracy","categoryConsent","messageOnly"];
    if (award()==="citation") return [...common,"citationScholar","citations","i10index","hindex"];
    if (award()==="book") return [...common,"bookLink","bookTitle","bookAuthor","publicationYear","publisherName","publisherAddress","onlineMarkets","bookCover","bookContent"];
    if (award()==="excellence") return [...common,"publicationUrl","publicationCount","contribution"];
    return ["awardType"];
  }

  function hasValue(name) {
    const control = field(name); if (!control) return false;
    if (control instanceof RadioNodeList) return Boolean(control.value);
    if (control.type==="checkbox") return control.checked;
    if (control.type==="file") return control.files.length>0;
    return Boolean(control.value.trim());
  }
  const completionScore = () => { const required=requiredForAward(); return Math.round(required.filter(hasValue).length/required.length*100); };

  function readinessScore() {
    if (award()==="citation") {
      const citations=Number(value("citations")), i10=Number(value("i10index")), h=Number(value("hindex"));
      let score=Math.min(50,citations/500*50)+Math.min(25,i10/10*25)+Math.min(20,h/5*20);
      if(citations>=1000) score+=5; else if(citations>=900) score+=4; else if(citations>=800) score+=3; else if(citations>=700) score+=2; else if(citations>=600) score+=1;
      return Math.min(100,Math.round(score));
    }
    if (award()==="excellence") {
      let score=validUrl(value("publicationUrl"))?40:0;
      score+=Math.min(20,Number(value("publicationCount"))/10*20);
      score+=validUrl(value("googleScholarUrl"))?10:0; score+=validUrl(value("scopusUrl"))?10:0; score+=validUrl(value("wosUrl"))?10:0; score+=validUrl(value("orcidUrl"))?10:0;
      return Math.min(100,Math.round(score));
    }
    if (award()==="book") {
      const details=["bookLink","bookTitle","bookAuthor","publicationYear","publisherName","publisherAddress","onlineMarkets"];
      let score=details.filter(hasValue).length/details.length*60;
      score+=hasValue("bookCover")?15:0; score+=hasValue("bookContent")?15:0; score+=hasValue("registration")?10:0;
      return Math.min(100,Math.round(score));
    }
    return 0;
  }

  function updateScores() {
    const completion=completionScore(), readiness=readinessScore();
    form.querySelector("#completionValue").textContent=completion; form.querySelector("#completionRing").style.setProperty("--score",`${completion}%`);
    form.querySelector("#scoreValue").textContent=readiness; form.querySelector("#scoreRing").style.setProperty("--score",`${readiness}%`);
    const title=form.querySelector("#scoreTitle"), message=form.querySelector("#scoreMessage");
    if(!award()){title.textContent="Start your application";message.textContent="Select an award to open its tailored application and scoring criteria.";}
    else if(award()==="citation"&&(Number(value("citations"))<500||Number(value("i10index"))<10||Number(value("hindex"))<5)){title.textContent="Threshold not yet met";message.textContent="Citation applicants need 500 citations, i10-index 10 and h-index 5 to meet the minimum threshold.";}
    else if(readiness>=95){title.textContent="Strong preliminary readiness";message.textContent="Your entered information meets the main scoring criteria. Final recognition remains subject to verification.";}
    else if(readiness>=70){title.textContent="Good preliminary readiness";message.textContent="Add any available verifiable links or remaining materials to strengthen the application.";}
    else{title.textContent="Build your evidence";message.textContent="Complete the relevant evidence fields to improve your preliminary readiness score.";}
  }

  function validateCurrent() {
    const step=activeSteps[current];
    const controls=[...step.querySelectorAll("input,select,textarea")].filter(control=>!control.closest("[hidden]"));
    if(step.dataset.stepId==="award"&&!award()){alert("Please select one award to continue.");return false;}
    if(step.dataset.stepId==="excellence-evidence"){
      if(!validUrl(value("publicationUrl"))){alert("Please enter at least one valid publication or profile URL.");field("publicationUrl").focus();return false;}
      if(!value("publicationCount")){alert("Please enter the total publication count.");field("publicationCount").focus();return false;}
      if(!value("contribution")){alert("Please add the contribution and significance statement.");field("contribution").focus();return false;}
    }
    if(step.dataset.stepId==="citation-evidence"){
      if(!validUrl(value("citationScholar"))){alert("Please enter a valid public Google Scholar profile URL.");field("citationScholar").focus();return false;}
      if(Number(value("citations"))<500||Number(value("i10index"))<10||Number(value("hindex"))<5){alert("Citation Award eligibility requires at least 500 citations, i10-index 10 and h-index 5.");return false;}
    }
    if(step.dataset.stepId==="book-details"&&!validUrl(value("bookLink"))){alert("Please enter a valid online book URL.");field("bookLink").focus();return false;}
    if(step.dataset.stepId==="registration"&&!form.querySelector('input[name="registration"]:checked')){alert("Please select a registration preference.");return false;}
    for(const control of controls){if(control.required&&!control.checkValidity()){control.reportValidity();return false;}}
    return true;
  }

  function summaryLines() {
    const registration=form.querySelector('input[name="registration"]:checked')?.value||"Not selected";
    const lines=["i-PROCLAIM AWARD APPLICATION SUMMARY",`Generated: ${new Date().toLocaleString()}`,`Award: ${awardLabel()}`,`Certificate category: ${value("scientistCategory")}`,"",`Applicant / nominee: ${value("applicantName")}`,`Nominator: ${value("nominatorName")||"Self-nomination"}`,`Institution / organisation: ${value("institution")}`,`Country: ${value("country")}`,`Address: ${value("address")}`,`Discipline: ${value("discipline")}`,`Email: ${value("email")}`,`WhatsApp: ${value("whatsapp")}`,"","AWARD EVIDENCE"];
    if(award()==="citation") lines.push(`Google Scholar: ${value("citationScholar")}`,`Total citations: ${value("citations")}`,`i10-index: ${value("i10index")}`,`h-index: ${value("hindex")}`);
    if(award()==="excellence") lines.push(`Primary publication/profile: ${value("publicationUrl")}`,`Publication count: ${value("publicationCount")}`,`Google Scholar: ${value("googleScholarUrl")||"—"}`,`Scopus: ${value("scopusUrl")||"—"}`,`Web of Science: ${value("wosUrl")||"—"}`,`ORCID: ${value("orcidUrl")||"—"}`,`Additional links: ${value("additionalPublicationLinks")||"—"}`,`Contribution: ${value("contribution")}`);
    if(award()==="book") lines.push(`Book title: ${value("bookTitle")}`,`Author(s): ${value("bookAuthor")}`,`Online link: ${value("bookLink")}`,`Year: ${value("publicationYear")}`,`Publisher: ${value("publisherName")}`,`Publisher address: ${value("publisherAddress")}`,`Online markets: ${value("onlineMarkets")}`,`Cover file: ${field("bookCover")?.files[0]?.name||"—"}`,`Contents/manuscript file: ${field("bookContent")?.files[0]?.name||"—"}`);
    lines.push("",`Registration preference: ${registration}`,`Optional media coverage: ${checked("mediaCoverage")?"Yes — additional US$500":"No"}`,`Form completed: ${completionScore()}%`,`Preliminary award-readiness score: ${readinessScore()}%`,"","Declaration: Information is accurate and verifiable; category may be stated on the certificate; WhatsApp messaging only.");
    return lines;
  }
  function buildSummary(){const text=summaryLines().join("\n");form.querySelector("#applicationSummary").textContent=text;return text;}

  function showStep(index,scroll=true){
    current=Math.max(0,Math.min(index,activeSteps.length-1)); form.querySelectorAll(".form-step").forEach(step=>step.classList.remove("active")); activeSteps[current].classList.add("active");
    [...progress.children].forEach((bar,index)=>bar.classList.toggle("active",index<=current)); back.hidden=current===0;
    const final=current===activeSteps.length-1; next.hidden=final; submit.hidden=!final; printButton.hidden=!final; if(final)buildSummary();
    if(scroll)window.scrollTo({top:form.getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"});
  }

  next.addEventListener("click",()=>{if(validateCurrent())showStep(current+1);}); back.addEventListener("click",()=>showStep(current-1));
  printButton.addEventListener("click",()=>{buildSummary();window.print();});
  form.querySelectorAll('input[name="awardType"]').forEach(input=>input.addEventListener("change",()=>configureSteps(true)));
  form.addEventListener("input",updateScores); form.addEventListener("change",updateScores);
  form.addEventListener("submit",event=>{event.preventDefault();if(!validateCurrent())return;const summary=buildSummary();const url=`https://wa.me/601156517351?text=${encodeURIComponent(summary+"\n\nPlease attach the saved one-page PDF and any requested files in this chat.")}`;form.querySelector("#applicationStatus").textContent="WhatsApp is opening with your application text. Please attach your saved PDF and supporting files before sending.";window.open(url,"_blank","noopener,noreferrer");});
  const queryAward=new URLSearchParams(location.search).get("award"); if(["excellence","citation","book"].includes(queryAward)){const target=form.querySelector(`input[name="awardType"][value="${queryAward}"]`);if(target)target.checked=true;}
  configureSteps(false);
});
