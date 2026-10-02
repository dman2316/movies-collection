const STORAGE_KEY = "movie-collection";
const OMDB_API_KEY = "c9915b84";

const searchForm = document.getElementById("searchForm");
const searchTitle = document.getElementById("searchTitle");
const searchResults = document.getElementById("searchResults");
const movieForm = document.getElementById("movieForm");
const movieList = document.getElementById("movieList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const clearAllBtn = document.getElementById("clearAllBtn");

const totalCount = document.getElementById("totalCount");
const watchedCount = document.getElementById("watchedCount");
const averageRating = document.getElementById("averageRating");

let movies = loadMovies();
let currentSearchResults = [];

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

async function searchMoviesOnline(query) {
  if (!query.trim()) {
    searchResults.innerHTML = '<p class="info-text">Enter a movie title to search.</p>';
    return;
  }

  searchResults.innerHTML = '<p class="loading-text">Searching...</p>';
  currentSearchResults = [];

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`
    );
    const data = await response.json();

    if (data.Response === "False") {
      searchResults.innerHTML = '<p class="info-text">No movies found. Try another search.</p>';
      return;
    }

    currentSearchResults = data.Search || [];
    displaySearchResults();
  } catch (error) {
    console.error("Search error:", error);
    searchResults.innerHTML = '<p class="error-text">Error searching movies. Please try again.</p>';
  }
}

function displaySearchResults() {
  searchResults.innerHTML = "";

  if (!currentSearchResults.length) {
    searchResults.innerHTML = '<p class="info-text">No results found.</p>';
    return;
  }

  const template = document.getElementById("searchResultTemplate");

  currentSearchResults.forEach((result) => {
    const clone = template.content.cloneNode(true);
    const title = clone.querySelector(".result-title");
    const year = clone.querySelector(".result-year");
    const addBtn = clone.querySelector(".add-result-btn");

    title.textContent = result.Title;
    year.textContent = `(${result.Year})`;

    const movieData = {
      title: result.Title,
      year: result.Year,
      imdbId: result.imdbID
    };

    addBtn.addEventListener("click", () => addMovieFromSearch(movieData));

    searchResults.appendChild(clone);
  });
}

function addMovieFromSearch(movieData) {
  const movie = {
    id: uid(),
    title: movieData.title,
    year: movieData.year,
    imdbId: movieData.imdbId,
    watched: false,
    rating: 0
  };

  movies.unshift(movie);
  saveMovies();
  searchTitle.value = "";
  searchResults.innerHTML = "";
  render();
}

function getFilteredMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  return movies.filter((movie) => {
    const matchesQuery = !query || movie.title.toLowerCase().includes(query);
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

  totalCount.textContent = String(total);
  watchedCount.textContent = String(watched);
  averageRating.textContent = String(total);
}

function renderMovies() {
  const visibleMovies = getFilteredMovies();
  movieList.innerHTML = "";

  if (!visibleMovies.length) {
    movieList.innerHTML = `
      <div class="empty-state">
        <p>No movies in your collection. Search and add one!</p>
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
    const toggleBtn = clone.querySelector(".toggle-btn");
    const deleteBtn = clone.querySelector(".delete-btn");

    title.textContent = movie.title;
    meta.textContent = movie.year ? `Year: ${movie.year}` : "Added to collection";

    badge.textContent = movie.watched ? "Watched" : "Plan to watch";
    badge.classList.toggle("unwatched", !movie.watched);

    toggleBtn.textContent = movie.watched ? "Mark Unwatched" : "Mark Watched";
    toggleBtn.classList.toggle("unwatched", !movie.watched);
    toggleBtn.addEventListener("click", () => toggleWatched(movie.id));

    deleteBtn.addEventListener("click", () => deleteMovie(movie.id));

    movieList.appendChild(clone);
  });
}

function addMovie(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();

  if (!title) {
    return;
  }

  const movie = {
    id: uid(),
    title,
    watched: document.getElementById("watched").checked,
    year: new Date().getFullYear().toString(),
    rating: 0
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

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchMoviesOnline(searchTitle.value);
});

movieForm.addEventListener("submit", addMovie);
searchInput.addEventListener("input", renderMovies);
filterSelect.addEventListener("change", renderMovies);
clearAllBtn.addEventListener("click", clearAllMovies);

render();
