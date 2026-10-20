
const destinations = [
  {
    id: 1,
    name: "Ajanta Caves",
    region: "Maharashtra, Western India",
    category: "Ancient",
    coords: [20.5519, 75.7033],
    query: "Ajanta Caves mural painting",
    description: "Ancient Buddhist cave paintings and sculptures depicting Buddha and stories from Buddhist traditions.",
    history: "Created in phases from around the 2nd century BCE to the 5th century CE, the Ajanta murals are masterpieces of ancient Indian art.",
    artForm: "Cave paintings",
    knownFor: "Buddhist murals",
    source: "https://commons.wikimedia.org/wiki/Category:Paintings_in_the_Ajanta_Caves"
  },
  {
    id: 2,
    name: "Mithila Painting",
    region: "Bihar, Eastern India",
    category: "Folk Art",
    coords: [26.12, 86.0],
    query: "Madhubani Mithila traditional painting",
    description: "A colourful folk-art tradition known for intricate patterns, bold outlines, and themes from nature and mythology.",
    history: "Associated with the Mithila region of Bihar, this painting tradition has been passed down through generations and is also known as Madhubani painting.",
    artForm: "Folk painting",
    knownFor: "Nature and mythology",
    source: "https://commons.wikimedia.org/wiki/Category:Madhubani_paintings"
  },
  {
    id: 3,
    name: "Warli Art",
    region: "Maharashtra, Western India",
    category: "Folk Art",
    coords: [19.5, 73.0],
    query: "Warli tribal painting",
    description: "A tribal art form using simple geometric shapes to represent people, animals, celebrations and everyday life.",
    history: "Warli painting is associated with communities in Maharashtra. Traditional works often use white pigment on an earthy background.",
    artForm: "Tribal painting",
    knownFor: "Geometric figures",
    source: "https://commons.wikimedia.org/wiki/Category:Warli_paintings"
  },
  {
    id: 4,
    name: "Thanjavur Painting",
    region: "Tamil Nadu, Southern India",
    category: "Classical",
    coords: [10.787, 79.1378],
    query: "Tanjore Thanjavur painting gold foil",
    description: "A richly decorated South Indian painting style known for vibrant colours, gold foil and devotional subjects.",
    history: "Thanjavur painting developed in Tamil Nadu and flourished under Nayak and Maratha patronage.",
    artForm: "Classical painting",
    knownFor: "Gold foil details",
    source: "https://commons.wikimedia.org/wiki/Category:Tanjore_paintings"
  },
  {
    id: 5,
    name: "Pattachitra",
    region: "Odisha, Eastern India",
    category: "Craft",
    coords: [19.9, 85.83],
    query: "Odisha Pattachitra traditional painting",
    description: "Traditional paintings on cloth featuring detailed borders, decorative patterns and mythological stories.",
    history: "Pattachitra is closely associated with Odisha's religious and artistic traditions, especially the region around Puri.",
    artForm: "Traditional painting",
    knownFor: "Detailed patterns",
    source: "https://commons.wikimedia.org/wiki/Category:Pattachitra"
  },
  {
    id: 6,
    name: "Kangra Painting",
    region: "Himachal Pradesh, Northern India",
    category: "Classical",
    coords: [32.1, 76.27],
    query: "Kangra miniature painting Radha Krishna",
    description: "A delicate miniature painting tradition known for lyrical landscapes, graceful figures and stories of Krishna and Radha.",
    history: "Kangra painting flourished in the Pahari region, especially in the 18th century, and is admired for its natural colours and expressive scenes.",
    artForm: "Miniature painting",
    knownFor: "Romantic landscapes",
    source: "https://commons.wikimedia.org/wiki/Category:Kangra_paintings"
  },
  {
    id: 7,
    name: "Mughal Miniatures",
    region: "Delhi and North India",
    category: "Classical",
    coords: [28.6139, 77.209],
    query: "Mughal miniature painting royal court",
    description: "Detailed miniature paintings depicting royal courts, portraits, battles, animals and daily life.",
    history: "Mughal painting developed under emperors including Akbar, Jahangir and Shah Jahan, combining Persian influences with Indian subjects.",
    artForm: "Miniature painting",
    knownFor: "Court portraits",
    source: "https://commons.wikimedia.org/wiki/Category:Mughal_paintings"
  },
  {
    id: 8,
    name: "Hampi Heritage",
    region: "Karnataka, Southern India",
    category: "Ancient",
    coords: [15.335, 76.46],
    query: "Hampi Vijayanagara temple stone architecture",
    description: "A historic landscape of Vijayanagara temples, stone sculptures, carved pillars and monumental architecture.",
    history: "Hampi was the capital of the Vijayanagara Empire. Its surviving monuments reveal the architectural achievements of South India, particularly from the 14th to 16th centuries.",
    artForm: "Temple architecture",
    knownFor: "Stone carvings",
    source: "https://commons.wikimedia.org/wiki/Category:Hampi"
  }
];

const grid = document.getElementById("destination-grid");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const noResults = document.getElementById("no-results");

let activeFilter = "All";
let map = null;
let markersLayer = null;
const markers = {};
const imageCache = {};

