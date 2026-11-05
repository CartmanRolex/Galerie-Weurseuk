(function(){
 const mount=document.getElementById('gallery-page');if(!mount)return;
 Promise.all(['gallery.json','site.json','atelier.json'].map(url=>fetch(url,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(url);return r.json();}))).then(([gallery,site,atelier])=>{
  mount.innerHTML=GalleryContent({gallery,site,atelier}).renderGallery();document.dispatchEvent(new CustomEvent('works:rendered'));
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target)target.scrollIntoView();}
 }).catch(error=>{mount.innerHTML='<div class="wrap"><p>La galerie ne peut pas être chargée. Veuillez réessayer.</p></div>';console.error(error);});
})();
