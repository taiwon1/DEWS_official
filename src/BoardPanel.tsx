import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowUpRight, ChevronRight, LockKeyhole, PencilLine, Search } from 'lucide-react'
import { canReadPost, visiblePosts, type BoardPost, type BoardViewer } from './domain/board'
import './board.css'

export const initialBoardPosts: BoardPost[] = [
  { id: 'sample-public', authorId: 'sample-other', title: '함께 읽을 책을 추천해 주세요', body: '이번 달에 읽기 좋은 책이 있으면 다음 모임에서 함께 이야기해 보고 싶어요.\n\n게시판 화면을 확인하기 위한 예시 글입니다.', visibility: 'public', createdAt: '2026-11-12T03:00:00Z' },
  { id: 'sample-mine', authorId: 'sample-me', title: '모임 일정에 대해 문의드립니다', body: '개인 일정과 모임 시간이 겹칠 때 어떻게 참여하면 좋을지 여쭤보고 싶습니다.\n\n비공개 열람을 확인하기 위한 예시 글입니다.', visibility: 'private', createdAt: '2026-11-11T03:00:00Z' },
  { id: 'sample-private', authorId: 'sample-other', title: '청년부 운영에 의견을 전합니다', body: '행사 안내를 조금 더 일찍 받을 수 있으면 좋겠습니다.\n\n다른 작성자의 비공개 글을 확인하기 위한 예시입니다.', visibility: 'private', createdAt: '2026-11-10T03:00:00Z' },
]
const previewUsers: { label: string; viewer: BoardViewer }[] = [
  { label: '청년 A · 내 계정', viewer: { id: 'sample-me', roles: ['member'] } },
  { label: '청년 B · 다른 계정', viewer: { id: 'sample-other', roles: ['member'] } },
  { label: '소그룹 리더', viewer: { id: 'sample-leader', roles: ['leader'] } },
  { label: '임원', viewer: { id: 'sample-officer', roles: ['officer'] } },
  { label: '목회자', viewer: { id: 'sample-pastor', roles: ['pastor'] } },
]
const formatDate = (value: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
type Props = { posts: BoardPost[]; onCreate: (post: BoardPost) => void }

export default function BoardPanel({ posts, onCreate }: Props) {
  const [preview, setPreview] = useState(0)
  const viewer = previewUsers[preview].viewer
  const [mode, setMode] = useState<'list' | 'write' | 'detail'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'mine'>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [review, setReview] = useState(false)
  const [cancelReview, setCancelReview] = useState(false)
  const [message, setMessage] = useState('')
  const current = posts.find(post => post.id === selectedId)
  const selected = current && canReadPost(current, viewer) ? current : undefined
  const list = visiblePosts(posts, viewer, query).filter(post => filter === 'all' || (filter === 'mine' ? post.authorId === viewer.id : post.visibility === filter))
  function resetDraft() { setTitle(''); setBody(''); setVisibility('private'); setReview(false); setCancelReview(false) }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) return
    if (!review) { setReview(true); return }
    const post: BoardPost = { id: crypto.randomUUID(), authorId: viewer.id, title: title.trim(), body: body.trim(), visibility, createdAt: new Date().toISOString() }
    onCreate(post); setSelectedId(post.id); setMode('detail'); resetDraft(); setMessage('예시 글이 등록되었습니다. 새로고침하면 사라집니다.')
  }
  return <section className="workspace section-wrap board-workspace">
    <div className="breadcrumb">DEWS <ChevronRight size={13} /> 게시판</div>
    <div className="section-top"><div><h1 className="page-title">게시판</h1><p className="page-description">이야기와 의견을 남겨 주세요. 작성자는 모두 익명으로 표시됩니다.</p></div>{mode === 'list' && <button className="primary-button" onClick={() => { resetDraft(); setMessage(''); setMode('write') }}><PencilLine size={16} /> 글 작성</button>}</div>
    <div className="board-preview"><div><strong>권한 미리보기 · 가상 계정</strong><p>실제 보안이 적용되지 않은 시연 화면입니다. 개인정보는 입력하지 마세요.<br />작성한 글은 현재 화면에서만 유지되며, 새로고침하면 사라집니다.</p></div><label>확인할 사용자<select value={preview} disabled={mode === 'write'} onChange={event => { setPreview(Number(event.target.value)); setMode('list'); setSelectedId(null); setQuery(''); setFilter('all'); setMessage('') }}>{previewUsers.map((user, index) => <option value={index} key={user.viewer.id}>{user.label}</option>)}</select></label></div>
    {message && <p className="board-message" role="status">{message}</p>}
    {mode === 'list' && <>
      <div className="board-toolbar"><div className="board-filters" aria-label="게시글 필터">{([['all', '전체'], ['public', '공개'], ['private', '비공개'], ['mine', '내 글']] as const).map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="board-search"><Search size={16} /><input aria-label="제목 또는 내용 검색" placeholder="제목 또는 내용 검색" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="board-list-note">열람할 수 있는 글 {list.length}개 · 비공개 글은 작성자·임원·목회자만 볼 수 있습니다.</p>
      <div className="board-list">{list.length ? list.map(post => <button className="board-row" key={post.id} onClick={() => { setSelectedId(post.id); setMode('detail'); setMessage('') }}><span className={`board-badge ${post.visibility}`}>{post.visibility === 'private' && <LockKeyhole size={12} />}{post.visibility === 'public' ? '공개' : '비공개'}</span><span className="board-row-title">{post.title}{post.authorId === viewer.id && <small>내 글</small>}</span><span className="board-author">익명</span><time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time><ArrowUpRight size={16} /></button>) : <div className="board-empty">{query ? '검색 결과가 없습니다.' : '표시할 글이 없습니다.'}</div>}</div>
    </>}
    {mode === 'detail' && <><button className="board-back" onClick={() => setMode('list')}><ArrowLeft size={15} /> 목록으로</button>{selected ? <article className="board-detail"><span className={`board-badge ${selected.visibility}`}>{selected.visibility === 'private' ? '비공개' : '공개'}</span><h2>{selected.title}</h2><div className="board-meta"><span>익명</span><time dateTime={selected.createdAt}>{formatDate(selected.createdAt)}</time>{selected.authorId === viewer.id && <span>내 글</span>}</div><p className="board-audience">{selected.visibility === 'private' ? '작성자·임원·목회자만 볼 수 있는 글입니다.' : '로그인한 공동체 구성원 모두 볼 수 있는 글입니다.'}</p><div className="board-body">{selected.body}</div></article> : <p className="board-empty">글이 없거나 열람 권한이 없습니다.</p>}</>}
    {mode === 'write' && <form className="board-form" onSubmit={submit}>
      <h2>글 작성</h2><label className="board-field">제목<input required maxLength={100} value={title} onChange={event => { setTitle(event.target.value); setReview(false) }} placeholder="제목을 입력하세요" /></label>
      <fieldset className="board-visibility"><legend>공개 범위</legend><label><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => { setVisibility('public'); setReview(false) }} /><span><strong>공개</strong><small>로그인한 공동체 구성원 전체</small></span></label><label><input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => { setVisibility('private'); setReview(false) }} /><span><strong>비공개</strong><small>작성자·임원·목회자만</small></span></label></fieldset>
      <p className="board-anonymous">작성자 표시는 임원·목회자에게도 ‘익명’입니다. 본문에 이름을 쓰면 신원이 드러날 수 있습니다.</p>
      <label className="board-field">내용<textarea required maxLength={5000} rows={10} value={body} onChange={event => { setBody(event.target.value); setReview(false) }} placeholder="예시 내용을 입력하세요" /><span className="board-count">{body.length.toLocaleString()} / 5,000자</span></label>
      {review && <div className="board-review" role="status"><strong>{visibility === 'public' ? '공개 글로 등록할까요?' : '비공개 글로 등록할까요?'}</strong><p>{visibility === 'public' ? '로그인한 공동체 구성원 모두 제목과 내용을 볼 수 있습니다.' : '작성자와 모든 임원·목회자가 제목과 내용을 볼 수 있습니다.'} 작성자는 익명으로 표시됩니다.</p></div>}
      {cancelReview && <div className="board-review"><p>작성 중인 내용을 버리고 목록으로 돌아갈까요?</p><button type="button" className="soft-button" onClick={() => { resetDraft(); setMode('list') }}>내용 버리기</button><button type="button" className="soft-button" onClick={() => setCancelReview(false)}>계속 작성</button></div>}
      <div className="board-form-actions"><button type="button" className="soft-button" onClick={() => title || body ? setCancelReview(true) : setMode('list')}>취소</button><button className="primary-button" type="submit" disabled={!title.trim() || !body.trim()}>{review ? '확인 후 등록' : '등록 내용 확인'}</button></div>
    </form>}
  </section>
}
