const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "marketing", "instagram");
const logoPath = path.join(root, "public", "brand", "gazie-commute-icon.png");

fs.mkdirSync(outDir, { recursive: true });

const posts = [
  {
    slug: "gazie-driver-launch-square",
    tag: "DRIVERS WANTED",
    title: ["Your daily", "commute can", "offset fuel."],
    accent: "offset fuel.",
    badge: "1",
    bodyTop: "Share empty seats on trips you already make.",
    bodyBottom: "Verified riders. Planned routes. Direct payment.",
    captionTitle: "Gazie Commute Driver Launch Caption",
    caption:
      "Drivers in Lugbe and Abuja: your daily commute can help offset fuel costs.\n\nGazie Commute helps verified private car owners share empty seats with riders going the same way. You choose your route, schedule, available seats, and fare.\n\nStart onboarding here:\nhttps://gazie-commute.vercel.app/drivers\n\n#GazieCommute #Lugbe #AbujaDrivers #RideSharing #AbujaCommute #DriversWanted",
  },
  {
    slug: "gazie-driver-how-it-works-square",
    tag: "HOW IT WORKS",
    title: ["Set your route.", "List your seats.", "Meet riders."],
    accent: "Meet riders.",
    badge: "2",
    bodyTop: "Create your driver profile and upload your documents.",
    bodyBottom: "Then post your usual commute route and schedule.",
    captionTitle: "Gazie Commute Driver How It Works Caption",
    caption:
      "How Gazie Commute works for drivers:\n\n1. Create your driver profile.\n2. Upload your licence, insurance, and vehicle details.\n3. Post your usual commute route.\n4. Accept riders going the same way.\n\nStart here:\nhttps://gazie-commute.vercel.app/drivers\n\n#GazieCommute #DriverOnboarding #LugbeDrivers #AbujaCommute #RideSharing",
  },
  {
    slug: "gazie-driver-benefits-square",
    tag: "DRIVER BENEFITS",
    title: ["Already driving?", "Let empty seats", "work for you."],
    accent: "work for you.",
    badge: "3",
    bodyTop: "Offset fuel costs without changing your daily route.",
    bodyBottom: "You control your schedule, seats, and fare.",
    captionTitle: "Gazie Commute Driver Benefits Caption",
    caption:
      "Already driving from Lugbe into town?\n\nGazie Commute lets you share empty seats with verified riders heading your way, so your normal commute can help offset fuel costs.\n\nYou control your route, available seats, schedule, and fare.\n\nJoin here:\nhttps://gazie-commute.vercel.app/drivers\n\n#GazieCommute #AbujaDrivers #FuelCosts #Lugbe #SharedCommute",
  },
  {
    slug: "gazie-driver-trust-square",
    tag: "BUILT ON TRUST",
    title: ["Planned trips.", "Verified people.", "Clear details."],
    accent: "Clear details.",
    badge: "4",
    bodyTop: "Drivers and riders complete verification before matching.",
    bodyBottom: "Gazie is for scheduled commutes, not random pickups.",
    captionTitle: "Gazie Commute Trust Caption",
    caption:
      "Gazie Commute is built for planned, community-minded trips.\n\nDrivers upload their licence, insurance, and vehicle details. Riders also complete verification, so each match starts with clearer trust and accountability.\n\nDriver onboarding:\nhttps://gazie-commute.vercel.app/drivers\n\n#GazieCommute #VerifiedDrivers #AbujaCommute #Lugbe #SaferCommutes",
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleLines(post) {
  return post.title
    .map((line, index) => {
      const y = 166 + index * 84;
      const fill = line === post.accent ? "#234C96" : "#0B253C";
      return `<text x="0" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="900" fill="${fill}">${escapeXml(line)}</text>`;
    })
    .join("\n");
}

function makeSvg(post) {
  return `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F8FBF6"/>
      <stop offset="0.55" stop-color="#EAF3EA"/>
      <stop offset="1" stop-color="#F5E7A6"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#08253C" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect width="1080" height="1080" fill="url(#sky)"/>
  <path d="M-80 780 C 160 660, 310 720, 520 610 S 870 440, 1160 540" fill="none" stroke="#2D6A4F" stroke-width="18" stroke-linecap="round" opacity="0.16"/>
  <path d="M-40 875 C 190 720, 380 820, 560 700 S 870 520, 1140 650" fill="none" stroke="#234C96" stroke-width="10" stroke-linecap="round" stroke-dasharray="36 30" opacity="0.38"/>

  <g transform="translate(84 78)">
    <rect x="0" y="0" width="912" height="924" rx="34" fill="#FFFFFF" filter="url(#shadow)"/>
    <rect x="0" y="0" width="912" height="924" rx="34" fill="none" stroke="#D9E7D9" stroke-width="2"/>

    <g transform="translate(56 48)">
      <circle cx="72" cy="72" r="72" fill="#F6F9F4" stroke="#E1E9DC" stroke-width="2"/>
      <text x="168" y="58" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#0B253C">Gazie Commute</text>
      <text x="168" y="100" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#2D6A4F">Lugbe, Abuja</text>
    </g>

    <g transform="translate(56 224)">
      <rect x="0" y="0" width="330" height="52" rx="26" fill="#F5C84B"/>
      <text x="165" y="35" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#0B253C">${escapeXml(post.tag)}</text>

      ${titleLines(post)}
    </g>

    <g transform="translate(56 620)">
      <rect x="0" y="0" width="800" height="120" rx="24" fill="#F6F9F4" stroke="#DCE8D7" stroke-width="2"/>
      <circle cx="58" cy="60" r="26" fill="#2D6A4F"/>
      <text x="58" y="70" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF">${escapeXml(post.badge)}</text>
      <text x="104" y="49" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" fill="#0B253C">${escapeXml(post.bodyTop)}</text>
      <text x="104" y="86" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="#44546A">${escapeXml(post.bodyBottom)}</text>
    </g>

    <g transform="translate(56 790)">
      <rect x="0" y="0" width="800" height="72" rx="36" fill="#0B253C"/>
      <text x="400" y="47" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF">Join: gazie-commute.vercel.app/drivers</text>
    </g>
  </g>
</svg>`;
}

async function generatePost(post, logoBuffer) {
  const imagePath = path.join(outDir, `${post.slug}.png`);
  const captionPath = path.join(outDir, `${post.slug.replace("-square", "-caption")}.md`);

  await sharp(Buffer.from(makeSvg(post)))
    .composite([
      {
        input: logoBuffer,
        top: 120,
        left: 147,
        blend: "over",
      },
    ])
    .png()
    .toFile(imagePath);

  fs.writeFileSync(captionPath, `# ${post.captionTitle}\n\n${post.caption}\n`, "utf8");
  console.log(imagePath);
  console.log(captionPath);
}

async function generate() {
  const logoBuffer = await sharp(logoPath)
    .resize({ width: 118, height: 92, fit: "inside" })
    .png()
    .toBuffer();

  for (const post of posts) {
    await generatePost(post, logoBuffer);
  }
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
