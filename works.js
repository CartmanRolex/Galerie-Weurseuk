(function(){
 const mount=document.getElementById('works');if(!mount)return;
 fetch('works.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(worksData=>{
  for(const [id,field] of [['works-eyebrow','eyebrow'],['works-title','page_title'],['works-intro','page_intro']]){const el=document.getElementById(id);if(el)el.textContent=worksData[field]||'';}
  mount.innerHTML=GalleryContent({worksData}).renderWorks();document.dispatchEvent(new CustomEvent('works:rendered'));
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target)target.scrollIntoView();}
 }).catch(error=>{mount.innerHTML='<p>Les œuvres ne peuvent pas être chargées. Veuillez réessayer.</p>';console.error(error);});
})();
