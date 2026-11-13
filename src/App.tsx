import { useState } from 'react'
import { ArrowUpRight, CalendarDays, Users, HeartHandshake, Menu, X, CheckCheck, Youtube } from 'lucide-react'
import { EventCalendar } from './EventViews'

type Page = 'home' | 'attendance' | 'care' | 'events' | 'board'
export default function App({ onLogin }: { onLogin: () => void }) {
  const page: Page = 'home'
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  function navigate(next: Page) { if(next !== 'home') onLogin(); else window.scrollTo({top:0,behavior:'smooth'}); setMobileMenu(false) }
  const navItems: [Page, string][] = [['home', '홈'], ['events', '행사 · 동아리'], ['board', '게시판']]
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
      <button className="header-cta" onClick={onLogin}>로그인 <ArrowUpRight size={16} /></button>
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
        <section className="events-section"><div className="section-wrap"><div className="section-top"><div><h2>행사 캘린더</h2><p className="calendar-intro">이번 달 청년부 일정을 확인하세요.</p></div><button className="text-button light" onClick={() => navigate('events')}>행사 게시판 <ArrowUpRight size={20} /></button></div><EventCalendar onOpen={onLogin} /></div></section>
      </>}
    </main>
    <footer className="footer section-wrap"><div><button className="brand-word footer-brand" onClick={() => navigate('home')}>DEWS.</button><p>도원동교회 이슬청년부</p></div><a className="youtube-link" href="https://www.youtube.com/@dews518" target="_blank" rel="noreferrer"><Youtube size={20} /> DEWS YouTube <ArrowUpRight size={17} /></a><span className="copyright">© 2026 DEWS COMMUNITY</span></footer>
    {page === 'home' && <aside className="quick-nav" aria-label="바로가기"><button onClick={() => navigate('attendance')}><CheckCheck /><span>출석 체크</span></button><button onClick={() => navigate('care')}><HeartHandshake /><span>돌봄 대상</span></button><button onClick={() => navigate('events')}><CalendarDays /><span>행사 일정</span></button></aside>}

  </>
}
