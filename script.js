const pages = [
  ["index.html", "Home"],
  ["journals.html", "Journals"],
  ["awards.html", "Awards"],
  ["research-services.html", "Research Services"],
  ["research-visibility.html", "Research Visibility"]
];

function currentPage() {
  const file = location.pathname.split("/").pop();
  return file || "index.html";
}

function renderHeader() {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;
  const active = currentPage();
  target.className = "site-header";
  target.innerHTML = `<div class="header-inner">
    <a href="index.html" class="brand" aria-label="i-Proclaim Research Academy home">
      <img src="i-proclaim-logo.png" alt="i-Proclaim.com">
    </a>
    <button class="menu-button" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
    <nav class="nav" aria-label="Main navigation">${pages.map(([href,label]) => `<a href="${href}"${active === href ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
  </div>`;
  const button = target.querySelector(".menu-button");
  const nav = target.querySelector(".nav");
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.textContent = open ? "×" : "☰";
    button.setAttribute("aria-expanded", String(open));
  });
}

function renderFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.className = "footer";
  target.innerHTML = `<div class="footer-grid">
    <div class="footer-about"><a href="index.html" class="footer-brand"><img src="i-proclaim-logo.png" alt="i-Proclaim.com"></a><p>An independent platform supporting scholarly publication, research development, academic collaboration and responsible knowledge dissemination.</p><address class="contact-block"><strong>Contact</strong><a href="tel:+601156517351">+60 11-5651 7351</a><span>Kuala Lumpur, Malaysia</span><span>21-09-06, Taman Bukit Angkasa,<br>Off Pantai Dalam, 59200 Kuala Lumpur, Malaysia</span><strong>Support Email</strong><a href="mailto:support@i-proclaim.my">support@i-proclaim.my</a></address></div>
    <div><h2>Journals</h2><a href="journals.html">Our Journals</a><a href="for-authors.html">For Authors</a><a href="publishing-policies.html">Publishing Policies</a></div>
    <div><h2>Awards</h2><a href="publication-citation.html">Publication Citation</a><a href="publication-excellence.html">Publication Excellence</a><a href="book-awards.html">Book Awards</a><a href="eligibility-criteria.html">Eligibility Criteria</a><a href="winner-benefits.html">What Do Winners Receive?</a><a href="apply-award.html">Apply for an Award</a><a href="events-research-meet.html">Events &amp; Research Meet</a></div>
    <div><h2>Research Services</h2><a href="research-services.html">Publishing Support</a><span>Digital Library Support</span><span>Conferences</span><span>Society Partnerships</span></div>
    <div><h2>Visibility</h2><a href="research-visibility.html">Profile Support</a><a href="https://medium.com/@abcprojects" target="_blank" rel="noreferrer">Research Insights</a><a href="https://abcprojects.org/immigration-support/" target="_blank" rel="noreferrer">Immigration Profile</a><a href="https://abcprojects.org/resources/research-profile-checklist/" target="_blank" rel="noreferrer">Research Profile Checklist</a><a href="https://abcprojects.org/contact/" target="_blank" rel="noreferrer">Free Profile Review</a></div>
  </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} i-Proclaim Research Academy</span><span><a href="privacy.html">Privacy</a><a href="legal.html">Legal</a><a href="cookies.html">Cookies</a></span></div>`;
}

const videos = [
  ["ftyqNV5WpYQ", "Research and scholarly publishing"], ["apyH-9ZdiCI", "Academic collaboration"],
  ["AjI7rGRwPlE", "Research communication"], ["JohiaSMh_nU", "Publication support"],
  ["KD3fru6ctw0", "Knowledge dissemination"], ["kCorzxOWX2U", "Supporting researchers"],
  ["awk8MSSMBVE", "Research development"], ["dHNYOn85YZw", "Academic contribution"],
  ["t7i_hxEyXMg", "Publishing perspectives"], ["3zZa6oxRvYg", "The i-Proclaim community"]
];

function renderCarousels() {
  document.querySelectorAll("[data-video-carousel]").forEach(section => {
    let start = 0;
    const grid = section.querySelector(".video-grid");
    const draw = () => {
      grid.innerHTML = Array.from({length: 4}, (_, i) => videos[(start + i) % videos.length]).map(([id, caption]) => `<article class="video-card"><button class="video-thumb" type="button" data-video="${id}" data-caption="${caption}" style="background-image:url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')" aria-label="Play ${caption}"><span>▶</span></button><h3>${caption}</h3></article>`).join("");
      grid.querySelectorAll("[data-video]").forEach(button => button.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${button.dataset.video}?autoplay=1`;
        iframe.title = button.dataset.caption;
        iframe.allow = "autoplay; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;
        button.replaceWith(iframe);
      }));
    };
    section.querySelector("[data-prev]").addEventListener("click", () => { start = (start - 1 + videos.length) % videos.length; draw(); });
    section.querySelector("[data-next]").addEventListener("click", () => { start = (start + 1) % videos.length; draw(); });
    draw();
    setInterval(() => { start = (start + 1) % videos.length; draw(); }, 5000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  renderCarousels();
});
