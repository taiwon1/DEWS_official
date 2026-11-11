import { describe, expect, it } from 'vitest'
import { confirmedPresence, emptyAttendance, statusFor, toggleAttendance } from './attendance'
describe('출석 확정 규칙', () => {
  it('한 명 체크해도 다른 사람을 결석으로 확정하지 않는다', () => {
    const draft = toggleAttendance(emptyAttendance(), 'a')
    expect(statusFor(draft, 'b')).toBe('미확정')
    expect(statusFor({ ...draft, confirmed: true }, 'b')).toBe('결석')
  })
  it('둘 중 한 모임에 확정 출석하면 출석으로 인정한다', () => {
    expect(confirmedPresence({ selected: [], confirmed: true }, { selected: ['a'], confirmed: true }, 'a')).toBe('present')
  })
  it('미확정 기록을 결석으로 단정하지 않는다', () => {
    expect(confirmedPresence({ selected: [], confirmed: true }, emptyAttendance(), 'a')).toBe('unknown')
  })
  it('확정 내용을 수정하면 다시 확정해야 한다', () => {
    expect(toggleAttendance({ selected: ['a'], confirmed: true }, 'a')).toEqual(emptyAttendance())
  })
})
