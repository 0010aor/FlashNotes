export function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

export const MAX_CHARACTERS = 3000
