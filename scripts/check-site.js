/* Assertions sur le site réellement généré, exécutées à chaque publication. */
const fs=require('fs');
const path=require('path');
module.exports=function check(root,out){
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 const read=file=>fs.readFileSync(path.join(out,file),'utf8');
 const pages=fs.readdirSync(out).filter(f=>f.endsWith('.html'));
 const texts=new Map(pages.map(file=>[file,read(file)]));
 const decode=s=>s.replace(/&amp;/g,'&');
 const nav=[];
 for(const [file,html] of texts){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert(new Set(ids).size===ids.length,file+': identifiants dupliqués');
  const menu=html.match(/<ul class="nav-links">([\s\S]*?)<\/ul>/);
  if(menu){const links=[...menu[1].matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert(links.length===5,file+': le menu doit avoir cinq liens');nav.push(JSON.stringify(links));}
  for(const match of html.matchAll(/\b(href|src)="([^"]+)"/g)){
   const url=decode(match[2]);if(!url||/^(https?:|mailto:|tel:|data:)/.test(url))continue;
   const [target,hash]=url.split('#');const targetFile=target||file;
   assert(fs.existsSync(path.join(out,targetFile)),file+': ressource introuvable '+url);
   if(hash&&targetFile.endsWith('.html'))assert((texts.get(targetFile)||'').includes('id="'+hash+'"'),file+': ancre introuvable '+url);
  }
 }
 assert(new Set(nav).size===1,'Navigation incohérente entre les pages');
 const home=read('index.html');assert(home.includes('id="home-featured"')&&!/id="home-featured"[^>]*>\s*<\/div>/.test(home),'La sélection d’accueil est vide');assert(home.includes('class="featured-artist'),'Artiste absent de l’accueil');assert(!home.includes('id="home-secondary"'),'Bouton redondant encore présent');
 const customization=read('customisation.html');assert(customization.indexOf('img_0515_original.jpeg')<customization.indexOf('<h2>Téngado'),'Pantalon mal classé');assert((customization.match(/img_0515_original.jpeg/g)||[]).length===1,'Pantalon dupliqué');
 const events=JSON.parse(fs.readFileSync(path.join(root,'exposition.json'),'utf8')).events;
 assert(new Set(events.map(e=>e.id)).size===events.length,'Identifiant événement dupliqué');
 for(const e of events){assert(/^\d{4}-\d{2}-\d{2}$/.test(e.start)&&/^\d{4}-\d{2}-\d{2}$/.test(e.end)&&e.start<=e.end,'Dates invalides : '+e.id);assert(read('exposition.html').includes('id="'+e.id+'"'),'Événement manquant : '+e.id);}
 const works=JSON.parse(fs.readFileSync(path.join(root,'works.json'),'utf8'));assert((read('oeuvres.html').match(/class="work zoom"/g)||[]).length===works.series.reduce((n,s)=>n+s.works.length,0),'Des œuvres ont disparu');
 console.log('Vérifications : navigation, ressources, ancres, accueil, pantalon, événements et catalogue conformes.');
};
