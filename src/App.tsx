import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight, Check, ChevronRight, CalendarDays, Users, HeartHandshake, Menu, X, Search, CheckCheck, Sprout, Plus, Youtube, ArrowLeft, LockKeyhole } from 'lucide-react'
import { members, events } from './data'
import { emptyAttendance, statusFor, toggleAttendance, type Attendance, type Meeting } from './domain/attendance'

type Page = 'home' | 'attendance' | 'care' | 'events'
type Dialog = { title: string; text: string; confirm?: () => void; action?: string }
const storageKey = 'dews-demo-attendance-v1'
function loadRecords(): Record<string, Attendance> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) || '{}')
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    return Object.fromEntries(Object.entries(raw).filter(([, value]) => value && Array.isArray(value.selected) && value.selected.every((id: unknown) => typeof id === 'string') && typeof value.confirmed === 'boolean'))
  } catch { return {} }
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [activeCard, setActiveCard] = useState(0)
  const [date, setDate] = useState('2026-11-15')
  const [meeting, setMeeting] = useState<Meeting>('worship')
  const [records, setRecords] = useState(loadRecords)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [storageError, setStorageError] = useState(false)
  const modalRef = useRef<HTMLDialogElement>(null)
  const recordKey = `${date}:demo-group-1:${meeting}`
  const record = records[recordKey] ?? emptyAttendance()
  const selectedCount = members.filter(m => record.selected.includes(m.id)).length
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(records)); setStorageError(false) } catch { setStorageError(true) }
  }, [records])
  useEffect(() => { if (dialog) modalRef.current?.showModal(); else modalRef.current?.close() }, [dialog])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer) }, [toast])
  function navigate(next: Page) { setPage(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function updateRecord(next: Attendance) { setRecords(previous => ({ ...previous, [recordKey]: next })) }
  const navItems: [Page, string][] = [['home', '우리 공동체'], ['attendance', '출석 관리'], ['care', '함께 돌봄'], ['events', '행사 · 동아리']]
  const cards = [
    { label: 'WORSHIP', title: '함께 예배해요', desc: '같은 마음으로 하나님을 향하는 시간.', icon: <Sprout />, page: 'events' as Page },
    { label: 'SMALL GROUP', title: '서로를 알아가요', desc: '작은 모임 안에서 나누는 깊은 이야기.', icon: <Users />, page: 'attendance' as Page },
    { label: 'CARE', title: '마음을 나눠요', desc: '한 사람도 놓치지 않고, 함께 걸어요.', icon: <HeartHandshake />, page: 'care' as Page },
    { label: 'TOGETHER', title: '일상을 함께해요', desc: '우리의 취향이 만나 더 풍성해지는 일상.', icon: <CalendarDays />, page: 'events' as Page },
  ]
  return <>
    <a href="#main" className="skip-link">본문으로 이동</a>
    <header className="header">
      <button className="brand" onClick={() => navigate('home')} aria-label="DEWS 홈"><span className="brand-word">DEWS<span className="brand-dot">.</span></span><span className="brand-caption">도원동교회<br />이슬청년부</span></button>
      <nav aria-label="주 메뉴" className={mobileMenu ? 'nav open' : 'nav'}>{navItems.map(([key, label]) => <button key={key} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>)}</nav>
      <button className="header-cta" onClick={() => setDialog({ title: '함께할 준비가 되셨나요?', text: '현재는 가상 데이터로 구성된 화면 미리보기입니다. 실제 로그인은 개인별 가입 링크와 인증 기능을 연결한 뒤 이용할 수 있어요.' })}>로그인 <ArrowUpRight size={16} /></button>
      <button className="menu-toggle" aria-label={mobileMenu ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button>
    </header>
    <div className="preview-notice"><span className="status-dot" />화면 미리보기 <span className="notice-divider">/</span> 모든 이름·일정·기록은 예시입니다.</div>
    <main id="main">
      {page === 'home' && <>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" /><div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="hero-content"><p className="eyebrow light">DOWONDONG CHURCH · YOUNG ADULTS</p><h1>함께 머물고,<br />함께 자라는 우리<span>.</span></h1><p className="hero-description">아침 이슬처럼, 서로의 일상에 스며드는 공동체.<br />도원동교회 이슬청년부 DEWS입니다.</p><button className="hero-button" onClick={() => navigate('attendance')}>우리 소그룹 만나기 <span><ArrowUpRight size={19} /></span></button></div>
          <div className="hero-art" aria-hidden="true"><div className="dew-ring ring-one" /><div className="dew-ring ring-two" /><div className="dew-word">DEWS</div><span className="art-caption">GROWING TOGETHER, IN GRACE.</span><div className="glass-drop" /></div>
          <div className="hero-bottom"><span>작은 만남이, 깊은 공동체가 되는 곳</span><span>SCROLL TO EXPLORE <span className="vertical-arrow">↓</span></span></div>
        </section>
        <section className="community section-wrap" id="community"><div className="center-heading"><p className="eyebrow">LIFE IN DEWS</p><h2>우리의 모든 순간에, 함께</h2><p>예배에서 일상까지.<br className="mobile-only" /> 서로의 이름을 부르며 함께 자라갑니다.</p></div>
          <div className="community-cards">{cards.map((card, index) => <button key={card.label} className={`community-card card-${index} ${activeCard === index ? 'expanded' : ''}`} onMouseEnter={() => setActiveCard(index)} onFocus={() => setActiveCard(index)} onClick={() => navigate(card.page)}><span className="card-label">{card.label}</span><h3>{card.title}</h3><p>{card.desc}</p><span className="card-art" aria-hidden="true">{card.icon}</span><span className="card-link">자세히 보기 <ArrowUpRight size={19} /></span></button>)}</div>
        </section>
        <section className="care-intro section-wrap"><div><p className="eyebrow">WE CARE FOR EACH OTHER</p><h2>한 사람의 안부가<br />우리의 시작이니까.</h2><p className="body-copy">지난주에 보지 못한 얼굴, 함께 나누었던 기도.<br />작은 관심이 이어져 누구도 혼자 남지 않도록.<br />이슬청년부는 서로의 오늘을 기억합니다.</p><button className="soft-button" onClick={() => navigate('care')}>돌봄 목록 살펴보기 <ArrowUpRight size={18} /></button></div><div className="care-illustration"><span className="illustration-label">A LITTLE CARE, A LOT OF LOVE</span><div className="care-circle"><HeartHandshake strokeWidth={1} /></div><span className="floating-note note-one"><span className="tiny-avatar">함께</span> 이번 주, 잘 지내고 있나요? <HeartHandshake size={17} /></span><span className="floating-note note-two"><span className="status-dot" /> 서로를 기억하는 공동체</span></div></section>
        <section className="events-section"><div className="section-wrap"><div className="section-top"><div><p className="eyebrow light">COMING TOGETHER</p><h2>함께할 다음 순간</h2></div><button className="text-button light" onClick={() => navigate('events')}>전체 일정 보기 <ArrowUpRight size={20} /></button></div><div className="event-cards">{events.map(event => <button className="event-card" key={event.id} onClick={() => setDialog({ title: event.title, text: `예시 일정입니다. ${event.when} · ${event.location}. ${event.description}` })}><div className="event-top"><span className="event-tag">{event.category}</span><ArrowUpRight size={20} /></div><h3>{event.title}</h3><p>{event.description}</p><div className="event-date"><CalendarDays size={17} />{event.when}<span>2026</span></div></button>)}</div></div></section>
      </>}
      {page === 'attendance' && <section className="workspace section-wrap"><div className="breadcrumb">DEWS <ChevronRight size={13} /> 소그룹 <ChevronRight size={13} /> 출석 관리</div><div className="section-top"><div><p className="eyebrow">OUR SMALL GROUP</p><h1 className="page-title">함께한 오늘을 기록해요.</h1><p className="page-description">참석한 소그룹원을 선택하고 출석을 확정해 주세요.</p></div><div className="group-pill"><Users size={18} /> 이슬 1그룹 <span>예시</span></div></div><div className="workspace-grid"><div className="attendance-panel"><div className="panel-toolbar"><label className="date-label"><CalendarDays size={18} /><input aria-label="출석 날짜" type="date" value={date} onChange={e => { if(e.target.value) setDate(e.target.value) }} /></label><span className={`record-status ${record.confirmed ? 'done' : ''}`}>{record.confirmed ? '확정 완료' : '입력 중 · 미확정'}</span></div><div className="meeting-tabs" role="group" aria-label="모임 종류"><button aria-pressed={meeting === 'worship'} className={meeting === 'worship' ? 'selected' : ''} onClick={() => setMeeting('worship')}>주일예배</button><button aria-pressed={meeting === 'group'} className={meeting === 'group' ? 'selected' : ''} onClick={() => setMeeting('group')}>소그룹 모임</button></div><div className="member-toolbar"><label className="search-field"><Search size={17} /><input placeholder="소그룹원 이름 검색" aria-label="소그룹원 이름 검색" value={query} onChange={e => setQuery(e.target.value)} /></label><button className="text-button" onClick={() => updateRecord({ selected: selectedCount === members.length ? [] : members.map(m => m.id), confirmed: false })}><CheckCheck size={16} />{selectedCount === members.length ? '전체 해제' : '전체 선택'}</button></div><div className="member-list">{members.filter(m => m.name.includes(query.trim())).map((member, index) => <label className={`member-row ${record.selected.includes(member.id) ? 'checked' : ''}`} key={member.id}><input type="checkbox" checked={record.selected.includes(member.id)} onChange={() => updateRecord(toggleAttendance(record, member.id))} /><span className={`avatar avatar-${index % 3}`}>{member.initials}</span><span className="member-info"><strong>{member.name}</strong><span>{member.category}</span></span><span className="member-status">{statusFor(record, member.id)}</span><span className="visual-checkbox" aria-hidden="true">{record.selected.includes(member.id) && <Check size={17} />}</span></label>)}{!members.some(m => m.name.includes(query.trim())) && <p className="empty-state">검색한 이름이 없어요.</p>}</div></div><aside className="attendance-aside"><div className="summary-card"><p className="eyebrow">TODAY’S ATTENDANCE</p><h2>오늘의 함께함</h2><div className="attendance-count"><strong>{selectedCount}</strong><span>/ {members.length}명</span></div><div className="progress-track"><span style={{ width: `${selectedCount / members.length * 100}%` }} /></div><div className="summary-line"><span>선택한 인원</span><strong>{selectedCount}명</strong></div><div className="summary-line"><span>{record.confirmed ? '결석 인원' : '미선택 인원'}</span><strong>{members.length - selectedCount}명</strong></div><button className="primary-button" disabled={record.confirmed} onClick={() => setDialog({ title: '출석을 확정할까요?', text: `${date} ${meeting === 'worship' ? '주일예배' : '소그룹 모임'}: 출석 ${selectedCount}명 · 결석 ${members.length - selectedCount}명으로 확정합니다. 다른 모임의 출석에는 영향을 주지 않습니다.`, action: '출석 확정', confirm: () => { updateRecord({ ...record, confirmed: true }); setToast('예시 출석이 이 브라우저에 저장되었어요.') } })}>{record.confirmed ? <><Check size={17} /> 확정 완료</> : <>출석 확정 <ArrowRight size={17} /></>}</button><p className="helper">확정 전까지 미선택 인원은 결석으로 처리되지 않아요. 수정하면 다시 확정해 주세요.</p></div><div className="info-card"><LockKeyhole size={21} /><strong>미리보기 저장 안내</strong><p>가상 출석만 이 브라우저에 저장해요. 실제 계정이나 공동체 데이터와 연결되지 않습니다.</p>{storageError && <p role="alert">브라우저 저장이 차단되어 새로고침하면 변경 내용이 사라져요.</p>}</div></aside></div></section>}
      {page === 'care' && <section className="workspace section-wrap"><div className="breadcrumb">DEWS <ChevronRight size={13} /> 함께 돌봄</div><p className="eyebrow">NO ONE LEFT BEHIND</p><h1 className="page-title">안부를 기다리는 이름들.</h1><p className="page-description">한 번의 연락이, 다시 함께하는 시작이 될 수 있어요.</p><div className="care-banner"><HeartHandshake size={28} /><div><strong>담당자의 다음 행동이 보이도록</strong><p>아래 목록은 화면 검토용 예시입니다. 실제 결석 계산과 기록 조회는 인증 연결 후 제공됩니다.</p></div></div><div className="care-list">{members.filter(m => m.absent > 0).map(member => <article className="care-row" key={member.id}><span className="avatar">{member.initials}</span><div><h3>{member.name}</h3><p>이슬 1그룹 · 예시 청년</p></div><span className={`care-badge ${member.absent >= 4 ? 'warm' : ''}`}>{member.absent}주 연속 결석</span><span className="care-assignee">{member.absent >= 4 ? '목회자 확인 대상' : '리더 확인 대상'}</span><button className="soft-button" onClick={() => setDialog({ title: `${member.name} · 돌봄 안내`, text: '실제 기도제목과 특이사항은 로그인 및 담당 범위 확인 후 표시됩니다. 이 화면에는 개인의 돌봄 기록을 넣지 않았습니다.' })}>살펴보기 <ArrowUpRight size={17} /></button></article>)}</div></section>}
      {page === 'events' && <section className="workspace section-wrap"><div className="breadcrumb">DEWS <ChevronRight size={13} /> 행사 · 동아리</div><div className="section-top"><div><p className="eyebrow">OUR NEXT CHAPTER</p><h1 className="page-title">함께라서 더 좋은 날.</h1><p className="page-description">예배와 모임, 그리고 우리 일상의 작은 즐거움.</p></div><span className="group-pill"><CalendarDays size={18} />2026년 11월 · 예시</span></div><div className="schedule-list">{events.map(event => <button key={event.id} className="schedule-row" onClick={() => setDialog({ title: event.title, text: `예시 일정 · ${event.when}. ${event.description} ${event.location}. 실제 일정은 운영자가 등록할 예정입니다.` })}><span className={`date-tile ${event.color}`}><small>{event.month}월</small><strong>{event.day}</strong></span><span className="schedule-copy"><span className="eyebrow">{event.category}</span><strong>{event.title}</strong><span>{event.description}</span></span><ArrowUpRight /></button>)}</div><div className="club-banner"><div><p className="eyebrow">FIND YOUR PEOPLE</p><h2>좋아하는 것으로, 더 가까이.</h2><p>동아리 소개와 활동 일정이 이곳에 모일 예정이에요.</p></div><span className="club-icon"><Plus size={36} /></span></div></section>}
    </main>
    <footer className="footer section-wrap"><div><button className="brand-word footer-brand" onClick={() => navigate('home')}>DEWS.</button><p>도원동교회 이슬청년부<br />함께 머물고, 함께 자라는 우리.</p></div><a className="youtube-link" href="https://www.youtube.com/@dews518" target="_blank" rel="noreferrer"><Youtube size={20} /> DEWS YouTube <ArrowUpRight size={17} /></a><span className="copyright">© 2026 DEWS COMMUNITY</span></footer>
    {page === 'home' && <aside className="quick-nav" aria-label="바로가기"><button onClick={() => navigate('attendance')}><CheckCheck /><span>출석 체크</span></button><button onClick={() => navigate('care')}><HeartHandshake /><span>함께 돌봄</span></button><button onClick={() => navigate('events')}><CalendarDays /><span>우리 일정</span></button></aside>}
    {page !== 'home' && <button className="back-home" onClick={() => navigate('home')}><ArrowLeft size={16} /> 공동체 홈</button>}
    <dialog ref={modalRef} onCancel={() => setDialog(null)} onClick={event => { if (event.target === event.currentTarget) setDialog(null) }} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="dialog-close" onClick={() => setDialog(null)} aria-label="닫기"><X /></button><span className="dialog-icon"><Sprout /></span><h2 id="dialog-title">{dialog?.title}</h2><p>{dialog?.text}</p><div className="dialog-actions">{dialog?.confirm && <button className="soft-button" onClick={() => setDialog(null)}>돌아가기</button>}<button className="primary-button" onClick={() => { dialog?.confirm?.(); setDialog(null) }}>{dialog?.action || '확인'}</button></div></div></dialog>
    {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
  </>
}
