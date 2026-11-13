import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, CheckCheck, HeartHandshake, LogOut, MessageSquare, RefreshCw, Users } from 'lucide-react'
import { action, loadSnapshot, officers, roleNames, statusNames, supabase, type Snapshot } from './api'
import { PeoplePanel, CarePanel, ProfilePanel } from './PeoplePanel'
import LiveAttendance from './LiveAttendance'
import LiveBoard from './LiveBoard'
import GroupPlanner from './GroupPlanner'
import LiveEvents from './LiveEvents'

export type Run = (name:string,payload?:Record<string,unknown>)=>Promise<{id?:string;token?:string}|null>
export type PanelProps = {data:Snapshot;run:Run;busy:boolean}
type Page='home'|'people'|'attendance'|'care'|'groups'|'events'|'board'|'profile'
export default function Portal({onLogout}:{onLogout:()=>Promise<void>}){
 const [data,setData]=useState<Snapshot|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState<Page>('home')
 const reload=useCallback(async()=>{try{const next=await loadSnapshot();setData(next);setError('')}catch(e){setData(null);setError(e instanceof Error?e.message:'조회 실패')}},[])
 useEffect(()=>{let alive=true;void loadSnapshot().then(s=>{if(alive)setData(s)}).catch(e=>{if(alive)setError(e.message)});const id=setInterval(()=>{if(alive)void reload()},60000);return()=>{alive=false;clearInterval(id)}},[reload])
 const run:Run=async(name,payload={})=>{setBusy(true);setError('');setMessage('');try{const result=await action(name,payload);await reload();setMessage('저장했습니다.');return result}catch(e){setError(e instanceof Error?e.message:'저장 실패');return null}finally{setBusy(false)}}
 if(!data)return <main className="auth-card"><h1>DEWS</h1><p>{error||'사용자 권한과 데이터를 불러오는 중…'}</p><button className="soft-button" onClick={()=>void reload()}>다시 불러오기</button><button className="soft-button" onClick={()=>void onLogout()}>로그아웃</button></main>
 const has=(...roles:string[])=>data.me.roles.some(r=>roles.includes(r))
 const leads=data.groups.some(g=>g.leader_id===data.me.id&&data.cycles.some(c=>c.id===g.cycle_id&&!c.ends_on))
 const deputies=data.groups.some(g=>g.deputy_id===data.me.id&&data.cycles.some(c=>c.id===g.cycle_id&&!c.ends_on))
 const canPeople=has('pastor','newcomer',...officers)||leads
 const canAttendance=has('secretary2','pastor')||leads||deputies
 const canCare=has('pastor','secretary2','newcomer')||leads
 const pages:[Page,string,boolean][]=[['home','홈',true],['people','인원 · 교육',canPeople],['attendance','출석 체크',canAttendance],['care','돌봄 기록',canCare],['groups','소그룹 편성',has('secretary2','pastor')],['events','행사 · 동아리',true],['board','게시판',true],['profile','내 정보',true]]
 const allowed=pages.find(p=>p[0]===page)?.[2]
 const props={data,run,busy}
 return <><header className="portal-header"><button className="brand-word" onClick={()=>setPage('home')}>DEWS.</button><div><strong>{data.me.name}</strong><span>{data.me.roles.map(r=>roleNames[r]).join(' · ')}</span></div><button className="soft-button" onClick={()=>void onLogout()}><LogOut size={15}/> 로그아웃</button></header>
 <div className="portal-test-notice">로컬 테스트 · 합성 인원 150명 · 실제 개인정보를 입력하지 마세요.</div>
 <nav className="portal-nav" aria-label="사용자 메뉴">{pages.filter(p=>p[2]).map(([key,label])=><button key={key} aria-current={page===key?'page':undefined} className={page===key?'active':''} onClick={()=>{setPage(key);setError('');setMessage('')}}>{label}</button>)}</nav>
 <main className="portal-main"><div className="portal-feedback">{error&&<p role="alert" className="portal-error">{error}</p>}{message&&<p role="status">{message}</p>}<button aria-label="최신 정보 불러오기" disabled={busy} onClick={()=>void reload()}><RefreshCw size={15}/></button></div>
 {!allowed?<p>현재 권한으로 이용할 수 없는 메뉴입니다.</p>:<>
 {page==='home'&&<><div className="portal-welcome"><p>도원동교회 이슬청년부</p><h1>{data.me.name}님, 안녕하세요.</h1><span>담당 업무와 공동체 일정을 확인하세요.</span></div><div className="portal-shortcuts">{canAttendance&&<button onClick={()=>setPage('attendance')}><CheckCheck/><strong>출석 체크</strong><span>예배와 소그룹 출석 입력</span></button>}{canCare&&<button onClick={()=>setPage('care')}><HeartHandshake/><strong>돌봄 기록</strong><span>{data.people.filter(p=>(p.streak||0)>=2).length}명 확인 필요</span></button>}<button onClick={()=>setPage('board')}><MessageSquare/><strong>게시판</strong><span>글과 댓글 작성</span></button><button onClick={()=>setPage('profile')}><Users/><strong>내 소그룹</strong><span>{data.groupmates.length}명</span></button></div><LiveEvents {...props} calendarOnly/></>}
 {page==='people'&&<PeoplePanel {...props}/>}{page==='attendance'&&<LiveAttendance {...props}/>}{page==='care'&&<CarePanel {...props}/>}{page==='groups'&&<GroupPlanner {...props}/>}{page==='events'&&<LiveEvents {...props}/>}{page==='board'&&<LiveBoard {...props}/>}{page==='profile'&&<ProfilePanel {...props}/>}
 </>}
 </main><footer className="portal-footer"><CalendarDays size={14}/> DEWS · 로컬 검증 환경 <span>운영 정책 확인 전 실제 운영 금지</span></footer></>
}
export function PersonStatus({status,full}:{status:string;full:boolean}){return <span className="portal-tag">{statusNames[status]}{status==='enrolled'&&!full?' · 권리 미회복':''}</span>}
export type Field={name:string;label:string;type?:string;required?:boolean;options?:{value:string;label:string}[];value?:string;max?:number}
export function SimpleForm({fields,submit,label='저장',busy=false}:{fields:Field[];submit:(values:Record<string,string>)=>Promise<boolean>;label?:string;busy?:boolean}){
 const [reset,setReset]=useState(0)
 return <form key={reset} className="portal-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const values=Object.fromEntries(new FormData(form)) as Record<string,string>;if(await submit(values))setReset(v=>v+1)}}>{fields.map(f=><label key={f.name}>{f.label}{f.options?<select name={f.name} required={f.required??true} defaultValue={f.value||''}><option value="">선택하세요</option>{f.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:f.type==='textarea'?<textarea name={f.name} required={f.required??true} maxLength={f.max||5000} rows={4} defaultValue={f.value}/>:<input name={f.name} required={f.required??true} type={f.type||'text'} maxLength={f.max||100} defaultValue={f.value} minLength={f.type==='password'?10:undefined}/>}</label>)}<button className="primary-button" disabled={busy}>{busy?'저장 중…':label}</button></form>
}
export function PasswordForm(){const [message,setMessage]=useState('');return <><SimpleForm fields={[{name:'password',label:'새 비밀번호 (10자 이상)',type:'password'}]} label="비밀번호 변경" submit={async v=>{const {error}=await supabase.auth.updateUser({password:v.password});setMessage(error?error.message:'비밀번호를 변경했습니다.');return !error}}/><p role="status">{message}</p></>}
