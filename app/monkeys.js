// A different monkey (or ape) for every month, drawn as small SVG scenes.
const Monkeys = (() => {
  const svg = inner => `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  const sky = (id, top, bottom) =>
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>` +
    `<stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="240" height="160" fill="url(#${id})"/>`;
  const eye = (x, y, r = 3.4, c = "#1d120b") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.36}" fill="#fff"/>`;
  const amberEye = (x, y, r = 3.8, iris = "#e09a20") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/><circle cx="${x}" cy="${y}" r="${r * 0.52}" fill="#1d120b"/>` +
    `<circle cx="${x + r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff"/>`;
  const leaf = (x, y, rot, len, color) =>
    `<ellipse cx="${x}" cy="${y}" rx="${len}" ry="${len * 0.38}" transform="rotate(${rot} ${x} ${y})" fill="${color}"/>`;
  const heart = (x, y, s, color) =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-6 0 -12 -2 -12 -7 C-12 -12 -6 -14 0 -8 C6 -14 12 -12 12 -7 C12 -2 6 0 0 6Z" fill="${color}"/>`;
  const star = (cx, cy, n, r1, r2) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? r2 : r1;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const snow = (pts, r = 2.2) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`).join("");
  const flower = (x, y, c) =>
    [0, 72, 144, 216, 288].map(a => {
      const rad = (a * Math.PI) / 180;
      return `<circle cx="${(x + 4 * Math.cos(rad)).toFixed(1)}" cy="${(y + 4 * Math.sin(rad)).toFixed(1)}" r="3.4" fill="${c}"/>`;
    }).join("") + `<circle cx="${x}" cy="${y}" r="2.4" fill="#ffd23f"/>`;
  const burst = (x, y, r, c) =>
    [...Array(12)].map((_, i) => {
      const a = (i * Math.PI) / 6;
      return `<line x1="${(x + r * 0.35 * Math.cos(a)).toFixed(1)}" y1="${(y + r * 0.35 * Math.sin(a)).toFixed(1)}" ` +
        `x2="${(x + r * Math.cos(a)).toFixed(1)}" y2="${(y + r * Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
    }).join("") + `<circle cx="${x}" cy="${y}" r="2" fill="${c}"/>`;

  const flakes = [[18, 20], [52, 12], [80, 34], [160, 16], [196, 30], [226, 12], [30, 54], [214, 58], [140, 10], [100, 14]];

  return [
    { // January
      name: "Japanese Macaque (Snow Monkey)",
      fact: "Snow monkeys live farther north than any other monkey and warm up in natural hot springs in winter.",
      svg: svg(
        sky("m0", "#bcd6ee", "#eaf3fb") +
        `<path d="M0 104 L40 72 L80 96 L130 62 L180 94 L240 70 L240 160 L0 160Z" fill="#dfe9f3"/>` +
        snow(flakes) +
        `<ellipse cx="26" cy="120" rx="52" ry="16" fill="#fff"/><ellipse cx="216" cy="118" rx="46" ry="14" fill="#fff"/>` +
        `<rect x="0" y="120" width="240" height="40" fill="#6fb3c8"/><ellipse cx="120" cy="121" rx="128" ry="7" fill="#8fc8d8"/>` +
        `<path d="M54 114 q-8 -10 0 -20 q8 -10 0 -20 M190 114 q-8 -10 0 -20 q8 -10 0 -20" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="128" rx="44" ry="22" fill="#a89786"/>` +
        `<circle cx="89" cy="78" r="7" fill="#d9988f"/><circle cx="151" cy="78" r="7" fill="#d9988f"/>` +
        `<ellipse cx="96" cy="94" rx="13" ry="16" fill="#c4b5a3"/><ellipse cx="144" cy="94" rx="13" ry="16" fill="#c4b5a3"/>` +
        `<circle cx="120" cy="82" r="31" fill="#b8a896"/>` +
        `<ellipse cx="120" cy="53" rx="20" ry="7" fill="#fff"/><ellipse cx="111" cy="50" rx="8" ry="5" fill="#fff"/>` +
        `<ellipse cx="120" cy="89" rx="19" ry="21" fill="#e5726b"/>` +
        `<path d="M104 77 Q112 72 119 77 M121 77 Q128 72 136 77" stroke="#a8433d" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
        eye(112, 83) + eye(128, 83) +
        `<circle cx="117" cy="95" r="1.5" fill="#8a2f2a"/><circle cx="123" cy="95" r="1.5" fill="#8a2f2a"/>` +
        `<path d="M113 102 q7 4 14 0" stroke="#8a2f2a" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        `<rect x="0" y="132" width="240" height="28" fill="#6fb3c8" opacity=".92"/>` +
        `<path d="M70 140 h20 M150 146 h26 M30 150 h18" stroke="#bfe3ec" stroke-width="2" stroke-linecap="round"/>`
      ),
    },
    { // February
      name: "Golden Lion Tamarin",
      fact: "Golden lion tamarins live in close family groups, and the dads help carry the babies on their backs.",
      svg: svg(
        sky("m1", "#ffd6e0", "#fff0f4") +
        heart(30, 30, 0.9, "#ff8fa8") + heart(206, 40, 1.1, "#ff7a98") + heart(60, 92, 0.7, "#ffb0c2") +
        heart(190, 104, 0.8, "#ffb0c2") + heart(170, 18, 0.6, "#ff8fa8") +
        `<path d="M0 146 Q120 128 240 146" stroke="#8a5a35" stroke-width="11" fill="none" stroke-linecap="round"/>` +
        `<path d="M142 140 Q170 150 186 132 Q196 118 184 112" stroke="#e88a1a" stroke-width="6" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="126" rx="26" ry="20" fill="#f0931e"/>` +
        `<polygon points="${star(120, 76, 18, 46, 34)}" fill="#f29a17"/>` +
        `<circle cx="120" cy="76" r="35" fill="#f8b33a"/>` +
        `<ellipse cx="120" cy="82" rx="15" ry="19" fill="#5b3b2c"/>` +
        eye(114, 78, 3.6, "#2a1408") + eye(126, 78, 3.6, "#2a1408") +
        `<circle cx="118" cy="88" r="1.2" fill="#2a1408"/><circle cx="122" cy="88" r="1.2" fill="#2a1408"/>` +
        `<path d="M115 93 q5 3 10 0" stroke="#2a1408" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
        heart(120, 126, 1.5, "#e53950") +
        `<circle cx="102" cy="122" r="5" fill="#4a2e1f"/><circle cx="138" cy="122" r="5" fill="#4a2e1f"/>`
      ),
    },
    { // March
      name: "Gorilla",
      fact: "Gorillas are the largest primates on Earth; an adult male silverback can weigh over 400 pounds.",
      svg: svg(
        sky("m2", "#bfe3b4", "#e6f5df") +
        leaf(14, 20, 30, 26, "#4f9a45") + leaf(40, 8, -20, 22, "#5fae54") + leaf(224, 24, -30, 28, "#4f9a45") +
        leaf(200, 8, 20, 22, "#5fae54") + leaf(10, 80, 60, 22, "#6dbb60") + leaf(232, 86, -60, 22, "#6dbb60") +
        `<rect y="140" width="240" height="20" fill="#7fb36a"/>` +
        `<ellipse cx="120" cy="152" rx="80" ry="46" fill="#2e2e35"/>` +
        `<ellipse cx="54" cy="150" rx="17" ry="12" fill="#2e2e35"/><ellipse cx="186" cy="150" rx="17" ry="12" fill="#2e2e35"/>` +
        `<ellipse cx="101" cy="140" rx="19" ry="13" fill="#3d3d46"/><ellipse cx="139" cy="140" rx="19" ry="13" fill="#3d3d46"/>` +
        `<circle cx="86" cy="96" r="6" fill="#3d3d46"/><circle cx="154" cy="96" r="6" fill="#3d3d46"/>` +
        `<path d="M84 94 Q82 52 120 38 Q158 52 156 94 Q150 124 120 126 Q90 124 84 94Z" fill="#2e2e35"/>` +
        `<ellipse cx="120" cy="98" rx="26" ry="25" fill="#4b4b54"/>` +
        `<path d="M93 84 Q120 70 147 84 Q140 92 120 88 Q100 92 93 84Z" fill="#26262c"/>` +
        eye(108, 92, 3.2, "#5a3416") + eye(132, 92, 3.2, "#5a3416") +
        `<path d="M106 106 Q120 94 134 106 Q134 114 120 114 Q106 114 106 106Z" fill="#3a3a42"/>` +
        `<ellipse cx="113" cy="109" rx="3.5" ry="2.5" fill="#1b1b20"/><ellipse cx="127" cy="109" rx="3.5" ry="2.5" fill="#1b1b20"/>` +
        `<path d="M108 119 Q120 123 132 119" stroke="#1b1b20" stroke-width="2" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // April
      name: "Spider Monkey",
      fact: "Spider monkeys use their long tail like a fifth hand — it's strong enough to hold their whole body weight.",
      svg: svg(
        sky("m3", "#cfe0ef", "#eef4fa") +
        `<g fill="#fff"><circle cx="40" cy="58" r="12"/><circle cx="56" cy="52" r="15"/><circle cx="72" cy="60" r="11"/>` +
        `<circle cx="182" cy="68" r="11"/><circle cx="198" cy="62" r="14"/><circle cx="214" cy="70" r="10"/></g>` +
        `<g stroke="#7aa7d6" stroke-width="2" stroke-linecap="round">` +
        [[30, 82], [52, 96], [70, 80], [20, 118], [62, 130], [186, 92], [206, 106], [222, 90], [176, 124], [214, 136]]
          .map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x - 3}" y2="${y + 8}"/>`).join("") + `</g>` +
        `<path d="M0 34 Q120 20 240 38" stroke="#7a4e2c" stroke-width="10" fill="none" stroke-linecap="round"/>` +
        leaf(30, 26, -20, 12, "#5fae54") + leaf(70, 22, 15, 11, "#4f9a45") + leaf(170, 24, -10, 12, "#5fae54") + leaf(222, 30, 25, 11, "#4f9a45") +
        `<path d="M124 118 Q170 132 196 92 Q214 58 202 32 Q196 22 188 30" stroke="#2b2420" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<path d="M109 92 L96 30 M131 92 L146 30" stroke="#2b2420" stroke-width="7" stroke-linecap="round"/>` +
        `<ellipse cx="96" cy="30" rx="5" ry="6" fill="#2b2420"/><ellipse cx="146" cy="30" rx="5" ry="6" fill="#2b2420"/>` +
        `<path d="M112 120 L104 148 M128 120 L138 148" stroke="#2b2420" stroke-width="7" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="104" rx="17" ry="22" fill="#2b2420"/><ellipse cx="120" cy="108" rx="10" ry="14" fill="#4a3f38"/>` +
        `<circle cx="120" cy="74" r="17" fill="#2b2420"/>` +
        `<ellipse cx="120" cy="77" rx="12" ry="11" fill="#e2b48c"/>` +
        eye(115, 74, 2.8) + eye(125, 74, 2.8) +
        `<circle cx="118" cy="80" r="1" fill="#5a3a26"/><circle cx="122" cy="80" r="1" fill="#5a3a26"/>` +
        `<path d="M116 84 q4 3 8 0" stroke="#5a3a26" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // May
      name: "Mandrill",
      fact: "Mandrills are the largest monkeys in the world, and the most colorful males are usually the leaders.",
      svg: svg(
        sky("m4", "#d9f0ff", "#f3fbff") +
        `<rect y="128" width="240" height="32" fill="#8fd27a"/>` +
        flower(20, 140, "#ff7eb6") + flower(46, 150, "#ffffff") + flower(196, 142, "#b98cff") + flower(222, 152, "#ff7eb6") +
        flower(170, 154, "#ffffff") + flower(70, 136, "#b98cff") +
        `<ellipse cx="120" cy="152" rx="58" ry="34" fill="#5d5a30"/>` +
        `<ellipse cx="84" cy="92" rx="13" ry="22" fill="#7a7640"/><ellipse cx="156" cy="92" rx="13" ry="22" fill="#7a7640"/>` +
        `<ellipse cx="120" cy="82" rx="38" ry="42" fill="#6d6a38"/>` +
        `<path d="M96 112 Q120 154 144 112 Z" fill="#e8c35a"/>` +
        `<ellipse cx="105" cy="100" rx="10" ry="21" fill="#5b8ed8"/><ellipse cx="135" cy="100" rx="10" ry="21" fill="#5b8ed8"/>` +
        `<path d="M100 86 V114 M105 82 V118 M110 86 V114 M130 86 V114 M135 82 V118 M140 86 V114" stroke="#3d6fbf" stroke-width="1.5"/>` +
        `<rect x="114" y="72" width="12" height="44" rx="6" fill="#d93030"/>` +
        `<ellipse cx="120" cy="116" rx="11" ry="7" fill="#e0393a"/>` +
        `<ellipse cx="116" cy="117" rx="1.8" ry="1.3" fill="#5a1414"/><ellipse cx="124" cy="117" rx="1.8" ry="1.3" fill="#5a1414"/>` +
        `<path d="M97 70 Q120 60 143 70 Q120 74 97 70Z" fill="#3a3820"/>` +
        amberEye(107, 76) + amberEye(133, 76) +
        `<path d="M110 127 Q120 131 130 127" stroke="#3a2a1a" stroke-width="2" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // June
      name: "Chimpanzee",
      fact: "Chimpanzees share about 98% of their DNA with us and use sticks as tools to fish termites out of mounds.",
      svg: svg(
        sky("m5", "#ffe9a8", "#fff7dc") +
        `<g stroke="#ffc83d" stroke-width="3" stroke-linecap="round">` +
        [...Array(8)].map((_, i) => {
          const a = (i * Math.PI) / 4;
          return `<line x1="${(200 + 24 * Math.cos(a)).toFixed(1)}" y1="${(34 + 24 * Math.sin(a)).toFixed(1)}" x2="${(200 + 32 * Math.cos(a)).toFixed(1)}" y2="${(34 + 32 * Math.sin(a)).toFixed(1)}"/>`;
        }).join("") + `</g><circle cx="200" cy="34" r="18" fill="#ffc83d"/>` +
        `<rect y="138" width="240" height="22" fill="#8fcf6a"/>` +
        leaf(18, 130, -50, 16, "#6dbb60") + leaf(30, 128, -20, 14, "#5fae54") + leaf(222, 130, 50, 16, "#6dbb60") +
        `<ellipse cx="120" cy="152" rx="52" ry="30" fill="#26201c"/>` +
        `<circle cx="79" cy="82" r="13" fill="#26201c"/><circle cx="79" cy="82" r="8" fill="#e3b48c"/>` +
        `<circle cx="161" cy="82" r="13" fill="#26201c"/><circle cx="161" cy="82" r="8" fill="#e3b48c"/>` +
        `<circle cx="120" cy="80" r="38" fill="#26201c"/>` +
        `<circle cx="108" cy="76" r="14" fill="#e8c19a"/><circle cx="132" cy="76" r="14" fill="#e8c19a"/>` +
        `<ellipse cx="120" cy="98" rx="24" ry="18" fill="#e8c19a"/>` +
        `<path d="M95 68 Q108 60 120 68 Q132 60 145 68" stroke="#c99a72" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        eye(109, 76, 3.6, "#3a2210") + eye(131, 76, 3.6, "#3a2210") +
        `<ellipse cx="116" cy="90" rx="2" ry="1.5" fill="#7a5236"/><ellipse cx="124" cy="90" rx="2" ry="1.5" fill="#7a5236"/>` +
        `<path d="M104 101 Q120 116 136 101" stroke="#7a4433" stroke-width="3" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // July
      name: "Orangutan",
      fact: "Orangutans spend most of their lives up in the trees and build a fresh leafy nest to sleep in every night.",
      svg: svg(
        sky("m6", "#1b2350", "#3a3f7a") +
        snow([[20, 16], [64, 40], [110, 12], [150, 30], [230, 50], [12, 70], [228, 100]], 1.2) +
        burst(44, 36, 22, "#ff5a6e") + burst(196, 30, 20, "#5ad1ff") + burst(212, 84, 14, "#ffd23f") + burst(28, 96, 12, "#9dff7a") +
        `<rect y="140" width="240" height="20" fill="#1d3a2a"/>` +
        `<path d="M66 118 Q42 130 38 158 M174 118 Q198 130 202 158" stroke="#c4561d" stroke-width="18" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="142" rx="64" ry="38" fill="#c4561d"/>` +
        `<path d="M86 130 l-4 18 M100 134 l-2 18 M140 134 l2 18 M154 130 l4 18 M120 136 v18" stroke="#a8441a" stroke-width="2" stroke-linecap="round"/>` +
        `<polygon points="${star(120, 70, 12, 40, 32)}" fill="#cf621f"/>` +
        `<ellipse cx="120" cy="86" rx="46" ry="30" fill="#6e3b22"/>` +
        `<ellipse cx="120" cy="86" rx="26" ry="27" fill="#8a4d2c"/>` +
        eye(112, 79, 3.2, "#2a1408") + eye(128, 79, 3.2, "#2a1408") +
        `<circle cx="117" cy="91" r="1.4" fill="#3a1d0e"/><circle cx="123" cy="91" r="1.4" fill="#3a1d0e"/>` +
        `<ellipse cx="120" cy="102" rx="14" ry="6" fill="#a76a48"/>` +
        `<path d="M108 102 Q120 106 132 102" stroke="#4a2414" stroke-width="2" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // August
      name: "Baboon",
      fact: "Baboons live in big troops and spend hours grooming each other, which helps keep friendships strong.",
      svg: svg(
        sky("m7", "#ffcf8a", "#ffe9c6") +
        `<circle cx="56" cy="92" r="30" fill="#ffb347" opacity=".8"/>` +
        `<path d="M194 126 L196 70 M196 82 L178 64 M196 78 L214 62" stroke="#5a4a2a" stroke-width="5" stroke-linecap="round"/>` +
        `<ellipse cx="196" cy="60" rx="40" ry="10" fill="#6b7a3a"/>` +
        `<rect y="124" width="240" height="36" fill="#d9b46a"/>` +
        `<path d="M14 126 l-4 -12 M18 126 l2 -14 M24 126 l6 -10 M222 128 l-4 -12 M228 128 l2 -12" stroke="#b08a3e" stroke-width="2" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="140" rx="56" ry="32" fill="#a89366"/>` +
        `<polygon points="${star(120, 86, 16, 50, 38)}" fill="#b39d6c"/>` +
        `<circle cx="93" cy="62" r="5" fill="#6b5a40"/><circle cx="147" cy="62" r="5" fill="#6b5a40"/>` +
        `<circle cx="120" cy="74" r="28" fill="#a08a5c"/>` +
        `<ellipse cx="100" cy="94" rx="9" ry="13" fill="#c7b386"/><ellipse cx="140" cy="94" rx="9" ry="13" fill="#c7b386"/>` +
        `<path d="M108 74 Q106 118 113 126 Q120 131 127 126 Q134 118 132 74 Z" fill="#5a4c47"/>` +
        `<ellipse cx="120" cy="124" rx="8" ry="5" fill="#3a312e"/>` +
        `<ellipse cx="117" cy="124" rx="1.6" ry="1.2" fill="#1d1614"/><ellipse cx="123" cy="124" rx="1.6" ry="1.2" fill="#1d1614"/>` +
        `<path d="M98 65 Q120 56 142 65 Q120 70 98 65Z" fill="#6b5a40"/>` +
        amberEye(106, 72, 3.2, "#d08a1c") + amberEye(134, 72, 3.2, "#d08a1c") +
        `<path d="M112 134 Q120 137 128 134" stroke="#3a312e" stroke-width="2" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // September
      name: "Proboscis Monkey",
      fact: "A male proboscis monkey's huge nose makes his calls louder. They're excellent swimmers, too!",
      svg: svg(
        sky("m8", "#c8ecd9", "#eefaf3") +
        `<path d="M24 130 V60 M24 100 q-14 14 -18 30 M24 100 q14 14 18 30 M216 130 V56 M216 96 q-14 14 -18 34 M216 96 q14 14 18 34" stroke="#6b4a2c" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="24" cy="52" rx="28" ry="18" fill="#4f9a45"/><ellipse cx="216" cy="48" rx="30" ry="18" fill="#4f9a45"/>` +
        `<rect y="134" width="240" height="26" fill="#4fa3b5"/>` +
        `<path d="M30 146 h20 M180 150 h24 M100 154 h16" stroke="#9fd4df" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M40 138 Q120 128 200 138" stroke="#7a4e2c" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<path d="M98 122 Q86 132 94 140 M142 122 Q154 132 146 140" stroke="#bdb6ad" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="118" rx="30" ry="24" fill="#d9893f"/>` +
        `<ellipse cx="120" cy="124" rx="18" ry="16" fill="#f2d2a6"/>` +
        `<ellipse cx="97" cy="82" rx="9" ry="14" fill="#f4e6d0"/><ellipse cx="143" cy="82" rx="9" ry="14" fill="#f4e6d0"/>` +
        `<circle cx="120" cy="72" r="26" fill="#c97a36"/>` +
        `<ellipse cx="120" cy="52" rx="18" ry="8" fill="#a85a26"/>` +
        `<ellipse cx="120" cy="80" rx="18" ry="18" fill="#f1b98a"/>` +
        eye(112, 73, 3) + eye(128, 73, 3) +
        `<path d="M116 78 Q109 96 112 108 Q120 119 128 108 Q131 96 124 78 Z" fill="#e7906a"/>` +
        `<path d="M114 106 Q120 111 126 106" stroke="#b5603e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
      ),
    },
    { // October
      name: "Howler Monkey",
      fact: "Howler monkeys are some of the loudest land animals — their howls can be heard up to 3 miles away.",
      svg: svg(
        sky("m9", "#2a1f4a", "#5a3a6e") +
        `<circle cx="188" cy="40" r="24" fill="#fff1b8"/><circle cx="180" cy="34" r="4" fill="#efdf9e"/><circle cx="194" cy="48" r="3" fill="#efdf9e"/>` +
        `<path d="M40 30 q6 -6 10 0 q4 -6 10 0 q-4 2 -10 4 q-6 -2 -10 -4Z M76 50 q5 -5 8 0 q3 -5 8 0 q-3 2 -8 3 q-5 -1 -8 -3Z" fill="#120c22"/>` +
        `<rect y="146" width="240" height="14" fill="#1d1430"/>` +
        `<path d="M0 132 Q120 120 240 136" stroke="#3b2a1e" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<g transform="translate(38 140)"><ellipse rx="16" ry="12" fill="#f07b1a"/><ellipse rx="6" ry="12" fill="#f99a3d"/>` +
        `<rect x="-2" y="-16" width="4" height="6" fill="#4a7a2a"/><path d="M-7 -2 l3 -3 l3 3Z M1 -2 l3 -3 l3 3Z M-6 4 q6 4 12 0" fill="#3a1d0e" stroke="#3a1d0e"/></g>` +
        `<path d="M146 126 Q176 132 180 112 Q182 98 170 100" stroke="#3a2418" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="118" cy="122" rx="30" ry="24" fill="#3a2418"/>` +
        `<ellipse cx="94" cy="118" rx="8" ry="14" fill="#7a3e1c"/><ellipse cx="142" cy="118" rx="8" ry="14" fill="#7a3e1c"/>` +
        `<ellipse cx="118" cy="98" rx="19" ry="15" fill="#2a1a12"/>` +
        `<circle cx="118" cy="74" r="22" fill="#3a2418"/>` +
        `<ellipse cx="118" cy="78" rx="14" ry="15" fill="#1d120c"/>` +
        `<circle cx="111" cy="71" r="3" fill="#fff"/><circle cx="111.5" cy="69.8" r="1.8" fill="#1d120c"/>` +
        `<circle cx="125" cy="71" r="3" fill="#fff"/><circle cx="125.5" cy="69.8" r="1.8" fill="#1d120c"/>` +
        `<ellipse cx="118" cy="86" rx="7" ry="8.5" fill="#8e1f2a"/><ellipse cx="118" cy="88" rx="4" ry="5" fill="#5a0f18"/>` +
        `<path d="M136 64 q8 -4 6 -14 M144 66 q12 -6 9 -22 M152 68 q16 -8 12 -30" stroke="#fff1b8" stroke-width="2.5" fill="none" opacity=".85" stroke-linecap="round"/>`
      ),
    },
    { // November
      name: "Capuchin Monkey",
      fact: "Capuchins are clever tool users — some crack open hard nuts by hammering them with stones.",
      svg: svg(
        sky("ma", "#ffe0b8", "#fff3e2") +
        leaf(30, 24, 30, 9, "#e2662a") + leaf(70, 50, -40, 8, "#c94a1e") + leaf(176, 20, 60, 9, "#e8962a") +
        leaf(212, 54, -20, 8, "#c94a1e") + leaf(20, 86, 10, 8, "#e8962a") + leaf(224, 100, 40, 9, "#e2662a") +
        `<rect y="136" width="240" height="24" fill="#e6a35a"/>` +
        leaf(30, 138, 10, 9, "#c94a1e") + leaf(46, 142, -30, 8, "#e2662a") + leaf(200, 140, 20, 9, "#c94a1e") + leaf(214, 136, -20, 8, "#8b4a1e") +
        `<path d="M142 140 Q176 150 182 124 Q186 108 174 108" stroke="#5a3a24" stroke-width="6" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="130" rx="28" ry="24" fill="#5a3a24"/>` +
        `<ellipse cx="120" cy="110" rx="26" ry="12" fill="#f1dfc0"/>` +
        `<circle cx="92" cy="82" r="6" fill="#e9c9a8"/><circle cx="148" cy="82" r="6" fill="#e9c9a8"/>` +
        `<circle cx="120" cy="80" r="28" fill="#f1dfc0"/>` +
        `<path d="M93 74 Q94 48 120 46 Q146 48 147 74 Q134 60 124 64 L120 72 L116 64 Q106 60 93 74Z" fill="#3e2618"/>` +
        `<ellipse cx="120" cy="88" rx="15" ry="16" fill="#e6b49a"/>` +
        eye(113, 84, 3.2) + eye(127, 84, 3.2) +
        `<circle cx="118" cy="92" r="1.2" fill="#7a4a3a"/><circle cx="122" cy="92" r="1.2" fill="#7a4a3a"/>` +
        `<path d="M115 97 q5 3 10 0" stroke="#7a4a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="120" cy="131" rx="7" ry="9" fill="#b8742c"/><ellipse cx="120" cy="123" rx="9" ry="5" fill="#7a4a22"/>` +
        `<rect x="119" y="115" width="2" height="5" fill="#5a3a24"/>` +
        `<circle cx="109" cy="129" r="5" fill="#4a2e1c"/><circle cx="131" cy="129" r="5" fill="#4a2e1c"/>`
      ),
    },
    { // December
      name: "Golden Snub-nosed Monkey",
      fact: "Golden snub-nosed monkeys live in snowy mountain forests in China; their thick golden fur keeps them warm.",
      svg: svg(
        sky("mb", "#a9c8e8", "#e3eefa") +
        `<path d="M20 120 l16 -40 l16 40Z M196 120 l18 -46 l18 46Z" fill="#2f6b4a"/>` +
        `<path d="M30 94 l6 -14 l6 14 q-6 -3 -12 0Z M207 92 l7 -18 l7 18 q-7 -3 -14 0Z" fill="#fff"/>` +
        snow(flakes) +
        `<ellipse cx="120" cy="150" rx="150" ry="26" fill="#fff"/>` +
        `<ellipse cx="120" cy="132" rx="40" ry="26" fill="#e39a2e"/>` +
        `<ellipse cx="94" cy="122" rx="12" ry="18" fill="#f0b54a"/><ellipse cx="146" cy="122" rx="12" ry="18" fill="#f0b54a"/>` +
        `<ellipse cx="92" cy="88" rx="11" ry="15" fill="#f3c35a"/><ellipse cx="148" cy="88" rx="11" ry="15" fill="#f3c35a"/>` +
        `<circle cx="120" cy="82" r="30" fill="#e8a536"/>` +
        `<ellipse cx="120" cy="88" rx="16" ry="17" fill="#9ccbe8"/>` +
        eye(113, 83, 3.2) + eye(127, 83, 3.2) +
        `<ellipse cx="117.5" cy="92" rx="1.6" ry="2" fill="#3d6f93"/><ellipse cx="122.5" cy="92" rx="1.6" ry="2" fill="#3d6f93"/>` +
        `<ellipse cx="120" cy="100" rx="6" ry="3" fill="#e5a3a0"/>` +
        `<path d="M96 60 Q110 22 152 28 Q132 40 146 60 Z" fill="#d62828"/>` +
        `<rect x="92" y="54" width="58" height="12" rx="6" fill="#fff"/><circle cx="153" cy="29" r="7" fill="#fff"/>`
      ),
    },
  ];
})();
