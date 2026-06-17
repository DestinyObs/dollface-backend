/**
 * Professional, email-client-safe templates for every email DollFace sends.
 * Table-based layout, inline styles, solid colours (no gradients — they break
 * in Gmail/Outlook), 600px max width. Each builder returns { subject, html, text }.
 */

const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const PLUM = "#753248";

type Email = { subject: string; html: string; text: string };

/** Base shell: header wordmark, body content, footer. */
function layout(bodyHtml: string, preheader = ""): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background-color:#f4eef1;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4eef1;font-size:1px;line-height:1px;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4eef1;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #ece3e7;border-radius:16px;">
        <tr><td align="center" style="background-color:${PLUM};border-radius:16px 16px 0 0;padding:30px 32px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">DollFace</span>
        </td></tr>
        ${bodyHtml}
        <tr><td align="center" style="background-color:#faf7f5;border-radius:0 0 16px 16px;padding:24px 44px;font-family:${FONT};">
          <p style="margin:0;font-size:12px;line-height:18px;color:#b3a7ac;">DollFace &middot; Beauty, personalised for you</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function heading(text: string): string {
  return `<tr><td style="padding:40px 44px 6px 44px;font-family:${FONT};"><h1 style="margin:0 0 12px 0;font-size:21px;line-height:28px;color:#1f1a1c;font-weight:700;">${text}</h1></td></tr>`;
}
function paragraph(text: string, topPad = false): string {
  return `<tr><td style="padding:${topPad ? "0" : "0"} 44px 6px 44px;font-family:${FONT};"><p style="margin:0 0 14px 0;font-size:15px;line-height:24px;color:#6b5e63;">${text}</p></td></tr>`;
}
function note(text: string): string {
  return `<tr><td style="padding:14px 44px 40px 44px;font-family:${FONT};"><p style="margin:0;font-size:13px;line-height:20px;color:#9a8d92;">${text}</p></td></tr>`;
}
function button(label: string, url: string): string {
  return `<tr><td align="center" style="padding:22px 44px 8px 44px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" style="background-color:${PLUM};border-radius:12px;">
        <a href="${url}" style="display:inline-block;padding:15px 34px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${label}</a>
      </td></tr></table></td></tr>`;
}
function codeBoxes(code: string): string {
  const cells = code
    .split("")
    .map(
      (d) =>
        `<td align="center" valign="middle" style="width:46px;height:58px;background-color:#f7eef2;border:1px solid #ecdfe6;border-radius:10px;font-family:${FONT};font-size:26px;font-weight:700;color:${PLUM};">${d}</td>` +
        `<td style="width:8px;font-size:0;line-height:0;">&nbsp;</td>`,
    )
    .join("")
    .replace(/<td style="width:8px;[^>]*>&nbsp;<\/td>$/, "");
  return `<tr><td align="center" style="padding:26px 44px 8px 44px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`;
}

// ── Templates ───────────────────────────────────────────────────────────────

export function verificationEmail(code: string): Email {
  const html = layout(
    heading("Verify your email address") +
      paragraph("Enter the code below in the DollFace app to finish creating your account. This code expires in 10 minutes.") +
      codeBoxes(code) +
      note("Didn't request this? You can safely ignore this email — no account is created without this code."),
    "Your DollFace verification code",
  );
  return { subject: "Your DollFace verification code", html, text: `Your DollFace verification code is ${code}. It expires in 10 minutes. If you didn't request this, ignore this email.` };
}

export function welcomeEmail(name: string): Email {
  const first = (name || "there").split(" ")[0];
  const html = layout(
    heading(`Welcome to DollFace, ${first} 💄`) +
      paragraph("Your account is all set. DollFace tailors shade matches, looks and tutorials to <em>you</em> — here's how to get the most out of it:") +
      `<tr><td style="padding:0 44px;font-family:${FONT};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:8px 0;font-size:15px;line-height:22px;color:#3f363a;">🎨 &nbsp;<strong>Scan your shade</strong> — match foundation &amp; concealer in seconds.</td></tr>
        <tr><td style="padding:8px 0;font-size:15px;line-height:22px;color:#3f363a;">✨ &nbsp;<strong>Recreate a look</strong> — upload any inspo and get a step-by-step.</td></tr>
        <tr><td style="padding:8px 0;font-size:15px;line-height:22px;color:#3f363a;">📖 &nbsp;<strong>Learn</strong> — tutorials tuned to your skill level.</td></tr>
        <tr><td style="padding:8px 0 4px 0;font-size:15px;line-height:22px;color:#3f363a;">🛍️ &nbsp;<strong>Shop smarter</strong> — only products that suit you.</td></tr>
      </table></td></tr>` +
      note("Open the app and start with a shade match — everything personalises from there. Welcome to the family 💕"),
    "Welcome to DollFace — your beauty, personalised",
  );
  return { subject: "Welcome to DollFace 💄", html, text: `Welcome to DollFace, ${first}! Your account is set. Start with a shade match and everything personalises from there.` };
}

export function passwordResetEmail(code: string, deepLink: string): Email {
  const html = layout(
    heading("Reset your password") +
      paragraph("We received a request to reset your DollFace password. Tap the button below to choose a new one. This link expires in 1 hour.") +
      button("Reset password", deepLink) +
      note(`If the button doesn't open the app, copy this link: ${deepLink}<br><br>Didn't request a reset? You can ignore this email — your password won't change.`),
    "Reset your DollFace password",
  );
  return { subject: "Reset your DollFace password", html, text: `Reset your DollFace password: ${deepLink}\nThis link expires in 1 hour. If you didn't request it, ignore this email.` };
}

export function magicLinkEmail(deepLink: string): Email {
  const html = layout(
    heading("Your sign-in link") +
      paragraph("Tap the button below to sign in to DollFace. This link expires in 15 minutes and can be used once.") +
      button("Sign in to DollFace", deepLink) +
      note(`If the button doesn't open the app, copy this link: ${deepLink}<br><br>Didn't try to sign in? You can safely ignore this email.`),
    "Your DollFace sign-in link",
  );
  return { subject: "Your DollFace sign-in link", html, text: `Sign in to DollFace: ${deepLink}\nThis link expires in 15 minutes.` };
}
