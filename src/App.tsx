import { HomeFooter, HomeHeader, HomeHero, HomeShortcuts } from './HomeLayout'
import { ArrowUpRight, CalendarDays, Users, HeartHandshake, CheckCheck } from 'lucide-react'
import { EventCalendar } from './EventViews'

type Page = 'home' | 'attendance' | 'care' | 'events' | 'board'
export default function App({ onLogin }: { onLogin: () => void }) {
  const page: Page = 'home'
  function navigate(next: Page) { if(next !== 'home') onLogin(); else window.scrollTo({top:0,behavior:'smooth'}) }
  const navItems: [Page, string][] = [['home', '홈'], ['events', '행사 · 동아리'], ['board', '게시판']]
  const cards = [
    { label: '출석', title: '출석 체크', desc: '주일예배와 소그룹 참석 여부를 기록합니다.', icon: <CheckCheck />, page: 'attendance' as Page },
    { label: '돌봄', title: '돌봄 대상', desc: '결석 기간과 연락이 필요한 청년을 확인합니다.', icon: <Users />, page: 'care' as Page },
    { label: '일정', title: '행사 일정', desc: '예정된 예배와 청년부 행사 일정을 확인합니다.', icon: <CalendarDays />, page: 'events' as Page },
  ]
  return <>
    <a href="#main" className="skip-link">본문으로 이동</a>
    <HomeHeader navItems={navItems} current={page} onHome={()=>navigate('home')} onNavigate={navigate} onAccount={onLogin} accountLabel="로그인"/>
    <div className="preview-notice"><span className="status-dot" />화면 미리보기 <span className="notice-divider">/</span> 모든 이름·일정·기록은 예시입니다.</div>
    <main id="main">
      {page === 'home' && <>
        <HomeHero title={<>이슬청년부<br/>DEWS</>} description={<>주일예배와 소그룹 출석을 기록하고,<br/>청년부 행사와 모임 일정을 확인하세요.</>} actionLabel="출석 체크하기" onAction={()=>navigate('attendance')}/>
        <HomeShortcuts cards={cards.map(c=>({...c,open:()=>navigate(c.page)}))} description="출석 기록과 돌봄 대상, 청년부 일정을 확인하세요."/>
        <section className="events-section"><div className="section-wrap"><div className="section-top"><div><h2>행사 캘린더</h2><p className="calendar-intro">이번 달 청년부 일정을 확인하세요.</p></div><button className="text-button light" onClick={() => navigate('events')}>행사 게시판 <ArrowUpRight size={20} /></button></div><EventCalendar onOpen={onLogin} /></div></section>
      </>}
    </main>
    <HomeFooter onHome={()=>navigate('home')}/>
    {page === 'home' && <aside className="quick-nav" aria-label="바로가기"><button onClick={() => navigate('attendance')}><CheckCheck /><span>출석 체크</span></button><button onClick={() => navigate('care')}><HeartHandshake /><span>돌봄 대상</span></button><button onClick={() => navigate('events')}><CalendarDays /><span>행사 일정</span></button></aside>}

  </>
}
