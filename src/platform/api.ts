import { createClient } from '@supabase/supabase-js'
const env = (import.meta as unknown as { env: Record<string,string> }).env
export const configured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY)
export const supabase = createClient(env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321', env.VITE_SUPABASE_ANON_KEY || 'not-configured')
export const loginEmail = (username: string) => 'u'+Array.from(new TextEncoder().encode(username.trim())).map(n=>n.toString(16).padStart(2,'0')).join('')+'@dews.test'
export const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date())
export const formatKoreanDate = (value:string, time=false) => new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',...(time?{hour:'2-digit' as const,minute:'2-digit' as const}:{})}).format(new Date(value))
export type Person = { id:string; name:string; birth_date:string|null; first_visit:string; phone:string|null; status:string; full_member:boolean; education_requested:boolean; educated:boolean; eligible:boolean; education:number[]; group_id:string|null; streak:number|null; rate:number|null }
export type Group = {id:string; cycle_id:string; name:string; leader_id:string; deputy_id:string|null}
export type Cycle = {id:string; name:string; starts_on:string; ends_on:string|null}
export type Membership = {person_id:string; group_id:string; starts_on:string; ends_on:string|null}
export type Attend = {group_id:string; day:string; meeting:'worship'|'group'; present:string[]; roster:string[]; version:number}
export type Note = {id:string; person_id:string; cycle_id:string; author_name:string; kind:string; body:string; prayer:string; next_contact:string|null; done:boolean; created_at:string}
export type EventRow = {id:string; title:string; description:string; day:string; location:string; category:string; poster:string; version:number}
export type Comment = {id:string; body:string; mine:boolean; created_at:string}
export type Post = {id:string; title:string; body:string; visibility:'public'|'private'; mine:boolean; created_at:string; comments:Comment[]}
export type Assignment = {name:string; leader_id:string; deputy_id?:string; members:string[]}
export type Plan = {id:string; name:string; assignments:Assignment[]; fixed:Record<string,number>; apply_on:string|null; state:string; error:string|null}
export type Snapshot = {me:{id:string; name:string; username:string; roles:string[]}; people:Person[]; groups:Group[]; groupmates:{id:string;name:string}[]; cycles:Cycle[]; memberships:Membership[]; attendance:Attend[]; notes:Note[]; timeline:{id:string;person_id:string;action:string;reason:string;created_at:string}[]; events:EventRow[]; clubs:{id:string;name:string;description:string;schedule:string}[]; posts:Post[]; plans:Plan[]}
export async function loadSnapshot():Promise<Snapshot>{const {data,error}=await supabase.rpc('app_snapshot');if(error)throw new Error(error.message);return data}
export async function action(name:string,payload:Record<string,unknown> = {}) {const {data,error}=await supabase.rpc('app_action',{action:name,payload});if(error)throw new Error(error.message);return data as {id?:string;token?:string}}
export const officers=['secretary2','president2','president1','secretary1','pd','treasurer','clerk']
export const roleNames:Record<string,string>={member:'청년',pastor:'목회자',secretary2:'2청년부 총무',president2:'2청년부 회장',president1:'1청년부 회장',secretary1:'1청년부 총무',pd:'PD',treasurer:'회계',clerk:'서기',leader:'소그룹 리더',deputy:'부리더',newcomer:'새가족반',admin:'테스트 관리자'}
export const statusNames:Record<string,string>={newcomer:'새가족',enrolled:'재적',long_absent:'장결',removed:'제적'}
