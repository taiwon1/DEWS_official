import {useEffect,useState} from 'react'
import {supabase,type Snapshot} from './api'

const positions = [
 ['president1','1청 회장'],['secretary1','1청 총무'],['president2','2청 회장'],
 ['secretary2','2청 총무'],['pd','PD'],['treasurer','회계'],['clerk','서기'],
] as const
type Assignment={person_id:string;position:string}

export default function OfficerPanel({data,refresh}:{data:Snapshot;refresh:()=>Promise<void>}){
 const [rows,setRows]=useState<Assignment[]|null>(null)
 const [personId,setPersonId]=useState('')
 const [query,setQuery]=useState('')
 const [selected,setSelected]=useState<string[]>([])
 const [feedback,setFeedback]=useState('')
 const [error,setError]=useState(false)
 const [busy,setBusy]=useState(false)
 useEffect(()=>{
  let active=true
  void supabase.rpc('officer_roster').then(({data,error})=>{
   if(!active)return
   if(error){setError(true);setFeedback(error.message)}else setRows(data)
  })
  return ()=>{active=false}
 },[])
 const eligible=data.people.filter(p=>p.full_member&&p.status==='enrolled')
 const assigned=data.people.filter(p=>p.account_roles?.includes('officer')||rows?.some(r=>r.person_id===p.id))
 const person=data.people.find(p=>p.id===personId)
 function edit(id:string){
  setPersonId(id);setSelected(rows?.filter(r=>r.person_id===id).map(r=>r.position)||[]);setFeedback('')
 }
 async function save(){
  if(!person)return
  setBusy(true)
  try{
   const {error}=await supabase.rpc('save_officer_positions',{target:person.id,positions:selected})
   if(error)throw error
   setRows(previous=>[...(previous||[]).filter(r=>r.person_id!==person.id),...selected.map(position=>({person_id:person.id,position}))])
   await refresh();setError(false);setFeedback(selected.length?'임원 직책을 저장했습니다.':'임원 지정을 해제했습니다.')
  }catch(e){setError(true);setFeedback((e as Error).message)}finally{setBusy(false)}
 }
 return <section className="officer-panel">
  <h1>임원 관리</h1><p className="portal-description">정회원을 선택하고 맡을 직책을 체크하세요. 한 사람이 여러 직책을 맡을 수 있습니다.</p>
  {feedback&&<p role={error?'alert':'status'} className={error?'portal-error':undefined}>{feedback}</p>}
  {rows===null?<p>{error?'임원 명단을 불러오지 못했습니다.':'임원 명단을 불러오는 중입니다.'}</p>:<div className="officer-layout">
   <section className="portal-box">
    <h2>현재 임원</h2>
    {!assigned.length&&<p>아직 지정된 임원이 없습니다.</p>}
    <ul className="officer-roster">{assigned.map(p=><li key={p.id}><button type="button" disabled={busy} onClick={()=>edit(p.id)}><strong>{p.name}</strong><span>{positions.filter(([key])=>rows.some(r=>r.person_id===p.id&&r.position===key)).map(([,label])=>label).join(' · ')||'직책 미지정'}</span></button></li>)}</ul>
   </section>
   <form className="portal-box officer-editor" onSubmit={e=>{e.preventDefault();void save()}}>
    <h2>임원 지정</h2>
    <label>정회원 검색<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름 검색"/></label>
    <fieldset><legend>정회원 선택 · 한 명씩</legend>
     <div className="officer-candidates">{eligible.filter(p=>p.name.includes(query)).map(p=><label key={p.id}><input type="checkbox" checked={p.id===personId} disabled={busy} onChange={e=>edit(e.target.checked?p.id:'')}/>{p.name}</label>)}</div>
    </fieldset>
    {person&&<fieldset><legend>{person.name}님의 직책</legend>
     <div className="officer-checks">{positions.map(([key,label])=><label key={key}><input type="checkbox" checked={selected.includes(key)} disabled={busy||!eligible.some(p=>p.id===person.id)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,key]:prev.filter(v=>v!==key))}/>{label}</label>)}</div>
    </fieldset>}
    <button className="primary-button" disabled={busy||!person}>{busy?'저장 중…':selected.length?'직책 저장':'임원 지정 해제'}</button>
   </form>
  </div>}
 </section>
}
