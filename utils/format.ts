export function formatDate(date: Date, format: "full" | "short" = "full"): string {
  if (format === "short") {
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
