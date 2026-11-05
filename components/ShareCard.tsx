const DECK_URL = "https://userdevaccount1.github.io/healthcare-ai-architecture-proposal/";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Link + QR so the audience can open the deck on a phone. */
export default function ShareCard({ compact }: { compact?: boolean }) {
  return (
    <div className={`share-card ${compact ? "is-compact" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE}/deck-qr.svg`} alt="QR code that opens this deck" width={compact ? 84 : 104} height={compact ? 84 : 104} />
      <div className="min-w-0">
        <span className="label">Open on your phone</span>
        <p className="mb-0 share-url">{DECK_URL.replace("https://", "")}</p>
        <p className="mb-0 text-body-secondary" style={{ fontSize: ".78rem" }}>Free public link · works on any phone, tablet or laptop</p>
      </div>
    </div>
  );
}
