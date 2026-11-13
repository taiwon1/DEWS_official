import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { writeFileSync,mkdirSync } from 'node:fs'
import { localConfig,loginEmail } from './local-config.mjs'
const config=localConfig()
const admin=createClient(config.API_URL,config.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const id=n=>{ const h=createHash('md5').update('person-'+n).digest('hex'); return h.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/,'$1-$2-$3-$4-$5') }
const roles={1:['pastor'],2:['pastor'],3:['secretary2'],4:['president2'],5:['president1'],6:['secretary1'],7:['pd'],8:['treasurer'],9:['clerk'],10:['leader'],11:['leader'],12:['leader','secretary1'],19:['deputy'],20:['newcomer'],21:['member'],22:['member'],23:['member'],24:['member'],150:['admin']}
const roleLabels={pastor:'목회자',secretary2:'2청 총무',president2:'2청 회장',president1:'1청 회장',secretary1:'1청 총무',pd:'PD',treasurer:'회계',clerk:'서기',leader:'리더',deputy:'부리더',newcomer:'새가족반',member:'청년',admin:'테스트 관리자'}
const password='DewsLocal!2026'
const accounts=[]
const {data:existing,error:existingError}=await admin.auth.admin.listUsers({perPage:1000})
if(existingError) throw existingError
for(const [n,role] of Object.entries(roles)) {
 const {data:p,error}=await admin.from('people').select('*').eq('id',id(n)).single(); if(error) throw error
 const username=p.name+p.birth_date.slice(5).replace('-',''); const email=loginEmail(username)
 let user=existing.users.find(u=>u.email===email)
 if(!user){const result=await admin.auth.admin.createUser({email,password,email_confirm:true}); if(result.error)throw result.error; user=result.data.user}
 const saved=await admin.from('profiles').upsert({id:user.id,person_id:p.id,username,roles:role}); if(saved.error)throw saved.error
 accounts.push({username,password,roles:role,person_id:p.id})
}
mkdirSync('.local',{recursive:true})
writeFileSync('.local/test-accounts.json',JSON.stringify(accounts,null,2))
writeFileSync('.env.local',`VITE_SUPABASE_URL=${config.API_URL}\nVITE_SUPABASE_ANON_KEY=${config.ANON_KEY}\n`)
writeFileSync('docs/TEST_ACCOUNTS.md','# 로컬 가상 계정\n\n로컬 Supabase 전용. 실제 사용자/운영 비밀번호가 아닙니다. 공통 비밀번호: `'+password+'`\n\n| 역할 | 아이디 |\n|---|---|\n'+accounts.map(a=>'| '+a.roles.map(r=>roleLabels[r]).join(' + ')+' | '+a.username+' |').join('\n')+'\n')
console.log(`Seeded ${accounts.length} local accounts; credentials: docs/TEST_ACCOUNTS.md`)
