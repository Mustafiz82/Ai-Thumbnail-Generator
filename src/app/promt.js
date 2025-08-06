export const getGeminiPrompt = (videoTitle) => `
Browse YouTube and search for the video titled "${videoTitle}". Based on what you observe, generate a **visually cinematic and high-impact thumbnail prompt** for the Flask Schnail model.

Apply the following visual logic **only when the topic demands it**:

🕌 **Religious Topics**:
- If the topic is religious and the specific religion is not mentioned, assume it is **Islamic**.
- Use **mosques, Arabic calligraphy, Islamic patterns**, or crescent moons.

🧍 **Human Depictions**:
- Avoid nude, semi-nude, or uncovered characters. Use **modest** clothing styles.
- When showing people without clear gender preference, **prefer male characters** unless the topic requires a female figure (e.g., women’s rights, makeup tutorials).

🎯 Topic-Based Visual Enhancements:
- **Programming languages** → Use logos or mascots (Python snake, Java cup, etc.).
- **Countries** → Show flags, landmarks, traditional clothing, etc.
- **Famous People** → Portraits or symbolic items (microphone, medals, etc.).
- **Sports** → Game-specific visuals like balls, stadiums, jerseys.
- **Festivals/Holidays** → Lanterns, lights, pumpkins, etc.
- **Science & Space** → Stars, planets, satellites.
- **Technology** → Futuristic UIs, glowing circuits.
- **Finance** → Money visuals, stock graphs, vaults.
- **AI/ML** → Glowing brains, neural nets, robots.
- **Gaming** → Characters, explosions, avatars.
- **Travel** → Landscapes, passports, airplanes.
- **History** → Old scrolls, maps, sepia tone visuals.
- **War/Conflict** → Broken flags, soldiers, battlefields.
- **Nature** → Forests, oceans, animals.
- **Education** → Books, boards, graduation caps.
- **Crime/Drama** → Police tape, red lighting, shadows.
- **Health/Medicine** → Stethoscopes, masks, red crosses.
- **Motivation** → Mountains, sunrise, trophies.
- **Mythology** → Gods, temples, lightning bolts.
- **Luxury** → Gold, watches, designer elements.
- **Art** → Canvases, sketches, colors.
- **Music** → Instruments, headphones, concerts.
- **Coding/Dev** → Terminal screens, keyboard lights.
- **Horror** → Blood spatters, fog, haunted visuals.
- **Animals** → Stylized, cute, or majestic creatures.
- **Weather** → Thunder, storms, sunrays.
- **Military/Spy** → Night vision, classified stamps.
- **Food** → Meals, ingredients, kitchens.
- **Fashion** → Clothing, runways, accessories.
- **Environment** → Trees, recycling icons, pollution.

📵 The generated image **must not contain any visible text** inside the thumbnail itself.

✍️ The second line must be a **JavaScript object with the text overlay config**.
Apply these typography principles:

- The **text style must be bold, high contrast, and easy to read**, even on mobile.
- Use **bold sans-serif fonts** (like "Anton", "Bebas Neue", "Oswald", or "Poppins") for high clickability.
- the text color should be clearly readable based on the background on the textconfig 
- Add **text shadow** for contrast and readability:
  \`shadowColor: "#000"\`, \`shadowBlur: 10\`, \`shadowOffset: { x: 2, y: 2 }\`, \`shadowOpacity: 0.6\`
- Use high-contrast text colors (white or bright tones if background is dark, or vice versa).
- If the video title is in **Bangla**, use  **"Noto Sans Bengali"** in the \`fontFamily\`.
- Use **multiline support and word wrapping** only if:
  - The text length exceeds 20 characters, or
  - The text's x position is 100 or greater.
- Set the following properties if wrapping:
  \`width\`, \`lineHeight\`

- Konva.js supports **line breaks** and **text wrapping** using \`width\`, \`lineHeight\`, and \`\\n\` for manual breaks.

If browsing is not possible, use your best judgment to create the most clickable, scannable, and attention-grabbing thumbnail prompt possible.

⚠️ Output Format:

1. First line: The **thumbnail prompt** (plain text).
2. Second line: A **JavaScript object** containing the thumbnail's overlay text configuration to be applied manually.

💡 Example Output:

A dramatic YouTube thumbnail showing a developer typing furiously with a dark background and glowing terminal, inspired by cyberpunk visuals and high-intensity lighting.||
{
  text: "The\\nDev Life",
  x: 150,
  y: 200,
  fill: "#ffffff",
  fontSize: 42,
  fontStyle: "bold",
  shadowColor: "#000",
  shadowBlur: 12,
  shadowOffset: { x: 2, y: 2 },
  shadowOpacity: 0.6,
  fontFamily: "Anton",
  letterSpacing: 1,
  lineHeight: 1.4,
  width: 300
}

🚫 Do not include any explanation or formatting. Just return exactly 2 lines: the prompt, then the config, separated by “||”.
`;
