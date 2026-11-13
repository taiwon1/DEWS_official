create or replace function public.app_action(action text, payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=app_private.me(); pid uuid; gid uuid; rid uuid; rec public.posts; g public.groups; c public.cycles; a public.attendance;
 n public.notes; m text; v jsonb; roster uuid[]; selected uuid[]; token text; reason text; state text;
begin
 if me is null then raise exception '로그인이 필요합니다.' using errcode='42501'; end if;
 if octet_length(payload::text)>3000000 then raise exception '요청이 너무 큽니다.'; end if;
 pid:=nullif(payload->>'person_id','')::uuid;
 if action='post.create' then
 insert into public.posts(author_id,title,body,visibility) values(me,trim(payload->>'title'),trim(payload->>'body'),payload->>'visibility') returning id into rid;
 elsif action='comment.create' then
 select * into rec from public.posts where id=(payload->>'post_id')::uuid;
 if rec.id is null or not app_private.read_post(rec) then raise exception '글이 없거나 권한이 없습니다.' using errcode='42501'; end if;
 insert into public.comments(post_id,author_id,body) values(rec.id,me,trim(payload->>'body')) returning id into rid;
 elsif action='person.create' then
 if not app_private.has_role(array['pastor','newcomer']) then raise exception '등록 권한이 없습니다.' using errcode='42501'; end if;
 if (payload->>'first_visit')::date>current_date or (payload->>'birth_date')::date>current_date then raise exception '날짜를 확인하세요.'; end if;
 insert into public.people(name,birth_date,first_visit,phone) values(trim(payload->>'name'),(payload->>'birth_date')::date,(payload->>'first_visit')::date,coalesce(payload->>'phone','')) returning id into rid;
 insert into public.timeline(person_id,action,reason,author_id) values(rid,'등록','새가족 등록',me);
 elsif action in ('education.request','education.complete') then
 if not app_private.has_role(array['pastor','newcomer']) then raise exception '교육 관리 권한이 없습니다.' using errcode='42501'; end if;
 if not exists(select 1 from public.people where id=pid and status='newcomer') then raise exception '새가족 대상이 아닙니다.'; end if;
 if action='education.request' then update public.people set education_requested=true where id=pid;
 else
 if not exists(select 1 from public.people where id=pid and education_requested) then raise exception '먼저 교육 등록 희망을 기록하세요.'; end if;
 if (payload->>'day')::date>current_date or (payload->>'day')::date<(select first_visit from public.people where id=pid) then raise exception '교육일을 확인하세요.'; end if;
 insert into public.education(person_id,lesson,attended_on,author_id) values(pid,(payload->>'lesson')::int,(payload->>'day')::date,me);
 end if;
 insert into public.timeline(person_id,action,reason,author_id) values(pid,action,coalesce(payload->>'lesson','교육 등록 희망'),me);
 elsif action='member.transition' then
 if not app_private.has_role(array['pastor']) then raise exception '목회자 승인 권한이 필요합니다.' using errcode='42501'; end if;
 reason:=trim(payload->>'reason'); state:=payload->>'state';
 if coalesce(length(reason),0)<3 then raise exception '처리 사유를 3자 이상 입력하세요.'; end if;
 perform 1 from public.people where id=pid for update;
 if state='enroll' then
 if not exists(select 1 from public.people where id=pid and status='newcomer' and first_visit+interval '6 months'<=current_date) or not app_private.educated(pid) then raise exception '첫 방문 6개월과 교육 이수를 모두 충족해야 합니다.'; end if;
 update public.people set status='enrolled',full_member=true where id=pid;
 elsif state='long_absent' then
 if app_private.streak(pid)<26 or not exists(select 1 from public.people where id=pid and status='enrolled') then raise exception '재적 인원의 26주 연속 결석 확인이 필요합니다.'; end if;
 update public.people set status='long_absent',full_member=false where id=pid;
 elsif state='removed' then
 if not exists(select 1 from public.people where id=pid and status='long_absent') then raise exception '장결자만 제적할 수 있습니다.'; end if;
 update public.people set status='removed',full_member=false where id=pid;
 elsif state='restore' then
 if not exists(select 1 from public.people where id=pid and status in ('long_absent','removed')) then raise exception '장결·제적자만 복귀할 수 있습니다.'; end if;
 update public.people set status='enrolled',full_member=false where id=pid;
 elsif state='rights' then
 if not exists(select 1 from public.people where id=pid and status='enrolled' and not full_member) then raise exception '재적 복귀 후 별도 승인하세요.'; end if;
 update public.people set full_member=true where id=pid;
 else raise exception '지원하지 않는 회원 처리입니다.'; end if;
 insert into public.timeline(person_id,action,reason,author_id) values(pid,state,reason,me);
 elsif action='attendance.save' then
 perform pg_advisory_xact_lock(116519);
 gid:=(payload->>'group_id')::uuid;
 select * into g from public.groups where id=gid;
 select * into c from public.cycles where id=g.cycle_id;
 if g.id is null or not coalesce(app_private.has_role(array['secretary2']) or g.leader_id=me or g.deputy_id=me,false) or c.ends_on is not null then raise exception '현재 담당 소그룹만 입력할 수 있습니다.' using errcode='42501'; end if;
 if (payload->>'day')::date>current_date or (payload->>'day')::date<c.starts_on then raise exception '출석일은 기수 시작일부터 오늘까지입니다.'; end if;
 select coalesce(array_agg(person_id),'{}') into roster from public.memberships where group_id=gid and starts_on<=(payload->>'day')::date and (ends_on is null or ends_on>=(payload->>'day')::date);
 if cardinality(roster)=0 then raise exception '해당 날짜의 명단이 없습니다.'; end if;
 if not (payload->'meetings' ? 'worship' or payload->'meetings' ? 'group') then raise exception '확정할 모임을 선택하세요.'; end if;
 for m,v in select * from jsonb_each(payload->'meetings') loop
 if m not in ('worship','group') then raise exception '모임 구분 오류'; end if;
 select coalesce(array_agg(value::uuid),'{}') into selected from jsonb_array_elements_text(v->'present');
 if not selected <@ roster then raise exception '명단에 없는 출석자가 있습니다.'; end if;
 select * into a from public.attendance where group_id=gid and day=(payload->>'day')::date and meeting=m;
 if coalesce(a.version,0)<>coalesce((v->>'version')::int,0) then raise exception '다른 사용자가 수정했습니다. 새로고침 후 다시 확인하세요.' using errcode='40001'; end if;
 insert into public.attendance(group_id,day,meeting,present,roster,author_id) values(gid,(payload->>'day')::date,m,selected,roster,me)
 on conflict(group_id,day,meeting) do update set present=excluded.present,roster=excluded.roster,author_id=me,version=public.attendance.version+1,updated_at=now();
 end loop;
 elsif action='note.create' then
 if not exists(select 1 from public.people where id=pid) then raise exception '대상이 없습니다.'; end if;
 if payload->>'kind'='leader' then
 if not (app_private.group_scope(pid) or app_private.new_scope(pid)) then raise exception '담당 리더만 작성할 수 있습니다.' using errcode='42501'; end if;
 else
 if not app_private.has_role(array['pastor']) then raise exception '목회자만 작성할 수 있습니다.' using errcode='42501'; end if;
 end if;
 insert into public.notes(person_id,cycle_id,author_id,kind,body,prayer,next_contact) values(pid,(select id from public.cycles where ends_on is null order by starts_on desc limit 1),me,payload->>'kind',trim(payload->>'body'),coalesce(payload->>'prayer',''),nullif(payload->>'next_contact','')::date) returning id into rid;
 elsif action='note.done' then
 select * into n from public.notes where id=(payload->>'id')::uuid;
 if n.id is null or not app_private.note_scope(n) or not (app_private.has_role(array['pastor']) or app_private.group_scope(n.person_id) or app_private.new_scope(n.person_id)) then raise exception '처리 권한이 없습니다.' using errcode='42501'; end if;
 update public.notes set done=true where id=n.id;
 elsif action='group.assign' then
 if not app_private.has_role(array['secretary2']) then raise exception '2청년부 총무 권한이 필요합니다.' using errcode='42501'; end if;
 if not app_private.educated(pid) or not exists(select 1 from public.people where id=pid and status in ('newcomer','enrolled')) then raise exception '교육 완료한 활동 인원만 배정할 수 있습니다.'; end if;
 gid:=(payload->>'group_id')::uuid;
 if not exists(select 1 from public.groups g join public.cycles c on c.id=g.cycle_id where g.id=gid and c.ends_on is null and c.starts_on<=current_date) then raise exception '활동 중인 소그룹이 아닙니다.'; end if;
 if exists(select 1 from public.memberships where person_id=pid and ends_on is null and starts_on=current_date) then raise exception '오늘 이미 배정된 인원입니다. 같은 날 재이동은 별도 검토가 필요합니다.'; end if;
 update public.memberships set ends_on=current_date-1 where person_id=pid and ends_on is null;
 insert into public.memberships(person_id,group_id,starts_on) values(pid,gid,current_date);
 insert into public.timeline(person_id,action,reason,author_id) values(pid,'소그룹 배정',gid::text,me);
 elsif action='plan.save' then
 if not app_private.has_role(array['secretary2']) then raise exception '편성 담당자만 작성할 수 있습니다.' using errcode='42501'; end if;
 perform app_private.validate_assignments(payload->'assignments');
 insert into public.plans(name,assignments,fixed,author_id) values(trim(payload->>'name'),payload->'assignments',coalesce(payload->'fixed','{}'),me) returning id into rid;
 elsif action='plan.schedule' then
 if not app_private.has_role(array['secretary2','pastor']) then raise exception '예약 권한이 없습니다.' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(116518);
 if (payload->>'day')::date<=current_date then raise exception '내일 이후의 적용일을 지정하세요.'; end if;
 if exists(select 1 from public.plans where state='scheduled') then raise exception '이미 예약이 있습니다. 취소 후 다시 예약하세요.'; end if;
 perform app_private.validate_assignments((select assignments from public.plans where id=(payload->>'id')::uuid and state='draft'));
 update public.plans set state='scheduled',apply_on=(payload->>'day')::date where id=(payload->>'id')::uuid and state='draft';
 if not found then raise exception '예약 가능한 초안이 아닙니다.'; end if;
 elsif action='plan.cancel' then
 if not app_private.has_role(array['secretary2','pastor']) then raise exception '취소 권한이 없습니다.' using errcode='42501'; end if;
 update public.plans set state='cancelled' where id=(payload->>'id')::uuid and state in ('draft','scheduled','failed');
 elsif action='cycle.end' then
 if not app_private.has_role(array['pastor','secretary2']) then raise exception '종료 권한이 없습니다.' using errcode='42501'; end if;
 if exists(select 1 from public.plans where state='scheduled') then raise exception '예약을 먼저 취소하세요.'; end if;
 update public.cycles set ends_on=current_date where id=(payload->>'id')::uuid and ends_on is null;
 update public.memberships set ends_on=current_date where group_id in(select id from public.groups where cycle_id=(payload->>'id')::uuid) and ends_on is null;
 elsif action='event.save' then
 if not (app_private.officer() or app_private.has_role(array['pastor'])) then raise exception '행사 관리 권한이 없습니다.' using errcode='42501'; end if;
 if coalesce(payload->>'poster','')<>'' and not (payload->>'poster' ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$') then raise exception 'PNG/JPEG/WebP 이미지만 사용하세요.'; end if;
 if nullif(payload->>'id','') is null then
 insert into public.events(title,description,day,location,category,poster) values(trim(payload->>'title'),payload->>'description',(payload->>'day')::date,payload->>'location',payload->>'category',coalesce(payload->>'poster','')) returning id into rid;
 else
 update public.events set title=trim(payload->>'title'),description=payload->>'description',day=(payload->>'day')::date,location=payload->>'location',category=payload->>'category',poster=coalesce(payload->>'poster',''),version=version+1 where id=(payload->>'id')::uuid and version=(payload->>'version')::int;
 if not found then raise exception '행사가 변경됐습니다. 다시 조회하세요.'; end if;
 end if;
 elsif action='club.save' then
 if not (app_private.officer() or app_private.has_role(array['pastor'])) then raise exception '동아리 관리 권한이 없습니다.' using errcode='42501'; end if;
 insert into public.clubs(name,description,schedule) values(trim(payload->>'name'),payload->>'description',payload->>'schedule') returning id into rid;
 elsif action='invite.create' then
 if not app_private.has_role(array['pastor','newcomer']) then raise exception '초대 권한이 없습니다.' using errcode='42501'; end if;
 if app_private.has_role(array['newcomer']) and not app_private.has_role(array['pastor']) and app_private.educated(pid) then raise exception '새가족반은 교육 중인 새가족만 초대할 수 있습니다.' using errcode='42501'; end if;
 if exists(select 1 from public.profiles where person_id=pid) or not exists(select 1 from public.people where id=pid) then raise exception '이미 계정이 있거나 인원이 없습니다.'; end if;
 token:=encode(extensions.gen_random_bytes(32),'hex');
 insert into public.invites(person_id,token_hash,created_by) values(pid,encode(extensions.digest(token,'sha256'),'hex'),me);
 return jsonb_build_object('token',token);
 else raise exception '지원하지 않는 작업입니다.'; end if;
 insert into public.audit(actor_id,action,target) values(me,action,coalesce(pid::text,rid::text,payload->>'id',payload->>'group_id'));
 return jsonb_build_object('id',rid,'ok',true);
end $$;
