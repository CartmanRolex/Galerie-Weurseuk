/* Rendu unique pour le build statique et les aperçus du CMS. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.GalleryContent=factory;})(typeof globalThis!=='undefined'?globalThis:this,function(context){
const {site={},home={},gallery={},worksData={},artistsData={},atelier={}}=context||{};
const esc = value => String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const rich = value => esc(value).replace(/&lt;(\/?)(em|strong)&gt;/g,'<$1$2>');
const slugify = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const tel = value => String(value || '').replace(/[^0-9+]/g,'');
const safeUrl = value => {const url=String(value || '').trim();return /^(https?:|mailto:|tel:|[^:]+$)/i.test(url)?esc(url):'#';};
function eventState(event,today) {return event.start>today?'À venir':event.end<today?'Passée':'En cours';}
function formatDate(value) {return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));}
function renderEvents(page) {
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Dakar'}).format(new Date());
 const cards=[...(page.events||[])].sort((a,b)=> (eventState(a,today)==='Passée')-(eventState(b,today)==='Passée') || a.start.localeCompare(b.start)).map(event =>
 '<article class="event-card rv" id="'+esc(event.id)+'" data-start="'+esc(event.start)+'" data-end="'+esc(event.end)+'"><div class="event-head"><p class="eyebrow">'+esc(event.kind)+'</p><span class="event-status">'+eventState(event,today)+'</span></div><h2>'+esc(event.title)+'</h2><p class="event-dates">Du '+formatDate(event.start)+' au '+formatDate(event.end)+'</p><p class="event-location">'+esc(event.location)+'</p>'+
 (event.date_note?'<p class="event-note">'+esc(event.date_note)+'</p>':'')+
 (event.description?'<p class="prose">'+esc(event.description)+'</p>':'')+
 (event.artists && event.artists.length?'<h3>Artistes</h3><p>'+event.artists.map(esc).join(', ')+'</p>':'')+
 (event.opening?'<h3>Vernissage</h3><p>'+esc(event.opening)+'</p>':'')+
 (event.hours?'<h3>Horaires de cette exposition</h3><p>'+esc(event.hours)+'</p>':'')+
 (event.address?'<h3>Adresse de cette exposition</h3><p>'+esc(event.address)+'</p>':'')+
 (event.map_url?'<a class="text-link" href="'+safeUrl(event.map_url)+'">Voir le lieu sur la carte</a>':'')+'</article>').join('');
 return '<section class="page-head"><div class="wrap"><p class="eyebrow">'+esc(page.eyebrow)+'</p><h1>'+esc(page.title)+'</h1><p class="lead">'+esc(page.intro)+'</p></div></section><section class="section"><div class="wrap events-list">'+cards+'</div></section>';
}
function workDetails(work) {
  return [work.medium, work.dimensions, work.year, work.price, work.availability].filter(Boolean);
}
function renderWorks() {
  return (worksData.series || []).map((series) => {
    const works = series.works || [];
    if (!works.length) return '';
    const media = [...new Set(works.map((work) => String(work.medium || '').split(' sur ')[0].trim()).filter(Boolean))].join(', ');
    const cards = works.map((work) => {
      const details = workDetails(work);
      return '<figure class="work zoom" tabindex="0" role="button" data-title="' + esc(work.title) +
        '" data-artist="' + esc(work.artist) + '" data-meta="' + esc(details.join(' · ')) +
        '" data-desc="' + esc(work.description) + '"><div class="work-img"><img loading="lazy" src="' +
        esc(work.image) + '" alt="' + esc(work.title) + (work.alt ? ' — ' + esc(work.alt) : '') +
        '"/></div><figcaption class="work-txt"><h3>' + esc(work.title) + '</h3><p class="meta">' +
        esc([work.artist].concat(details).filter(Boolean).join(' · ')) + '</p></figcaption></figure>';
    }).join('');
    return '<div class="serie rv" id="' + esc(slugify(series.name)) + '"><div class="serie-bar"><h2>' +
      esc(series.name) + '</h2><span class="count">' + works.length + (works.length > 1 ? ' toiles' : ' toile') +
      (media ? ' · ' + esc(media) : '') + '</span></div>' + (series.description ? '<details class="series-story"><summary>À propos de cette série</summary><p class="prose series-description">' + esc(series.description) + '</p></details>' : '') + '<div class="grid' +
      (works.length === 2 ? ' pair' : '') + '">' + cards + '</div></div>';
  }).join('');
}
function renderFeatured() {
  const artist = (artistsData.artists || [])[0];
  const cards = (worksData.series || []).filter(s => (s.works || []).length).slice(0,3).map(series => {
    const work=series.works[0];
    return '<a class="work" href="oeuvres.html#'+esc(slugify(series.name))+'"><div class="work-img"><img loading="lazy" src="'+esc(work.image)+'" alt="'+esc(work.alt || work.title)+'"/></div><div class="work-txt"><h3>'+esc(series.name)+'</h3><p class="meta">'+series.works.length+' œuvres</p></div></a>';
  }).join('');
  return '<div class="section-head rv"><h2>'+esc(home.featured_label || 'Une sélection d’œuvres')+'</h2></div><div class="grid rv">'+cards+'</div>'+
    (artist ? '<div class="featured-artist rv"><p>'+esc(artist.name)+' · '+esc(artist.discipline)+'</p><a class="text-link" href="'+esc(slugify(artist.name))+'.html">Rencontrer '+esc(artist.name)+'</a></div>' : '');
}
function renderGallery() {
 const sections=(gallery.sections || []).map(section => '<article class="gallery-block rv"><h2>'+esc(section.title)+'</h2><p class="prose">'+esc(section.text)+'</p>'+(section.button_label ? '<a class="text-link" href="'+safeUrl(section.button_url)+'">'+esc(section.button_label)+'</a>' : '')+'</article>').join('');
 const workshop=(atelier.sections || []).map(section => '<article class="content-block'+(section.image?' has-image':'')+'"><div class="content-copy rv"><h3>'+esc(section.title)+'</h3><p>'+esc(section.text)+'</p></div>'+(section.image?'<figure class="content-visual rv"><img loading="lazy" src="'+esc(section.image)+'" alt="'+esc(section.image_alt || section.title)+'"/>'+(section.caption?'<figcaption>'+esc(section.caption)+'</figcaption>':'')+'</figure>':'')+'</article>').join('');
 return '<section class="page-head"><div class="wrap"><p class="eyebrow">'+esc(gallery.eyebrow)+'</p><h1>'+esc(gallery.title)+'</h1><p class="lead">'+esc(gallery.intro)+'</p></div></section><section class="section"><div class="wrap gallery-blocks">'+sections+'</div></section>'+
 '<section class="section" id="atelier"><div class="wrap"><div class="section-head"><h2>L’atelier</h2><p class="lead">'+esc(atelier.intro)+'</p></div><div class="content-blocks">'+workshop+'</div></div></section>'+
 '<section class="section contact" id="visiter"><div class="wrap"><h2>'+esc(gallery.contact_title)+'</h2><p>'+esc([site.location,site.country].filter(Boolean).join(' — '))+'</p><p class="prose">'+esc(gallery.contact_text)+'</p><div class="lines">'+
 (site.whatsapp?'<a class="line" href="https://wa.me/'+esc(String(site.whatsapp).replace(/\D/g,''))+'"><span class="line-label">Rendez-vous</span>Préparer une visite sur WhatsApp</a>':'')+
 (site.phone?'<a class="line" href="tel:'+esc(tel(site.phone))+'"><span class="line-label">Téléphone</span>'+esc(site.phone)+'</a>':'')+
 (site.email?'<a class="line" href="mailto:'+esc(site.email)+'"><span class="line-label">Email</span>'+esc(site.email)+'</a>':'')+'</div></div></section>';
}
function renderEditorial(page) {
  if (page.events) return renderEvents(page);
  const sections = (page.sections || []).map((section) => {
    const visual = section.image ? '<figure class="content-visual rv"><img loading="lazy" src="' + esc(section.image) +
      '" alt="' + esc(section.image_alt || section.title) + '"/>' + (section.caption ? '<figcaption>' + esc(section.caption) + '</figcaption>' : '') + '</figure>' : '';
    return '<article class="content-block' + (section.image ? ' has-image' : '') + '"><div class="content-copy rv"><h2>' + esc(section.title) +
      '</h2>' + (section.text ? '<p>' + esc(section.text) + '</p>' : '') + '</div>' + visual + '</article>';
  }).join('');
  const galleryItems = (page.gallery || []).filter((item) => item.image).map((item) => '<figure class="work rv"><div class="work-img"><img loading="lazy" src="' +
    esc(item.image) + '" alt="' + esc(item.alt || item.caption || '') + '"/></div>' + (item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : '') + '</figure>').join('');
  const galleryHtml = galleryItems ? '<div class="editorial-gallery">'+(page.gallery_title ? '<h2>'+esc(page.gallery_title)+'</h2>' : '')+'<div class="grid">' + galleryItems + '</div></div>' : '';
  return '<section class="page-head"><div class="wrap">' + (page.eyebrow ? '<p class="eyebrow">' + esc(page.eyebrow) + '</p>' : '') +
    '<h1>' + esc(page.title) + '</h1>' + (page.intro ? '<p class="lead">' + esc(page.intro) + '</p>' : '') +
    (page.cta_label ? '<div class="cta-row"><a class="btn" href="' + safeUrl(page.cta_url) + '">' + esc(page.cta_label) + '</a></div>' : '') +
    '</div></section><section class="section"><div class="wrap"><div class="content-blocks">' + sections + '</div>' + galleryHtml + '</div></section>';
}
function renderArtistsList() {
  return '<div class="grid rv">' + (artistsData.artists || []).map((artist) => '<a class="work" href="' + esc(slugify(artist.name)) +
    '.html" style="text-decoration:none"><div class="work-img"><img loading="lazy" src="' + esc(artist.portrait) +
    '" alt="' + esc(artist.portrait_alt || artist.name) + '"/></div><div class="work-txt"><h3>' + esc(artist.name) +
    '</h3><p class="meta">' + esc(artist.discipline || artist.role) + '</p></div></a>').join('') + '</div>';
}
function renderArtistDetail(artist) {
  if (!artist) return '<div class="wrap"><p class="prose">Cet artiste est introuvable.</p></div>';
  const exhibitions = (artist.exhibitions || []).filter((entry) => (entry.items || []).length).map((entry) => '<div class="expo-year rv"><h3>' + esc(entry.year) +
    '</h3><ul class="expo-list">' + entry.items.map((item) => '<li>' + esc(item) + '</li>').join('') + '</ul></div>').join('');
  return '<section class="page-head"><div class="wrap"><p class="eyebrow">' + esc(artist.role) + '</p><h1>' + esc(artist.name) + '</h1>' +
    (artist.intro ? '<p class="lead">' + rich(artist.intro) + '</p>' : '') + (artist.highlight_tag || artist.highlight_text ? '<div class="badge rv">' +
    (artist.highlight_tag ? '<span class="badge-tag">' + esc(artist.highlight_tag) + '</span>' : '') + (artist.highlight_text ? '<p>' + rich(artist.highlight_text) + '</p>' : '') + (artist.highlight_url ? '<a class="text-link" href="'+safeUrl(artist.highlight_url)+'">Voir cette exposition</a>' : '') + '</div>' : '') +
    '</div></section><section class="section bio"><div class="wrap bio-grid">' + (artist.portrait ? '<figure class="portrait rv"><img src="' + esc(artist.portrait) +
    '" alt="' + esc(artist.portrait_alt || artist.name) + '"/>' + (artist.portrait_credit ? '<figcaption>' + esc(artist.portrait_credit) + '</figcaption>' : '') + '</figure>' : '') +
    '<div class="rv"><h2>' + esc(artist.statement_title || 'Note d\'intention') + '</h2>' + (artist.statement ? '<p>' + rich(artist.statement) + '</p>' : '') +
    '<div class="cta-row"><a class="text-link" href="oeuvres.html">Voir les œuvres</a></div></div></div></section>' + (exhibitions ? '<section class="section"><div class="wrap"><div class="section-head rv"><h2>Expositions &amp; participations</h2></div>' + exhibitions + '</div></section>' : '');
}

return {renderWorks,renderFeatured,renderGallery,renderEditorial,renderArtistsList,renderArtistDetail};
});
