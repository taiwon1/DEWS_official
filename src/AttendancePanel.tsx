import { useEffect, useState } from 'react'
import { CalendarDays, Check, Search, Users } from 'lucide-react'
import { members } from './data'
import { emptyAttendance, statusFor, toggleAttendance, type Attendance, type Meeting } from './domain/attendance'

type Records = Record<string, Attendance>
type ConfirmDialog = { title: string; text: string; action: string; confirm: () => void }
const meetings: { key: Meeting; title: string }[] = [{ key: 'worship', title: '주일예배' }, { key: 'group', title: '소그룹' }]
const storageKey = 'dews-demo-attendance-v1'
function loadRecords(): Records {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) || '{}')
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    return Object.fromEntries(Object.entries(raw).filter(([, value]) => value && Array.isArray(value.selected) && value.selected.every((id: unknown) => typeof id === 'string') && typeof value.confirmed === 'boolean'))
  } catch { return {} }
}

export default function AttendancePanel({ openDialog }: { openDialog: (dialog: ConfirmDialog) => void }) {
  const [date, setDate] = useState('2026-11-15')
  const [records, setRecords] = useState(loadRecords)
  const [query, setQuery] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [message, setMessage] = useState('')
  // Selection controls allow each meeting to be confirmed independently without leaving the page.
  const [included, setIncluded] = useState<Record<Meeting, boolean>>({ worship: true, group: true })
  const keyFor = (meeting: Meeting) => `${date}:demo-group-1:${meeting}`
  const getRecord = (meeting: Meeting) => records[keyFor(meeting)] ?? emptyAttendance()
  const count = (meeting: Meeting) => members.filter(m => getRecord(meeting).selected.includes(m.id)).length
  const pending = meetings.filter(m => included[m.key] && !getRecord(m.key).confirmed)
  const visible = members.filter(member => member.name.includes(query.trim()))
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(records)); setStorageError(false) } catch { setStorageError(true) }
  }, [records])
  function update(meeting: Meeting, next: Attendance) {
    setRecords(previous => ({ ...previous, [keyFor(meeting)]: next }))
    setMessage('')
  }
  function requestConfirm() {
    const entries = pending.map(meeting => ({ key: keyFor(meeting.key), record: getRecord(meeting.key) }))
    openDialog({
      title: '출석 기록을 확정할까요?',
      text: `${date}\n${pending.map(meeting => `${meeting.title}: 출석 ${count(meeting.key)}명 · 결석 ${members.length - count(meeting.key)}명`).join('\n')}\n\n확정하는 모임에서 체크하지 않은 사람은 결석으로 기록됩니다.`,
      action: '확정하기',
      confirm: () => {
        setRecords(previous => ({ ...previous, ...Object.fromEntries(entries.map(entry => [entry.key, { ...entry.record, confirmed: true }])) }))
        setMessage('출석 기록을 확정했습니다.')
      },
    })
  }
  return <section className="workspace section-wrap attendance-workspace">
    <div className="section-top"><div><h1 className="page-title">출석 체크</h1><p className="page-description">날짜를 선택하고 주일예배와 소그룹 참석 여부를 체크하세요.</p></div><div className="group-pill"><Users size={18} /> 이슬 1그룹 <span>예시 · {members.length}명</span></div></div>
    <div className="attendance-sheet">
      <div className="sheet-toolbar"><label className="date-label"><CalendarDays size={18} /><input aria-label="출석 날짜" type="date" value={date} onChange={e => { if(e.target.value) { setDate(e.target.value); setMessage('') } }} /></label><label className="search-field"><Search size={17} /><input placeholder="이름 검색" aria-label="소그룹원 이름 검색" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      <table className="attendance-table"><caption className="sr-only">{date} 이슬 1그룹 출석 명단</caption><thead><tr><th scope="col">소그룹원 <span className="table-count">{members.length}명</span></th>{meetings.map(meeting => <th scope="col" key={meeting.key}><span>{meeting.title}</span><span className={`column-status ${getRecord(meeting.key).confirmed ? 'done' : ''}`}>{getRecord(meeting.key).confirmed ? '확정' : '미확정'}</span><button className="column-select" onClick={() => update(meeting.key, { selected: count(meeting.key) === members.length ? [] : members.map(m => m.id), confirmed: false })} aria-label={`${meeting.title} 전체 ${count(meeting.key) === members.length ? '해제' : '선택'}`}>{count(meeting.key) === members.length ? '전체 해제' : '전체 선택'}</button></th>)}</tr></thead><tbody>{visible.map(member => <tr key={member.id}><th scope="row"><strong>{member.name}</strong><span className="member-category">{member.category}</span></th>{meetings.map(meeting => { const record = getRecord(meeting.key); return <td key={meeting.key}><label className="attendance-cell"><input aria-label={`${member.name} ${meeting.title} 출석`} type="checkbox" checked={record.selected.includes(member.id)} onChange={() => update(meeting.key, toggleAttendance(record, member.id))} /><span className="cell-status">{record.confirmed ? statusFor(record, member.id) : record.selected.includes(member.id) ? '출석 선택' : '—'}</span></label></td> })}</tr>)}</tbody></table>
      {!visible.length && <p className="empty-state">검색 결과가 없습니다.</p>}
      <div className="sheet-totals"><span>전체 명단 기준</span>{meetings.map(meeting => <span key={meeting.key}>{meeting.title} <strong>{count(meeting.key)}</strong> / {members.length}명</span>)}</div>
    </div>
    <div className="attendance-save"><div className="save-options"><strong>확정할 모임</strong><div>{meetings.map(meeting => <label key={meeting.key}><input type="checkbox" checked={included[meeting.key]} onChange={e => setIncluded(previous => ({ ...previous, [meeting.key]: e.target.checked }))} />{meeting.title}</label>)}</div><p>아직 진행하지 않은 모임은 선택을 해제하세요. 해당 모임은 확정되지 않습니다.</p></div><button className="primary-button" disabled={!pending.length} onClick={requestConfirm}>{pending.length ? `선택한 모임 출석 확정` : meetings.every(m => getRecord(m.key).confirmed) ? <><Check size={17} /> 확정 완료</> : '확정할 모임을 선택하세요'}</button></div>
    <p className="attendance-help">출석을 수정하면 해당 모임을 다시 확정해야 합니다. 검색 중에도 확정은 전체 명단에 적용됩니다.</p>
    {message && <p className="save-message" role="status">{message}</p>}
    {storageError && <p className="save-error" role="alert">브라우저 저장이 차단되어 있습니다. 새로고침하면 변경 내용이 사라집니다.</p>}
    <p className="demo-footnote">예시 출석은 이 브라우저에만 저장됩니다.</p>
  </section>
}
