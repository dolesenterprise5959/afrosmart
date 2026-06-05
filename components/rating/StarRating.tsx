// Display-only star rating (read-only). For the interactive picker see
// RateUserForm.
export function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value);
  const cls = size === "md" ? "text-lg" : "text-sm";
  return (
    <span className={`inline-flex ${cls}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? "text-accent" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}
