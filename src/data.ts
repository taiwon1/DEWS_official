// All people, events and notes below are fictional UI fixtures, never production data.
export const members = [
  { id: 'demo-1', name: '김하은', category: '정회원', initials: '하은', absent: 0 },
  { id: 'demo-2', name: '이도윤', category: '정회원', initials: '도윤', absent: 2 },
  { id: 'demo-3', name: '박서연', category: '새가족 · 교육 완료', initials: '서연', absent: 0 },
  { id: 'demo-4', name: '정유진', category: '정회원', initials: '유진', absent: 4 },
  { id: 'demo-5', name: '최지우', category: '정회원', initials: '지우', absent: 0 },
  { id: 'demo-6', name: '강민준', category: '정회원', initials: '민준', absent: 0 },
  { id: 'demo-7', name: '윤다은', category: '정회원', initials: '다은', absent: 2 },
  { id: 'demo-8', name: '한시온', category: '새가족 · 교육 완료', initials: '시온', absent: 0 },
]
export const events = [
  { id: 1, day: '15', month: '11', category: '예배', title: '주일예배', description: '예배 시간과 장소를 확인하세요.', when: '11월 15일 일요일', location: '예배 장소는 운영 시 등록됩니다', color: 'mint' },
  { id: 2, day: '22', month: '11', category: '공동체', title: '소그룹 모임', description: '소그룹별 모임 일정입니다.', when: '11월 22일 일요일', location: '소그룹별 모임', color: 'cream' },
  { id: 3, day: '29', month: '11', category: '동아리', title: '동아리 모임', description: '동아리별 활동 안내입니다.', when: '11월 29일 일요일', location: '동아리별 안내 예정', color: 'blue' },
]

export type CommunityEvent = Omit<typeof events[number], 'id'> & { id: number|string; date: string; posterUrl?: string }
export const calendarEvents: CommunityEvent[] = events.map(event => ({ ...event, date: `2026-${event.month}-${event.day}` }))
