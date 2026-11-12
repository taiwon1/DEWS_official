export type BoardRole = 'member' | 'leader' | 'deputy' | 'newcomer-team' | 'officer' | 'pastor' | 'admin'
export type BoardViewer = { id: string; roles: BoardRole[] }
export type BoardPost = {
  id: string
  authorId: string
  title: string
  body: string
  visibility: 'public' | 'private'
  createdAt: string
}

// UI prototype policy only. Production must enforce this before fetching rows,
// and omit authorId from reader-facing responses. Never trust a client role.
export function canReadPost(post: BoardPost, viewer: BoardViewer | null): boolean {
  if (!viewer) return false
  return post.visibility === 'public' || post.authorId === viewer.id ||
    viewer.roles.some(role => role === 'officer' || role === 'pastor')
}

export function visiblePosts(posts: BoardPost[], viewer: BoardViewer | null, query = '') {
  const term = query.trim().toLocaleLowerCase()
  return posts.filter(post => canReadPost(post, viewer))
    .filter(post => `${post.title}\n${post.body}`.toLocaleLowerCase().includes(term))
}
