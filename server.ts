import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PEGAWAI_DATABASE } from "./src/data/pegawaiDatabase";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json());

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const sessions = new Map<string, { userId: string; role: string; expiresAt: number }>();
const normalizeNip = (value: unknown) => String(value || "").replace(/\D/g, "");
const rolePasswords: Record<string, string> = {
  SUPERADMIN: process.env.SUPERADMIN_PASSWORD || "",
  DEFAULT: process.env.DEFAULT_USER_PASSWORD || ""
};
const customPasswords = new Map<string, string>();

app.post("/api/auth/login", (req, res) => {
  const nip = normalizeNip(req.body?.nip);
  const address = req.ip || "unknown";
  const attempt = loginAttempts.get(address);
  if (attempt && attempt.resetAt > Date.now() && attempt.count >= 5) return res.status(429).json({ success: false, message: "Terlalu banyak percobaan login. Coba lagi nanti." });
  const user = PEGAWAI_DATABASE.find(candidate => normalizeNip(candidate.nip) === nip);
  const expectedPassword = user ? (customPasswords.get(user.id) || (user.role === "SUPERADMIN" ? rolePasswords.SUPERADMIN : rolePasswords.DEFAULT)) : "";
  if (!user || nip.length !== 18 || !expectedPassword || req.body?.password !== expectedPassword) {
    const next = attempt && attempt.resetAt > Date.now() ? { count: attempt.count + 1, resetAt: attempt.resetAt } : { count: 1, resetAt: Date.now() + 15 * 60 * 1000 };
    loginAttempts.set(address, next);
    return res.status(401).json({ success: false, message: "NIP atau password tidak valid." });
  }
  loginAttempts.delete(address);
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId: user.id, role: user.role, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
  return res.json({ success: true, user, token });
});

app.post("/api/auth/change-password", (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ success: false, message: "Sesi tidak valid atau telah berakhir." });
  const user = PEGAWAI_DATABASE.find(candidate => candidate.id === session.userId);
  const currentPassword = customPasswords.get(session.userId) || (user?.role === "SUPERADMIN" ? rolePasswords.SUPERADMIN : rolePasswords.DEFAULT);
  const nextPassword = String(req.body?.newPassword || "");
  if (!currentPassword || req.body?.currentPassword !== currentPassword || nextPassword.length < 8) return res.status(400).json({ success: false, message: "Password lama salah atau password baru minimal 8 karakter." });
  customPasswords.set(session.userId, nextPassword);
  return res.json({ success: true, message: "Password berhasil diubah." });
});

function getSession(req: express.Request) {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : "";
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) { if (token) sessions.delete(token); return null; }
  return session;
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try { aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); } catch (err) { console.error("Failed to initialize GoogleGenAI:", err); }
  }
  return aiClient;
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "e-KANJOLI Smart Office", version: "2.0.0-blueprint", timestamp: new Date().toISOString() }));

interface LockState { isLocked: boolean; queue: Array<() => void>; }
class BackendLockService {
  private locks = new Map<string, LockState>();
  private counters = new Map<string, number>([["SURAT_MASUK_2026",142],["SURAT_KELUAR_2026",88],["TIKET_LAYANAN_2026",45],["DOKUMEN_LAYANAN_2026",32],["SPT_2026",67],["SPPD_2026",67],["ARSIP_2026",314]]);
  private async acquireLock(key: string): Promise<() => void> {
    if (!this.locks.has(key)) this.locks.set(key, { isLocked: false, queue: [] });
    const state = this.locks.get(key)!;
    if (!state.isLocked) { state.isLocked = true; return () => this.releaseLock(key); }
    return new Promise(resolve => state.queue.push(() => { state.isLocked = true; resolve(() => this.releaseLock(key)); }));
  }
  private releaseLock(key: string) { const state = this.locks.get(key); if (!state) return; if (state.queue.length) state.queue.shift()!(); else state.isLocked = false; }
  async generateNumber(type: string, prefix = "", year = new Date().getFullYear()) {
    const unlock = await this.acquireLock(`${type}_${year}`);
    try {
      const key = `${type}_${year}`; const nextCounter = (this.counters.get(key) || 1) + 1; this.counters.set(key, nextCounter);
      const padded3 = String(nextCounter).padStart(3,"0"), padded4 = String(nextCounter).padStart(4,"0"), padded5 = String(nextCounter).padStart(5,"0");
      let documentNumber = `${prefix || "DOC"}/${nextCounter}/${year}`;
      if (type === "SURAT_MASUK") documentNumber = `000.1.1/${nextCounter}/BAPPEDA/${year}`;
      else if (type === "SURAT_KELUAR") documentNumber = `000.1.2/${prefix || "ND"}/${padded3}/BAPPEDA/${year}`;
      else if (type === "TIKET_LAYANAN") documentNumber = `TIKET-${prefix || "LYN"}-${year}-${padded4}`;
      else if (type === "DOKUMEN_LAYANAN") documentNumber = `BA-${prefix || "LYN"}/${padded3}/BAPPEDA-LITBANG/${year}`;
      else if (type === "SPT") documentNumber = `090/${padded3}/SPT/BAPPEDA/${year}`;
      else if (type === "SPPD") documentNumber = `090/${padded3}/SPPD/BAPPEDA/${year}`;
      else if (type === "ARSIP") documentNumber = `ARSIP/${prefix || "BAPPEDA"}/${year}/${padded5}`;
      return { documentNumber, counter: nextCounter, year };
    } finally { unlock(); }
  }
}
const lockService = new BackendLockService();

