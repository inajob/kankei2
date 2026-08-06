import type { NodeType } from './types'

export const DATE_DAY_RE = /^\d{4}-\d{2}-\d{2}$/
export const DATE_MONTH_RE = /^\d{4}-\d{2}$/
export const TIME_RE = /^\d{1,2}:\d{2}$/

export function detectNodeType(name: string): NodeType {
  if (DATE_DAY_RE.test(name)) return 'date_day'
  if (DATE_MONTH_RE.test(name)) return 'date_month'
  if (TIME_RE.test(name)) return 'time'
  return 'entity'
}

export function nodeIcon(type: NodeType): string {
  switch (type) {
    case 'date_day':
      return '📅'
    case 'date_month':
      return '🗓️'
    case 'time':
      return '🕐'
    default:
      return '🏷️'
  }
}
