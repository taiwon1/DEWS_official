import { execFileSync } from 'node:child_process'
export function localConfig() {
  const raw=execFileSync('cmd.exe',['/d','/s','/c','pnpm exec supabase status -o json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']})
  const config=JSON.parse(raw.slice(raw.indexOf('{')))
  if (!config.API_URL?.startsWith('http://127.0.0.1:')) throw new Error('Local Supabase only')
  return config
}
export function loginEmail(username) { return 'u'+Buffer.from(username).toString('hex')+'@dews.test' }
