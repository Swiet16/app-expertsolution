import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  /* ── Config endpoint (serves Supabase creds safely) ── */
  app.get("/api/config", (_req, res) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      return res.status(500).json({ error: "Supabase credentials not configured" });
    }
    res.json({ supabaseUrl: url, supabaseAnonKey: key });
  });

  /* ── Send activation key email via Brevo ── */
  app.post("/api/send-activation-email", async (req, res) => {
    const { toEmail, toName, activationKey, packageName } = req.body;
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Email service not configured" });
    if (!toEmail || !activationKey) return res.status(400).json({ error: "Missing required fields" });

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Expert Solutions", email: "noreply@expertsolutions.pk" },
          to: [{ email: toEmail, name: toName || toEmail }],
          subject: `🎉 Your Activation Key — ${packageName || "Expert Solutions"}`,
          htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0b1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:24px;overflow:hidden;border:1px solid #1f2937;">
          <!-- Header gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🎯</div>
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Your Package is Ready!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Expert Solutions · Earning Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;color:#d1d5db;font-size:15px;line-height:1.6;">
                Hi <strong style="color:#fff;">${toName || "Member"}</strong>,<br/><br/>
                Great news! Your <strong style="color:#a78bfa;">${packageName || "package"}</strong> purchase has been approved.
                Use the activation key below to unlock your account and start earning PKR daily.
              </p>

              <!-- Key box -->
              <div style="background:#1e1b4b;border:2px dashed #4f46e5;border-radius:16px;padding:24px;text-align:center;margin:24px 0;">
                <p style="margin:0 0 8px;color:#a78bfa;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Your Activation Key</p>
                <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:900;color:#fff;letter-spacing:4px;background:#312e81;padding:14px 20px;border-radius:12px;display:inline-block;margin:4px 0;">
                  ${activationKey}
                </div>
                <p style="margin:12px 0 0;color:#6b7280;font-size:12px;">Copy this key exactly as shown</p>
              </div>

              <!-- Steps -->
              <div style="margin:24px 0;">
                <p style="margin:0 0 12px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">How to redeem</p>
                ${["Log in to your Expert Solutions account", "Go to the <strong>Packages</strong> page", "Find the 'Have an Activation Key?' box", "Paste your key and click <strong>Redeem</strong>"].map((s, i) => `
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
                  <div style="min-width:24px;height:24px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;line-height:24px;text-align:center;">${i + 1}</div>
                  <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.5;">${s}</p>
                </div>`).join("")}
              </div>

              <div style="background:#1f2937;border-radius:12px;padding:16px;margin-top:24px;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  ⚠️ Keep this key safe — it can only be used once. If you have any issues, contact our support team.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;text-align:center;border-top:1px solid #1f2937;">
              <p style="margin:0;color:#4b5563;font-size:12px;">Expert Solutions · Pakistan's Trusted Earning Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Brevo error:", result);
        const msg = result.message || "";
        const isIpBlock = msg.toLowerCase().includes("unrecogni") || msg.toLowerCase().includes("ip address") || response.status === 401;
        if (isIpBlock) {
          return res.status(403).json({
            error: "IP_NOT_AUTHORIZED",
            message: "Brevo has blocked this server's IP address. You need to authorize it in your Brevo account.",
            authorizeUrl: "https://app.brevo.com/security/authorised_ips",
          });
        }
        return res.status(500).json({ error: msg || "Email send failed" });
      }
      res.json({ success: true, messageId: result.messageId });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ error: "Failed to send email" });
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
