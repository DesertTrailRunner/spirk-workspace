# eynsagent

An agent builder built with Vue, Supabase, and OpenAI.

## Creation prompt
I would like to create a Vue app that works as an agent builder. I already have an account on OpenAI and an API key, and an account on Vercel to host this Vue app, and a database hosted in Supabase. Update this app to allow the user to create a simple agent. The agent will be defined by a name, purpose, personality, and knowledge sources. The app should allow the user to create, edit and delete agents stored in the Supabase database table "agents". It should allow the user to chat with a specific agent, which will send the system prompt and knowledge sources to the OpenAI model and respond.

## Configure

Create a `.env.local` file for local development and add:

```sh
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

Run the SQL in `supabase/schema.sql` in the Supabase SQL editor. The app uses the `agents` table for CRUD and sends chat requests to the Vercel function in `api/chat.ts`. Keep `OPENAI_API_KEY` server-side and add it as a Vercel environment variable; only the two `VITE_` values belong in the browser.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
