#!/usr/bin/env python3
"""
AuditX Genesis Auto-Announcer v3
Posts verification updates with branded image to Telegram & X (Twitter).
"""

import os, json, tweepy, requests, datetime, textwrap

# --- GitHub Secrets / environment variables ---
TG_TOKEN  = os.getenv("TELEGRAM_BOT_TOKEN")
TG_CHAT   = os.getenv("TELEGRAM_CHAT_ID")
TW_KEY    = os.getenv("TWITTER_API_KEY")
TW_SECRET = os.getenv("TWITTER_API_SECRET")
TW_TOKEN  = os.getenv("TWITTER_ACCESS_TOKEN")
TW_TOKSEC = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")

AUDITS_FILE  = "data/audits.json"
BADGE_PATH   = "assets/badges/badge-verified.png"
PREVIEW_FILE = "scripts/post-preview.txt"

HASHTAGS = "#AuditXGenesis #SmartContractAudit #BlockchainSecurity #Crypto"
SHORTENER = "https://tinyurl.com/api-create.php?url="


def shorten_url(url: str) -> str:
    """Return a shortened URL if possible."""
    try:
        r = requests.get(SHORTENER + url, timeout=5)
        if r.status_code == 200 and r.text.startswith("http"):
            return r.text.strip()
    except Exception:
        pass
    return url


def build_message():
    """Build announcement text for latest verified audit."""
    with open(AUDITS_FILE, "r", encoding="utf-8") as f:
        audits = json.load(f)
    verified = [a for a in audits if a.get("status") == "Verified"]
    if not verified:
        return None
    latest = max(verified, key=lambda a: a.get("updated", ""))
    link = shorten_url(latest["link"])
    conf = latest.get("confidence", "—")

    msg = textwrap.dedent(f"""
        ✅ *{latest['project']}* by *{latest['company']}* has been fully verified!
        🔒 Confidence Score: {conf}/5  
        🌐 View full audit: {link}

        {HASHTAGS}
        — Posted automatically by AuditX Genesis AI Announcer
    """).strip()
    return msg


def post_telegram(message: str):
    """Send the announcement to Telegram channel."""
    if not (TG_TOKEN and TG_CHAT):
        print("⚠️ Telegram credentials not set.")
        return
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
    payload = {"chat_id": TG_CHAT, "text": message, "parse_mode": "Markdown"}
    try:
        r = requests.post(url, json=payload, timeout=10)
        print("Telegram →", r.status_code, r.text[:200])
    except Exception as e:
        print("Telegram error:", e)


def post_twitter(message: str):
    """Tweet announcement with hashtags and attached AuditX Genesis badge."""
    if not all([TW_KEY, TW_SECRET, TW_TOKEN, TW_TOKSEC]):
        print("⚠️ Twitter credentials not set.")
        return
    tweet = message.replace("*", "")
    tweet = tweet.split("\n—")[0] + f"\n\n{HASHTAGS}"
    if len(tweet) > 275:
        tweet = tweet[:270] + "…"

    try:
        auth = tweepy.OAuth1UserHandler(TW_KEY, TW_SECRET, TW_TOKEN, TW_TOKSEC)
        api = tweepy.API(auth)
        if os.path.exists(BADGE_PATH):
            media = api.media_upload(BADGE_PATH)
            api.update_status(status=tweet, media_ids=[media.media_id])
            print("Tweet with image posted successfully.")
        else:
            api.update_status(tweet)
            print("Tweet (no image) posted successfully.")
    except Exception as e:
        print("Twitter error:", e)


def save_preview(message: str):
    """Save last announcement text for record."""
    os.makedirs(os.path.dirname(PREVIEW_FILE), exist_ok=True)
    with open(PREVIEW_FILE, "w", encoding="utf-8") as f:
        f.write(message)


def main():
    msg = build_message()
    if not msg:
        print("No verified audits found.")
        return
    save_preview(msg)
    print("Generated announcement:\n", msg)
    post_telegram(msg)
    post_twitter(msg)


if __name__ == "__main__":
    main()
