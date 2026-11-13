import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react'
import { calendarEvents, type CommunityEvent } from './data'
import './events.css'

type Props = { onOpen: (event: CommunityEvent) => void; events?: CommunityEvent[] }
const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export function PosterBoard({ onOpen, events = calendarEvents }: Props) {
  return <div className="poster-board">{events.map(event => <button className="poster-item" key={event.id} onClick={() => onOpen(event)}>
    <div className={`event-poster poster-${event.color}`}>
      {event.posterUrl ? <img src={event.posterUrl} alt={`${event.title} 포스터`} /> : <>
        <span className="poster-brand">DEWS <span>도원동교회 이슬청년부</span></span>
        <span className="poster-heading">{event.title}</span>
        <span className="poster-motif" aria-hidden="true"><i /><i /><i /></span>
        <span className="poster-bottom"><strong>{event.month}.{event.day}</strong><span>{event.date.slice(0,4)} · {event.category}<br />기본 안내 이미지</span></span>
      </>}
      <span className="poster-open" aria-hidden="true"><ArrowUpRight size={19} /></span>
    </div>
    <div className="poster-info"><span className="poster-category">{event.category}</span><h2>{event.title}</h2><p>{event.when}</p><span className="poster-detail">행사 안내 <ArrowUpRight size={14} /></span></div>
  </button>)}</div>
}

export function EventCalendar({ onOpen, events = calendarEvents }: Props) {
  const [today] = useState(() => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()))
  const [year, month] = today.split('-').map(Number)
  const [view, setView] = useState({ year, month: month - 1 })
  const [selected, setSelected] = useState<string | null>(null)
  const prefix = dateKey(view.year, view.month, 1).slice(0, 7)
  const monthEvents = events.filter(event => event.date.startsWith(prefix))
  const shownEvents = selected ? monthEvents.filter(event => event.date === selected) : monthEvents
  const offset = new Date(view.year, view.month, 1).getDay()
  const count = new Date(view.year, view.month + 1, 0).getDate()
  const cellCount = Math.ceil((offset + count) / 7) * 7
  function move(delta: number) {
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() }); setSelected(null)
  }
  return <div className="calendar-layout">
    <div className="month-calendar">
      <div className="calendar-toolbar"><h3 aria-live="polite">{view.year}년 <strong>{view.month + 1}월</strong></h3><div><button className="calendar-today" onClick={() => { setView({ year, month: month - 1 }); setSelected(null) }}>이번 달</button><button aria-label="이전 달" onClick={() => move(-1)}><ChevronLeft size={18} /></button><button aria-label="다음 달" onClick={() => move(1)}><ChevronRight size={18} /></button></div></div>
      <div className="calendar-weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">{Array.from({ length: cellCount }, (_, index) => {
        const day = index - offset + 1
        if (day < 1 || day > count) return <div className="calendar-blank" key={index} />
        const key = dateKey(view.year, view.month, day)
        const daily = monthEvents.filter(event => event.date === key)
        return <button key={key} className={`calendar-day ${selected === key ? 'selected' : ''} ${today === key ? 'is-today' : ''}`} aria-pressed={selected === key} aria-current={today === key ? 'date' : undefined} aria-label={`${view.month + 1}월 ${day}일 ${weekdays[index % 7]}요일, ${daily.length ? daily.map(event => event.title).join(', ') : '등록된 행사 없음'}`} onClick={() => setSelected(selected === key ? null : key)}><span className="day-number">{day}</span><span className="day-events">{daily.slice(0, 2).map(event => <span key={event.id} className={`calendar-chip chip-${event.color}`}>{event.title}</span>)}{daily.length > 2 && <small>+{daily.length - 2}</small>}</span>{daily.length > 0 && <span className="mobile-event-dot" />}</button>
      })}</div>
      <p className="calendar-hint"><span /> 행사 날짜를 누르면 상세 목록을 볼 수 있어요.</p>
    </div>
    <aside className="calendar-agenda" aria-live="polite"><div className="agenda-heading"><h3>{selected ? `${Number(selected.slice(-2))}일 행사` : '이달의 행사'}</h3><span>{shownEvents.length}건</span></div>{selected && <button className="agenda-reset" onClick={() => setSelected(null)}>이달 전체 보기</button>}
      {shownEvents.length ? shownEvents.map(event => <button className="agenda-event" key={event.id} onClick={() => onOpen(event)}><span className={`agenda-date chip-${event.color}`}><small>{event.month}월</small><strong>{event.day}</strong></span><span className="agenda-copy"><small>{event.category}</small><strong>{event.title}</strong><span><MapPin size={12} />{event.location}</span></span><ArrowUpRight size={16} /></button>) : <div className="calendar-empty"><CalendarDays size={27} /><p>등록된 행사가 없습니다.</p><span>{selected ? '다른 날짜를 선택해 보세요.' : '행사가 등록되면 여기에 표시됩니다.'}</span></div>}
      <p className="agenda-note">현재 표시된 일정은 미리보기용입니다.</p>
    </aside>
  </div>
}
