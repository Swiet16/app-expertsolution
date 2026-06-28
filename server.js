import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

/* ── Brevo helpers ───────────────────────────────── */
async function brevoRequest(path, method = "GET", body = null) {
  const apiKey = process.env.BREVO_API_KEY;
  const opts = {
    method,
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.brevo.com/v3${path}`, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function getVerifiedSender(apiKey) {
  if (!apiKey) return null;
  // Always prefer the verified senders list — these are explicitly validated by Brevo
  const { ok, data } = await brevoRequest("/senders");
  if (ok && Array.isArray(data?.senders) && data.senders.length > 0) {
    // Pick the first active/verified sender
    const verified = data.senders.find((s) => s.active !== false) || data.senders[0];
    return { name: verified.name || "Expert Solutions", email: verified.email };
  }
  // Last resort: account email (may not be a verified sender, but try anyway)
  const { ok: ok2, data: data2 } = await brevoRequest("/account");
  if (ok2 && data2?.email) {
    return { name: data2.companyName || data2.firstName || "Expert Solutions", email: data2.email };
  }
  return null;
}

function buildEmailHtml(toName, packageName, activationKey) {
  const steps = [
    "Log in to your Expert Solutions account",
    "Go to the <strong>Packages</strong> page",
    "Find the <em>'Have an Activation Key?'</em> box",
    "Paste your key and click <strong>Redeem</strong>",
  ];
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0b1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:24px;overflow:hidden;border:1px solid #1f2937;">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 32px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">🎯</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Your Package is Activated!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Expert Solutions · Earning Platform</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#d1d5db;font-size:15px;line-height:1.7;">
              Hi <strong style="color:#fff;">${toName || "Member"}</strong>,<br/><br/>
              Your <strong style="color:#a78bfa;">${packageName || "package"}</strong> purchase has been <strong style="color:#34d399;">approved</strong>. 
              Use the activation key below to unlock your account and start earning PKR daily.
            </p>
            <div style="background:#1e1b4b;border:2px dashed #4f46e5;border-radius:16px;padding:24px;text-align:center;margin:24px 0;">
              <p style="margin:0 0 10px;color:#a78bfa;font-size:11px;text-transform:uppercase;letter-spacing:3px;font-weight:700;">Your Activation Key</p>
              <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:900;color:#fff;letter-spacing:5px;background:#312e81;padding:16px 24px;border-radius:12px;display:inline-block;">
                ${activationKey}
              </div>
              <p style="margin:12px 0 0;color:#6b7280;font-size:12px;">Copy this key exactly as shown — it is case sensitive</p>
            </div>
            <div style="margin:28px 0 0;">
              <p style="margin:0 0 14px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">How to redeem</p>
              ${steps.map((s, i) => `
              <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:12px;">
                <div style="min-width:26px;height:26px;background:#4f46e5;border-radius:50%;text-align:center;line-height:26px;color:#fff;font-size:12px;font-weight:800;">${i + 1}</div>
                <p style="margin:2px 0 0;color:#d1d5db;font-size:14px;line-height:1.5;">${s}</p>
              </div>`).join("")}
            </div>
            <div style="background:#1f2937;border-radius:12px;padding:16px;margin-top:28px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">⚠️ This key can only be used <strong>once</strong>. Keep it safe. Contact support if you have any issues.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;text-align:center;border-top:1px solid #1f2937;">
            <p style="margin:0;color:#374151;font-size:12px;">Expert Solutions · Pakistan's Trusted Earning Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  /* ── Config endpoint ── */
  app.get("/api/config", (_req, res) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return res.status(500).json({ error: "Supabase credentials not configured" });
    res.json({ supabaseUrl: url, supabaseAnonKey: key });
  });

  /* ── Brevo senders check — frontend calls this to show sender info ── */
  app.get("/api/brevo-senders", async (_req, res) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "BREVO_API_KEY not set" });
    try {
      const sender = await getVerifiedSender(apiKey);
      if (!sender) return res.status(404).json({ error: "NO_VERIFIED_SENDER", message: "No verified sender found in your Brevo account." });
      res.json({ sender });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  /* ── Send activation key email ── */
  app.post("/api/send-activation-email", async (req, res) => {
    const { toEmail, toName, activationKey, packageName } = req.body;
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Email service not configured" });
    if (!toEmail || !activationKey) return res.status(400).json({ error: "Missing required fields" });

    try {
      // Always use a verified sender from the account
      const sender = await getVerifiedSender(apiKey);
      if (!sender) {
        return res.status(422).json({
          error: "NO_VERIFIED_SENDER",
          message: "Your Brevo account has no verified sender email. Please verify a sender at app.brevo.com → Senders & IPs → Senders.",
          fixUrl: "https://app.brevo.com/senders",
        });
      }

      console.log(`[email] Sending from ${sender.email} to ${toEmail} — key: ${activationKey}`);

      const { ok, status, data } = await brevoRequest("/smtp/email", "POST", {
        sender,
        to: [{ email: toEmail, name: toName || toEmail }],
        subject: `🎉 Your Activation Key — ${packageName || "Expert Solutions"}`,
        htmlContent: buildEmailHtml(toName, packageName, activationKey),
      });

      console.log(`[email] Brevo response ${status}:`, JSON.stringify(data));

      if (!ok) {
        const msg = data?.message || "";
        const isIpBlock =
          msg.toLowerCase().includes("unrecogni") ||
          msg.toLowerCase().includes("ip address") ||
          status === 401;

        if (isIpBlock) {
          return res.status(403).json({
            error: "IP_NOT_AUTHORIZED",
            message: "Brevo blocked this server's IP. Authorize it and try again.",
            authorizeUrl: "https://app.brevo.com/security/authorised_ips",
          });
        }
        return res.status(500).json({ error: msg || "Brevo rejected the request" });
      }

      res.json({ success: true, messageId: data.messageId, sentFrom: sender.email });
    } catch (err) {
      console.error("[email] Send error:", err);
      res.status(500).json({ error: "Failed to send email — " + String(err) });
    }
  });

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
