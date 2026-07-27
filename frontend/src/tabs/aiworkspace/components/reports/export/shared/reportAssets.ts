export async function loadAssetAsDataUrl(assetUrl: string): Promise<string | null> {
  try {
    const response = await fetch(assetUrl)
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
