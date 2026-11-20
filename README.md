# Test M1 — suivi de la consommation énergétique

Application de suivi de la consommation énergétique (kWh) des salles d'un campus universitaire : saisie par mois et par année, pour chaque salle, selon le type d'énergie (Jirama, solaire, groupe électrogène), puis consultation de la liste et du résultat.

Stack : **Next.js 16** (front), **ASP.NET Core / .NET 10** (API), MySQL 8.4 (EF Core 9 + Pomelo). Le projet part du template [next-dotnet-template](https://github.com/Fotsykely/next-dotnet-template) (branche `mysql`), dont la documentation technique suit.

## Utiliser ce template

- **Sur GitHub** : bouton « Use this template » (si le dépôt est marqué *Template repository* dans ses réglages).
- **En local** :

```bash
git clone https://github.com/Fotsykely/next-dotnet-template.git mon-projet
cd mon-projet
rm -rf .git && git init -b main   # repartir d'un historique vide
```

Prérequis : .NET SDK 10 (voir `global.json`), Node.js 20.9 ou plus, Docker.

## Lancer le projet

Trois terminaux.

**1. Base de données** (à la racine) :

```bash
cp .env.example .env        # ajustez le mot de passe et le port si besoin
docker compose up -d
```

**2. API** :

```bash
cd backend/Api
dotnet user-secrets set "ConnectionStrings:Default" "Server=localhost;Port=3307;Database=app;User=app;Password=change-me"
dotnet run                  # http://localhost:5080
```

Au démarrage, l'API applique les migrations, qui insèrent les 6 salles du sujet. La chaîne de connexion n'est jamais dans le code : elle vient des *user secrets* en développement, ou de la variable d'environnement `ConnectionStrings__Default` ailleurs. Le port et le mot de passe doivent correspondre à votre `.env`.

> Au tout premier démarrage, le journal affiche un `fail: … SELECT "MigrationId" … FROM "__EFMigrationsHistory"`. C'est normal : EF lit la table d'historique avant qu'elle existe, puis applique la migration.

**3. Front** :

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

Documentation interactive de l'API (en développement) : <http://localhost:5080/scalar>.

## Tests

```bash
cd backend && dotnet test                  # Docker doit tourner : Testcontainers lance un MySQL jetable
cd frontend && npm run lint && npm test    # ESLint, puis Vitest sur lib/api-client
cd frontend && npm run build               # API_BASE_URL doit être définie (voir .env.local)
```

Les tests de l'API utilisent un vrai MySQL et non SQLite ou le fournisseur en mémoire : les migrations sont propres à Pomelo.

## Architecture

```
Navigateur ──► Next.js (:3000) ──► API ASP.NET Core (:5080) ──► MySQL (:3307)
```

Seul le serveur Next.js parle à l'API. Il n'y a donc **pas de CORS** à configurer, et l'URL de l'API (`API_BASE_URL`, sans préfixe `NEXT_PUBLIC_`) n'arrive jamais dans le navigateur.

```
backend/
  Api/                  contrôleurs, DTOs, entités, DbContext, migrations
  Api.Tests/            xUnit + WebApplicationFactory + Testcontainers
frontend/
  lib/api-client/       client HTTP (server-only), un fichier par ressource, types des DTOs
  lib/                  helpers de formulaires et de routes
  components/           composants d'interface génériques
  app/                  pages et Server Actions
```

### Pages du front

| Route | Rôle |
|---|---|
| `/` | liste des salles : on choisit le mois (par défaut le mois courant) et l'année, puis « Saisir » sur la salle voulue |
| `/consumptions/entry?roomId=&month=&year=` | saisie des trois consommations (kWh) d'une salle pour un mois. Si la salle a déjà une saisie ce mois-là, le formulaire est pré-rempli et « Valider » la remplace. Un lien modifié à la main (salle inconnue, mois 13…) mène à « Page introuvable ». « Valider » renvoie vers la liste |
| `/consumptions` | liste des saisies (la plus récente d'abord) : kWh par énergie, « Modifier » (rouvre la page de saisie pré-remplie) et « Supprimer » (avec confirmation) |
| `/results` | résultat : une ligne par salle (les 6, avec des zéros si rien n'est saisi), kWh de chaque énergie et total, tous les mois saisis confondus |

### Points d'entrée de l'API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/rooms` | les 6 salles du sujet, dans l'ordre (lecture seule) |
| GET | `/api/rooms/{id}` | une salle (404 si inconnue) |
| GET | `/api/consumptions` | saisies, filtres optionnels `roomId`, `year`, `month` ; période la plus récente d'abord |
| GET | `/api/consumptions/summary` | résultat : une ligne par salle, avec le total kWh de chaque énergie sur tous les mois saisis, et le total général (0 pour une salle sans saisie) |
| GET | `/api/consumptions/{id}` | une saisie (404 si inconnue) |
| POST | `/api/consumptions` | création : `roomId`, `year`, `month`, `jiramaKwh`, `solarKwh`, `generatorKwh` (400 par champ, 409 si la salle a déjà une saisie ce mois-là) |
| PUT | `/api/consumptions/{id}` | modification des trois valeurs kWh uniquement (salle, mois et année ne changent pas) |
| DELETE | `/api/consumptions/{id}` | suppression (204, ou 404) |
| GET | `/health` | santé de l'API et de la base |

Une saisie = une salle × un mois × une année, avec une colonne par type d'énergie. Les valeurs sont en kWh, positives ou nulles, arrondies à 2 décimales.

Les erreurs non gérées et les statuts nus (404, 405…) répondent en `ProblemDetails` (JSON).

### Le client d'API (`frontend/lib/api-client`)

- `client.ts` est le **seul** endroit qui fait du `fetch`. Il traduit les statuts HTTP en erreurs typées : 404 → `ApiNotFoundError`, 400 → `ApiValidationError` (noms de champs en camelCase), autre → `Error`. Délai maximum de 5 s.
- Un fichier par ressource (`rooms.ts`, `consumptions.ts`…) expose une fonction par endpoint. Les pages et les Server Actions n'appellent que ces fonctions.
- `types.ts` reproduit à la main les DTOs de l'API. Quand un DTO change côté .NET, mettez à jour le type correspondant.
- Les composants client ne font jamais de requête : ils reçoivent leurs données ou appellent une Server Action.

## Ajouter une entité

Exemple : `Product`. Suivez le chemin de `Consumption` côté API.

1. **Entité** : `backend/Api/Entities/Product.cs` (les longueurs max en `const`, partagées par EF et la validation).
2. **DbContext** : ajoutez un `DbSet<Product>` et la configuration dans `OnModelCreating`.
3. **DTOs** : `backend/Api/Dtos/ProductDtos.cs` (requête avec DataAnnotations, réponse en `record`).
4. **Contrôleur** : `ProductsController`, calqué sur `ConsumptionsController`.
5. **Migration** (depuis `backend/`) :
   ```bash
   dotnet tool restore
   dotnet ef migrations add AddProduct --project Api
   ```
   Le `dotnet ef` a besoin d'une chaîne de connexion pour construire l'application : exportez `ConnectionStrings__Default` si vous n'avez pas de *user secret*.

   Branche `mysql` : le projet reste en `net10.0`, mais les paquets EF Core sont en `9.*` car Pomelo n'a pas de version pour EF Core 10. L'outil `dotnet-ef` est donc en 9.0.23 (avec `rollForward`), et `MySqlConnector` est épinglé en 2.6.2 (la 2.4.0 tirée par Pomelo a une vulnérabilité connue).
6. **Front** : type dans `lib/api-client/types.ts`, fonctions dans `lib/api-client/products.ts`, Server Actions dans `app/products/actions.ts`, formulaire et pages dans `app/products/`.
7. **Tests** : un fichier `ProductsEndpointsTests.cs` sur le modèle de `ConsumptionsEndpointsTests.cs`.

## Renommer le projet

Les noms `Api`, `Api.Tests` et `App` sont neutres : on peut les garder. Pour les changer (par exemple `MonProjet.Api`) :

1. renommez les dossiers, les `.csproj` et `App.sln` ;
2. remplacez `namespace Api` / `using Api.` dans le back et dans les tests ;
3. mettez à jour `RootNamespace` dans le `.csproj` ;
4. changez le `UserSecretsId` du `.csproj` (un nouveau GUID) ;
5. dans `.env.example` et `docker-compose.yml`, adaptez le nom de la base, de l'utilisateur et du conteneur.

Côté front : le nom de l'application est dans `app/layout.tsx` (métadonnées et en-tête) et les couleurs dans `app/globals.css`.

## Pièges Next.js 16 déjà rencontrés

`next.config.ts` active `cacheComponents` et `partialPrefetching`. Conséquences :

- **Toute lecture de l'API doit être sous une frontière `<Suspense>`.** Le `loading.tsx` racine couvre les pages de premier niveau, mais pas une navigation client vers une route imbriquée : le layout racine est déjà monté. Une page d'édition imbriquée (par exemple `app/<ressource>/[id]/edit/page.tsx`) doit donc afficher son titre tout de suite et lit `params` puis appelle l'API dans un composant enfant, dans son propre `<Suspense>`. Sans cela, `next dev` affiche *« encountered uncached data during prerendering or a navigation »*.
- `params` est une promesse : `await props.params`.
- `error.tsx` reçoit la prop `retry` (et non `reset`).
- `redirect()` fonctionne en levant une exception : appelez-le **hors** des `try/catch`.
- Une page « introuvable » répond en HTTP 200, car la page est streamée avant que l'API réponde. C'est une limite connue du streaming.
- `next build` appelle l'API pendant le rendu : `API_BASE_URL` doit être définie, sinon le build échoue avec « API_BASE_URL is not set ».
- Le fichier `frontend/AGENTS.md` est généré par `next dev` : gardez-le versionné pour ne pas recréer une modification à chaque lancement.

## Choix et limites

- Pas d'authentification, pas de CORS (inutile tant que seul le serveur Next appelle l'API).
- Pas de CI ni de Dockerfiles : Docker ne sert qu'à MySQL.
- Les types du front sont écrits à la main. Pour de gros projets, générez-les depuis `/openapi/v1.json`.
- La réponse de l'API est typée par un cast `as T` à un seul endroit (`client.ts`), sans validation à l'exécution. Ajoutez zod à cet endroit si l'API n'est pas de confiance.
- Conventions : identifiants et commentaires en anglais, textes affichés à l'utilisateur en français, commits en [Conventional Commits](https://www.conventionalcommits.org/).
