#!/usr/bin/env python3
"""Measure sidebar/page geometry and sidebar-overlap against a URL.

Usage:
  python3 tools/layout-probe.py <label> <url> [width ...]

Kept in tools/ so the stdlib `inspect` module is never shadowed.
"""
import json
import sys

from playwright.sync_api import sync_playwright

# Counts .page headings, paragraphs, links and list items whose box
# overlaps the .sidebar box by more than 8px.
#
# NB: #main runs an `intro` opacity animation with `animation-fill-mode: both`,
# so computed opacity is exactly 0 for the first 0.35s. That must NOT be used as
# a visibility filter here or every element is silently dropped; visibility is
# judged from display/visibility plus a non-zero box only.
PROBE = """() => {
  const box = (el) => {
    const r = el.getBoundingClientRect();
    const q = (n) => Math.round(n * 100) / 100;
    return {x: q(r.x), y: q(r.y), w: q(r.width), h: q(r.height),
            right: q(r.right), bottom: q(r.bottom)};
  };
  const sb = document.querySelector('.sidebar');
  const pg = document.querySelector('.page');
  if (!sb || !pg) return {error: 'missing .sidebar or .page'};
  const s = box(sb), p = box(pg);
  const sbCs = getComputedStyle(sb);
  const nodes = Array.from(pg.querySelectorAll(
    'h1,h2,h3,h4,h5,h6,p,a,li,blockquote,img,figure,table'));
  const overlaps = (root) => {
    const out = [];
    for (const el of root.querySelectorAll(
        'h1,h2,h3,h4,h5,h6,p,a,li,blockquote,img,figure,table')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const ov = Math.min(r.right, s.right) - Math.max(r.left, s.x);
      const oy = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.y);
      if (ov > 8 && oy > 0) {
        out.push({tag: el.tagName.toLowerCase(),
                  cls: String(el.className || '').slice(0, 40),
                  x: Math.round(r.x), overlapPx: Math.round(ov)});
      }
    }
    return out;
  };
  const covered = overlaps(pg);
  const footer = document.querySelector('.page__footer');
  const footerCovered = footer ? overlaps(footer) : [];
  const first = pg.querySelector('h1, .page__title, .page__content');
  const vis = (sel) => {
    const n = document.querySelector(sel);
    if (!n) return null;
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    const shown = cs.display !== 'none' && cs.visibility !== 'hidden'
                  && r.width > 0 && r.height > 0;
    return {visible: shown, display: cs.display,
            y: Math.round(r.y), h: Math.round(r.height)};
  };
  return {
    vw: innerWidth,
    sidebar: s, page: p,
    sidebarPosition: sbCs.position,
    pageX_ge_sidebarRight: p.x >= s.right - 0.5,
    overlapCount: covered.length,
    overlapSample: covered.slice(0, 5),
    footerOverlapCount: footerCovered.length,
    footerOverlapSample: footerCovered.slice(0, 5),
    firstPageContentY: first ? Math.round(first.getBoundingClientRect().y) : null,
    scrollWidth: document.body.scrollWidth,
    noHOverflow: document.body.scrollWidth <= innerWidth,
    nowWatchingSidebar: vis('.now-watching--compact'),
    nowWatchingPage: vis('.page .now-watching:not(.now-watching--compact)'),
  };
}"""


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        return 2
    label = sys.argv[1]
    url = sys.argv[2]
    widths = [int(w) for w in sys.argv[3:]] or [1440, 1280, 1024, 925, 420]

    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w in widths:
            ctx = browser.new_context(viewport={"width": w, "height": 900})
            page = ctx.new_page()
            page.goto(url, wait_until="networkidle", timeout=60000)
            # #main runs a 0.35s-delayed intro animation; settle past it.
            page.wait_for_timeout(1200)
            results[w] = page.evaluate(PROBE)
            ctx.close()
        browser.close()

    print(f"### {label}  {url}")
    for w in widths:
        r = results[w]
        if "error" in r:
            print(f"  {w}px  ERROR: {r['error']}")
            continue
        sb, pg = r["sidebar"], r["page"]
        print(
            f"  {w}px  sidebar x={sb['x']} w={sb['w']} right={sb['right']} h={sb['h']}"
            f" | page x={pg['x']} w={pg['w']} right={pg['right']}"
            f" | pageX>=sbRight={r['pageX_ge_sidebarRight']}"
            f" | overlap={r['overlapCount']} footerOverlap={r['footerOverlapCount']}"
            f" | firstContentY={r['firstPageContentY']}"
            f" | noHOverflow={r['noHOverflow']} ({r['scrollWidth']}<={w})"
        )
        if r["overlapCount"]:
            print(f"        overlap sample: {r['overlapSample']}")
        print(
            f"        nowWatchingSidebar={r['nowWatchingSidebar']}"
            f" nowWatchingPage={r['nowWatchingPage']}"
        )
    with open(f"/tmp/probe-{label}.json", "w") as fh:
        json.dump(results, fh, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
