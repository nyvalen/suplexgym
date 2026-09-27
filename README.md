# Suplexgym

This repository contains a web and a mobile app for our school exam, using React and React Native frontend and ASP .NET Core for our server.

## Getting Started

This section details how to install our project onto your local machine to develop or test.


### Prerequisites

> You'll need the following tooling to be able to contribute:

- npm (Node Package Manager): Required for running and building the website and the mobile app, which serves as the frontend of the application.
- Expo GO: Needed for opening the mobile application on your phone.
- Dotnet

---

### Environment variables

The app depends on the following environment variables:

- PORT (default: 8080)
- DB_URL (default: suplexgym.db)
- SECRET_KEY (default: super_secret_key)
- ALLOWED_ORIGINS (default: http://localhost:5173)

### Setting up the project

1 - Clone the repo:

```bash
git clone https://github.com/nyvalen/suplexgym.git
```

2 - Install dependencies and build each application from its own directory:

```bash
cd web
npm ci
npm run build --workspace=web
```

For the mobile app, run `npm install` from `mobile/`. Build the ASP.NET server from `Server/` with `dotnet build`.