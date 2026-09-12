# AEM Cosentino

AEM Cosentino is an Adobe Experience Manager (AEM) Edge Delivery Services project based on [`adobe-rnd/aem-boilerplate-xwalk`](https://github.com/adobe-rnd/aem-boilerplate-xwalk).

The project supports two kinds of blocks:

- **Vanilla AEM blocks** continue to use the standard HTML/CSS/JavaScript decoration model.
- **React islands** are authored as normal AEM blocks, rendered to HTML by an optional Node.js SSR gateway, and hydrated in the browser for interactivity.

Two reference React blocks are included:

- `react-teaser`: a two-field teaser with an expandable details action.
- `react-button`: a one-field button whose pressed state demonstrates hydration and React state.

The SSR gateway is optional during development, but it must be used in production if React components need to be present in the initial HTML response. Opening an `*.aem.page` or `*.aem.live` URL directly still works, but React blocks are then rendered client-side rather than server-side.

## Requirements

- Node.js 20.19 or newer; Node.js 24 is used in CI
- npm
- AEM Cloud Service release 2026.4 or newer
- An AEM Edge Delivery origin for real content, for example:
  `https://main--aem-cosentino--diegovanbelle.aem.live`

## Install and verify

```sh
npm install
npm run build
npm test
npm run lint
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run build:json` | Regenerate the aggregate Universal Editor component JSON files. |
| `npm run build:react` | Build Tailwind CSS, the server renderer, and browser hydration bundle. |
| `npm run build` | Build both the component JSON and React bundles. |
| `npm test` | Build React and run the SSR, gateway, island, and demo tests. |
| `npm run lint` | Lint JavaScript, JSX, JSON, and CSS. |
| `npm run demo:ssr` | Start a self-contained SSR demo without an AEM environment. |
| `npm run start:ssr` | Start the SSR gateway against `AEM_ORIGIN`. |

## Run locally

### Offline SSR demo

Use this to inspect the complete SSR and hydration flow without published AEM content:

```sh
npm run demo:ssr
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The React teaser is already present in the returned HTML. Its button becomes interactive after React hydrates it.

Use another port if port 3000 is occupied:

```sh
PORT=3001 npm run demo:ssr
```

### SSR with AEM content

Build the generated bundles, set the trusted AEM origin, and start the gateway:

```sh
npm run build
AEM_ORIGIN=https://main--aem-cosentino--diegovanbelle.aem.live \
PUBLIC_HOST=www.example.com \
PORT=3000 \
npm run start:ssr
```

Environment variables:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `AEM_ORIGIN` | Yes | — | Fixed `http` or `https` AEM origin. It may not contain credentials or a path. |
| `PUBLIC_HOST` | No | — | Trusted production hostname forwarded to AEM as `X-Forwarded-Host`. Do not derive this from the incoming request. |
| `PORT` | No | `3000` | Gateway listening port. |
| `HOST` | No | `127.0.0.1` | Gateway listening interface. Use `0.0.0.0` in a container when required. |

### Standard AEM development

The normal AEM CLI workflow remains available:

```sh
npx -y @adobe/aem-cli up --no-open --forward-browser-logs
```

This serves the repository directly at `http://localhost:3000`. Because that request does not pass through the SSR gateway, React blocks use the client-rendering fallback. Use `npm run demo:ssr` or `npm run start:ssr` when testing initial server-rendered HTML.

## Tailwind styling for React islands

Tailwind CSS v4 is compiled locally using `tailwindcss` and `@tailwindcss/cli`.
There is no CDN, browser compiler, runtime CSS injection, or global reset.

```sh
npm run build:css  # Minify react/tailwind.css into styles/react-tailwind.css
npm run watch:css  # Recompile CSS when component utility classes change
```

`build:react` builds CSS before both JSX bundles, so `build`, `test`, and
`demo:ssr` always include current styles. The CSS watcher watches only CSS/class
changes, not the React bundle: run `npm run build:react` after JSX changes to
update rendering too. Build before starting the standard AEM CLI or SSR gateway;
restart the gateway after rebuilding its server bundle.

### Stylesheet delivery and cascade

- `head.html` includes `/styles/react-tailwind.css` as a normal blocking stylesheet
  after the AEM stylesheet. It is already available for direct CSR pages and
  newly inserted Universal Editor islands.
- The SSR renderer also ensures that link exists, even when upstream HTML lacks
  the shared head, without adding duplicates. Initial SSR content is styled with
  JavaScript disabled; actions still require JavaScript.
- The gateway serves this exact generated asset from its own build (including
  GET, HEAD, and cache-busting query strings), just like the hydration bundle.
  The offline fixture explicitly allows it. Direct AEM delivery uses the checked-in
  `styles/react-tailwind.css`; deploy CSS and both React bundles from one revision.
- `react/tailwind.css` imports only theme and utilities, **not Preflight**. Vanilla
  AEM headings, images, buttons, and quote blocks are not reset. Tailwind's theme
  variables and property initializers are `--tw-*` namespaced, not visual resets.
- Utilities deliberately remain **unlayered**: otherwise unlayered AEM element
  rules would outrank layered Tailwind utilities regardless of specificity.
  Prefixed class selectors beat the existing element styles without `!important`.
  The old React block visual rules were removed to avoid higher-specificity
  conflicts and a styling shift when AEM lazily loads those block stylesheets.
  Keep those files for scoped layout overrides, not duplicate utility styling.

### Authoring utilities

Put complete, literal `tw:` utility names in `react/components/**/*.jsx`:

```jsx
<article className="tw:rounded-2xl tw:bg-stone-100 tw:p-6 tw:sm:p-10">
  <h2 className="tw:m-0 tw:text-3xl tw:font-bold">Surfaces</h2>
</article>
```

The prefix comes first, including variants: `tw:hover:bg-stone-700` and
`tw:focus-visible:outline-3`. Scan scope is explicit (`source(none)` plus
`@source`); tests, authored content, generated bundles, and vanilla blocks do not
inflate the stylesheet. Add an `@source` entry if components move outside that
folder. Never construct partial class names such as `tw:bg-${color}-900`;
map choices to complete literal classes. This also applies to conditional UI.

Without Preflight, specify borders (`tw:border-solid` plus width/color), sizing
(`tw:box-border`), margins, typography, and button states explicitly where needed.
Keep native buttons, accessible names, ARIA state, visible keyboard focus, and
identical initial SSR/client classes. Breakpoints follow AEM: `sm` 600px, `md`
900px, `lg` 1200px. Both reference components use stone colors, rounded edges,
explicit focus outlines, and responsive spacing; the Button's pressed state has
contrasting background and text colors.

Commit the generated stylesheet alongside `scripts/react-islands.js`. CI checks
both for build drift. Stylelint validates the Tailwind input with narrow directive
exceptions and skips only the generated CSS; do not edit generated CSS by hand.

### Browser compatibility

Tailwind v4 requires modern browsers: Safari 16.4+, Chrome 111+, and Firefox 128+.
It uses features such as `@property` and `color-mix()`; this is not a legacy-browser
polyfill. Validate your supported browser matrix before deployment. Vanilla blocks
retain their existing CSS behavior; choosing older-browser support for React
islands would require a different Tailwind version/build strategy.

References: [CLI installation](https://tailwindcss.com/docs/installation/tailwind-cli),
[omitting Preflight and prefixing imports](https://tailwindcss.com/docs/preflight),
[source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files),
[browser compatibility](https://tailwindcss.com/docs/compatibility).

## Architecture

```text
                       build time
 react/components/*.jsx ─┐
 react/components.jsx ───┴─────────┬─> react/dist/server.mjs
          │                        └─> scripts/react-islands.js
          │
          │              request time
 Browser ─┴─> SSR gateway ─> AEM Edge Delivery origin
                  │                    │
                  │                    └─ authored page/block HTML
                  │
                  ├─ finds registered React block roots
                  ├─ reads authored rows as component props
                  ├─ renderToString(component, props)
                  └─ returns complete HTML with SSR markers and props
                                      │
                                      v
                              Browser receives HTML
                                      │
                                      ├─ AEM decorates sections/blocks
                                      ├─ React-owned children are protected
                                      └─ hydrateRoot attaches interactivity
```

### Request lifecycle

1. A browser requests a page from the Node.js gateway.
2. `react/gateway.mjs` sends the path and query string to the fixed `AEM_ORIGIN`.
3. Assets and non-document responses pass through unchanged in content. Full HTML documents are sent to `transformHTML`; `.plain.html` fragments are not transformed.
4. `react/server.jsx` finds block classes registered in `react/components.jsx`.
5. `readProps()` converts the authored AEM block rows into React props.
6. React's `renderToString()` replaces the authored children with component HTML. The existing block root and its `data-aue-*` instrumentation stay in place.
7. The renderer writes `data-react-ssr` and serialized `data-react-props` attributes on the block root. These provide an explicit contract to the browser bundle.
8. The browser receives meaningful HTML before JavaScript executes, so the content is available to crawlers and remains visible with JavaScript disabled.
9. AEM loads `blocks/<block>/<block>.js`. For a React block, that loader imports `scripts/react-islands.js` and calls `mount(block)`.
10. `react/client.jsx` calls `hydrateRoot()` when SSR markers are present. For direct AEM pages or newly inserted Universal Editor markup without SSR markers, it calls `createRoot()` instead.

### React islands and AEM ownership

React owns only the children of registered React block roots. AEM continues to own the outer block element, section structure, block lifecycle, styles, and Universal Editor instrumentation.

`scripts/react-support.js` temporarily removes React-owned children while synchronous AEM decorators run. This prevents button, icon, block, and rich-text decorators from rewriting the server-generated React tree before hydration. Keep `REACT_BLOCKS` aligned with the registry whenever a component is added or removed.

### Important files

```text
react/
├── components/
│   ├── Button.jsx       # Button component and its authored-props parser
│   └── Teaser.jsx       # Teaser component and its authored-props parser
├── components.jsx       # Registry mapping block names to components and parsers
├── server.jsx           # HTML document transformation and renderToString()
├── client.jsx           # hydrateRoot()/createRoot() island mounting
├── build.mjs            # Builds server and browser bundles with esbuild
├── gateway.mjs          # HTTP gateway in front of the fixed AEM origin
├── start.mjs            # Production-style gateway entry point
├── demo.mjs             # Offline demo entry point
├── fixture.mjs          # Explicit test/demo origin
└── fixture.html         # Demo AEM-like document

blocks/react-teaser/
├── _react-teaser.json   # Universal Editor definition and model
├── react-teaser.js      # Small AEM loader that mounts the React island
└── react-teaser.css     # Block-scoped styles

blocks/react-button/
├── _react-button.json   # One-field button definition and model
├── react-button.js      # Mounts the shared React island bundle
└── react-button.css     # Button states and block-scoped styles

scripts/
├── react-islands.js     # Generated browser bundle; do not edit by hand
└── react-support.js     # Protects React-owned children during AEM decoration
```

`react/dist/server.mjs` and `scripts/react-islands.js` are generated by `npm run build:react`. Edit the JSX source files, not generated output.

## Add a React component: step by step

The following example adds a `react-product-card` block with authored `title` and `description` fields.

### 1. Add the React component

Create `react/components/ProductCard.jsx`:

```jsx
import { useState } from 'react';

export function ProductCard({ title, description }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article>
      <h2>{title}</h2>
      <p>{description}</p>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        Details
      </button>
      {expanded && <p>Additional product information.</p>}
    </article>
  );
}
```

Keep the initial render deterministic. The server and browser must produce identical HTML during hydration: do not read `window`, `document`, the current time, or random values during the initial render.

### 2. Register the component

Edit `react/components.jsx`, import the component and parser with the exact filename casing and `.jsx` extension, then add the AEM block name to `registry`:

```jsx
import {
  ProductCard,
  readProductCardProps,
} from './components/ProductCard.jsx';

export const registry = {
  'react-teaser': { Component: Teaser, readProps: readTeaserProps },
  'react-button': { Component: Button, readProps: readButtonProps },
  'react-product-card': {
    Component: ProductCard,
    readProps: readProductCardProps,
  },
};
```

The registry key must exactly match the block folder name, block CSS class, and Universal Editor component ID.

### 3. Map authored rows to props

Each registry entry owns its parser. In `react/components/ProductCard.jsx`, export a parser that maps the authored row order to component props:

```jsx
export const readProductCardProps = (block) => {
  const rows = [...block.children];
  return {
    title: rows[0]?.textContent.trim() || 'Product',
    description: rows[1]?.textContent.trim() || '',
  };
};
```

Define the parser before `registry`, then reference it in the new entry as shown above. `react/server.jsx` and `react/client.jsx` both consume the same registry entry, ensuring that SSR and hydration receive identical props.

### 4. Add the AEM block loader

Create `blocks/react-product-card/react-product-card.js`:

```js
export default async function decorate(block) {
  const { mount } = await import('../../scripts/react-islands.js');
  mount(block);
}
```

This keeps the standard Edge Delivery block lifecycle. Do not import React directly into every block loader.

### 5. Add block-scoped styles

Create `blocks/react-product-card/react-product-card.css`:

```css
.react-product-card article {
  padding: 24px;
  border: 1px solid currentcolor;
  border-radius: 8px;
}

.react-product-card button {
  cursor: pointer;
}
```

All selectors must be scoped below `.react-product-card`.

### 6. Add the Universal Editor model

Create `blocks/react-product-card/_react-product-card.json`:

```json
{
  "definitions": [
    {
      "title": "React Product Card",
      "id": "react-product-card",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "React Product Card",
              "model": "react-product-card"
            }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "react-product-card",
      "fields": [
        {
          "component": "text",
          "valueType": "string",
          "name": "title",
          "label": "Title",
          "value": ""
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "description",
          "label": "Description",
          "value": ""
        }
      ]
    }
  ],
  "filters": []
}
```

The field order defines the row order consumed by `readProps()`.

### 7. Allow the block inside sections

Add the ID to the `components` list in `models/_section.json`:

```json
"components": [
  "text",
  "image",
  "button",
  "title",
  "hero",
  "cards",
  "columns",
  "fragment",
  "react-teaser",
  "react-button",
  "react-product-card"
]
```

### 8. Protect the island during AEM decoration

Add its selector to `REACT_BLOCKS` in `scripts/react-support.js`:

```js
export const REACT_BLOCKS = '.react-teaser, .react-button, .react-product-card';
```

If this selector is omitted, AEM decorators can mutate React's initial DOM and cause hydration mismatches.

### 9. Add tests

Add assertions under `test/` for both rendering modes:

- `transformHTML()` includes the component content in the initial document.
- The block root retains `data-aue-*` attributes.
- SSR output receives the correct `data-react-ssr` and serialized props.
- The browser hydrates without changing the initial DOM.
- Direct/raw AEM markup mounts through `createRoot()`.
- An interaction such as a button click updates the component.

Use a small AEM-shaped fixture whose block rows match the Universal Editor model.

### 10. Build and validate

```sh
npm run build
npm test
npm run lint
```

`npm run build` regenerates:

- `component-definition.json`
- `component-models.json`
- `component-filters.json`
- `react/dist/server.mjs`
- `scripts/react-islands.js`
- `styles/react-tailwind.css`

Review and commit the three aggregate component JSON files, `scripts/react-islands.js`, and `styles/react-tailwind.css`. `react/dist/` stays ignored because it is rebuilt before the gateway starts or during deployment.

### 11. Test both delivery paths

1. Run `npm run demo:ssr` or start the gateway against AEM.
2. View page source or use `curl`; confirm component text exists in the HTTP response.
3. Disable JavaScript; confirm the component content remains visible.
4. Enable JavaScript; confirm the component hydrates and interactions work without hydration errors.
5. Open the direct AEM/Universal Editor flow; confirm the component uses client rendering and remains editable.

## Deployment

AEM Code Sync publishes repository assets, but `*.aem.page` and `*.aem.live` do not execute this Node.js gateway. To get true SSR on the production domain:

1. Run `npm ci` and `npm run build` in the deployment image or pipeline.
2. Deploy `npm run start:ssr` to a Node.js 20.19+ service or compatible container platform.
3. Set `AEM_ORIGIN` to the production `.aem.live` origin.
4. Set `PUBLIC_HOST` to the public site hostname when required by the AEM/CDN configuration.
5. Point the public CDN or load balancer at the gateway.
6. Preserve query strings in the CDN cache key and origin request.
7. Configure health checks and appropriate production caching before launch. The reference gateway returns transformed responses with `Cache-Control: no-store`; add a reviewed caching layer for production scale.
8. Validate the setup in a staging environment before moving the public domain.

Do not set `AEM_ORIGIN` from request data. It is the gateway's SSRF boundary and must remain trusted deployment configuration.

## Limitations

- SSR is applied only to full HTML documents. Client-loaded `.plain.html` fragments are not part of the initial SSR pass; React blocks inside them use the client fallback.
- The renderer uses `renderToString()`, so components must receive their data before rendering. It does not implement React Server Components or streaming Suspense.
- The reference gateway accepts only `GET` and `HEAD`, has request/response size and concurrency limits, and rejects upstream redirects. Adapt these policies deliberately if the production site needs other behavior.
- Universal Editor updates insert raw authored markup, so updated React islands are client-rendered after the edit rather than round-tripping through the SSR gateway.
- The SSR and hydration bundles must come from the same source revision. Deploy them atomically to avoid hydration mismatches.

## Environments

- Preview: `https://main--aem-cosentino--diegovanbelle.aem.page/`
- Live: `https://main--aem-cosentino--diegovanbelle.aem.live/`
- Feature preview: `https://<branch>--aem-cosentino--diegovanbelle.aem.page/`

At the time this integration was implemented, the preview and live root URLs returned HTTP 404 because no root content was available there. The offline demo remains available for verifying the SSR implementation independently.

## Further reading

- [AEM authoring](https://www.aem.live/docs/aem-authoring)
- [Universal Editor tutorial](https://www.aem.live/developer/ue-tutorial)
- [Component model definitions](https://www.aem.live/developer/component-model-definitions)
- [AEM Edge Delivery architecture](https://www.aem.live/docs/architecture)
- [BYO CDN setup](https://www.aem.live/docs/byo-cdn-setup)
- [React `renderToString`](https://react.dev/reference/react-dom/server/renderToString)
- [React `hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot)
