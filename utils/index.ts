export const fmt = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
