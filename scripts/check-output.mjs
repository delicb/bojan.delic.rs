#!/usr/bin/env node
// Sanity checks for the generated site in `public/` (or the directory given as the first argument).
//
// Usage: node scripts/check-output.mjs [dir] [--site]
//
//   --site      also run checks specific to bojan.delic.rs (files that must be deployed, etc.).
//               Without it only generic checks run, so the script also works for the theme's exampleSite.
//   --no-links  skip checking that internal links point to existing files.
//
// No dependencies: HTML is inspected with regular expressions, which is good enough for
// sanity checks on Hugo output.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const args = process.argv.slice(2);
const siteChecks = args.includes("--site");
const checkLinks = !args.includes("--no-links");
const root = args.find((a) => !a.startsWith("--")) ?? "public";

const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

if (!existsSync(join(root, "index.html"))) {
  console.error(`${root}/index.html not found. Build the site first.`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(root);
const rel = (path) => relative(root, path).split(sep).join("/");

// Base URL is taken from the homepage's canonical link, so no config needs to be parsed.
const homeHtml = readFileSync(join(root, "index.html"), "utf8");
const canonicalOf = (html) => html.match(/<link[^>]*rel=["']?canonical["']?[^>]*>/i)?.[0];
const attr = (tag, name) =>
  tag?.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find((v) => v !== undefined);
const baseURL = attr(canonicalOf(homeHtml), "href");
if (!baseURL) {
  console.error("index.html: missing canonical link; cannot determine base URL.");
  process.exit(1);
}
const base = new URL(baseURL);

// Resolves a URL found in the output to a file path in `root`, or null if it is external.
function localTarget(url, fromFile) {
  if (/^(mailto:|tel:|javascript:|data:|#)/i.test(url)) return null;
  let parsed;
  try {
    parsed = new URL(url, new URL(rel(fromFile), base));
  } catch {
    return undefined;
  }
  if (parsed.origin !== base.origin) return null;
  let path = decodeURIComponent(parsed.pathname);
  if (path.endsWith("/")) path += "index.html";
  return path.replace(/^\/+/, "");
}

function targetExists(path) {
  const full = join(root, path);
  if (existsSync(full)) return statSync(full).isFile() || existsSync(join(full, "index.html"));
  return false;
}

const urlAttrs = /\s(href|src|srcset|content)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

for (const file of files.filter((f) => f.endsWith(".html"))) {
  const name = rel(file);
  const html = readFileSync(file, "utf8");

  for (const marker of ["ZgotmplZ", "<no value>", "%!(", "[MISSING"]) {
    if (html.includes(marker)) fail(name, `contains template error marker "${marker}"`);
  }

  // Hugo alias pages are tiny redirects; only check that the redirect target exists.
  const refresh = html.match(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/i)?.[0];
  if (refresh) {
    const target = attr(refresh, "content")?.match(/url=(.+)$/i)?.[1];
    const path = target && localTarget(target, file);
    if (!target) fail(name, "redirect without target");
    else if (path && !targetExists(path)) fail(name, `redirect target not found: ${target}`);
    continue;
  }

  if (!/<!doctype html>/i.test(html)) fail(name, "missing <!doctype html>");
  if (!/<html[^>]*\slang=/i.test(html)) fail(name, "missing lang attribute on <html>");
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  if (!title) fail(name, "missing or empty <title>");
  if (!/<meta[^>]*name=["']?viewport/i.test(html)) fail(name, "missing viewport meta");
  if (!/<meta[^>]*name=["']?description["']?[^>]*content=["']?[^"'\s>]/i.test(html))
    fail(name, "missing or empty meta description");
  if (!/<meta[^>]*property=["']?og:title/i.test(html)) fail(name, "missing og:title");
  const canonical = attr(canonicalOf(html), "href");
  if (name !== "404.html") {
    if (!canonical) fail(name, "missing canonical link");
    else if (!canonical.startsWith(base.href)) fail(name, `canonical not under base URL: ${canonical}`);
  }

  for (const [, script] of html.matchAll(
    /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      JSON.parse(script);
    } catch (e) {
      fail(name, `invalid JSON-LD: ${e.message}`);
    }
  }

  for (const [, attrName, ...values] of checkLinks ? html.matchAll(urlAttrs) : []) {
    const value = values.find((v) => v !== undefined).trim();
    const lower = attrName.toLowerCase();
    if (lower === "content") {
      // Only check meta content values that are URLs on this site (og:image, og:url, ...).
      if (!value.startsWith(base.href)) continue;
    } else if (!value) {
      fail(name, `empty ${lower} attribute`);
      continue;
    }
    const urls = lower === "srcset" ? value.split(",").map((s) => s.trim().split(/\s+/)[0]) : [value];
    for (const url of urls) {
      const path = localTarget(url, file);
      if (path === undefined) fail(name, `invalid URL in ${lower}: ${url}`);
      else if (path !== null && !targetExists(path)) fail(name, `broken link in ${lower}: ${url}`);
    }
  }
}

// Sitemap: every entry must point to a generated page.
const sitemapPath = join(root, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  fail("sitemap.xml", "missing");
} else {
  const locs = [...readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) fail("sitemap.xml", "no <loc> entries");
  for (const loc of locs) {
    const path = localTarget(loc, sitemapPath);
    if (path === null) fail("sitemap.xml", `entry outside base URL: ${loc}`);
    else if (!path || !targetExists(path)) fail("sitemap.xml", `entry not found: ${loc}`);
  }
}

// Feeds: must be well-formed enough to contain a channel, and items must link to real pages.
for (const file of files.filter((f) => f.endsWith(".xml") && !f.endsWith("sitemap.xml"))) {
  const name = rel(file);
  const xml = readFileSync(file, "utf8");
  if (!xml.startsWith("<?xml")) fail(name, "missing XML declaration");
  if (!/<rss[\s>]/.test(xml) || !/<channel>/.test(xml)) continue;
  for (const [, link] of xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)) {
    const path = localTarget(link, file);
    if (path && !targetExists(path)) fail(name, `feed item link not found: ${link}`);
  }
}

if (siteChecks) {
  const required = [
    "404.html",
    "index.xml",
    "blog/index.xml",
    "robots.txt",
    "_headers",
    "favicon.ico",
    "og-default.jpg",
    ".well-known/security.txt",
    "imessage-public-verification-code.txt",
  ];
  for (const path of required) if (!existsSync(join(root, path))) fail(path, "required file missing");

  const blogFeed = join(root, "blog/index.xml");
  if (existsSync(blogFeed) && !readFileSync(blogFeed, "utf8").includes("<item>"))
    fail("blog/index.xml", "feed has no items");

  const securityTxt = join(root, ".well-known/security.txt");
  if (existsSync(securityTxt)) {
    const expires = readFileSync(securityTxt, "utf8").match(/^Expires:\s*(.+)$/m)?.[1];
    if (!expires) fail(".well-known/security.txt", "missing Expires field");
    else if (!(new Date(expires) > new Date()))
      fail(".well-known/security.txt", `Expires date has passed or is invalid: ${expires}`);
  }

  if (!/<script[^>]*application\/ld\+json/i.test(homeHtml)) fail("index.html", "missing JSON-LD");
}

const pages = files.filter((f) => f.endsWith(".html")).length;
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) found in ${root}/ (${pages} HTML files checked).`);
  process.exit(1);
}
console.log(`OK: ${root}/ passed all checks (${pages} HTML files checked).`);
