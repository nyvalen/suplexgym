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

### Server configuration

The ASP.NET API reads standard .NET configuration values. For Azure App Service, configure these in **Settings → Environment variables** (double underscores map to `:`):

- `Jwt__Secret`: required; use a unique random secret of at least 32 UTF-8 bytes.
- `Storage__DataDirectory`: optional writable persistent directory. Defaults to `$HOME/data` on App Service; uploaded images and the default SQLite database are stored there.
- `ConnectionStrings__DefaultConnection`: optional SQLite connection string override.
- `Email__SmtpHost`, `Email__SmtpPort`, `Email__SenderName`, `Email__SenderAddress`, `Email__Username`, `Email__Password`: optional SMTP settings; emails are skipped when they are not configured.

The API uses the App Service-provided HTTP binding (the .NET 8 default port) and applies EF Core migrations on startup. SQLite is suitable for a single App Service instance; use a managed database before scaling out to multiple instances.

### Deploying the server to Azure App Service

Create an App Service running .NET 8, set the configuration above, and publish the project from the `Server` directory:

```sh
dotnet publish suplex_projektmunka/suplex_projektmunka.csproj --configuration Release
```

Keep App Service **Always On** enabled for production and make sure the API's CORS policy allows the deployed frontend origin.

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