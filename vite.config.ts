import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({mode}) => {
 const env=loadEnv(mode,'.','VITE_')
 if(mode==='staging'){
  let url:URL
  try{url=new URL(env.VITE_SUPABASE_URL)}catch{throw new Error('배포용 Supabase URL이 필요합니다.')}
  if(url.protocol!=='https:'||['localhost','127.0.0.1'].includes(url.hostname))throw new Error('외부 배포에는 HTTPS 클라우드 DB가 필요합니다.')
  const key=env.VITE_SUPABASE_ANON_KEY||''
  if(!key||key.startsWith('sb_secret_'))throw new Error('공개용 Supabase 키만 사용할 수 있습니다.')
  if(key.includes('.')){try{const claims=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(claims.role!=='anon')throw new Error('not anon')}catch{throw new Error('공개 anon 키가 아닙니다. 서비스 키는 프런트엔드에 넣지 마세요.')}}
 }
 return {plugins:[react()]}
})
