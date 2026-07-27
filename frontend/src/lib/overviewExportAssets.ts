function faviconUrl(brandUrl: string) {
  try {
    const domain = new URL(brandUrl.startsWith("http") ? brandUrl : `https://${brandUrl}`).hostname
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
  } catch {
    return null
  }
}

export async function loadBrandLogoDataUrl(brandUrl: string): Promise<string | null> {
  const url = faviconUrl(brandUrl)
  if (!url) return null

  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}
