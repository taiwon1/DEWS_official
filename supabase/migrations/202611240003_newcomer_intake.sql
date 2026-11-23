create table app_private.newcomer_intake (
  person_id uuid primary key references public.people(id) on delete cascade,
  introducer text check (length(introducer) <= 100),
  remarks text check (length(remarks) <= 2000)
);

create function public.register_newcomer(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  result jsonb;
  introducer text := nullif(trim(payload->>'introducer'), '');
  remarks text := nullif(trim(payload->>'remarks'), '');
begin
  result := public.app_action('person.create', payload - 'introducer' - 'remarks');
  if introducer is not null or remarks is not null then
    insert into app_private.newcomer_intake values ((result->>'id')::uuid, introducer, remarks);
  end if;
  return result;
end;
$$;

create function public.read_newcomer_intake(person uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('introducer', i.introducer, 'remarks', i.remarks)
  from app_private.newcomer_intake i
  where i.person_id = person and
    (app_private.has_role(array['pastor']) or app_private.new_scope(person));
$$;

revoke all on app_private.newcomer_intake from public, anon, authenticated;
revoke all on function public.register_newcomer(jsonb), public.read_newcomer_intake(uuid) from public, anon;
grant execute on function public.register_newcomer(jsonb), public.read_newcomer_intake(uuid) to authenticated;
