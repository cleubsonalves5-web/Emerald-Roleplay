const express = require("express");
const dgram = require("dgram");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ===== CONFIGURAÇÕES ===== */

const HOST = "151.242.227.118"; // IP do SA-MP
const PORT = 7777;             // Porta do SA-MP
const API_PORT = 3000;         // Porta da API
const API_KEY = "EMERALD_2026"; // chave de segurança Pawn → API

/* ===== STATUS SA-MP ===== */

function getSampInfo(){
    return new Promise((resolve)=>{
        const socket = dgram.createSocket("udp4");
        let resolved = false;

        const packet = Buffer.from(
            "SAMP" +
            HOST.split(".").map(x => String.fromCharCode(x)).join("") +
            String.fromCharCode(PORT & 0xFF, PORT >> 8) +
            "i"
        );

        socket.send(packet, 0, packet.length, PORT, HOST);

        socket.on("message", (msg) => {
            if (resolved) return;
            resolved = true;

            const players = msg.readUInt16LE(11);
            const max = msg.readUInt16LE(13);

            socket.close();
            resolve({ players, max });
        });

        setTimeout(() => {
            if (resolved) return;
            resolved = true;

            socket.close();
            resolve({ players: 0, max: 0 });
        }, 1500);
    });
}

/* ===== ROTAS ===== */

app.get("/status", async (req, res) => {
    try{
        const info = await getSampInfo();
        res.json(info);
    }catch(err){
        res.status(500).json({ players: 0, max: 0 });
    }
});

/* ===== RANKING RECEBIDO DO PAWN ===== */

let ranking = [];

app.post("/ranking", (req, res) => {

    // 🔐 segurança: só aceita do gamemode
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).json({ error: "Acesso negado" });
    }

    if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: "Formato inválido" });
    }

    ranking = req.body;

    console.log("📊 Ranking atualizado via Pawn:", ranking.length, "players");

    res.json({ success: true });
});

app.get("/ranking", (req, res) => {
    res.json(ranking);
});

/* ===== START ===== */

app.listen(API_PORT, () => {
    console.log(`✅ API Emerald rodando na porta ${API_PORT}`);
});
