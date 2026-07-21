import type { SuggestedPrompt } from "./types"

const MAX_IMPORT_ROWS = 500

function splitCsvRow(row: string) {
  const cells: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index]
    if (character === '"' && quoted && row[index + 1] === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === "," && !quoted) {
      cells.push(cell.trim())
      cell = ""
    } else {
      cell += character
    }
  }
  cells.push(cell.trim())
  return cells
}

function cleanPrompt(input: Partial<SuggestedPrompt>, requireTopic: boolean = false): SuggestedPrompt | null {
  const text = input.text?.trim().replace(/\s+/g, " ") ?? ""
  if (text.length < 8 || text.length > 500) return null
  
  const topic = input.topic?.trim().replace(/\s+/g, " ")
  if (requireTopic && !topic) return null

  return {
    text,
    topic: topic || "Imported prompts",
    type: input.type?.trim().replace(/\s+/g, "_") || "customer_prompt",
    source: "CUSTOMER",
  }
}

export function parsePromptImport(fileName: string, content: string) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim())
  const isCsv = fileName.toLowerCase().endsWith(".csv")
  const parsed: SuggestedPrompt[] = []

  if (isCsv && lines.length) {
    const header = splitCsvRow(lines[0]).map((cell) => cell.toLowerCase().replace(/[^a-z]/g, ""))
    const textIndex = header.findIndex((cell) => ["prompt", "text", "query", "question"].includes(cell))
    const topicIndex = header.findIndex((cell) => ["topic", "category", "cluster"].includes(cell))
    const typeIndex = header.findIndex((cell) => ["type", "intent", "prompttype"].includes(cell))
    const startsAt = textIndex >= 0 ? 1 : 0

    for (const line of lines.slice(startsAt, startsAt + MAX_IMPORT_ROWS)) {
      const cells = splitCsvRow(line)
      const prompt = cleanPrompt({
        text: cells[textIndex >= 0 ? textIndex : 0],
        topic: topicIndex >= 0 ? cells[topicIndex] : undefined,
        type: typeIndex >= 0 ? cells[typeIndex] : undefined,
      }, true)
      if (prompt) parsed.push(prompt)
    }
  } else {
    for (const line of lines.slice(0, MAX_IMPORT_ROWS)) {
      const prompt = cleanPrompt({ text: line })
      if (prompt) parsed.push(prompt)
    }
  }

  const seen = new Set<string>()
  const prompts = parsed.filter((prompt) => {
    const key = prompt.text.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    prompts,
    rejected: Math.max(0, Math.min(lines.length, MAX_IMPORT_ROWS) - prompts.length),
    truncated: lines.length > MAX_IMPORT_ROWS,
  }
}
