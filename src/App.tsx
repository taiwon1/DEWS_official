import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronRight, CalendarDays, Users, HeartHandshake, Menu, X, CheckCheck, Sprout, Youtube, ArrowLeft } from 'lucide-react'
import { members } from './data'
import { EventCalendar, PosterBoard } from './EventViews'
import AttendancePanel from './AttendancePanel'
import BoardPanel, { initialBoardPosts } from './BoardPanel'

type Page = 'home' | 'attendance' | 'care' | 'events' | 'board'
type Dialog = { title: string; text: string; confirm?: () => void; action?: string }
export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [boardPosts, setBoardPosts] = useState(initialBoardPosts)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [activeCard, setActiveCard] = useState(0)
  const modalRef = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (dialog) modalRef.current?.showModal(); else modalRef.current?.close() }, [dialog])
  function navigate(next: Page) { setPage(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const navItems: [Page, string][] = [['home', '홈'], ['attendance', '출석 체크'], ['care', '돌봄 대상'], ['events', '행사 · 동아리'], ['board', '게시판']]
  const cards = [
    { label: '출석', title: '출석 체크', desc: '주일예배와 소그룹 참석 여부를 기록합니다.', icon: <CheckCheck />, page: 'attendance' as Page },
    { label: '돌봄', title: '돌봄 대상', desc: '결석 기간과 연락이 필요한 청년을 확인합니다.', icon: <Users />, page: 'care' as Page },
    { label: '일정', title: '행사 일정', desc: '예정된 예배와 청년부 행사 일정을 확인합니다.', icon: <CalendarDays />, page: 'events' as Page },
  ]
  return <>
    <a href="#main" className="skip-link">본문으로 이동</a>
    <header className="header">
      <button className="brand" onClick={() => navigate('home')} aria-label="DEWS 홈"><span className="brand-word">DEWS<span className="brand-dot">.</span></span><span className="brand-caption">도원동교회<br />이슬청년부</span></button>
      <nav aria-label="주 메뉴" className={mobileMenu ? 'nav open' : 'nav'}>{navItems.map(([key, label]) => <button key={key} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>)}</nav>
      <button className="header-cta" onClick={() => setDialog({ title: '로그인 준비 중', text: '현재는 화면 검토 단계입니다. 로그인 기능이 연결되면 전달받은 가입 링크에서 계정을 등록할 수 있습니다.' })}>로그인 <ArrowUpRight size={16} /></button>
      <button className="menu-toggle" aria-label={mobileMenu ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button>
    </header>
    <div className="preview-notice"><span className="status-dot" />화면 미리보기 <span className="notice-divider">/</span> 모든 이름·일정·기록은 예시입니다.</div>
    <main id="main">
      {page === 'home' && <>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" /><div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="hero-content"><p className="eyebrow light">도원동교회</p><h1>이슬청년부<br />DEWS</h1><p className="hero-description">주일예배와 소그룹 출석을 기록하고,<br />청년부 행사와 모임 일정을 확인하세요.</p><button className="hero-button" onClick={() => navigate('attendance')}>출석 체크하기 <span><ArrowUpRight size={19} /></span></button></div>
          <div className="hero-art" aria-hidden="true"><div className="dew-ring ring-one" /><div className="dew-ring ring-two" /><div className="dew-word">DEWS</div><span className="art-caption">도원동교회 이슬청년부</span><div className="glass-drop" /></div>
        </section>
        <section className="community section-wrap" id="community"><div className="center-heading"><h2>주요 메뉴</h2><p>출석 기록과 돌봄 대상, 청년부 일정을 확인하세요.</p></div>
          <div className="community-cards">{cards.map((card, index) => <button key={card.label} className={`community-card card-${index} ${activeCard === index ? 'expanded' : ''}`} onMouseEnter={() => setActiveCard(index)} onFocus={() => setActiveCard(index)} onClick={() => navigate(card.page)}><span className="card-label">{card.label}</span><h3>{card.title}</h3><p>{card.desc}</p><span className="card-art" aria-hidden="true">{card.icon}</span><span className="card-link">{card.title} 열기 <ArrowUpRight size={19} /></span></button>)}</div>
        </section>
        <section className="events-section"><div className="section-wrap"><div className="section-top"><div><h2>행사 캘린더</h2><p className="calendar-intro">이번 달 청년부 일정을 확인하세요.</p></div><button className="text-button light" onClick={() => navigate('events')}>행사 게시판 <ArrowUpRight size={20} /></button></div><EventCalendar onOpen={event => setDialog({ title: event.title, text: `예시 일정 · ${event.when}. ${event.description} ${event.location}.` })} /></div></section>
      </>}
      {page === 'attendance' && <AttendancePanel openDialog={setDialog} />}
      {page === 'board' && <BoardPanel posts={boardPosts} onCreate={post => setBoardPosts(previous => [post, ...previous])} />}
      {page === 'care' && <section className="workspace section-wrap"><div className="breadcrumb">DEWS <ChevronRight size={13} /> 돌봄 대상</div><h1 className="page-title">돌봄 대상</h1><p className="page-description">연속 결석한 청년과 확인 담당자를 표시합니다.</p><div className="care-banner"><HeartHandshake size={28} /><div><strong>확인 기준: 2주 결석은 리더, 4주 결석은 목회자</strong><p>아래 명단과 결석 기간은 예시입니다.</p></div></div><div className="care-list">{members.filter(m => m.absent > 0).map(member => <article className="care-row" key={member.id}><span className="avatar">{member.initials}</span><div><h3>{member.name}</h3><p>이슬 1그룹 · 예시 청년</p></div><span className={`care-badge ${member.absent >= 4 ? 'warm' : ''}`}>{member.absent}주 연속 결석</span><span className="care-assignee">{member.absent >= 4 ? '목회자 확인 대상' : '리더 확인 대상'}</span><button className="soft-button" onClick={() => setDialog({ title: `${member.name} · 돌봄 안내`, text: '실제 기도제목과 특이사항은 로그인 및 담당 범위 확인 후 표시됩니다. 이 화면에는 개인의 돌봄 기록을 넣지 않았습니다.' })}>상세 보기 <ArrowUpRight size={17} /></button></article>)}</div></section>}
      {page === 'events' && <section className="workspace section-wrap"><div className="breadcrumb">DEWS <ChevronRight size={13} /> 행사 · 동아리</div><div className="section-top"><div><h1 className="page-title">행사 · 동아리</h1><p className="page-description">예정된 행사와 동아리 활동 일정을 확인하세요.</p></div><span className="group-pill"><CalendarDays size={18} />예시 행사 3건</span></div><PosterBoard onOpen={event => setDialog({ title: event.title, text: `예시 일정 · ${event.when}. ${event.description} ${event.location}.` })} /><div className="club-banner"><div><h2>동아리 안내</h2><p>아직 등록된 동아리가 없습니다.</p></div></div></section>}
    </main>
    <footer className="footer section-wrap"><div><button className="brand-word footer-brand" onClick={() => navigate('home')}>DEWS.</button><p>도원동교회 이슬청년부</p></div><a className="youtube-link" href="https://www.youtube.com/@dews518" target="_blank" rel="noreferrer"><Youtube size={20} /> DEWS YouTube <ArrowUpRight size={17} /></a><span className="copyright">© 2026 DEWS COMMUNITY</span></footer>
    {page === 'home' && <aside className="quick-nav" aria-label="바로가기"><button onClick={() => navigate('attendance')}><CheckCheck /><span>출석 체크</span></button><button onClick={() => navigate('care')}><HeartHandshake /><span>돌봄 대상</span></button><button onClick={() => navigate('events')}><CalendarDays /><span>행사 일정</span></button></aside>}
    {page !== 'home' && <button className="back-home" onClick={() => navigate('home')}><ArrowLeft size={16} /> 홈으로</button>}
    <dialog ref={modalRef} onCancel={() => setDialog(null)} onClick={event => { if (event.target === event.currentTarget) setDialog(null) }} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="dialog-close" onClick={() => setDialog(null)} aria-label="닫기"><X /></button><span className="dialog-icon"><Sprout /></span><h2 id="dialog-title">{dialog?.title}</h2><p>{dialog?.text}</p><div className="dialog-actions">{dialog?.confirm && <button className="soft-button" onClick={() => setDialog(null)}>돌아가기</button>}<button className="primary-button" onClick={() => { dialog?.confirm?.(); setDialog(null) }}>{dialog?.action || '확인'}</button></div></div></dialog>
  </>
}
