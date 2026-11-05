# Organisation du site

## Parcours et URLs

La marque renvoie à l’accueil. Le menu commun comporte cinq entrées : Œuvres, Artistes, Expositions, Créations sur mesure et La galerie.

- `index.html` : une action principale vers le catalogue, présentation du lieu, trois séries et un lien vers l’artiste.
- `oeuvres.html` : séries, informations des œuvres et demande d’acquisition depuis l’agrandissement. Le texte commun d’une série est rangé dans « À propos de cette série ».
- `artistes.html` et `nalla-thioye.html` : présentation, démarche et participations ; l’encart d’exposition peut pointer vers une fiche d’événement.
- `exposition.html` : un enregistrement par événement, avec dates et lieu propres. Le statut est calculé avec la date courante au Sénégal, au build et à chaque visite.
- `customisation.html` : créations sur mesure, avec vêtements et Téngado clairement séparés. Une seule action de demande ; le pantalon appartient aux vêtements.
- `galerie.html` : présentation du lieu, atelier (`#atelier`) et modalités de visite (`#visiter`). Les horaires et l’adresse propres à une exposition restent sur sa fiche.
- `atelier.html` : ancienne adresse conservée, redirection vers `galerie.html#atelier`.
- `nalla.html` : ancienne adresse de la fiche artiste conservée.

## Édition et publication

Les fichiers JSON restent les sources éditoriales. Le CMS expose les descriptions de séries, le titre de la galerie Téngado et des événements structurés : identifiant, titre, nature, lieu, dates, participants, vernissage, horaires et adresse.

`render-content.js` fournit le même rendu aux aperçus dynamiques et au build statique. Modifier ce rendu partagé plutôt que créer une seconde implémentation dans les scripts de page. `node scripts/build-site.js` génère `dist/` puis vérifie les liens, ancres, menus, images et contenus essentiels via `scripts/check-site.js`. Le workflow GitHub Pages existant exécute ces contrôles avant déploiement.

Ne pas inventer d’unité pour les dimensions ni d’adresse permanente à partir de l’adresse d’un événement. Les dates et participations publiées restent celles des contenus fournis à la galerie ; les mises à jour factuelles se font dans le CMS.
