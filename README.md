# TopoConnect Playground

[Live demo](https://ggmxip.github.io/TopoConnect/)

TopoConnect is an interactive network topology playground built with Flask, Cytoscape.js, and GitHub Pages. It lets users load common computer network layouts and edit them directly in the browser.

## Features

- Explore Playground, Star, Ring, Mesh, Bus, and Tree topologies.
- Add, delete, and connect nodes interactively.
- Undo, redo, reset, and fit the graph to the current view.
- Toggle between light and dark themes.

## Technologies

- [Flask](https://flask.palletsprojects.com/) for local development.
- [Cytoscape.js](https://js.cytoscape.org/) for graph rendering.
- GitHub Pages for static deployment.

## Run Locally

```bash
git clone https://github.com/ggmxip/TopoConnect.git
cd TopoConnect
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000`.

## GitHub Pages Deployment

The workflow in `.github/workflows/jekyll-gh-pages.yml` publishes `templates/index.html` and the `static/` assets to GitHub Pages whenever changes are pushed to `master`.