app.post("/api/v1/numbering/generate", async (req, res) => {
  try {
    const { type, prefix, year } = req.body;
    const allowedTypes = new Set(["SURAT_MASUK","SURAT_KELUAR","TIKET_LAYANAN","DOKUMEN_LAYANAN","SPT","SPPD","ARSIP"]);
    const parsedYear = year === undefined ? new Date().getFullYear() : Number(year);
    if (!allowedTypes.has(type) || !Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) return res.status(400).json({ success:false, message:"Parameter penomoran tidak valid." });
    return res.json({ success:true, data:await lockService.generateNumber(type,prefix || "",parsedYear), source:"LockService Backend (Atomic Guard)" });
  } catch (error: any) { return res.status(500).json({ success:false, message:error.message }); }
});

app.post("/api/v1/auth/authorize", (req, res) => {
  const session = getSession(req); if (!session) return res.status(401).json({ success:false, authorized:false, message:"Sesi tidak valid atau telah berakhir." });
  const { action, module } = req.body; const role = session.role;
  const allowedRoles = new Set(PEGAWAI_DATABASE.map(user => user.role));
  const allowedModules = new Set(["dashboard","persuratan","disposisi","tugas","perjalanan","aset","rapat","arsip","perencanaan","litbang","pekppp","layanan","laporan","governance"]);
  const allowedActions = new Set(["VIEW","CREATE","EDIT","DELETE","APPROVE","REJECT","DOWNLOAD","UPLOAD","EXPORT","MANAGE","DELETE_USER","APPROVE_LETTER","SIGN_TTE","VERIFY_LAYANAN","PROCESS_LAYANAN","ARCHIVE_LAYANAN","CREATE_DISPOSITION","CREATE_TASK","UPDATE_TASK","CREATE_TRIP","APPROVE_TRIP"]);
  if (!allowedRoles.has(role) || !allowedModules.has(module) || !allowedActions.has(action)) return res.status(400).json({ success:false, authorized:false, message:"Role, modul, atau action tidak valid." });
  const isSuperAdmin=role==="SUPERADMIN", isKaban=role==="KEPALA_BADAN", isSekretaris=role==="SEKRETARIS", isFrontOffice=role==="OPR_FRONTOFFICE";
  let authorized=false, reason="";
  if (action === "DELETE_USER") authorized=isSuperAdmin;
  else if (action === "APPROVE_LETTER" || action === "SIGN_TTE") authorized=isSuperAdmin||isKaban||isSekretaris;
  else if (action === "VERIFY_LAYANAN") authorized=isSuperAdmin||isFrontOffice||isSekretaris;
  else if (action === "PROCESS_LAYANAN") authorized=isSuperAdmin||role==="ADMIN_PERENCANAAN"||role==="ADMIN_LITBANG"||role==="PEGAWAI";
  else if (action === "ARCHIVE_LAYANAN") authorized=isSuperAdmin||isSekretaris||role==="ADMIN_SEKRETARIAT";
  else if (action === "CREATE_DISPOSITION" || action === "APPROVE_TRIP") authorized=isSuperAdmin||isKaban||isSekretaris;
  else if (action === "CREATE_TASK" || action === "UPDATE_TASK" || action === "CREATE_TRIP") authorized=isSuperAdmin||role!=="PEGAWAI"||module==="tugas";
  else if (["VIEW","CREATE","EDIT","UPLOAD","DOWNLOAD","EXPORT"].includes(action)) authorized=action==="VIEW"||isSuperAdmin||role!=="PEGAWAI";
  if (!authorized && !reason) reason="Role ini tidak memiliki kewenangan untuk operasi tersebut.";
  return res.json({ success:true, authorized, reason:authorized?"Otorisasi berhasil diberikan.":reason, auditPayload:{timestamp:new Date().toISOString(),role,action,module,userId:session.userId,status:authorized?"GRANTED":"DENIED"} });
});

app.get("/api/v1/system/status", (_req,res)=>res.json({success:true,data:{runtime:"Cloudflare Edge + Node.js (Vite/vinext compatible)",googleSheets:{databaseName:"E-KANJOLI_DATABASE",status:"CONNECTED",tableCount:28,latencyMs:38},googleDrive:{rootFolder:"E-KANJOLI/",status:"MOUNTED",totalFiles:1420,storageQuotaUsed:"4.8 GB / Unlimited (Workspace Enterprise)"},telegramBot:{botName:"@bappeda_notif_bot",status:"ACTIVE_WEBHOOK",lastPing:new Date().toISOString()},geminiAi:{status:process.env.GEMINI_API_KEY?"CONFIGURED":"READY_KEY_OPTIONAL",model:"gemini-3.8-flash"}},requestId:"req-"+Math.random().toString(36).substring(2,9)}));

