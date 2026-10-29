// Fig. 1: an engraving of the eye in cross-section.
export function Eye() {
  return (
    <svg viewBox="0 0 600 400" role="img" aria-label="Engraving of an eye in cross-section: the letters you look at are focused onto the fovea">
      <defs>
        <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)" className="hatch"><line x1="0" y1="0" x2="0" y2="5"/></pattern>
        <pattern id="stip" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6" fill="currentColor" opacity=".35"/><circle cx="5.5" cy="5" r=".5" fill="currentColor" opacity=".25"/></pattern>
      </defs>
      <g style={{ color: "var(--line)" }}>
        <circle cx="350" cy="200" r="138" fill="url(#stip)"/>
        <path d="M232 108 A150 150 0 1 1 232 292" className="ln thick"/>
        <path d="M238 116 A144 144 0 1 1 238 284" fill="none" stroke="url(#hatch)" strokeWidth="11"/>
        <path d="M281 80.5 A138 138 0 1 1 281 319.5" className="ln"/>
        <path d="M232 108 Q170 200 232 292" className="ln thick"/>
        <path d="M238 112 Q182 200 238 288" className="ln thin"/>
        <path d="M242 128 V178 M242 222 V272" className="ln" strokeWidth="3.5"/>
        <ellipse cx="260" cy="200" rx="16" ry="44" className="ln"/>
        <ellipse cx="260" cy="200" rx="9" ry="34" className="ln thin"/>
        <path d="M486 184 Q474 200 486 216" className="ln"/>
        <path d="M478 250 L592 284 M468 268 L586 306" className="ln"/>
        <path d="M486 260 L590 292 M480 270 L588 300" className="ln thin"/>
      </g>
      <path d="M8 150 L275 200 L482 239" className="ray2"/>
      <path d="M8 200 L206 161 L256 170 L478 200" className="ray"/>
      <path d="M8 200 L206 239 L256 230 L478 200" className="ray"/>
      <path d="M8 200 L478 200" className="ray solid"/>
      <circle cx="8" cy="200" r="3" className="dot"/>
      <path d="M402 262 L476 240" className="lead"/><text x="296" y="276" className="lbl">the rest of the line</text>
      <circle cx="478" cy="200" r="3.5" className="dot"/>
      <path d="M8 140 V260" className="ln thick"/>
      <text x="14" y="132" className="lbl">the page</text>
      <path d="M190 92 L214 132" className="lead"/><text x="146" y="86" className="lbl">cornea</text>
      <path d="M232 330 L242 274" className="lead"/><text x="214" y="348" className="lbl">iris</text>
      <path d="M262 64 L260 154" className="lead"/><text x="248" y="56" className="lbl">lens</text>
      <path d="M430 44 L410 78" className="lead"/><text x="420" y="38" className="lbl">retina</text>
      <path d="M520 150 L484 196" className="lead"/><text x="512" y="142" className="lbl">fovea</text>
      <path d="M548 352 L548 300" className="lead"/><text x="508" y="370" className="lbl">optic nerve</text>
    </svg>
  );
}
