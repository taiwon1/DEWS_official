import { createClient } from '@supabase/supabase-js'
const env = (import.meta as unknown as { env: Record<string,string> }).env
export const configured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY)
// A QA tab stores its session separately. Supabase still validates credentials and roles.
const qaTab = new URLSearchParams(location.search).get('qa-tab') ?? ''
const isolatedTab = env.MODE === 'staging' && /^(pastor|officer|leader|newcomer|member)$/.test(qaTab)
const url = env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const publicKey = env.VITE_SUPABASE_ANON_KEY || 'not-configured'
const tabKey = 'dews-tab-session-' + new URL(url).hostname
function clientFor(persistent: boolean) {
 if (isolatedTab) return createClient(url, publicKey, {auth:{storage:sessionStorage,storageKey:`dews-qa-tab-${qaTab}`}})
 if (persistent) return createClient(url, publicKey)
 let key = sessionStorage.getItem(tabKey)
 if (!key) { key = crypto.randomUUID(); sessionStorage.setItem(tabKey,key) }
 return createClient(url, publicKey, {auth:{storage:sessionStorage,storageKey:'dews-session-'+key}})
}
let persistent = !sessionStorage.getItem(tabKey)
export let supabase = clientFor(persistent)
export function chooseLoginStorage(remember: boolean) {
 if (!isolatedTab && persistent !== remember) {
  if (remember) sessionStorage.removeItem(tabKey)
  persistent = remember
  supabase = clientFor(remember)
 }
 return supabase
}
export const loginEmail = (username: string) => 'u'+Array.from(new TextEncoder().encode(username.trim())).map(n=>n.toString(16).padStart(2,'0')).join('')+'@dews.test'
export const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date())
export const formatKoreanDate = (value:string, time=false) => new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',...(time?{hour:'2-digit' as const,minute:'2-digit' as const}:{})}).format(new Date(value))
export type Person = { id:string; name:string; birth_date:string|null; cohort?:string; account_roles?:string[]|null; first_visit:string; phone:string|null; status:string; full_member:boolean; education_requested:boolean; educated:boolean; eligible:boolean; education:number[]; group_id:string|null; streak:number|null; rate:number|null }
export type Group = {id:string; cycle_id:string; name:string; leader_id:string; deputy_id:string|null}
export type Cycle = {id:string; name:string; starts_on:string; ends_on:string|null}
export type Membership = {person_id:string; group_id:string; starts_on:string; ends_on:string|null}
export type Attend = {group_id:string; day:string; meeting:'worship'|'group'; present:string[]; roster:string[]; version:number}
export type Note = {id:string; person_id:string; cycle_id:string; author_name:string; kind:string; body:string; prayer:string; care_date:string|null; updated_at:string|null; mine:boolean; created_at:string}
export type EventRow = {id:string; title:string; description:string; day:string; location:string; category:string; poster:string; version:number}
export type Comment = {id:string; body:string; mine:boolean; created_at:string}
export type Post = {id:string; title:string; body:string; visibility:'public'|'private'; mine:boolean; created_at:string; comments:Comment[]}
export type Assignment = {name:string; leader_id:string; deputy_id?:string; members:string[]}
export type Plan = {id:string; name:string; assignments:Assignment[]; fixed:Record<string,number>; apply_on:string|null; state:string; error:string|null}
export type Snapshot = {me:{id:string; name:string; username:string; roles:string[]}; people:Person[]; groups:Group[]; groupmates:{id:string;name:string}[]; cycles:Cycle[]; memberships:Membership[]; attendance:Attend[]; notes:Note[]; timeline:{id:string;person_id:string;action:string;reason:string;created_at:string}[]; events:EventRow[]; clubs:{id:string;name:string;description:string;schedule:string}[]; posts:Post[]; plans:Plan[]}
export async function loadSnapshot():Promise<Snapshot>{const {data,error}=await supabase.rpc('app_snapshot');if(error)throw new Error(error.message);return data}
export async function action(name:string,payload:Record<string,unknown> = {}) {const {data,error}=await (name==='person.create' ? supabase.rpc('register_newcomer',{payload}) : supabase.rpc('app_action',{action:name,payload}));if(error)throw new Error(error.message);return data as {id?:string;token?:string}}
export const officers=['officer']
export const roleNames:Record<string,string>={member:'일반 청년',pastor:'최고 관리자',officer:'임원',leader:'소그룹 리더',newcomer:'새가족반'}
export const statusNames:Record<string,string>={newcomer:'새가족',enrolled:'재적',long_absent:'장결',removed:'제적'}