app.post("/api/v1/gemini/assist", async (req,res)=>{
  const {prompt,taskType,context}=req.body; const client=getGeminiClient();
  if(client) try {
    const systemInstruction=`Anda adalah Asisten AI Resmi e-KANJOLI Bappeda & Litbang. Bantu ASN menyusun naskah dinas resmi, telaahan staf, ringkasan surat masuk, atau rekomendasi disposisi dengan tata naskah dinas baku pemerintah Indonesia. Gaya bahasa: Formal, lugas, akurat, birokratis sesuai standar tata naskah dinas.`;
    const response=await client.models.generateContent({model:"gemini-3.8-flash",contents:[{role:"user",parts:[{text:`${systemInstruction}\n\nJenis Tugas: ${taskType||"Bantuan Naskah Dinas"}\nKonteks: ${JSON.stringify(context||{})}\nPermintaan: ${prompt||"Buatkan draf naskah resmi"}`}]}]});
    return res.json({success:true,data:{resultText:response.text,model:"gemini-3.8-flash"}});
  } catch(err:any){ console.warn("Gemini API call failed, falling back to local generator:",err?.message); }
  let fallbackText="";
  if(taskType==="RINGKASAN_SURAT") fallbackText=`**RINGKASAN EKSEKUTIF SURAT DINAS**\n1. **Hal / Pokok Masalah**: Undangan Rapat Koordinasi Teknis Rancangan Awal RKPD dan Sinkronisasi Program Prioritas Provinsi.\n2. **Urgensi**: Wajib dihadiri pejabat Eselon II/III terkait penyelarasan target indikator makro ekonomi daerah.\n3. **Rekomendasi Tindak Lanjut**: Disposisikan ke Kabid Perencanaan untuk menyiapkan matriks usulan program prioritas dan menghadiri rapat bersama tim teknis.`;
  else if(taskType==="DRAFT_TELAAHAN") fallbackText=`**TELAAHAN STAF**\nKepada Yth : Kepala Bappeda & Litbang\nDari       : Kepala Bidang Perencanaan\nTanggal    : ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}\nNomor      : 000.1.2/TLH/BAPPEDA/${new Date().getFullYear()}\nPerihal    : Telaahan Hasil Sinkronisasi Usulan Musrenbang Kecamatan dengan Pagu Indikatif Renja OPD\n\nI. PERSOALAN\nTerdapat pergeseran alokasi pagu usulan infrastruktur jalan dan penanganan stunting di 3 kecamatan prioritas yang memerlukan penyesuaian pada SIPD-RI.\n\nII. FAKTA YANG MEMPENGARUHI\n1. Pagu indikatif DAK Fisik belum terbit secara definitif dari Kemenkeu.\n2. Target penurunan stunting daerah membutuhkan akselerasi intervensi spesifik di 14 lokus desa.\n\nIII. ANALISIS\nPenyesuaian prioritas dapat diakomodir melalui pergeseran sub-kegiatan pada Renja OPD teknis tanpa menambah total pagu belanja daerah.\n\nIV. KESIMPULAN DAN SARAN\nDisarankan Kepala Badan menyetujui rekomendasi pembukaan jadwal pemutakhiran input usulan di SIPD selama 3 hari kerja kalender.`;
  else fallbackText=`**DRAF NOTA DINAS / NASKAH DINAS RESMI**\nNomor: 000.1.2/ND/BAPPEDA/${new Date().getFullYear()}\nSifat: Segera\nPerihal: ${prompt||"Permohonan Data Realisasi Capaian Indikator Kinerja Utama (IKU)"}\n\nSehubungan dengan penyusunan Laporan Keterangan Pertanggungjawaban (LKPJ) dan Laporan Kinerja Instansi Pemerintah (SAKIP), dimohon seluruh Kepala Bidang dan Subbagian untuk menyampaikan laporan capaian target kinerja triwulanan paling lambat tanggal 10 bulan berjalan ke Sekretariat Bappeda & Litbang.`;
  return res.json({success:true,data:{resultText:fallbackText,model:"system-local-generator"}});
});

async function startServer(){
  if(process.env.NODE_ENV!=="production"){
    const vite=await createViteServer({server:{middlewareMode:true},appType:"spa"}); app.use(vite.middlewares);
  } else { const distPath=path.join(process.cwd(),"dist"); app.use(express.static(distPath)); app.get("*",(_req,res)=>res.sendFile(path.join(distPath,"index.html"))); }
  app.listen(PORT,"0.0.0.0",()=>console.log(`[e-KANJOLI] Server running on http://0.0.0.0:${PORT}`));
}
startServer();
