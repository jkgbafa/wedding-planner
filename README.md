# Joshua & Lucia — Wedding Planner

Live site: https://jkgbafa.github.io/wedding-planner/

A standalone React + TypeScript + Vite app. Opens directly with no login, account, popup, platform SDK, or external storage connection. Source code, initial checklist, build configuration and an optional portable backend are included here.

## Google Drive sync (recommended)

With sync turned on, the planner is saved to a file in Joshua's Google Drive, so every device and everyone with the link sees the same list. Nobody needs to log in to the site.

1. Go to https://script.google.com and click **New project**.
2. Delete what's in the editor, paste in everything from `google-drive/Code.gs` and save.
3. Click **Deploy → New deployment**, choose the type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and allow access.
4. Copy the **Web app URL** (it ends in `/exec`).
5. In this repository go to **Settings → Secrets and variables → Actions → Variables**, add a variable named `SYNC_URL` with that URL, then re-run the **Deploy wedding planner** workflow.

The first time the site loads after that, it copies the planner saved in that browser into Drive, so open it first in the browser you've been editing in. The data lives in `Wedding planner data.json` in your Drive; Drive keeps earlier versions under **Manage versions**. Anyone who has the site link can view and edit. Uploaded source files stay in the browser that added them.

## GitHub Pages without sync

Edits and uploaded files are saved in IndexedDB in the current browser. They survive reloads but are **not automatically shared with other devices or other people**. A new browser starts with the published checklist. Clearing site data or private browsing can remove local changes.

Use **Download backup** to export your current list. Use **Restore backup** to move it to another device. Restore downloads a backup of the previous list before replacement. Original uploads are stored locally and can be downloaded individually under Import & reconcile.

The starting snapshot contains 81 items: the 103 exported from the prior planner on 9 October 2026, with the 13 October corrections in `src/lib/migrations.ts` applied. Those corrections are also applied once to planners already saved in a browser or on the server. It is public as requested. Raw chat archives and personal source media are not included.

## Develop or move to another host

Requires Node 22.13+ (Node 24 recommended).

```sh
npm ci
npm run dev
npm run build
```

GitHub Actions deploys `dist/` on pushes to `main`. For another static host, build with `VITE_BASE=/ npm run build` and upload `dist/`. For a subdirectory, set `VITE_BASE=/your-path/`.

### Optional shared editing server

To enable shared edits on a conventional Node host with a persistent disk:

```sh
npm ci
npm run build:server
DATA_DIR=/persistent/wedding-data PORT=3000 npm start
```

This serves the app and `/api/board` and `/api/files` from the same origin. The `DATA_DIR` directory stores the shared board and original uploads. Use a persistent disk; ephemeral server filesystems will lose changes. The backend has **no login by design**: anyone who can reach it can view and edit its data. It is supplied for migration and is not running on GitHub Pages.

The backend uses validation, atomic file replacement and revision checks to prevent silently overwriting another person's edits. To migrate your latest list, start the server and use Restore backup. Copy uploaded files separately.

## Structure

- `src/app/dashboard.tsx`: main dashboard and item editor
- `src/app/personal-dashboard.tsx`: personal payments and tasks
- `src/lib/local-store.ts`: browser persistence
- `src/lib/drive-store.ts` and `google-drive/Code.gs`: Google Drive sync
- `src/lib/migrations.ts`: one-time corrections applied to saved planners
- `src/lib/api.ts`: local or optional same-origin server adapter
- `src/lib/initial-board.json`: starting data
- `server.mjs`: optional shared backend

The blue design, wedding monogram, horizontal progress, Joshua/Lucia dashboards, finance tracking, spreadsheet/PDF imports and exports are retained. Cedis and dollars stay separate; marking a task Done does not mark its payment Paid.
