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

Other files:

- `ProductRequirementDocument.md` — high-level product requirements and goals.
- `PersonalTracker.sln` — Visual Studio solution for the backend.

## Tech stack & highlights

- Frontend: React (Vite) / React Native (Expo) with TypeScript.
- Backend: .NET 9 (C#), Entity Framework Core for data access.
- Microservices: Node.js + Express for experimental services.
- Integrations: Google Calendar, SaltEdge, AI insights (see `Controllers` and `Services` in `PersonalTrackerBackend`).
- Patterns: layered services, DI, controller/service separation, DTOs, and small, focused modules.

## Project goals for reviewers / employers

When reviewing this repo, consider the following:

- Clear separation of concerns between UI and backend.
- Use of TypeScript for type-safety across frontends.
- Production-aware backend patterns (logging, request logs, services, controllers).
- Integration points (AIInsights, Google Calendar) demonstrating external API design.
- Familiarity with both ecosystems (Node/JS and .NET/C#).

## Quick start — local development

Below are minimal steps to get each component running locally. For full environment variables and configuration, see config files in each subfolder (`appsettings*.json`, `app.json`, `package.json`) and the `GOOGLE_API_SETUP.md` for Google integrations.

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

Notes:
- The backend may require connection strings and API keys (look in `appsettings.Development.json` and `GOOGLE_API_SETUP.md`).
- For mobile native features, connect device or use an emulator via Expo.

## Project structure (quick tour)

- `PersonalTrackerBackend/Controllers` — HTTP endpoints (read controllers to see API shape).
- `PersonalTrackerBackend/Services` — Business logic and external API integration code.
- `PersonalTrackerBackend/Data` — EF Core DB context and data models.
- `PersonalTrackerReact/src` — Web app entry and components.
- `PersonalTrackerNative/app` — Native app routes and UI components.

## Tests & quality

This repo contains unit and integration points in several places. Running tests depends on the stack:

- For .NET: use `dotnet test` in the backend when tests are present.
- For Node/JS: run `npm test` inside the related package folders.



