-- Synthetic data only. Relative dates keep boundary scenarios reproducible.
insert into public.people(id,name,birth_date,first_visit,status,full_member,education_requested,phone)
select md5('person-'||i)::uuid,
case i when 1 then '김목자' when 2 then '이목자' when 3 then '박총무' when 4 then '최회장' when 5 then '윤회장' when 6 then '정총무' when 7 then '한피디' when 8 then '오회계' when 9 then '임서기'
when 10 then '김리더' when 19 then '이부리' when 20 then '박새담' when 21 then '김청년' when 22 then '이청년' when 23 then '최새봄' when 24 then '윤새싹' when 25 then '장결자' when 26 then '제적자' when 27 then '장후보' when 28 then '돌봄넷' when 29 then '돌봄둘' when 150 then '테관리' else '예시'||lpad(i::text,3,'0') end,
make_date(1998+i%10,1+i%12,1+i%27),
case when i=23 then current_date-90 when i=24 then current_date-40 else current_date-500 end,
case when i in(23,24) then 'newcomer' when i=25 then 'long_absent' when i=26 then 'removed' else 'enrolled' end,
i not in(23,24,25,26),true,'010-0000-'||lpad(i::text,4,'0') from generate_series(1,150) i;
insert into public.education(person_id,lesson,attended_on,author_id)
select p.id,l,p.first_visit+l*7,md5('person-20')::uuid from public.people p cross join generate_series(1,4) l where p.id<>md5('person-24')::uuid or l<=2;
insert into public.cycles(id,name,starts_on,ends_on) values
(md5('cycle-prev')::uuid,'이전 기수',current_date-500,date_trunc('week',current_date)::date-211),
(md5('cycle-current')::uuid,'현재 기수',date_trunc('week',current_date)::date-210,null);
insert into public.groups(id,cycle_id,name,leader_id,deputy_id)
select md5('group-'||i)::uuid,md5('cycle-current')::uuid,'이슬 '||i||'그룹',md5('person-'||(i+9))::uuid,case when i=1 then md5('person-19')::uuid end from generate_series(1,9)i;
insert into public.groups(id,cycle_id,name,leader_id)
select md5('old-group-'||i)::uuid,md5('cycle-prev')::uuid,'이전 '||i||'그룹',md5('person-'||(i+9))::uuid from generate_series(1,9)i;
insert into public.memberships(person_id,group_id,starts_on,ends_on)
select id,md5('old-group-'||(1+(row_number() over(order by id))%9))::uuid,first_visit,date_trunc('week',current_date)::date-211 from public.people where first_visit<current_date-300;
insert into public.memberships(person_id,group_id,starts_on)
select md5('person-'||i)::uuid,md5('group-'||case when i between 10 and 18 then i-9 when i in(19,21,23,27,28,29,30) then 1 when i=22 then 2 else 1+i%9 end)::uuid,
case when i=23 then current_date-60 else date_trunc('week',current_date)::date-210 end from generate_series(1,150)i where i not in(24,25,26);
insert into public.attendance(group_id,day,meeting,present,roster,author_id)
select g.id,date_trunc('week',current_date)::date-w*7+6,meeting,
coalesce((select array_agg(m.person_id) from public.memberships m where m.group_id=g.id and m.ends_on is null and m.starts_on<=date_trunc('week',current_date)::date-w*7+6
and m.person_id<>md5('person-30')::uuid
and not(m.person_id=md5('person-27')::uuid and w<=26)
and not(m.person_id=md5('person-28')::uuid and w<=4)
and not(m.person_id=md5('person-29')::uuid and w<=2)
and (abs(hashtext(m.person_id::text))::bigint+w)%5<>0),'{}'),
coalesce((select array_agg(m.person_id) from public.memberships m where m.group_id=g.id and m.ends_on is null and m.starts_on<=date_trunc('week',current_date)::date-w*7+6 and m.person_id<>md5('person-30')::uuid),'{}'),g.leader_id
from public.groups g cross join generate_series(1,30)w cross join unnest(array['worship','group']) meeting where g.cycle_id=md5('cycle-current')::uuid;
insert into public.notes(person_id,cycle_id,author_id,kind,body,prayer,next_contact) values
(md5('person-28')::uuid,md5('cycle-current')::uuid,md5('person-10')::uuid,'leader','예시: 4주 결석, 이번 주 안부 확인 예정','예시 기도제목',current_date),
(md5('person-28')::uuid,md5('cycle-current')::uuid,md5('person-1')::uuid,'pastor_private','목회자 전용 테스트 기록','',null),
(md5('person-28')::uuid,md5('cycle-current')::uuid,md5('person-2')::uuid,'pastor_shared','담당 리더와 공유하는 테스트 기록','',null),
(md5('person-24')::uuid,md5('cycle-current')::uuid,md5('person-20')::uuid,'leader','새가족반 테스트 기록','새가족 기도제목',null),
(md5('person-28')::uuid,md5('cycle-prev')::uuid,md5('person-11')::uuid,'leader','이전 기수 인계 테스트 기록','',null);
insert into public.timeline(person_id,action,reason,author_id) select id,'초기 등록','가상 데이터 생성',md5('person-1')::uuid from public.people;
insert into public.events(title,description,day,location,category) values
('주일예배','가상 행사입니다. 실제 일정이 아닙니다.',date_trunc('month',current_date)::date+14,'청년부 예배실','예배'),
('소그룹 모임','가상 행사입니다.',date_trunc('month',current_date)::date+21,'소그룹별 장소','공동체'),
('동아리 모임','가상 동아리 활동입니다.',date_trunc('month',current_date)::date+27,'교회 모임방','동아리');
insert into public.clubs(name,description,schedule) values ('독서 모임','가상 동아리 소개','매월 마지막 주일'),('찬양 모임','가상 동아리 소개','격주 토요일');
insert into public.posts(id,author_id,title,body,visibility) values
(md5('post-public')::uuid,md5('person-21')::uuid,'함께 읽을 책을 추천해 주세요','공개 게시글 테스트입니다.','public'),
(md5('post-private')::uuid,md5('person-21')::uuid,'모임 일정 문의','작성자·임원·목회자만 읽는 비공개 테스트입니다.','private'),
(md5('post-other')::uuid,md5('person-22')::uuid,'운영 관련 의견','다른 작성자의 비공개 테스트입니다.','private');
insert into public.comments(post_id,author_id,body) values
(md5('post-public')::uuid,md5('person-22')::uuid,'익명 댓글 테스트입니다.'),
(md5('post-private')::uuid,md5('person-3')::uuid,'비공개 글의 댓글도 같은 열람 범위를 따릅니다.');
