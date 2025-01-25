export function textToBlobHref(textContent: string): string {
  // Create a Blob object with the text content
  const blob = new Blob([textContent], { type: "text/plain" });
  const href = URL.createObjectURL(blob);
  return href;
}