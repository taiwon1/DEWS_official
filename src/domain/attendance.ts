export type Meeting = 'worship' | 'group'
export type Attendance = { selected: string[]; confirmed: boolean }
export const emptyAttendance = (): Attendance => ({ selected: [], confirmed: false })
export function toggleAttendance(record: Attendance, id: string): Attendance {
  return { selected: record.selected.includes(id) ? record.selected.filter(value => value !== id) : [...record.selected, id], confirmed: false }
}
export function statusFor(record: Attendance, id: string): '출석' | '결석' | '미확정' {
  if (!record.confirmed) return '미확정'
  return record.selected.includes(id) ? '출석' : '결석'
}
export function confirmedPresence(worship: Attendance, group: Attendance, id: string): 'present' | 'absent' | 'unknown' {
  if ((worship.confirmed && worship.selected.includes(id)) || (group.confirmed && group.selected.includes(id))) return 'present'
  return worship.confirmed && group.confirmed ? 'absent' : 'unknown'
}
