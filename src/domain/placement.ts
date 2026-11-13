export type Candidate={id:string;rate:number|null}
export function balancedPlacement(candidates:Candidate[],leaders:string[],fixed:Record<string,number>,random:()=>number=Math.random):string[][]{
 if(!leaders.length||new Set(leaders).size!==leaders.length)throw new Error('그룹별 리더를 중복 없이 선택하세요.')
 const ids=new Set(candidates.map(c=>c.id));if(leaders.some(id=>!ids.has(id)))throw new Error('리더가 편성 대상에서 제외되어 있습니다.')
 const groups=leaders.map(id=>[id]);const rates=new Map(candidates.map(c=>[c.id,c.rate??50]))
 for(const [id,index]of Object.entries(fixed)){if(!ids.has(id))continue;if(index<0||index>=groups.length)throw new Error('고정 배정의 그룹을 확인하세요.');const leader=leaders.indexOf(id);if(leader>=0){if(leader!==index)throw new Error('리더는 담당 그룹에 고정됩니다.');continue}groups[index].push(id)}
 const assigned=new Set(groups.flat())
 // Attendance bands preserve a random element; compare size before average rate.
 const rest=candidates.filter(c=>!assigned.has(c.id)).map(c=>({...c,tie:random()})).sort((a,b)=>Math.floor((b.rate??50)/20)-Math.floor((a.rate??50)/20)||a.tie-b.tie)
 for(const c of rest){const min=Math.min(...groups.map(g=>g.length));const choices=groups.map((g,i)=>({i,size:g.length,rate:g.reduce((sum,id)=>sum+(rates.get(id)??50),0)/g.length,tie:random()})).filter(g=>g.size===min).sort((a,b)=>a.rate-b.rate||a.tie-b.tie);groups[choices[0].i].push(c.id)}
 return groups
}
