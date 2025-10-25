"""
build_embeddings.py
-------------------
Generates vector embeddings for AuditX Genesis knowledge base.
Reads all Markdown files in /data/knowledge and outputs data/embeddings.json
"""

import os
import json
import glob
from pathlib import Path
from datetime import datetime
from tqdm import tqdm
from openai import OpenAI

# --- Configuration ---
EMBED_MODEL = "text-embedding-3-small"
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
KNOWLEDGE_DIR = DATA_DIR / "knowledge"
OUT_FILE = DATA_DIR / "embeddings.json"

def build_embeddings():
    # Ensure OpenAI key exists
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("❌ Missing environment variable: OPENAI_API_KEY")

    client = OpenAI(api_key=api_key)

    print(f"📘 Building embeddings from {KNOWLEDGE_DIR}")
    files = sorted(glob.glob(str(KNOWLEDGE_DIR / "*.md")))
    if not files:
        print("⚠️ No Markdown files found. Add content to data/knowledge/ first.")
        return

    chunks = []

    for fpath in tqdm(files, desc="Embedding documents"):
        text = Path(fpath).read_text(encoding="utf-8").strip()
        if not text:
            continue

        # Truncate long files
        if len(text) > 6000:
            text = text[:6000]

        try:
            emb = client.embeddings.create(
                model=EMBED_MODEL,
                input=text
            ).data[0].embedding

            chunks.append({
                "id": os.path.basename(fpath),
                "source": os.path.basename(fpath),
                "content": text[:600] + "...",
                "embedding": emb
            })
        except Exception as e:
            print(f"⚠️ Failed embedding for {fpath}: {e}")

    result = {
        "model": EMBED_MODEL,
        "updated_at": datetime.utcnow().isoformat(),
        "chunks": chunks
    }

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(result, indent=2))
    print(f"\n✅ Embeddings saved → {OUT_FILE}")
    print(f"📦 Total documents embedded: {len(chunks)}")

if __name__ == "__main__":
    build_embeddings()
