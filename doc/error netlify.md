10:11:20 AM: build-image version: 37c27078fd36bc14c3fa8836175bd77aa6640872 (noble-new-builds)
10:11:20 AM: buildbot version: ee2c327a2718c921510fd736205acbb9fe49aa61
10:11:20 AM: Fetching cached dependencies
10:11:20 AM: Starting to download cache of 183.9MB (Last modified: 2026-04-02 10:12:27 +0000 UTC)
10:11:21 AM: Downloaded cache in 625ms
10:11:23 AM: Extracted cache in 2.302s
10:11:23 AM: Fetched cache in 2.996s
10:11:23 AM: Starting to prepare the repo for build
10:11:23 AM: Preparing Git Reference refs/heads/main
10:11:24 AM: Custom publish path detected. Proceeding with the specified path: '.next'
10:11:24 AM: Custom build command detected. Proceeding with the specified command: 'npm run build'
10:11:25 AM: Installing dependencies
10:11:25 AM: mise ~/.config/mise/config.toml tools: python@3.14.3
10:11:25 AM: mise ~/.config/mise/config.toml tools: ruby@3.4.8
10:11:25 AM: mise ~/.config/mise/config.toml tools: go@1.26.1
10:11:25 AM: v22.22.2 is already installed.
10:11:26 AM: Now using node v22.22.2 (npm v10.9.7)
10:11:26 AM: Enabling Node.js Corepack
10:11:26 AM: No npm workspaces detected
10:11:26 AM: Installing npm packages using npm version 10.9.7
10:11:27 AM: added 111 packages in 1s
10:11:27 AM: npm packages installed
10:11:27 AM: Successfully installed dependencies
10:11:28 AM: Detected 1 framework(s)
10:11:28 AM: "next" at version "16.2.2"
10:11:28 AM: Starting build script
10:11:28 AM: Section completed: initializing
10:11:30 AM: ​
10:11:30 AM: Netlify Build                                                 
10:11:30 AM: ────────────────────────────────────────────────────────────────
10:11:30 AM: ​
10:11:30 AM: ❯ Version
10:11:30 AM:   @netlify/build 35.11.2
10:11:30 AM: ​
10:11:30 AM: ❯ Flags
10:11:30 AM:   accountId: 67e4e7a51f42958fb0243044
10:11:30 AM:   baseRelDir: true
10:11:30 AM:   buildId: 69cf21c79bd22c00082b1c88
10:11:30 AM:   deployId: 69cf21c79bd22c00082b1c8a
10:11:30 AM: ​
10:11:30 AM: ❯ Current directory
10:11:30 AM:   /opt/build/repo
10:11:30 AM: ​
10:11:30 AM: ❯ Config file
10:11:30 AM:   /opt/build/repo/netlify.toml
10:11:30 AM: ​
10:11:30 AM: ❯ Context
10:11:30 AM:   production
10:11:31 AM: ​
10:11:31 AM: ❯ Installing extensions
10:11:31 AM:    - neon
10:11:32 AM: ​
10:11:32 AM: ❯ Using Next.js Runtime - v5.15.9
10:11:32 AM: ​
10:11:32 AM: ❯ Loading extensions
10:11:32 AM:    - neon
10:11:33 AM: No Next.js cache to restore
10:11:33 AM: ​
10:11:33 AM: build.command from netlify.toml                               
10:11:33 AM: ────────────────────────────────────────────────────────────────
10:11:33 AM: ​
10:11:33 AM: $ npm run build
10:11:34 AM: > new-version@0.1.0 build
10:11:34 AM: > next build
10:11:34 AM: ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
10:11:34 AM: ▲ Next.js 16.2.2 (Turbopack)
10:11:34 AM:   Creating an optimized production build ...
10:11:39 AM: ✓ Compiled successfully in 5.0s
10:11:39 AM:   Running TypeScript ...
10:11:41 AM:   Finished TypeScript in 2.3s ...
10:11:41 AM:   Collecting page data using 2 workers ...
10:11:42 AM:   Generating static pages using 2 workers (0/6) ...
10:11:42 AM: Supabase URL or Anon Key is missing. Check your .env.local file.
10:11:42 AM: Error occurred prerendering page "/blog/[slug/]". Read more: https://nextjs.org/docs/messages/prerender-error
10:11:42 AM: Error: supabaseUrl is required.
10:11:42 AM:     at <unknown> (.next/server/chunks/ssr/[root-of-the-server]__0rmdb0g._.js:37:43441)
10:11:42 AM:     at new cu (.next/server/chunks/ssr/[root-of-the-server]__0rmdb0g._.js:37:43692)
10:11:42 AM:     at module evaluation (.next/server/chunks/ssr/[root-of-the-server]__0rmdb0g._.js:37:48216)
10:11:42 AM:     at instantiateModule (.next/server/chunks/ssr/[turbopack]_runtime.js:853:9)
10:11:42 AM:     at getOrInstantiateModuleFromParent (.next/server/chunks/ssr/[turbopack]_runtime.js:877:12)
10:11:42 AM:     at Context.esmImport [as i] (.next/server/chunks/ssr/[turbopack]_runtime.js:281:20)
10:11:42 AM:     at module evaluation (.next/server/chunks/ssr/src_app_blog_[slug_]_page_tsx_08qh1s3._.js:1:87)
10:11:42 AM:     at instantiateModule (.next/server/chunks/ssr/[turbopack]_runtime.js:853:9)
10:11:42 AM:     at getOrInstantiateModuleFromParent (.next/server/chunks/ssr/[turbopack]_runtime.js:877:12)
10:11:42 AM:     at Context.commonJsRequire [as r] (.next/server/chunks/ssr/[turbopack]_runtime.js:302:12) {
10:11:42 AM:   digest: '2999969796'
10:11:42 AM: }
10:11:42 AM: Export encountered an error on /blog/[slug/]/page: /blog/[slug/], exiting the build.
10:11:42 AM: ⨯ Next.js build worker exited with code: 1 and signal: null
10:11:42 AM: ​
10:11:42 AM: "build.command" failed                                        
10:11:42 AM: ────────────────────────────────────────────────────────────────
10:11:42 AM: ​
10:11:42 AM:   Error message
10:11:42 AM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
10:11:42 AM: ​
10:11:42 AM:   Error location
10:11:42 AM:   In build.command from netlify.toml:
10:11:42 AM:   npm run build
10:11:42 AM: ​
10:11:42 AM:   Resolved config
10:11:42 AM:   build:
10:11:42 AM:     command: npm run build
10:11:42 AM:     commandOrigin: config
10:11:42 AM:     publish: /opt/build/repo/.next
10:11:42 AM:     publishOrigin: config
10:11:42 AM:   plugins:
10:11:42 AM:     - inputs: {}
10:11:42 AM:       origin: config
10:11:42 AM:       package: "@netlify/plugin-nextjs"
10:11:43 AM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
10:11:43 AM: Build failed due to a user error: Build script returned non-zero exit code: 2
10:11:43 AM: Failing build: Failed to build site
10:11:43 AM: Finished processing build request in 22.806s