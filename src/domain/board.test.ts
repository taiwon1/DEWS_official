import { describe, expect, it } from 'vitest'
import { canReadPost, visiblePosts, type BoardPost, type BoardRole } from './board'

const privatePost: BoardPost = { id: 'one', authorId: 'author', title: '비공개 예시', body: '검색용 비밀문구', visibility: 'private', createdAt: '2026-11-12T00:00:00Z' }
describe('익명 게시판 열람 정책', () => {
  it('작성자는 자기 비공개 글을 읽는다', () => {
    expect(canReadPost(privatePost, { id: 'author', roles: ['member'] })).toBe(true)
  })
  it.each<BoardRole>(['officer', 'pastor'])('%s는 다른 작성자의 비공개 글을 읽는다', role => {
    expect(canReadPost(privatePost, { id: 'other', roles: [role] })).toBe(true)
  })
  it.each<BoardRole>(['member', 'leader', 'deputy', 'newcomer-team', 'admin'])('%s 직책만으로 비공개 글에 접근하지 못한다', role => {
    expect(canReadPost(privatePost, { id: 'other', roles: [role] })).toBe(false)
  })
  it('겸직 권한을 결합하고 임원 해제 시 접근을 회수한다', () => {
    expect(canReadPost(privatePost, { id: 'other', roles: ['leader', 'officer'] })).toBe(true)
    expect(canReadPost(privatePost, { id: 'other', roles: ['leader'] })).toBe(false)
  })
  it('검색에서도 읽을 수 없는 제목과 본문을 제외한다', () => {
    expect(visiblePosts([privatePost], { id: 'other', roles: ['member'] }, '비밀문구')).toEqual([])
  })
  it('공개 글은 로그인한 구성원에게만 보이는 보수적 기본값이다', () => {
    const post = { ...privatePost, visibility: 'public' as const }
    expect(canReadPost(post, { id: 'other', roles: ['member'] })).toBe(true)
    expect(canReadPost(post, null)).toBe(false)
  })
})
