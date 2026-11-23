import { HomeFooter, HomeHeader, HomeHero, HomeShortcuts, type Shortcut } from '../HomeLayout'
import OfficerPanel from './OfficerPanel'
import { useCallback, useEffect, useState } from 'react'
import { CheckCheck, HeartHandshake, MessageSquare, RefreshCw, Users } from 'lucide-react'
import { action, loadSnapshot, officers, roleNames, statusNames, supabase, type Snapshot } from './api'
import { PeoplePanel, ProfilePanel } from './PeoplePanel'
import CarePanel from './CarePanel'
import LiveAttendance from './LiveAttendance'
import LiveBoard from './LiveBoard'
import GroupPlanner from './GroupPlanner'
import LiveEvents from './LiveEvents'

export type Run = (name:string,payload?:Record<string,unknown>)=>Promise<{id?:string;token?:string}|null>
export type PanelProps = {data:Snapshot;run:Run;busy:boolean;error?:string;message?:string}
type Page='officers'|'home'|'people'|'attendance'|'care'|'groups'|'events'|'board'|'profile'
export default function Portal({onLogout}:{onLogout:()=>Promise<void>}){
 const [data,setData]=useState<Snapshot|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState<Page>('home')
 const reload=useCallback(async()=>{try{const next=await loadSnapshot();setData(next);setError('')}catch(e){setData(null);setError(e instanceof Error?e.message:'조회 실패')}},[])
 useEffect(()=>{let alive=true;void loadSnapshot().then(s=>{if(alive)setData(s)}).catch(e=>{if(alive)setError(e.message)});const id=setInterval(()=>{if(alive)void reload()},60000);return()=>{alive=false;clearInterval(id)}},[reload])
 const run:Run=async(name,payload={})=>{setBusy(true);setError('');setMessage('');try{const result=await action(name,payload);await reload();setMessage('저장했습니다.');return result}catch(e){setError(e instanceof Error?e.message:'저장 실패');return null}finally{setBusy(false)}}
 if(!data)return <main className="auth-card"><h1>DEWS</h1><p>{error||'사용자 권한과 데이터를 불러오는 중…'}</p><button className="soft-button" onClick={()=>void reload()}>다시 불러오기</button><button className="soft-button" onClick={()=>void onLogout()}>로그아웃</button></main>
 const has=(...roles:string[])=>data.me.roles.some(r=>roles.includes(r))
 const leads=has('leader')&&data.groups.some(g=>g.leader_id===data.me.id&&data.cycles.some(c=>c.id===g.cycle_id&&!c.ends_on))
 const canPeople=has('pastor','newcomer',...officers)||leads
 const canAttendance=has('pastor')||leads
 const canCare=has('pastor','newcomer')||leads
 const pages:[Page,string,boolean][]=[['home','홈',true],['people','인원 · 교육',canPeople],['officers','임원 관리',has('pastor')],['attendance','출석 체크',canAttendance],['care','돌봄 기록',canCare],['groups','소그룹 편성',has('officer','pastor')],['events','행사 · 동아리',true],['board','게시판',true],['profile','내 정보',true]]
 const allowed=pages.find(p=>p[0]===page)?.[2]
 const props={data,run,busy,error,message}
 const feedback=<div className="portal-feedback">{error&&<p role="alert" className="portal-error">{error}</p>}{message&&<p role="status">{message}</p>}<button aria-label="최신 정보 불러오기" disabled={busy} onClick={()=>void reload()}><RefreshCw size={15}/></button></div>
 const navigate=(next:Page)=>{setPage(next);setError('');setMessage('');window.scrollTo(0,0)}
 const shortcuts:Shortcut[]=[
  ...(canAttendance?[{label:'출석',title:'출석 체크',desc:'주일예배와 소그룹 출석을 입력합니다.',icon:<CheckCheck/>,open:()=>navigate('attendance')}]:[]),
  ...(canCare?[{label:'돌봄',title:'돌봄 기록',desc:`연속 결석으로 확인할 청년 ${data.people.filter(p=>(p.streak||0)>=2).length}명`,icon:<HeartHandshake/>,open:()=>navigate('care')}]:[]),
  {label:'소통',title:'게시판',desc:'공동체의 글과 댓글을 확인합니다.',icon:<MessageSquare/>,open:()=>navigate('board')},
  {label:'소그룹',title:'내 소그룹',desc:`소그룹원 ${data.groupmates.length}명`,icon:<Users/>,open:()=>navigate('profile')}
 ]
 return <><HomeHeader navItems={pages.filter(p=>p[2]).map(([key,label])=>[key,label])} current={page} onHome={()=>navigate('home')} onNavigate={navigate} onAccount={()=>void onLogout()} accountLabel="로그아웃"/>
 <div className="preview-notice"><span className="status-dot"/>로컬 테스트 · 합성 인원 150명 · 실제 개인정보를 입력하지 마세요.</div>
 <main className={page==='home'?'signed-home':'portal-main'}>{page!=='home'&&feedback}
 {!allowed?<p>현재 권한으로 이용할 수 없는 메뉴입니다.</p>:<>
 {page==='home'&&<>
  <HomeHero title={<>{data.me.name}님,<br/>안녕하세요.</>} description={data.me.roles.map(r=>roleNames[r]).join(' · ')} actionLabel={canAttendance?'출석 체크하기':'행사 일정 보기'} onAction={()=>navigate(canAttendance?'attendance':'events')}/>
  <HomeShortcuts cards={shortcuts} description="담당 업무와 소그룹 정보를 확인하세요."/>
  <div className="events-section"><div className="section-wrap">{feedback}<LiveEvents {...props} calendarOnly/></div></div>
 </>}
 {page==='officers'&&<OfficerPanel data={data} refresh={reload}/>}{page==='people'&&<PeoplePanel {...props}/>}{page==='attendance'&&<LiveAttendance {...props}/>}{page==='care'&&<CarePanel {...props}/>}{page==='groups'&&<GroupPlanner {...props}/>}{page==='events'&&<LiveEvents {...props}/>}{page==='board'&&<LiveBoard {...props}/>}{page==='profile'&&<ProfilePanel {...props}/>}
 </>}
 </main><HomeFooter onHome={()=>navigate('home')}/></>
}
export function PersonStatus({status,full}:{status:string;full:boolean}){return <span className="portal-tag">{statusNames[status]}{status==='enrolled'&&!full?' · 권리 미회복':''}</span>}
export type Field={name:string;label:string;type?:string;required?:boolean;options?:{value:string;label:string}[];value?:string;max?:number}
export function SimpleForm({fields,submit,label='저장',busy=false}:{fields:Field[];submit:(values:Record<string,string>)=>Promise<boolean>;label?:string;busy?:boolean}){
 const [reset,setReset]=useState(0)
 return <form key={reset} className="portal-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const values=Object.fromEntries(new FormData(form)) as Record<string,string>;if(await submit(values))setReset(v=>v+1)}}>{fields.map(f=><label key={f.name}>{f.label}{f.options?<select name={f.name} required={f.required??true} defaultValue={f.value||''}><option value="">선택하세요</option>{f.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:f.type==='textarea'?<textarea name={f.name} required={f.required??true} maxLength={f.max||5000} rows={4} defaultValue={f.value}/>:<input name={f.name} required={f.required??true} type={f.type||'text'} maxLength={f.max||100} defaultValue={f.value} minLength={f.type==='password'?10:undefined}/>}</label>)}<button className="primary-button" disabled={busy}>{busy?'저장 중…':label}</button></form>
}
export function PasswordForm(){const [message,setMessage]=useState('');return <><SimpleForm fields={[{name:'password',label:'새 비밀번호 (10자 이상)',type:'password'}]} label="비밀번호 변경" submit={async v=>{const {error}=await supabase.auth.updateUser({password:v.password});setMessage(error?error.message:'비밀번호를 변경했습니다.');return !error}}/><p role="status">{message}</p></>}
