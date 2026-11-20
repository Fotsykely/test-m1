# Test M1 — suivi de la consommation énergétique

Application de suivi de la consommation énergétique (kWh) des salles d'un campus universitaire : saisie par mois et par année, pour chaque salle, selon le type d'énergie (Jirama, solaire, groupe électrogène), puis consultation de la liste et du résultat.

Stack : **Next.js 16** (front), **ASP.NET Core / .NET 10** (API), MySQL 8.4 (EF Core 9 + Pomelo). Le projet part du template [next-dotnet-template](https://github.com/Fotsykely/next-dotnet-template) (branche `mysql`), dont la documentation technique suit.

Il contient pour l'instant le CRUD d'exemple du template (`Item`), qui montre le chemin complet : base de données → API → `lib/api-client` → pages Next.js. Il sera supprimé quand les vraies entités seront en place.

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

Au démarrage, l'API applique les migrations puis insère trois éléments de démonstration si la table est vide. La chaîne de connexion n'est jamais dans le code : elle vient des *user secrets* en développement, ou de la variable d'environnement `ConnectionStrings__Default` ailleurs. Le port et le mot de passe doivent correspondre à votre `.env`.

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

### Points d'entrée de l'API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/items` | liste |
| GET | `/api/items/{id}` | détail (404 si inconnu) |
| POST | `/api/items` | création (400 + erreurs par champ si invalide) |
| PUT | `/api/items/{id}` | modification |
| DELETE | `/api/items/{id}` | suppression (204, ou 404) |
| GET | `/health` | santé de l'API et de la base |

Les erreurs non gérées et les statuts nus (404, 405…) répondent en `ProblemDetails` (JSON).

### Le client d'API (`frontend/lib/api-client`)

- `client.ts` est le **seul** endroit qui fait du `fetch`. Il traduit les statuts HTTP en erreurs typées : 404 → `ApiNotFoundError`, 400 → `ApiValidationError` (noms de champs en camelCase), autre → `Error`. Délai maximum de 5 s.
- `items.ts` expose une fonction par endpoint. Les pages et les Server Actions n'appellent que ces fonctions.
- `types.ts` reproduit à la main les DTOs de l'API. Quand un DTO change côté .NET, mettez à jour le type correspondant.
- Les composants client ne font jamais de requête : ils reçoivent leurs données ou appellent une Server Action.

## Ajouter une entité

Exemple : `Product`. Suivez le chemin d'`Item`.

1. **Entité** : `backend/Api/Entities/Product.cs` (les longueurs max en `const`, partagées par EF et la validation).
2. **DbContext** : ajoutez un `DbSet<Product>` et la configuration dans `OnModelCreating`.
3. **DTOs** : `backend/Api/Dtos/ProductDtos.cs` (requête avec DataAnnotations, réponse en `record`).
4. **Contrôleur** : `ProductsController`, calqué sur `ItemsController`.
5. **Migration** (depuis `backend/`) :
   ```bash
   dotnet tool restore
   dotnet ef migrations add AddProduct --project Api
   ```
   Le `dotnet ef` a besoin d'une chaîne de connexion pour construire l'application : exportez `ConnectionStrings__Default` si vous n'avez pas de *user secret*.

   Branche `mysql` : le projet reste en `net10.0`, mais les paquets EF Core sont en `9.*` car Pomelo n'a pas de version pour EF Core 10. L'outil `dotnet-ef` est donc en 9.0.23 (avec `rollForward`), et `MySqlConnector` est épinglé en 2.6.2 (la 2.4.0 tirée par Pomelo a une vulnérabilité connue).
6. **Front** : type dans `lib/api-client/types.ts`, fonctions dans `lib/api-client/products.ts`, Server Actions dans `app/products/actions.ts`, formulaire et pages sur le modèle de `item-form.tsx` et `app/items/`.
7. **Tests** : un fichier `ProductsEndpointsTests.cs` sur le modèle de `ItemsEndpointsTests.cs`.

Pour **supprimer l'exemple** : retirez les fichiers `Item*` du back (et la migration `InitialCreate`, à régénérer), puis `lib/api-client/items.ts`, `components/item-form.tsx`, `app/items/`, `app/_components/item-row.tsx` et le contenu de `app/page.tsx`.

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

- **Toute lecture de l'API doit être sous une frontière `<Suspense>`.** Le `loading.tsx` racine couvre les pages de premier niveau, mais pas une navigation client vers une route imbriquée : le layout racine est déjà monté. La page d'édition (`app/items/[itemId]/edit/page.tsx`) affiche donc son titre tout de suite et lit `params` puis appelle l'API dans un composant enfant, dans son propre `<Suspense>`. Sans cela, `next dev` affiche *« encountered uncached data during prerendering or a navigation »*.
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
