(function(){
 const list=document.getElementById('artists'),detail=document.getElementById('artist');if(!list&&!detail)return;
 const slug=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 fetch('artists.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(artistsData=>{
  const render=GalleryContent({artistsData});
  for(const [id,field] of [['artists-eyebrow','eyebrow'],['artists-title','page_title'],['artists-intro','page_intro']]){const el=document.getElementById(id);if(el)el.textContent=artistsData[field]||'';}
  if(list)list.innerHTML=render.renderArtistsList();if(detail){const artist=(artistsData.artists||[]).find(a=>slug(a.name)===detail.dataset.slug);detail.innerHTML=render.renderArtistDetail(artist);if(artist)document.title=artist.name+' · Galerie Weurseuk';}
  document.dispatchEvent(new CustomEvent('works:rendered'));
 }).catch(error=>{(detail||list).innerHTML='<p>Les artistes ne peuvent pas être chargés. Veuillez réessayer.</p>';console.error(error);});
})();
