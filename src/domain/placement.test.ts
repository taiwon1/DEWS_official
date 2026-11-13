import {expect,it} from 'vitest'
import {balancedPlacement} from './placement'
it('대상 중복/누락 없이 고정 배정과 리더를 보존한다',()=>{const c=Array.from({length:25},(_,i)=>({id:String(i),rate:i%2?90:20}));const g=balancedPlacement(c,['0','1','2'],{'3':1},()=>.5);expect(new Set(g.flat()).size).toBe(25);expect(g.flat().length).toBe(25);expect(g[1]).toContain('3');expect(g.map(x=>x[0])).toEqual(['0','1','2']);expect(Math.max(...g.map(x=>x.length))-Math.min(...g.map(x=>x.length))).toBeLessThanOrEqual(1)})
it('중복 리더와 리더의 다른 그룹 고정 배정을 거부한다',()=>{const c=[{id:'a',rate:null},{id:'b',rate:100}];expect(()=>balancedPlacement(c,['a','a'],{})).toThrow();expect(()=>balancedPlacement(c,['a','b'],{a:1})).toThrow()})
