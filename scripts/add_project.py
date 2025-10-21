#!/usr/bin/env python3
import os, json, re, datetime, pathlib
DOMAIN = "https://auditx.io"
TODAY = datetime.date.today().isoformat()
def normalize(name):
    return re.sub(r'[^A-Za-z0-9]+','', name.title().replace(' ','_'))
def prompt(msg, default=None):
    v = input(f"{msg}{' ['+default+']' if default else ''}: ").strip()
    return v or (default or '')
def main():
    print("=== AuditX Genesis • Add New Project ===")
    company = prompt("Company Name")
    project = prompt("Project Name")
    desc = prompt("Short Description")
    est = prompt("Est. completion (e.g., 2025-12)", "TBD")
    key = normalize(project)
    base = pathlib.Path("audits")/key; (base/"assets").mkdir(parents=True, exist_ok=True)
    (base/"assets"/"styles.css").write_text(".content{display:grid;gap:16px}.box{background:#0f172a;border:1px solid #1e2a44;border-radius:14px;padding:16px}.muted{color:#94a3b8}.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:700;font-size:12px}.b-red{background:#3b0d0d;color:#fecaca;border:1px solid #ef4444}")
    (base/"assets"/"microcharts.js").write_text("export function gauge(){}")
    (base/"index-initial.html").write_text(f"<!doctype html><html><head><meta charset='utf-8'><title>AuditX Genesis | {project} (Initial)</title><link rel='stylesheet' href='{DOMAIN}/assets/global-style.css'><link rel='stylesheet' href='./assets/styles.css'></head><body><div class='wrap'><div class='header'><img src='{DOMAIN}/assets/auditx-logo.svg'/><div><h1>{company} — {project}</h1><div class='muted'>Initial Audit</div></div></div><div class='content'><div class='box'><h2>Executive Summary</h2><p>{desc}</p><p>Estimated completion: <b>{est}</b></p></div><div class='box'><h2>Status</h2><span class='badge b-red'>IN AUDIT</span></div></div><div class='footer'>© {datetime.date.today().year} AuditX Genesis • <a href='{DOMAIN}'>auditx.io</a></div></body></html>")
    (base/"issues.initial.json").write_text("[]")
    (base/"README.md").write_text(f"# {project} — Audit In Progress\n\n**Company:** {company}\n\n**Audited by:** [AuditX Genesis]({DOMAIN})\n\n**Status:** 🔴 In Audit\n\n**Report URL:** {DOMAIN}/audits/{key}/\n")
    data_path = pathlib.Path("data")/"audits.json"; rows = []
    if data_path.exists(): rows = json.loads(data_path.read_text())
    rows.append({"company":company,"project":project,"status":"In Audit","confidence":None,"updated":TODAY,"link":f"{DOMAIN}/audits/{key}/"})
    data_path.write_text(json.dumps(rows, indent=2))
    badges_path = pathlib.Path("data")/"badges.json"; bj = {}
    if badges_path.exists(): bj = json.loads(badges_path.read_text())
    bj[key] = {"svg": f"{DOMAIN}/assets/badges/{key}.svg", "png": f"{DOMAIN}/assets/badges/{key}.png", "report": f"{DOMAIN}/audits/{key}/"}
    badges_path.write_text(json.dumps(bj, indent=2))
    print(f"✅ New project folder created: audits/{key}/")
    print("✅ Added to data/audits.json and data/badges.json")
    print("🔴 Status: IN AUDIT")
    print('Next: git add . && git commit -m "Add new audit ' + project + '" && git push')
if __name__ == "__main__":
    main()
