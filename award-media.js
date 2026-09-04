document.addEventListener("DOMContentLoaded", () => {
  const base = "";
  const mediaSets = {
    book: {
      heading: "Book Award stories",
      intro: "A selection of i-Proclaim Book Award recognitions. Select any video to watch; the next story starts automatically.",
      videos: [
        ["youtube","dHNYOn85YZw","i-Proclaim Book Award"],
        ["youtube","awk8MSSMBVE","Book Award recognition"],
        ["youtube","t7i_hxEyXMg","Book Award story"],
        ["youtube","LWHStY--LF8","Recognising an awarded book"],
        ["youtube","2iH5eIQNIis","i-Proclaim Book Award highlight"]
      ]
    },
    excellence: {
      heading: "Publication Excellence in focus",
      intro: "Past award presentations and moments from the i-Proclaim research community.",
      videos: [
        ["local","excellence-dr-halim","Dr. Halim"], ["local","excellence-dr-ismail","Dr. Ismail"],
        ["local","excellence-dr-leong","Dr. Leong"], ["local","excellence-dr-ng-poh","Dr. Ng Poh"],
        ["local","excellence-dr-razimi","Dr. Razimi"], ["local","excellence-dr-sobuj-kanti","Dr. Sobuj Kanti"],
        ["local","excellence-dr-sofiullah","Dr. Sofiullah"], ["local","excellence-felicia-lim","Felicia Lim"],
        ["local","excellence-group-dr-intan","Group with Dr. Intan"], ["local","excellence-group-dr-mostafiz","Group with Dr. Mostafiz"]
      ],
      photos: [
        ["excellence-trophies.jpg","Award trophies prepared for presentation"],
        ["excellence-registration.jpg","Research Meet registration and delegate support"],
        ["excellence-hospitality.jpg","Behind the scenes at the Research Meet"],
        ["excellence-presentation.jpg","Publication Excellence award presentation"]
      ]
    },
    citation: {
      heading: "Citation Award moments",
      intro: "Recognition, presentation and community moments from past i-Proclaim Annual Research Awards.",
      videos: [
        ["local","citation-event-video-4","ARA 2017 · Kuala Lumpur · Video 4"],
        ["local","citation-event-video-5","ARA 2017 · Kuala Lumpur · Video 5"],
        ["local","citation-annual-award-2017","Annual Research Award 2017"],
        ["local","citation-award-2017","Award for Publication Citation 2017"],
        ["local","citation-ng-poh-kiet","Ng Poh Kiet"],
        ["local","citation-prof-saidur-rahman","Prof. Saidur Rahman"]
      ],
      photos: [
        ["citation-coordination.jpg","Programme coordination at the Research Meet"],
        ["citation-awardees-group.jpg","Annual Research Award recipients"],
        ["citation-trophy-preparation.jpg","Trophies prepared for awardees"],
        ["citation-awardees-pair.jpg","Citation Award recipients"],
        ["citation-awardees-trio.jpg","Award recipients at the presentation"],
        ["citation-networking.jpg","Research Meet networking and hospitality"]
      ]
    },
    events: {
      heading: "Research Meet & conference archive",
      intro: "Highlights from i-Proclaim conferences, graduate research meetings and scholarly events.",
      videos: [
        ["youtube","yGRsGp03gfY","i-Proclaim Conference Highlight 01"], ["youtube","xbhQb331Cn4","i-Proclaim Conference Highlight 02"],
        ["youtube","WVvLShNWhBY","i-Proclaim Conference Highlight 03"], ["youtube","LIueK9kFA0g","i-Proclaim Conference Highlight 04"],
        ["youtube","jg3uh1JeHwY","i-Proclaim Conference Highlight 05"], ["youtube","lj3TVfZ3xz0","i-Proclaim Conference Highlight 06"],
        ["youtube","_6uuoGCtEzg","i-Proclaim Conference Highlight 07"], ["youtube","kTBk7RASJfo","i-Proclaim Conference Highlight 08"],
        ["youtube","L6KpxEbeuE8","i-Proclaim Conference Highlight 09"], ["youtube","9jbHvceKZ2g","i-Proclaim Conference Highlight 10"],
        ["youtube","64kO5uRAzJg","i-Proclaim Conference Highlight 11"], ["youtube","V7hTZUoDrEw","i-Proclaim Conference Highlight 12"]
      ],
      photos: [
        ["event-highlight-1.jpg","Scholarly conference session"], ["event-highlight-2.jpg","Research community gathering"],
        ["event-highlight-4.jpg","Research Meet participants"], ["event-highlight-5.jpg","International delegate connection"],
        ["event-highlight-6.jpg","Research presentation and discussion"]
      ]
    }
  };

  let activeVideos = [], activeVideoIndex = 0, player = null, photoList = [], photoIndex = 0;
  const modal = document.createElement("div");
  modal.className = "media-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `<button class="media-modal-close" type="button" aria-label="Close">×</button><button class="media-modal-prev" type="button" aria-label="Previous">‹</button><div class="media-modal-stage"></div><button class="media-modal-next" type="button" aria-label="Next">›</button><p class="media-modal-caption"></p>`;
  document.body.appendChild(modal);
  const stage = modal.querySelector(".media-modal-stage");
  const caption = modal.querySelector(".media-modal-caption");

  function openModal() { modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); }
  function closeModal() { if (player?.destroy) player.destroy(); player = null; stage.innerHTML = ""; modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); }
  modal.querySelector(".media-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  function ensureYouTube(callback) {
    if (window.YT?.Player) return callback();
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (previous) previous(); callback(); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(script);
    }
  }
  function playVideo(index) {
    activeVideoIndex = (index + activeVideos.length) % activeVideos.length;
    const [type, id, title] = activeVideos[activeVideoIndex];
    if (player?.destroy) player.destroy(); player = null; stage.innerHTML = ""; caption.textContent = title;
    modal.classList.remove("photo-mode"); openModal();
    if (type === "local") {
      const video = document.createElement("video"); video.controls = true; video.autoplay = true; video.playsInline = true; video.src = `${base}${id}.mp4`; video.poster = `${base}${id}.jpg`; video.addEventListener("ended", () => playVideo(activeVideoIndex + 1)); stage.appendChild(video);
    } else {
      const holder = document.createElement("div"); holder.id = `youtube-player-${Date.now()}`; stage.appendChild(holder);
      ensureYouTube(() => { player = new YT.Player(holder.id,{videoId:id,playerVars:{autoplay:1,rel:0,playsinline:1},events:{onStateChange:event=>{if(event.data===YT.PlayerState.ENDED) playVideo(activeVideoIndex+1);}}}); });
    }
  }

  function openPhoto(index) {
    photoIndex = (index + photoList.length) % photoList.length;
    const [src, alt, direct=false] = photoList[photoIndex];
    if (player?.destroy) player.destroy(); player = null; stage.innerHTML = "";
    const image = document.createElement("img"); image.src = direct ? src : `${base}${src}`; image.alt = alt; stage.appendChild(image); caption.textContent = alt; modal.classList.add("photo-mode"); openModal();
  }
  modal.querySelector(".media-modal-prev").addEventListener("click", () => modal.classList.contains("photo-mode") ? openPhoto(photoIndex-1) : playVideo(activeVideoIndex-1));
  modal.querySelector(".media-modal-next").addEventListener("click", () => modal.classList.contains("photo-mode") ? openPhoto(photoIndex+1) : playVideo(activeVideoIndex+1));
  document.addEventListener("keydown", e => { if (!modal.classList.contains("open")) return; if(e.key==="Escape") closeModal(); if(e.key==="ArrowLeft") modal.querySelector(".media-modal-prev").click(); if(e.key==="ArrowRight") modal.querySelector(".media-modal-next").click(); });

  document.querySelectorAll("[data-award-media]").forEach(section => {
    const set = mediaSets[section.dataset.awardMedia]; if (!set) return;
    const cards = set.videos.map(([type,id,title],index) => `<button class="award-video-card" type="button" data-video-index="${index}"><span class="award-video-thumb" style="background-image:url('${type === "youtube" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : `${base}${id}.jpg`}')"><i>▶</i></span><strong>${title}</strong><small>Watch video</small></button>`).join("");
    section.innerHTML = `<div class="award-media-heading"><div><span class="award-kicker">Media archive</span><h2>${set.heading}</h2><p>${set.intro}</p></div><div class="award-media-controls"><button type="button" data-track-prev aria-label="Previous videos">‹</button><button type="button" data-track-next aria-label="Next videos">›</button></div></div><div class="award-video-window"><div class="award-video-track">${cards}${cards}</div></div>${set.photos ? `<div class="award-photo-heading"><span class="award-kicker">Photo archive</span><h2>Moments from the programme</h2></div><div class="award-photo-grid">${set.photos.map(([src,alt],i)=>`<button type="button" data-photo-index="${i}"><img src="${base}${src}" alt="${alt}" loading="lazy"><span>${alt}</span></button>`).join("")}</div>` : ""}`;
    const track = section.querySelector(".award-video-track");
    const videoWindow = section.querySelector(".award-video-window");
    section.querySelectorAll("[data-video-index]").forEach(button => button.addEventListener("click", () => { activeVideos=set.videos; playVideo(+button.dataset.videoIndex); }));
    section.querySelector("[data-track-prev]").addEventListener("click", () => { track.style.animationPlayState="paused"; videoWindow.scrollBy({left:-330,behavior:"smooth"}); });
    section.querySelector("[data-track-next]").addEventListener("click", () => { track.style.animationPlayState="paused"; videoWindow.scrollBy({left:330,behavior:"smooth"}); });
    section.querySelectorAll("[data-photo-index]").forEach(button => button.addEventListener("click", () => { photoList=set.photos; openPhoto(+button.dataset.photoIndex); }));
  });

  document.querySelectorAll("[data-certificate-preview]").forEach((button,index,buttons) => button.addEventListener("click", () => {
    photoList=[...buttons].map(item=>[item.dataset.certificatePreview,item.querySelector("img").alt,true]); openPhoto(index);
  }));
});
