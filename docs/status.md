# StuckonStack - Project Status

## Accomplished
- **CLI Flow**: Interactive scaffolding prompts via `@clack/prompts` (Preset and Custom modes).
- **Environment Checks**: Verification for Docker, Python, and Node versions before proceeding.
- **Stitching Logic**: `stitchProject` core implemented for copying templates, merging `package.json`, and overlaying database/auth extensions.
- **Frontends**: `nextjs`, `react-vite`, `vue-vite` templates exist.
- **Backends**: `express`, `fastapi`, `nestjs`, `django` templates exist.
- **Databases**: `mysql`, `postgresql`, `mongodb` templates exist for backends.
- **BaaS Folders**: Creation of standard directories for Supabase (`supabase/migrations`, `supabase/functions`) and Firebase (`firebase/functions`).
- **Runner Configuration**: Support for generating `docker-compose` and local `concurrently` (npm) setups.
- **Auth Templates**: Clerk boilerplate implemented for React/Express (Login/Signup/Home with session management).

## To Do
- **Populate Templates**: The newly created template directories (`vue-vite`, `nestjs`, `django`, `mysql-*`) are currently empty folders waiting for actual boilerplate code.
- **Verify Auth Templates**: Ensure integration overlays for all auth providers work correctly (Clerk, NextAuth, Firebase Auth, Supabase Auth) across all supported frontend/backend combos.
