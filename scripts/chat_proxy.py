# scripts/chat_proxy.py
import os
import json
import openai
from http.server import BaseHTTPRequestHandler, HTTPServer

openai.api_key = os.getenv("OPENAI_API_KEY")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/chat":
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers["Content-Length"])
        body = self.rfile.read(content_length)
        data = json.loads(body.decode("utf-8"))
        message = data.get("message", "")

        if not message:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing message")
            return

        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are AUI-Bot, the AI auditor for AuditX Genesis."},
                    {"role": "user", "content": message}
                ]
            )
            reply = response.choices[0].message.content
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"reply": reply}).encode("utf-8"))

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode("utf-8"))

def run():
    port = int(os.environ.get("PORT", 8000))
    httpd = HTTPServer(("0.0.0.0", port), Handler)
    print(f"Running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