// Search Wikimedia Commons automatically for real images.
async function getArtworkImage(place) {
  if (imageCache[place.id]) return imageCache[place.id];

  const apiURL = new URL(
    "https://commons.wikimedia.org/w/api.php"
  );

  apiURL.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: place.query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "650",
    format: "json",
    origin: "*"
  });

  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("Image search failed");

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    // Prefer actual image files with thumbnails.
    const validPages = pages.filter(page =>
      page.imageinfo &&
      page.imageinfo[0] &&
      page.imageinfo[0].thumburl &&
      /\.(jpe?g|png|webp)$/i.test(page.title || "")
    );

    if (validPages.length > 0) {
      const result = {
        url: validPages[0].imageinfo[0].thumburl,
        title: validPages[0].title.replace("File:", ""),
        page: "https://commons.wikimedia.org/wiki/" +
          encodeURIComponent(validPages[0].title.replace(/ /g, "_"))
      };

      imageCache[place.id] = result;
      return result;
    }
  } catch (error) {
    console.warn("Could not load image for " + place.name, error);
  }

  return null;
}

function makeImage(place, className) {
  const wrapper = document.createElement("div");
  wrapper.className = className + " photo-frame";

  const image = document.createElement("img");
  image.alt = place.name + " — Indian art heritage";
  image.loading = "lazy";
  image.referrerPolicy = "no-referrer";

  const placeholder = document.createElement("div");
  placeholder.className = "image-placeholder";
  placeholder.textContent = "Loading artwork image…";

  wrapper.append(image, placeholder);

  getArtworkImage(place).then(result => {
    if (result) {
      image.src = result.url;
      image.onload = () => {
        placeholder.remove();
        image.classList.add("image-loaded");
      };
      image.onerror = () => {
        image.remove();
        placeholder.textContent = "Image unavailable — view source";
        const link = document.createElement("a");
        link.href = place.source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Browse artwork images ↗";
        placeholder.appendChild(link);
      };
      image.dataset.source = result.page;
    } else {
      placeholder.textContent = "Browse real artwork images";
      const link = document.createElement("a");
      link.href = place.source;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open image collection ↗";
      placeholder.appendChild(link);
    }
  });

  return wrapper;
}

function showDetails(place) {
  document.getElementById("detail-category").textContent = place.category;
  document.getElementById("detail-region").textContent = place.region;
  document.getElementById("detail-title").textContent = place.name;
  document.getElementById("detail-description").textContent = place.description;
  document.getElementById("detail-history").textContent = place.history;
  document.getElementById("detail-artist").textContent = place.artForm;
  document.getElementById("detail-work").textContent = place.knownFor;

  const panel = document.getElementById("detail-art");
  panel.replaceChildren(makeImage(place, "detail-photo"));

  const sourceLink = document.getElementById("detail-source");
  sourceLink.href = place.source;
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  sourceLink.textContent = "View image source ↗";
}

function createCard(place) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "destination-card";
  card.setAttribute("aria-label", "Explore " + place.name);

  card.appendChild(makeImage(place, "card-photo"));

  const body = document.createElement("div");
  body.className = "card-body";

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = place.category;

  const title = document.createElement("h3");
  title.textContent = place.name;

  const description = document.createElement("p");
  description.textContent = place.description;

  const location = document.createElement("div");
  location.className = "card-location";
  location.textContent = "⌖ " + place.region;

  body.append(category, title, description, location);
  card.appendChild(body);

  card.addEventListener("click", () => {
    showDetails(place);

    if (map && markers[place.id]) {
      map.setView(place.coords, 7, { animate: true });
      markers[place.id].openPopup();
    }

    document.getElementById("explore").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  return card;
}

function getFilteredDestinations() {
  const query = searchInput.value.trim().toLowerCase();

  return destinations.filter(place => {
    const matchesFilter =
      activeFilter === "All" || place.category === activeFilter;

    const searchable = [
      place.name,
      place.region,
      place.category,
      place.description,
      place.history,
      place.artForm
    ].join(" ").toLowerCase();

    return matchesFilter && searchable.includes(query);
  });
}

function renderCards() {
  const filtered = getFilteredDestinations();
  grid.replaceChildren();

  filtered.forEach(place => {
    grid.appendChild(createCard(place));
  });

  noResults.hidden = filtered.length !== 0;
}

function renderMarkers() {
  if (!map || !markersLayer) return;

  markersLayer.clearLayers();

  getFilteredDestinations().forEach(place => {
    const marker = L.marker(place.coords);

    marker.bindPopup(
      "<strong>" + place.name + "</strong><br>" +
      place.region + "<br><small>" + place.category + "</small>"
    );

    marker.on("click", () => showDetails(place));
    marker.addTo(markersLayer);
    markers[place.id] = marker;
  });
}

function applyFilters() {
  renderCards();
  renderMarkers();
}

function initializeMap() {
  const mapElement = document.getElementById("map");

  if (typeof L === "undefined") {
    mapElement.innerHTML =
      '<p class="map-fallback">The map needs an internet connection. Refresh the page to try again.</p>';
    return;
  }

  map = L.map("map").setView([22.5, 79.0], 4.5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  renderMarkers();

  showDetails(destinations[1]);
  setTimeout(() => map.invalidateSize(), 200);
}

searchInput.addEventListener("input", applyFilters);

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    applyFilters();
  });
});

renderCards();
initializeMap();

