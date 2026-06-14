const ASSETS_BASE_URL = "assets/gallery/";
const PHP_BRIDGE_URL = ASSETS_BASE_URL + "get_assets.php";

const MEDIA_EXTENSIONS = {
  IMAGE: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
  VIDEO: ["mp4", "webm", "mov", "ogg"],
};

let galleryMedia = [];
let currentIndex = 0;

export async function loadGalleryMedia() {
  console.log("Fetching gallery assets via PHP bridge...");
  try {
    const response = await fetch(PHP_BRIDGE_URL);
    if (!response.ok) {
      console.warn("PHP bridge not reachable, using fallback.");
      fallbackDiscovery();
      return;
    }

    const fileNames = await response.json();
    if (!Array.isArray(fileNames)) {
      console.warn("Invalid response from PHP bridge, using fallback.");
      fallbackDiscovery();
      return;
    }

    const discoveredMedia = [];

    fileNames.forEach((fileName) => {
      const parts = fileName.split(".");
      if (parts.length < 2) return;
      const ext = parts.pop().toLowerCase();
      let type = null;

      if (MEDIA_EXTENSIONS.IMAGE.includes(ext)) {
        type = "IMAGE";
      } else if (MEDIA_EXTENSIONS.VIDEO.includes(ext)) {
        type = "VIDEO";
      }

      if (type) {
        discoveredMedia.push({
          url: ASSETS_BASE_URL + fileName,
          type: type,
          thumbnail: type === "VIDEO" ? ASSETS_BASE_URL + fileName : null,
        });
      }
    });

    if (discoveredMedia.length === 0) {
      fallbackDiscovery();
    } else {
      initializeGallery(discoveredMedia);
    }
  } catch (error) {
    console.error("Gallery discovery error:", error);
    fallbackDiscovery();
  }
}

function fallbackDiscovery() {
  const fallback = [
    { url: ASSETS_BASE_URL + "car1.jpg", type: "IMAGE" },
    { url: ASSETS_BASE_URL + "car2.jpg", type: "IMAGE" },
    { url: ASSETS_BASE_URL + "car3.jpg", type: "IMAGE" },
  ];
  initializeGallery(fallback);
}
function initializeGallery(media) {
  galleryMedia = media;
  currentIndex = 0;
  updateGalleryUI();
}

export function nextMedia() {
  if (galleryMedia.length === 0) return;
  currentIndex = (currentIndex + 1) % galleryMedia.length;
  updateGalleryUI();
}

export function prevMedia() {
  if (galleryMedia.length === 0) return;
  currentIndex = (currentIndex - 1 + galleryMedia.length) % galleryMedia.length;
  updateGalleryUI();
}

function updateGalleryUI() {
  const media = galleryMedia;
  if (!media || media.length === 0) return;

  $(".image-container").addClass("blink");

  setTimeout(() => {
    const len = media.length;
    renderMedia("#img1", media[(currentIndex - 1 + len) % len]);
    renderMedia("#img2", media[currentIndex]);
    renderMedia("#img3", media[(currentIndex + 1) % len]);
  }, 250);

  setTimeout(() => {
    $(".image-container").removeClass("blink");
  }, 500);
}

function renderMedia(containerId, item) {
  const $container = $(containerId).parent();
  $container.empty();

  if (item.type === "VIDEO") {
    const $video = $("<video>", {
      src: item.url,
      autoplay: true,
      loop: true,
      muted: true,
      playsinline: true,
      poster: item.thumbnail,
      controls: true,
      class: "gallery-video",
    });
    $video[0].muted = true;
    $video.attr("id", containerId.replace("#", ""));
    $container.append($video);
  } else {
    const $img = $("<img>", {
      src: item.url,
      id: containerId.replace("#", ""),
      alt: "Gallery Image",
    });
    $container.append($img);
  }
}
