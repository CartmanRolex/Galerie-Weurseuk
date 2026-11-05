#!/usr/bin/env node
/* Génère le site publié à partir des contenus enregistrés par le CMS. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const esc = (value) => String(value == null ? '' : value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const rich = (value) => esc(value).replace(/&lt;(\/?)(em|strong)&gt;/g, '<$1$2>');
const slugify = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const tel = (value) => String(value || '').replace(/[^0-9+]/g, '');
const safeUrl = (value) => {
  const url = String(value || '').trim();
  return /^(https?:|mailto:|tel:|[^:]+$)/i.test(url) ? esc(url) : '#';
};

const site = readJson('site.json');
const home = readJson('homepage.json');
const gallery = readJson('gallery.json');
const worksData = readJson('works.json');
const artistsData = readJson('artists.json');
const atelier = readJson('atelier.json');
const customisation = readJson('customisation.json');
const exposition = readJson('exposition.json');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.readdirSync(root).forEach((entry) => {
  if (['.git', 'dist', 'node_modules'].includes(entry)) return;
  fs.cpSync(path.join(root, entry), path.join(out, entry), { recursive: true });
});

function replaceInner(html, id, content) {
  return html.replace(new RegExp('(<[^>]+id="' + id + '"[^>]*>)[\\s\\S]*?(</[^>]+>)'), '$1' + content + '$2');
}
function replaceMount(html, id, content) {
  const pattern = new RegExp('(<div\\b(?=[^>]*\\bid="' + id + '")[^>]*>)[\\s\\S]*?</div>');
  if (!pattern.test(html)) throw new Error('Conteneur introuvable : ' + id);
  return html.replace(pattern, (_, opening) => opening + content + '</div>');
}
function removeDataScripts(html) {
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '').replace(/\s*<script src="(?:site|home|gallery|works|artists|editorial-page)\.js"><\/script>/g, '');
}
function decorateShell(html) {
  const words = String(site.name || '').trim().split(/\s+/);
  const finalWord = words.pop() || '';
  const brand = esc(words.join(' ')) + (words.length ? ' ' : '') + '<span>' + esc(finalWord) + '</span>';
  const place = [site.name, site.location].filter(Boolean).join(' · ');
  return html
    .replace(/<a class="brand" href="index\.html">[\s\S]*?<\/a>/g, '<a class="brand" href="index.html">' + brand + '</a>')
    .replace(/<span data-site-location>[\s\S]*?<\/span>/g, '<span data-site-location>' + esc(place) + '</span>')
    .replace(/<a data-site-phone href="[^"]*">[\s\S]*?<\/a>/g, '<a data-site-phone href="tel:' + esc(tel(site.phone)) + '">' + esc(site.phone) + '</a>')
    .replace(/<a data-site-whatsapp href="[^"]*">/g, '<a data-site-whatsapp href="https://wa.me/' + esc(String(site.whatsapp || '').replace(/\D/g, '')) + '">')
    .replace(/<a class="foot-mail" data-site-email href="[^"]*">[\s\S]*?<\/a>/g, '<a class="foot-mail" data-site-email href="mailto:' + esc(site.email) + '">' + esc(site.email) + '</a>');
}
function write(name, html) {
  const page = ({'customisation.html':customisation,'exposition.html':exposition,'galerie.html':gallery})[name];
  if(page){ html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+esc(page.title)+' · Galerie Weurseuk</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+esc(page.intro)+'"/>'); }
  fs.writeFileSync(path.join(out, name), removeDataScripts(decorateShell(html)));
}
function source(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }

const { renderWorks, renderFeatured, renderGallery, renderEditorial, renderArtistsList, renderArtistDetail } = require('../render-content.js')({site, home, gallery, worksData, artistsData, atelier});

let index = source('index.html');
index = index.replace(/<img id="home-hero-image"[^>]*>/, '<img id="home-hero-image" src="' + esc(home.hero_image) + '" alt="' + esc(home.hero_alt || '') + '"/>');
index = replaceInner(index, 'home-eyebrow', esc(home.eyebrow));
index = index.replace(/(<h1 id="home-title">)[\s\S]*?(<\/h1>)/, '$1' + esc(home.title) + (home.title_emphasis ? '<br/><em>' + esc(home.title_emphasis) + '</em>' : '') + '$2');
index = replaceInner(index, 'home-intro', esc(home.intro));
index = index.replace(/(<a class="btn" id="home-primary" href=")[^"]*(">)[\s\S]*?<\/a>/, '$1' + safeUrl(home.primary_url) + '$2' + esc(home.primary_label) + '</a>');
index = index.replace(/(<a class="btn ghost" id="home-secondary" href=")[^"]*(">)[\s\S]*?<\/a>/, '$1' + safeUrl(home.secondary_url) + '$2' + esc(home.secondary_label) + '</a>');
index = replaceInner(index, 'home-meeting-title', esc(home.meeting_title));
index = replaceInner(index, 'home-meeting-text', esc(home.meeting_text));
index = index.replace(/(<a class="btn ghost" id="home-meeting-button" href=")[^"]*(">)[\s\S]*?<\/a>/, '$1' + safeUrl(home.meeting_url) + '$2' + esc(home.meeting_label) + '</a>');
index = replaceMount(index, 'home-featured', renderFeatured());
write('index.html', index);

let works = source('oeuvres.html');
works = replaceInner(works, 'works-eyebrow', esc(worksData.eyebrow));
works = replaceInner(works, 'works-title', esc(worksData.page_title));
works = replaceInner(works, 'works-intro', esc(worksData.page_intro));
works = replaceMount(works, 'works', renderWorks());
write('oeuvres.html', works);

let artists = source('artistes.html');
artists = replaceInner(artists, 'artists-eyebrow', esc(artistsData.eyebrow));
artists = replaceInner(artists, 'artists-title', esc(artistsData.page_title));
artists = replaceInner(artists, 'artists-intro', esc(artistsData.page_intro));
artists = replaceMount(artists, 'artists', renderArtistsList());
write('artistes.html', artists);

let artistPage = source('nalla-thioye.html');
artistPage = artistPage.replace(/<div id="artist"[^>]*><\/div>/, '<div id="artist" data-slug="nalla-thioye">' + renderArtistDetail((artistsData.artists || []).find((artist) => slugify(artist.name) === 'nalla-thioye')) + '</div>');
write('nalla-thioye.html', artistPage);

let galleryPage = source('galerie.html');
galleryPage = galleryPage.replace(/<main id="gallery-page"><\/main>/, '<main id="gallery-page">' + renderGallery() + '</main>');
write('galerie.html', galleryPage);

write('atelier.html', source('atelier.html'));
let customisationPage = source('customisation.html');
customisationPage = replaceMount(customisationPage, 'editorial-page', renderEditorial(customisation));
write('customisation.html', customisationPage);
let expositionPage = source('exposition.html');
expositionPage = replaceMount(expositionPage, 'editorial-page', renderEditorial(exposition));
write('exposition.html', expositionPage);

require('./check-site.js')(root, out);
console.log('Site statique généré dans dist/.');
