# PersonalTracker

A multi-platform personal tracking suite: web app, native app, and a .NET backend with supporting microservices. This monorepo demonstrates full-stack skills (TypeScript/React/React Native, Node, C#/.NET), integrations (Google Calendar, AI insights), and pragmatic project structure suitable for interview walkthroughs and portfolio inspection.

## Why this project

PersonalTracker is built to showcase practical end-to-end development: a responsive web client for quick access, a native app for mobile reading and offline features, and a scalable backend powering authentication, data persistence, and third-party integrations. It highlights design choices, testability, and cross-platform code organization.

## Repository overview

Top-level folders (major components):

- `PersonalTrackerReact/` — Web frontend (Vite + React + TypeScript).
- `PersonalTrackerNative/` — Native application (Expo / React Native + TypeScript).
- `PersonalTrackerBackend/` — .NET backend (C#) with controllers, services, and EF Core data models.
- `food-backend/` — Small Node/Express service used by the project (example microservice).
- 
## Project structure 

- `PersonalTrackerBackend/Controllers` — HTTP endpoints (read controllers to see API shape).
- `PersonalTrackerBackend/Services` — Business logic and external API integration code.
- `PersonalTrackerBackend/Data` — EF Core DB context and data models.
- `PersonalTrackerReact/src` — Web app entry and components.
- `PersonalTrackerNative/app` — Native app routes and UI components.

## Tech stack & highlights

- Frontend: React (Vite) / React Native (Expo) with TypeScript.
- Backend: .NET 9 (C#), Entity Framework Core for data access.
- Microservices: Node.js + Express for experimental services.
- Integrations: Google Calendar, SaltEdge, AI insights (see `Controllers` and `Services` in `PersonalTrackerBackend`).
- Patterns: layered services, DI, controller/service separation, DTOs, and small, focused modules.

## Quick start 

Windows PowerShell snippets (copy/paste into PowerShell):

Web (PersonalTrackerReact):

```powershell
cd "./PersonalTrackerReact"
npm install
npm run dev
```

Native (PersonalTrackerNative - Expo):

```powershell
cd "./PersonalTrackerNative"
npm install
# Start Expo dev server
npm start
```

.NET Backend (PersonalTrackerBackend):

```powershell
cd "./PersonalTrackerBackend"
dotnet restore
dotnet build
dotnet run
```

Node microservice (food-backend):

```powershell
cd "./food-backend"
npm install
node ./bin/www
```

## Tests & quality

- For .NET: use `dotnet test` in the backend when tests are present.
- For Node/JS: run `npm test` inside the related package folders.



