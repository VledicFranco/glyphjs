# RFC-016: npm Trusted Publishers (OIDC)

- **Status:** Pending
- **Related:** `.github/workflows/release.yml`

---

## 1. Problem

The current release workflow authenticates to npm using a `NPM_TOKEN` secret stored in GitHub Actions. This has several drawbacks:

- **Token rotation burden**: npm deprecated classic tokens on Dec 9, 2025. Granular tokens now have a maximum 90-day expiry, requiring periodic manual rotation.
- **Security surface**: A long-lived write token stored as a GitHub secret is an attractive target. If leaked or extracted, it can be used to publish malicious versions of any `@glyphjs/*` package from anywhere.
- **Manual setup**: Every contributor with release access needs to coordinate token creation, scoping, and secret updates.

npm introduced **Trusted Publishers** (GA July 2025), an OIDC-based mechanism that eliminates stored tokens entirely. PyPI, RubyGems, and other major registries already support equivalent mechanisms.

---

## 2. How Trusted Publishers Work

1. You configure a **trust relationship** on npmjs.com: "this package can be published by workflow `release.yml` in repo `VledicFranco/glyphjs`."
2. During a GitHub Actions run, the runner requests a short-lived OIDC token from GitHub's identity provider.
3. The npm CLI presents this OIDC token to the npm registry instead of a classic/granular auth token.
4. npm verifies the token's claims (repo, workflow, ref) match the trusted publisher config.
5. Publish succeeds. No secrets were stored, transmitted, or rotatable.

The OIDC token is:

- **Short-lived**: valid only for the duration of the workflow run
- **Non-extractable**: bound to the runner environment
- **Scoped**: tied to the specific repo, workflow file, and (optionally) environment

---

## 3. Requirements

| Requirement                  | Current                     | Target                           |
| ---------------------------- | --------------------------- | -------------------------------- |
| Node.js version              | 20                          | 24+                              |
| npm CLI version              | ~10.x (ships with Node 20)  | 11.5.1+ (ships with Node 24)     |
| `id-token: write` permission | Already set                 | Keep                             |
| `NODE_AUTH_TOKEN` env var    | Set from `NPM_TOKEN` secret | **Remove entirely**              |
| `--provenance` flag          | Explicit in publish command | Automatic with OIDC (can remove) |

**Critical**: `NODE_AUTH_TOKEN` must not be set at all -- not even to an empty string. npm only falls back to OIDC when no auth token is present. An empty string is still treated as a token value.

---

## 4. Setup Steps

### Phase 1: Configure npmjs.com (manual, per-package)

For each of the 8 `@glyphjs/*` packages:

1. Navigate to `https://www.npmjs.com/package/@glyphjs/<name>/access`
2. Under **Trusted Publishers**, click **GitHub Actions**
3. Fill in the form:
   - **Organization/Owner:** `VledicFranco`
   - **Repository:** `glyphjs`
   - **Workflow filename:** `release.yml`
4. Click **Set up connection**
5. Optionally enable **"Require OIDC"** to fully disable token-based publishing

Packages to configure:

| #   | URL                                                        |
| --- | ---------------------------------------------------------- |
| 1   | `https://www.npmjs.com/package/@glyphjs/types/access`      |
| 2   | `https://www.npmjs.com/package/@glyphjs/schemas/access`    |
| 3   | `https://www.npmjs.com/package/@glyphjs/parser/access`     |
| 4   | `https://www.npmjs.com/package/@glyphjs/ir/access`         |
| 5   | `https://www.npmjs.com/package/@glyphjs/compiler/access`   |
| 6   | `https://www.npmjs.com/package/@glyphjs/runtime/access`    |
| 7   | `https://www.npmjs.com/package/@glyphjs/components/access` |
| 8   | `https://www.npmjs.com/package/@glyphjs/brand/access`      |

### Phase 2: Update `release.yml`

```yaml
name: Release

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write # Required for OIDC
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.release.tag_name }}

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24 # npm 11.5.1+ required for OIDC
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm lint

      - name: Verify versions match tag
        run: |
          TAG="${{ github.event.release.tag_name }}"
          EXPECTED_VERSION="${TAG#v}"
          for pkg in packages/*/package.json; do
            PKG_VERSION=$(node -p "require('./$pkg').version")
            if [ "$PKG_VERSION" != "$EXPECTED_VERSION" ]; then
              echo "Version mismatch in $pkg: expected $EXPECTED_VERSION, got $PKG_VERSION"
              exit 1
            fi
          done
          echo "All package versions match tag $TAG"

      # No NODE_AUTH_TOKEN — npm uses OIDC automatically
      # Provenance attestations are also automatic with OIDC
      - run: pnpm -r --filter './packages/*' publish --access public --no-git-checks
```

Key changes from current workflow:

- `node-version: 20` -> `node-version: 24`
- Remove `--provenance` flag (automatic with OIDC)
- Remove `env: NODE_AUTH_TOKEN` block entirely

### Phase 3: Clean up

1. Delete the `NPM_TOKEN` secret from GitHub repo settings (Settings -> Secrets and variables -> Actions)
2. Revoke the granular access token on npmjs.com

---

## 5. Caveats

1. **First publish requires a token**: Trusted Publishers can only be configured on packages that already exist on npm. All 8 packages were published as v0.1.0, so this is no longer a constraint.

2. **One publisher per package**: Each package supports only one trusted publisher configuration at a time.

3. **`repository.url` must match**: The `repository.url` field in each `package.json` must exactly match the GitHub repo URL. All packages already have `https://github.com/VledicFranco/glyphjs.git` -- this is correct.

4. **pnpm compatibility**: pnpm delegates registry operations to npm, so OIDC works transparently. The npm version on the runner (from Node 24) must be 11.5.1+.

5. **Self-hosted runners**: OIDC trusted publishing does not currently support self-hosted GitHub Actions runners. This is not relevant since we use `ubuntu-latest`.

---

## 6. Rollback Plan

If OIDC publishing fails after migration:

1. Create a new granular access token on npmjs.com scoped to `@glyphjs`
2. Add it as `NPM_TOKEN` secret in GitHub repo settings
3. Restore the `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` block in `release.yml`
4. Re-run the release workflow

---

## 7. References

- [npm Trusted Publishers documentation](https://docs.npmjs.com/trusted-publishers/)
- [npm trusted publishing GA announcement (GitHub Changelog, July 2025)](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [OIDC troubleshooting journey (DEV Community)](https://dev.to/zhangjintao/from-deprecated-npm-classic-tokens-to-oidc-trusted-publishing-a-cicd-troubleshooting-journey-4h8b)
- [No more tokens! (zachleat.com)](https://www.zachleat.com/web/npm-security)
