# Security Considerations

Security guidance for using AutoTracer without exposing sensitive data.

## Overview

Treat trace output as sensitive operational data. Publicly accessible builds should exclude AutoTracer entirely. When AutoTracer is used in restricted internal DEV/QA environments, trace only the code paths and data you are prepared to expose in logs.

## Core Rules

- Keep AutoTracer out of publicly accessible builds. See [Production Deployment](/best-practices/production).
- Do not trace credential handling, authentication flows, payment flows, or PII-heavy components.
- Assume any operator with access to a browser build that ships AutoTracer can activate tracing.
- Treat any copied or stored trace output as sensitive operational data.
- Prefer synthetic or scrubbed data in DEV/QA. If real user or customer data can appear, define retention and deletion procedures before tracing begins.

## Credentials and Secrets

**Risk:** Tokens, API keys, passwords, session identifiers, and authorization headers can appear in traces.

Use FlowTracer excludes for sensitive functions. For React, exclude sensitive files or component patterns at build time, then use tracing directives for component-level exceptions. React runtime name filters can narrow a live session, but they are not a security boundary.

### FlowTracer: Exclude Credential Handling

```javascript
// FlowTracer
{
  "exclude": {
    "functions": ["*Auth*", "*Credential*", "*Token*", "*Password*", "*Secret*"]
  }
}
```

### ReactTracer: Exclude Sensitive Paths And Component Patterns

```typescript
// React build-time injection config
{
  exclude: {
    paths: [
      "src/auth/**",
      "src/login/**",
      "src/payments/**"
    ],
    components: ["Login*", "Auth*", "Credential*", /^Secret/]
  }
}
```

### FlowTracer: Exclude Exact Auth Calls By Function Name

```javascript
// FlowTracer
{
  "exclude": {
    "functions": ["authenticatedFetch"]
  }
}
```

### ReactTracer: Disable Tracing for Sensitive UI

```typescript
// @trace-disable
function LoginForm() {
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  return <form>{/* ... */}</form>;
}
```

Never move credentials into query strings just to avoid tracing them. URLs leak through browser history, referrers, caches, and server logs.

## Personal Data and Sensitive Business Data

**Risk:** Names, emails, phone numbers, addresses, account identifiers, patient data, and internal business records can appear in traces.

Use FlowTracer excludes for sensitive paths. For React, exclude sensitive files or component patterns at build time, then use tracing directives for component-level exceptions.

### ReactTracer: Exclude Sensitive Paths And Component Patterns

```typescript
// React build-time injection config
{
  exclude: {
    paths: [
      "src/patient/**",
      "src/health/**",
      "src/medical/**",
      "src/components/account/**"
    ],
    components: ["UserProfile", "Patient*", "Account*", /^Billing/]
  }
}
```

### ReactTracer: Exclude PII-heavy Components

```typescript
// @trace-disable
function UserProfile({ email, phone, address }) {
  return <div>{email}</div>;
}
```

### FlowTracer: Exclude Sensitive Paths

```javascript
// FlowTracer
{
  "exclude": {
    "paths": [
      "**/patient/**",
      "**/health/**",
      "**/medical/**",
      "**/components/account/**"
    ]
  }
}
```

### Scrub Shared Output

Before copying traces into tickets, chat, or documents, remove emails, tokens, account identifiers, and customer-specific values.

## Output Handling

Trace output can surface in browser DevTools, terminal logs, CI logs, screenshots, copied snippets, and centralized logging systems.

### Access and Retention

- Limit tracing to the smallest group and session scope that can reproduce the issue.
- Decide where trace output may be copied or stored before you begin tracing.
- Apply the same retention and deletion rules to saved traces and screenshots that you apply to other operational logs.
- Review stored traces for sensitive data before sharing them outside the immediate debugging group.

## Build and Browser Surfaces

### Source Maps

**Risk:** Source maps reveal implementation details and make instrumented code easier to inspect.

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === "development",
  },
}));
```

### DevTools Hook Shim

**Risk:** A DevTools hook shim expands the debugging surface in the browser.

Only include it in development:

```typescript
// pages/_document.tsx
export default function Document() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <Html>
      <Head>
        {isDev && (
          <script
            dangerouslySetInnerHTML={{
              __html: `/* DevTools hook shim */`,
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

For publicly accessible builds, exclude AutoTracer at build time. Do not rely on runtime hostname checks, query parameters, or overridden console methods as a security boundary.

## Compliance

### GDPR Considerations

1. Avoid real user data when possible.
2. Treat trace output as personal-data processing when it can include identifiable information.
3. Restrict access, minimize traced scope, and define retention and deletion procedures before tracing real data.
4. Document where trace output can be viewed, copied, or retained.

### HIPAA Considerations

1. Never trace PHI.
2. Exclude patient-related code paths before tracing begins.

```javascript
{
  "exclude": {
    "paths": ["**/patient/**", "**/health/**", "**/medical/**"]
  }
}
```

If a workflow can expose PHI, do not use AutoTracer on that workflow.

## Security Checklist

### Development

- [ ] Sensitive functions and components are excluded from tracing.
- [ ] Secrets are never passed in query strings for traced calls.
- [ ] Source maps and DevTools-only shims are limited to development builds.
- [ ] Shared traces, screenshots, and pasted logs are scrubbed before leaving the immediate debugging group.

### Restricted Internal DEV/QA

- [ ] Tracing is limited to the smallest group and session scope that need it.
- [ ] Copied or stored trace output is handled as sensitive operational data.
- [ ] Real user or customer data is avoided or explicitly scrubbed.
- [ ] Retention and deletion rules are defined before traces are stored.

### Publicly Accessible Deployments

- [ ] AutoTracer is excluded entirely. See [Production Deployment](/best-practices/production).
- [ ] No tracing runtime imports or dashboard surface ship in the public bundle.
- [ ] No DevTools hook shim ships in the public bundle.
- [ ] Bundle inspection confirms tracing packages are absent.

## Incident Response

If trace output exposes sensitive data:

1. Disable tracing in the affected environment.
2. Determine what data was exposed and where it may have been copied or persisted.
3. Remove retained copies when possible and follow internal notification or regulatory procedures.
4. Narrow the traced scope or exclude the affected code path before tracing again.

## Related Documentation

- [Production Deployment](/best-practices/production)
- [Configuration Reference - ReactTracer](/guide/config-react)
- [Configuration Reference - FlowTracer](/guide/config-flow)
