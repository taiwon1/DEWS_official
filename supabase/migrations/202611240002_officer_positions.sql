create table public.officer_positions (
 person_id uuid not null references public.people(id),
 position text not null check(position in ('president1','secretary1','president2','secretary2','pd','treasurer','clerk')),
 primary key(person_id,position)
);
alter table public.officer_positions enable row level security;
revoke all on public.officer_positions from public, anon, authenticated;

create function public.officer_roster() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not app_private.has_role(array['pastor']) then raise exception '최고 관리자만 임원 명단을 관리할 수 있습니다.' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('person_id',person_id,'position',position)) from public.officer_positions),'[]');
end $$;

create function public.save_officer_positions(target uuid, positions text[]) returns void
language plpgsql security definer set search_path='' as $$
declare candidate public.people;
begin
 if not app_private.has_role(array['pastor']) then raise exception '최고 관리자만 임원을 변경할 수 있습니다.' using errcode='42501'; end if;
 if positions is null or array_position(positions,null) is not null or not positions <@ array['president1','secretary1','president2','secretary2','pd','treasurer','clerk'] then raise exception '정해진 직책만 선택하세요.'; end if;
 select * into candidate from public.people where id=target for update;
 if not found or (cardinality(positions)>0 and (candidate.status<>'enrolled' or not candidate.full_member)) then raise exception '정회원만 임원으로 지정할 수 있습니다.'; end if;
 delete from public.officer_positions where person_id=target;
 insert into public.officer_positions select target, p from (select distinct unnest(positions) as p) selected;
 update public.profiles set roles=case when cardinality(positions)>0 then
   array(select distinct unnest(roles||array['officer']))
   else coalesce(nullif(array_remove(roles,'officer'),'{}'),array['member']) end
 where person_id=target;
 insert into public.audit(actor_id,action,target) values(app_private.me(),'officer.positions',target::text);
end $$;

create function app_private.apply_officer_on_join() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.officer_positions where person_id=new.person_id)
 and exists(select 1 from public.people where id=new.person_id and status='enrolled' and full_member)
 and not ('officer'=any(new.roles)) then new.roles:=new.roles||array['officer']; end if;
 return new;
end $$;
create trigger apply_officer_on_join before insert on public.profiles
for each row execute function app_private.apply_officer_on_join();

create function app_private.clear_ineligible_officer() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status<>'enrolled' or not new.full_member then
   delete from public.officer_positions where person_id=new.id;
   update public.profiles set roles=coalesce(nullif(array_remove(roles,'officer'),'{}'),array['member'])
    where person_id=new.id and 'officer'=any(roles);
 end if;
 return new;
end $$;
create trigger clear_ineligible_officer after update of status,full_member on public.people
for each row execute function app_private.clear_ineligible_officer();

revoke all on function public.officer_roster(), public.save_officer_positions(uuid,text[]) from public, anon;
revoke all on function app_private.apply_officer_on_join(), app_private.clear_ineligible_officer() from public, anon, authenticated;
grant execute on function public.officer_roster(), public.save_officer_positions(uuid,text[]) to authenticated;
create function app_private.check_officer_profile() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if 'officer'=any(new.roles) and not ('officer'=any(old.roles)) and
    not exists(select 1 from public.people where id=new.person_id and status='enrolled' and full_member) then
   raise exception '정회원만 임원으로 지정할 수 있습니다.';
 end if;
 if not ('officer'=any(new.roles)) and exists(select 1 from public.officer_positions where person_id=new.person_id) then
   raise exception '임원 관리에서 직책을 해제하세요.';
 end if;
 return new;
end $$;
create trigger check_officer_profile before update of roles on public.profiles
for each row execute function app_private.check_officer_profile();
revoke all on function app_private.check_officer_profile() from public, anon, authenticated;
