const fmt = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const getInitials = (name?: string) => {
  if (!name?.trim()) return "—";

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0].toUpperCase())
    .join("");
};

const fomarlizeName = (name: string | undefined) => {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Your name";
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export { fmt, getInitials, fomarlizeName, getGreeting };
