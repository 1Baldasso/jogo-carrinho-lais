/**
 * Side-profile car SVG, front pointing right (→), colored by `color`.
 * height is always width * 0.5 (32:64 aspect ratio).
 */
export function carSvg(color: string, width = 56): string {
  const h = Math.round(width * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" width="${width}" height="${h}" aria-hidden="true">
    <!-- Body (rear left → front right) -->
    <path d="
      M3 21
      Q3 17 7 17
      L15 17
      L19 6 Q20 4 23 4
      L42 4 Q45 4 47 7
      L52 14 L58 14
      Q62 14 62 18
      L62 21 Z
    " fill="${color}"/>
    <!-- Windshield / cabin glass -->
    <path d="M20 16 L23 5 L42 5 L46 13 Z" fill="#b8e4f9" opacity="0.85"/>
    <!-- Rear wheel -->
    <circle cx="13" cy="24" r="7" fill="#1c1c1c"/>
    <circle cx="13" cy="24" r="3.2" fill="#555"/>
    <circle cx="13" cy="24" r="1.2" fill="#888"/>
    <!-- Front wheel -->
    <circle cx="51" cy="24" r="7" fill="#1c1c1c"/>
    <circle cx="51" cy="24" r="3.2" fill="#555"/>
    <circle cx="51" cy="24" r="1.2" fill="#888"/>
    <!-- Headlight (front) -->
    <rect x="59" y="16" width="3" height="3" rx="1" fill="#fffbe6" opacity="0.9"/>
    <!-- Taillight (rear) -->
    <rect x="2" y="17" width="3" height="3" rx="1" fill="#ff6b6b" opacity="0.85"/>
  </svg>`;
}
