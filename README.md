# Camel — Static Blog

A GitHub Pages blog powered by Jekyll and Decap CMS.

## Stack
- Jekyll on GitHub Pages (GitHub Actions deployment)
- Decap CMS at `/admin/`
- Markdown posts with YAML front matter
- Responsive, accessible layout with SEO metadata, sitemap and robots.txt

## Local preview
1. Install Ruby and Bundler.
2. Run `bundle install`.
3. Run `bundle exec jekyll serve`.
4. Open `http://localhost:4000/camel/`.

## GitHub Pages
In repository Settings → Pages, select **GitHub Actions** as the build and deployment source. The included workflow builds and deploys the site on pushes to `main`.

## Decap CMS authentication — required setup
The CMS is configured for the GitHub backend, but GitHub OAuth is not active until you deploy an OAuth proxy and configure its secrets. Never put a GitHub Personal Access Token or OAuth client secret in this repository.

A Cloudflare Worker starter is included at `oauth/worker.js`. Deploy it as a Worker and set these Worker secrets:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Set these Worker variables:
- `OAUTH_REDIRECT_URI` (the full deployed Worker callback URL, ending in `/callback`)
- `CMS_ORIGIN` (`https://gpldroid.github.io`, or the exact origin of your published site)

Then replace `YOUR_OAUTH_WORKER_HOST` in `admin/config.yml` with the Worker hostname, and register the matching callback URL in your GitHub OAuth App. Restrict the OAuth App homepage URL to your published site. The Worker should be reviewed and tested before production use.

## Site configuration
Edit `_config.yml` to set the final site title, description, URL, author and social profiles. The current URL is the GitHub Pages project-site default: `https://gpldroid.github.io/camel`.

## Content management
- Posts: `_posts/YYYY-MM-DD-title.md`
- Pages: `_pages/`
- Uploaded media: `assets/uploads/`

Decap CMS manages posts and the editable pages collection. Theme/layout source remains version-controlled code; template editing is intentionally not exposed as a CMS collection.

## Analytics and advertising
Optional IDs are configured in `_config.yml`. Leave them blank until you have real IDs. Ad slots are placeholders and do not load ads until a valid AdSense publisher/slot configuration is supplied.

## Import/export
Posts and pages are plain Markdown/YAML files in Git. They can be imported by committing compatible files and exported by downloading the repository or selecting the relevant files. Back up the repository before bulk imports.
