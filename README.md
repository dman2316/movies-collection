# Movie Collection

A lightweight movie collection app built with HTML, CSS, and JavaScript. Data is stored in the browser using `localStorage`, so your list remains available even after refreshing the page.

## Features

- Add movies with title, director, genre, year, rating, and watched status
- Search by title, director, or genre
- Filter by all, watched, or unwatched movies
- Toggle watched status
- Delete individual movies or clear the whole collection
- View quick stats like total movies, watched count, and average rating

## Run locally

Open `index.html` in a browser, or serve the folder with a local static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Files

- `index.html` – app structure
- `style.css` – styles
- `script.js` – logic and localStorage handling

## Notes

This app is suitable for a personal movie tracker and can be extended with features like:

- editing existing movies
- sorting by rating or newest release
- importing/exporting JSON
- drag-and-drop ordering
