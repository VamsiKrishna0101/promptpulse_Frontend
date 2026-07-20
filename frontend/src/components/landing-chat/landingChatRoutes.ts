const PUBLIC_CHAT_PATHS = [
  "/",
  "/pricing",
  "/demo",
  "/book-demo",
  "/blog",
  "/geo-guide",
  "/help-center",
  "/changelog",
]

export function shouldShowLandingChat(pathname: string) {
  if (pathname.startsWith("/product/")) return true
  return PUBLIC_CHAT_PATHS.includes(pathname)
}
