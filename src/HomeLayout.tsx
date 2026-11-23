import { useState, type ReactNode } from 'react'
import { ArrowUpRight, Menu, X, Youtube } from 'lucide-react'
import Brand from './Brand'

export function HomeHeader<T extends string>({navItems,current,onHome,onNavigate,onAccount,accountLabel}:{
 navItems: [T,string][]; current:T; onHome:()=>void; onNavigate:(key:T)=>void; onAccount:()=>void; accountLabel:string
}){
 const [mobileMenu,setMobileMenu]=useState(false)
 return (<header className="header">
      <Brand onClick={()=>{setMobileMenu(false);onHome()}}/>
      <nav aria-label="주 메뉴" className={mobileMenu ? 'nav open' : 'nav'}>{navItems.map(([key, label]) => <button key={key} className={current === key ? 'active' : ''} aria-current={current === key ? 'page' : undefined} onClick={() => {onNavigate(key);setMobileMenu(false)}}>{label}</button>)}</nav>
      <button className="header-cta" onClick={onAccount}>{accountLabel} <ArrowUpRight size={16} /></button>
      <button className="menu-toggle" aria-label={mobileMenu ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button>
    </header>)
}

export function HomeHero({title,description,actionLabel,onAction}:{title:ReactNode;description:ReactNode;actionLabel:string;onAction:()=>void}){
 return (<section className="hero">
          <div className="hero-grid" aria-hidden="true" /><div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="hero-content"><p className="eyebrow light">도원동교회</p><h1>{title}</h1><p className="hero-description">{description}</p><button className="hero-button" onClick={onAction}>{actionLabel} <span><ArrowUpRight size={19}/></span></button></div>
          <div className="hero-art" aria-hidden="true"><div className="dew-ring ring-one" /><div className="dew-ring ring-two" /><div className="dew-word">DEWS</div><span className="art-caption">도원동교회 이슬청년부</span><div className="glass-drop" /></div>
        </section>)
}

export type Shortcut={label:string;title:string;desc:string;icon:ReactNode;open:()=>void}
export function HomeShortcuts({cards,description}:{cards:Shortcut[];description:string}){
 const [activeCard,setActiveCard]=useState(0)
 return (<section className="community section-wrap" id="community"><div className="center-heading"><h2>주요 메뉴</h2><p>{description}</p></div>
          <div className="community-cards">{cards.map((card, index) => <button key={card.label} className={`community-card card-${index} ${activeCard === index ? 'expanded' : ''}`} onMouseEnter={() => setActiveCard(index)} onFocus={() => setActiveCard(index)} onClick={() => card.open()}><span className="card-label">{card.label}</span><h3>{card.title}</h3><p>{card.desc}</p><span className="card-art" aria-hidden="true">{card.icon}</span><span className="card-link">{card.title} 열기 <ArrowUpRight size={19} /></span></button>)}</div>
        </section>)
}

export function HomeFooter({onHome}:{onHome:()=>void}){
 return (<footer className="footer section-wrap"><div><button className="brand-word footer-brand" onClick={onHome}>DEWS<span className="brand-dot">.</span></button><p>도원동교회 이슬청년부</p></div><a className="youtube-link" href="https://www.youtube.com/@dews518" target="_blank" rel="noreferrer"><Youtube size={20} /> DEWS YouTube <ArrowUpRight size={17} /></a><span className="copyright">© 2026 DEWS COMMUNITY</span></footer>)
}
