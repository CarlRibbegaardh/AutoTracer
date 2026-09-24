# `labelHooksPattern`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"^use[A-Z].*"`

---

`labelHooksPattern` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package.

**It decides which hook calls should have their returned values labeled automatically, based on the hook's name.**

Most projects should leave this setting at its default.

Change it only when your project needs hook-name matching that is significantly different from the normal React-style `useX` pattern, or when you are deliberately turning pattern-based hook labeling off and relying only on explicit names in [`labelHooks`](./labelHooks).

If a hook name matches this pattern, the plugin injects labels for the variable names returned from that hook call.

Examples:

- `const todos = useSelector(...)` can be labeled as `todos`
- `const [count, setCount] = useState(...)` can be labeled as `count` and `setCount`
- `const { data, error } = useQuery(...)` can be labeled as `data` and `error`

The hook name itself is not the label. The hook name only decides whether the returned values from that hook call should be labeled automatically.

If a hook name does not match this pattern, it can still be included when you list it explicitly in [`labelHooks`](./labelHooks).

An empty string disables pattern-based labeling, leaving only the exact hook names in [`labelHooks`](./labelHooks).

Read together with [`labelHooks`](./labelHooks) when you are tuning automatic hook labeling.

## Usage

```typescript
reactTracer.vite({
  labelHooksPattern: "^(use|with)[A-Z].*",
});
```
