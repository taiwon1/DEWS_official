import { useState } from 'react'
import { today, type Attend, type Person } from './api'
import type { PanelProps } from './Portal'

export default function LiveAttendance({data,run,busy}:PanelProps){
 const groups=data.groups.filter(g=>data.cycles.some(c=>c.id===g.cycle_id&&!c.ends_on))
 const [groupId,setGroupId]=useState(groups[0]?.id||''),[day,setDay]=useState(today()),[query,setQuery]=useState('')
 const [draft,setDraft]=useState<Record<string,{present:string[];version:number}>>({}),[include,setInclude]=useState({worship:true,group:true}),[review,setReview]=useState(false)
 const group=groups.find(g=>g.id===groupId)
 const writable=data.me.roles.includes('secretary2')||group?.leader_id===data.me.id||group?.deputy_id===data.me.id
 const meetings=[['worship','주일예배'],['group','소그룹']] as const
 const record=(m:string)=>data.attendance.find(a=>a.group_id===groupId&&a.day===day&&a.meeting===m)
 const key=(m:string)=>`${groupId}/${day}/${m}`
 const selected=(m:string)=>draft[key(m)]?.present??record(m)?.present??[]
 const roster=data.memberships.filter(m=>m.group_id===groupId&&m.starts_on<=day&&(!m.ends_on||m.ends_on>=day)).map(m=>m.person_id)
 const allIds=roster.length?roster:record('worship')?.roster||record('group')?.roster||[]
 const people=allIds.map(id=>data.people.find(p=>p.id===id)||{id,name:'이전 소속 인원',status:'enrolled'} as Person)
 function change(m:string,ids:string[]){setDraft({...draft,[key(m)]:{present:ids,version:draft[key(m)]?.version??record(m)?.version??0}});setReview(false)}
 return <section><h1>출석 체크</h1><p className="portal-description">주일예배와 소그룹 출석을 같은 명단에서 확인하세요. 확정 전에는 결석으로 처리하지 않습니다.</p><div className="portal-toolbar"><label>소그룹<select value={groupId} onChange={e=>{setGroupId(e.target.value);setReview(false)}}>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label>날짜<input aria-label="출석 날짜" type="date" max={today()} value={day} onChange={e=>{setDay(e.target.value);setReview(false)}}/></label><input aria-label="출석 명단 검색" placeholder="이름 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div>
 {!writable&&<p>목회자 계정은 조회 전용입니다. 입력 권한은 리더·부리더·2청년부 총무에게 있습니다.</p>}
 <div className="attendance-sheet"><table className="attendance-table"><thead><tr><th>소그룹원 · {people.length}명</th>{meetings.map(([m,label])=><th key={m}>{label}<span className="column-status">{draft[key(m)]?'수정 중 · 미확정':record(m)?'확정':'미입력'}</span>{writable&&<button className="column-select" onClick={()=>change(m,selected(m).length===allIds.length?[]:allIds)}>{selected(m).length===allIds.length?'전체 해제':'전체 선택'}</button>}</th>)}</tr></thead><tbody>{people.filter(p=>p.name.includes(query)).map(p=><tr key={p.id}><th><strong>{p.name}</strong></th>{meetings.map(([m,label])=><td key={m}><label className="attendance-cell"><input aria-label={`${p.name} ${label} 출석`} disabled={!writable||busy} type="checkbox" checked={selected(m).includes(p.id)} onChange={()=>change(m,selected(m).includes(p.id)?selected(m).filter(id=>id!==p.id):[...selected(m),p.id])}/><span className="cell-status">{selected(m).includes(p.id)?'출석':record(m)&&!draft[key(m)]?'결석':'미입력'}</span></label></td>)}</tr>)}</tbody></table>{!people.length&&<p className="board-empty">해당 날짜에 소속된 인원이 없습니다.</p>}</div>
 {writable&&<><div className="attendance-save"><div className="save-options"><strong>확정할 모임</strong><div>{meetings.map(([m,l])=><label key={m}><input type="checkbox" checked={include[m]} onChange={e=>{setInclude({...include,[m]:e.target.checked});setReview(false)}}/>{l}</label>)}</div><p>아직 모이지 않은 모임은 선택을 해제하세요.</p></div><button disabled={busy||!people.length||!Object.values(include).some(Boolean)} className="primary-button" onClick={async()=>{if(!review){setReview(true);return}const r=await run('attendance.save',{group_id:groupId,day,meetings:Object.fromEntries(meetings.filter(([m])=>include[m]).map(([m])=>[m,{present:selected(m),version:draft[key(m)]?.version??(record(m) as Attend|undefined)?.version??0}]))});if(r){setDraft({});setReview(false)}}}>{review?'확인 후 출석 확정':'출석 인원 확인'}</button></div>{review&&<div className="board-review"><strong>{day} · {group?.name}</strong>{meetings.filter(([m])=>include[m]).map(([m,l])=><p key={m}>{l}: 출석 {selected(m).length}명 / 결석 {allIds.length-selected(m).length}명</p>)}<p>체크하지 않은 인원은 결석으로 확정됩니다. 검색과 관계없이 전체 명단에 적용됩니다.</p></div>}</>}
 </section>
}
