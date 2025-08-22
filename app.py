from flask import Flask, request, jsonify, render_template
import os
from datetime import datetime
import zoneinfo
from pathlib import Path

app = Flask(__name__)

FILE_PATH = Path("/home/ubuntu/form-makan/data/makan/list.txt")
TZ = zoneinfo.ZoneInfo("Asia/Jakarta")

ALLOWED_NAMES = {
    "azril", "ariq", "surya", "rouf", "budi",
    "heru", "dion", "ruhiyat", "rangga", "kelvin", "zasda"
}
SRASI_VALUE = "Srasi Restoran"

@app.get("/")
def home():
    return render_template("index.html")

@app.post("/api/submit")
def submit():
    try:
        data = request.get_json(silent=True) or {}
        nama = (data.get("nama") or "").strip()
        resto = (data.get("resto") or "").strip()

        if not nama or not resto:
            return jsonify({"error": "nama & resto wajib"}), 400

        if nama.lower() not in ALLOWED_NAMES:
            return jsonify({"error": f"Nama '{nama}' ga diajak"}), 400

        if resto != SRASI_VALUE:
            return jsonify({
                "ok": False,
                "prank": True,
                "msg": "Maaf, silahkan pilih tempat makan yang lainnya"
            }), 200

        if FILE_PATH.exists():
            with open(FILE_PATH, "r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines:
                if f"] {nama.lower()} " in line.lower():
                    return jsonify({
                        "ok": False,
                        "duplicate": True,
                        "msg": f"Nama '{nama}' sudah terdaftar"
                    }), 200

        FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(TZ).strftime("%d/%m/%Y %H:%M:%S")
        line = f"[{ts}] {nama} => {resto}\n"
        with open(FILE_PATH, "a", encoding="utf-8") as f:
            f.write(line)

        return jsonify({"ok": True})

    except Exception:
        app.logger.exception("Gagal menyimpan")
        return jsonify({"error": "internal error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
