const STORAGE_KEY = "movie-collection";

const movieForm = document.getElementById("movieForm");
const movieList = document.getElementById("movieList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const clearAllBtn = document.getElementById("clearAllBtn");

const totalCount = document.getElementById("totalCount");
const watchedCount = document.getElementById("watchedCount");
const averageRating = document.getElementById("averageRating");

let movies = loadMovies();

function loadMovies() {
  const savedMovies = localStorage.getItem(STORAGE_KEY);
  return savedMovies ? JSON.parse(savedMovies) : [];
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function uid() {
  return (Date.now() + Math.random()).toString(36).slice(2);
}

function normalizeRating(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(10, Math.max(0, num));
}

function getFilteredMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  return movies.filter((movie) => {
    const matchesQuery =
      !query ||
      movie.title.toLowerCase().includes(query) ||
      movie.director.toLowerCase().includes(query) ||
      movie.genre.toLowerCase().includes(query);

    const matchesFilter =
      filter === "all" ||
      (filter === "watched" && movie.watched) ||
      (filter === "unwatched" && !movie.watched);

    return matchesQuery && matchesFilter;
  });
}

function updateStats() {
  const watched = movies.filter((movie) => movie.watched).length;
  const total = movies.length;
  const ratings = movies
    .map((movie) => Number(movie.rating) || 0)
    .filter((value) => value > 0);
  const avg = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0;

  totalCount.textContent = String(total);
  watchedCount.textContent = String(watched);
  averageRating.textContent = avg.toFixed(1);
}

function renderMovies() {
  const visibleMovies = getFilteredMovies();
  movieList.innerHTML = "";

  if (!visibleMovies.length) {
    movieList.innerHTML = `
      <div class="empty-state">
        <p>No movies found. Add one to start your collection.</p>
      </div>
    `;
    return;
  }

  const template = document.getElementById("movieItemTemplate");

  visibleMovies.forEach((movie) => {
    const clone = template.content.cloneNode(true);
    const title = clone.querySelector(".movie-title");
    const meta = clone.querySelector(".movie-meta");
    const badge = clone.querySelector(".badge");
    const ratingPill = clone.querySelector(".rating-pill");
    const toggleBtn = clone.querySelector(".toggle-btn");
    const deleteBtn = clone.querySelector(".delete-btn");

    title.textContent = movie.title;
    const metaText = [movie.director || "Unknown director", movie.genre || "General", movie.year || "N/A"]
      .filter(Boolean)
      .join(" • ");
    meta.textContent = metaText;

    badge.textContent = movie.watched ? "Watched" : "Plan to watch";
    badge.classList.toggle("unwatched", !movie.watched);

    const rating = Number(movie.rating) || 0;
    ratingPill.textContent = rating ? `Rating: ${rating.toFixed(1)}` : "No rating";

    toggleBtn.textContent = movie.watched ? "Mark Unwatched" : "Mark Watched";
    toggleBtn.classList.toggle("unwatched", !movie.watched);
    toggleBtn.addEventListener("click", () => toggleWatched(movie.id));

    deleteBtn.addEventListener("click", () => deleteMovie(movie.id));

    movieList.appendChild(clone);
  });
}

function addMovie(event) {
  event.preventDefault();

  const formData = new FormData(movieForm);
  const title = (formData.get("title") || "").toString().trim();

  if (!title) {
    return;
  }

  const movie = {
    id: uid(),
    title,
    director: (formData.get("director") || "").toString().trim(),
    genre: (formData.get("genre") || "").toString().trim(),
    year: (formData.get("year") || "").toString().trim(),
    rating: normalizeRating(formData.get("rating") || 0),
    watched: Boolean(formData.get("watched"))
  };

  movies.unshift(movie);
  saveMovies();
  movieForm.reset();
  render();
}

function toggleWatched(id) {
  movies = movies.map((movie) =>
    movie.id === id ? { ...movie, watched: !movie.watched } : movie
  );
  saveMovies();
  render();
}

function deleteMovie(id) {
  movies = movies.filter((movie) => movie.id !== id);
  saveMovies();
  render();
}

function clearAllMovies() {
  if (!movies.length) {
    return;
  }

  const confirmed = window.confirm("Delete all movies from your collection?");
  if (!confirmed) {
    return;
  }

  movies = [];
  saveMovies();
  render();
}

function render() {
  updateStats();
  renderMovies();
}

movieForm.addEventListener("submit", addMovie);
searchInput.addEventListener("input", renderMovies);
filterSelect.addEventListener("change", renderMovies);
clearAllBtn.addEventListener("click", clearAllMovies);

render();
