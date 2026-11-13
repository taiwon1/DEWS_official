import { Suspense, lazy, useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import Landing from '../App'
const Portal = lazy(() => import('./Portal'))
import { configured, loginEmail, supabase } from './api'
import './platform.css'

export default function AuthApp(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[login,setLogin]=useState(false)
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const [token,setToken]=useState(()=>new URLSearchParams(window.location.hash.slice(1)).get('invite')||'')
 useEffect(()=>{let active=true;void supabase.auth.getSession().then(({data})=>{if(active){setSession(data.session);setReady(true)}});const {data}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setReady(true)});return()=>{active=false;data.subscription.unsubscribe()}},[])
 async function submit(e:FormEvent){e.preventDefault();setError('');setBusy(true);try{
 if(token){
 let current= session
 if(!current){const result=await supabase.auth.signUp({email:loginEmail(username),password});if(result.error)throw result.error;current=result.data.session;if(!current)throw new Error('가입 확인이 필요합니다. 로컬 인증 설정을 확인하세요.')}
 const result=await supabase.rpc('claim_invite',{token,username:username.trim()});if(result.error)throw result.error;setToken('');history.replaceState(null,'',location.pathname);setLogin(false)
 }else{const result=await supabase.auth.signInWithPassword({email:loginEmail(username),password});if(result.error)throw new Error('아이디 또는 비밀번호를 확인하세요.');setLogin(false)}
 setPassword('')
 }catch(e){setError(e instanceof Error?e.message:'로그인에 실패했습니다.')}finally{setBusy(false)}}
 if(!ready)return <div className="auth-card">로그인 상태 확인 중…</div>
 if(session&&!token)return <Suspense fallback={<div className="auth-card">화면을 불러오는 중…</div>}><Portal key={session.user.id} onLogout={async()=>{await supabase.auth.signOut();setPassword('');setLogin(false)}} /></Suspense>
 if(!login&&!token)return <Landing onLogin={()=>setLogin(true)} />
 return <main className="auth-page"><form className="auth-card" onSubmit={submit}><span className="brand-word">DEWS.</span><h1>{token?'초대받은 계정 등록':'로그인'}</h1><p>로컬 테스트 환경 · 가상 계정으로 확인하세요.</p><label>아이디<input autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)} placeholder="이름 + 생일 네 자리" /></label><label>비밀번호<input type="password" autoComplete={token?'new-password':'current-password'} minLength={token?10:1} required value={password} onChange={e=>setPassword(e.target.value)} /></label>{token&&<p>비밀번호는 10자 이상으로 설정하세요. 초대 링크는 48시간 동안 한 번 사용할 수 있습니다.</p>}{error&&<p className="portal-error" role="alert">{error}</p>}<button disabled={busy||!configured} className="primary-button">{busy?'처리 중…':token?'계정 등록':'로그인'}</button><button type="button" className="soft-button" onClick={()=>{setLogin(false);setToken('');history.replaceState(null,'',location.pathname)}}>홈으로</button>{!configured&&<p>로컬 DB 연결 설정이 필요합니다. pnpm seed:accounts를 실행하세요.</p>}</form></main>
}
