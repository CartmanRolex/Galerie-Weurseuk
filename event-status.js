/* Les dates restent lisibles sans JavaScript ; le statut se met à jour à chaque visite. */
(function(){
 function update(){const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Dakar'}).format(new Date());document.querySelectorAll('.event-card[data-start][data-end]').forEach(card=>{const label=card.querySelector('.event-status');if(label)label.textContent=card.dataset.start>today?'À venir':card.dataset.end<today?'Passée':'En cours';});}
 update();document.addEventListener('works:rendered',update);
})();
