# Standalone wedding planner

The user explicitly requires an ordinary, no-login GitHub Pages site. Do not add hosted AI-platform dependencies, sign-in gates, popup bridges, or storage-connection screens.

Preserve the blue translucent design, monogram, 11 AM wedding time, horizontal progress and personal dashboards. Honeymoon is excluded. Preserve the user's browser data; initial-board is only for a fresh browser. Amounts in GHS and USD remain separate, unknown is not zero, and Done is independent of Paid.

When the `SYNC_URL` repository variable is set, the planner board is saved to Google Drive through `google-drive/Code.gs`, with no sign-in for viewers. Without it, GitHub Pages stores edits in IndexedDB; clearly disclose that those local edits are not synced. Change data that is already saved by adding a migration to `src/lib/migrations.ts` and baking it into `initial-board.json`; editing `initial-board.json` alone only affects new browsers. The optional Node server supports shared editing when hosted elsewhere; do not claim it is deployed.

Publish `dist/` using the GitHub Actions workflow. Never include raw WhatsApp ZIPs or unrelated media. Run npm run build and npm test for changes to persistence.
