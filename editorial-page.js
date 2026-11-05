(function(){
 const mount=document.getElementById('editorial-page');if(!mount)return;
 fetch(mount.dataset.source,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(page=>{
  document.title=page.title+' · Galerie Weurseuk';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=page.intro||'';
  mount.innerHTML=GalleryContent({}).renderEditorial(page);
  document.dispatchEvent(new CustomEvent('works:rendered'));
 }).catch(error=>{mount.innerHTML='<section class="page-head"><div class="wrap"><h1>Page indisponible</h1><p>Veuillez réessayer.</p></div></section>';console.error(error);});
})();
