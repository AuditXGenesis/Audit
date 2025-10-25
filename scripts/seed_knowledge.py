"""
Seed AUI-Bot knowledge base from live AuditX Genesis pages.
Converts HTML into Markdown and stores under data/knowledge/.
"""

import os, requests, re
from pathlib import Path
from bs4 import BeautifulSoup
from markdownify import markdownify as md

BASE_URL = os.getenv("BASE_URL", "https://auditxgenesis.github.io/Audit")
PAGES = [
    f"{BASE_URL}/index.html",
    f"{BASE_URL}/audits/AtlasLend_RiskEngine/index.html",
    f"{BASE_URL}/audits/Nebula_Finance/index.html",
    f"{BASE_URL}/audits/NovaVault_Treasury/index.html",
    f"{BASE_URL}/audits/OrbitDEX_Perpetuals/index.html"
]

SAVE_DIR = Path(__file__).resolve().parent.parent / "data" / "knowledge"
SAVE_DIR.mkdir(parents=True, exist_ok=True)

def clean_name(url: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "_", url).strip("_")

def fetch_page(url: str) -> str:
    try:
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f"⚠️  Error fetching {url}: {e}")
        return ""

def html_to_markdown(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    # remove scripts/styles
    for tag in soup(["script", "style"]):
        tag.extract()
    return md(str(soup))

def main():
    print(f"🌍 Seeding from base URL: {BASE_URL}")
    for url in PAGES:
        html = fetch_page(url)
        if not html:
            continue
        md_text = html_to_markdown(html)
        filename = f"{clean_name(url)}.md"
        outpath = SAVE_DIR / filename
        outpath.write_text(md_text, encoding="utf-8")
        print(f"✅  Saved → {outpath}")
    print("🎯 Done. Knowledge base updated.")

if __name__ == "__main__":
    main()
