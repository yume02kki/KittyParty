# KittyParty - API Proxy Comparison Platform

Internal tool for capturing real API traffic, forwarding it to two APIs (Main + Dev), comparing results, and visualizing differences.

## Architecture

- **Backend**: C# / .NET 9 Web API (in-memory storage)
- **Frontend**: React + TypeScript (Vite)

## Quick Start

### Backend

```bash
cd backend/KittyParty.Api
dotnet run
```

Runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

## Usage

### 1. Create a Mission

Open the frontend, click **+ New Mission**, and enter:
- **Name**: e.g. "User Service v2 Migration"
- **Main API URL**: e.g. `http://localhost:3001`
- **Dev API URL**: e.g. `http://localhost:3002`

### 2. Send Traffic Through the Proxy

Point your client at the proxy endpoint instead of the real API:

```
GET http://localhost:5000/proxy/{missionId}/users/123
POST http://localhost:5000/proxy/{missionId}/orders
```

The proxy will:
- Forward the request to **both** APIs in parallel
- Return only the **Main API** response to the client
- Store both responses and compute a diff

### 3. View Results

Open the Mission Dashboard to see:
- Traffic log table with method, path, status codes, and match/diff indicators
- Click any row for side-by-side response comparison
- Highlighted differences between Main and Dev responses

### 4. Add Regex Ignore Rules

Go to the **Ignore Rules** tab to:
- Add regex patterns (e.g. `"id":\s*"[a-f0-9-]+"` to ignore UUIDs)
- Set optional replacement values
- Test rules against sample response bodies

### 5. Replay Traffic

Click **Replay** on any captured request to re-send it to both APIs and compare fresh results.

### 6. Export / Import

- **Export**: Download captured traffic as JSON
- **Import**: Load previously exported traffic into a mission

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/missions/` | List missions |
| POST | `/api/missions/` | Create mission |
| GET | `/api/missions/{id}` | Get mission |
| PUT | `/api/missions/{id}` | Update mission |
| DELETE | `/api/missions/{id}` | Delete mission |
| GET | `/api/missions/{id}/rules` | List ignore rules |
| POST | `/api/missions/{id}/rules` | Add ignore rule |
| DELETE | `/api/missions/{mid}/rules/{rid}` | Delete ignore rule |
| POST | `/api/missions/{id}/rules/test` | Test rules on sample text |
| GET | `/api/logs/mission/{missionId}` | Get logs for mission |
| GET | `/api/logs/{id}` | Get single log |
| POST | `/api/logs/{id}/replay` | Replay a request |
| GET | `/api/missions/{id}/export` | Export traffic |
| POST | `/api/missions/{id}/import` | Import traffic |
| ANY | `/proxy/{missionId}/{*path}` | Proxy endpoint |
