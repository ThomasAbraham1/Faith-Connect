import { Injectable } from "@nestjs/common";

@Injectable()
export class htmlContentGenerator{

    htmlContentGenerator(username: string, otp: string){

        const htmlContent = `<!DOCTYPE html>
        <html lang="en" style="margin:0; padding:0;">
        <head>
          <meta charset="utf-8" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
          <title>Faith Connect • Your OTP</title>
          <!-- Preheader (hidden preview text) -->
          <style>
            .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }
            /* Base */
            body { margin:0; padding:0; background:#f6f7fb; -webkit-font-smoothing:antialiased; }
            table { border-collapse:collapse; }
            img { border:0; outline:none; text-decoration:none; display:block; }
            a { text-decoration:none; color:#2d6cdf; }
            /* Card */
            .container { width:100%; background:#f6f7fb; padding:24px; }
            .card { max-width:560px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 24px rgba(23,42,79,.08); }
            .header { background:#0e1b4d; color:#ffffff; padding:24px 28px; font-family:Inter,Segoe UI,Arial,sans-serif; }
            .brand { font-size:18px; font-weight:700; letter-spacing:.3px; }
            .body { padding:28px; font-family:Inter,Segoe UI,Arial,sans-serif; color:#172a4f; }
            .h1 { margin:0 0 8px; font-size:20px; line-height:28px; font-weight:700; }
            .p  { margin:0 0 16px; font-size:14px; line-height:22px; color:#3a4b6a; }
            /* OTP block */
            .otp-wrap { margin:18px 0 12px; }
            .otp {
              letter-spacing:8px; /* space between digits */
              font-size:32px; line-height:40px; font-weight:800;
              background:#f0f3ff; color:#0e1b4d;
              padding:16px 18px; border-radius:12px; text-align:center;
              border:1px solid #e3e8ff;
              font-family:SFMono-Regular,Menlo,Consolas,Monaco,monospace;
            }
            /* Button (optional “Verify now”) */
            .btn { display:inline-block; background:#2d6cdf; color:#fff; padding:12px 18px; border-radius:10px; font-weight:600; font-size:14px; }
            .btn:hover { opacity:.96; }
            /* Footer */
            .foot { padding:18px 28px 26px; font-family:Inter,Segoe UI,Arial,sans-serif; color:#6b7a99; font-size:12px; line-height:18px; }
            .muted { color:#96a2be; }
            /* Dark mode */
            @media (prefers-color-scheme: dark) {
              body, .container { background:#0b1226 !important; }
              .card { background:#0f1a33 !important; box-shadow:none !important; }
              .header { background:#0a1530 !important; color:#e8eeff !important; }
              .body { color:#e8eeff !important; }
              .p { color:#b8c2df !important; }
              .otp { background:#0a1329 !important; color:#e8eeff !important; border-color:#1f2b4d !important; }
              .foot { color:#96a2be !important; }
            }
            /* Outlook fixes */
            /*[if mso]>* { font-family: Arial, sans-serif !important; }*/ 
          </style>
        </head>
        <body>
          <div class="preheader">Your Faith Connect verification code: {{otp}} (valid for 10 minutes)</div>
        
          <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="header">
                      <!-- You can swap this text for a logo image -->
                      <!-- <img src="cid:faithconnect_logo" alt="Faith Connect" height="24" /> -->
                      <div class="brand">Faith Connect</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="body">
                      <h1 class="h1">Your verification code</h1>
                      <p class="p">Hi ${username},</p>
                      <p class="p">Use the one-time passcode below to continue signing in to your Faith Connect account.</p>
        
                      <div class="otp-wrap">
                        <div class="otp">${otp}</div>
                      </div>
        
                      <p class="p muted">This code will expire in 5 minutes. If you didn’t request it, you can safely ignore this email.</p>
        
                      <!-- Optional CTA button that deep-links to your app -->
                      <!--
                      <p style="margin:20px 0 0;">
                        <a class="btn" href="https://app.faithconnect.example/verify?code={{otp}}">Verify now</a>
                      </p>
                      -->
                    </td>
                  </tr>
                  <tr>
                    <td class="foot">
                      Need help? Contact us at <a href="mailto:cta102938@gmail.com">cta102938@gmail.com</a>.<br />
                      © Faith Connect • Please don’t forward this code to anyone.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        
        </body>
        </html>
        `;
        return htmlContent
    }
}


