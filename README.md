# PersonalTracker

<!-- Frontend -->
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
<!-- Backend -->
![.NET](https://img.shields.io/badge/.NET_9-512BD4?style=flat&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat&logo=csharp&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)

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



