-- 0002_match_function: RPC used by the match-pros Edge Function.

create or replace function public.find_pros_for_job(p_job_id uuid)
returns table(profile_id uuid, pro_id uuid, distance_m double precision)
language sql stable security definer set search_path = public as $$
  select p.profile_id, p.id as pro_id,
         st_distance(j.geo, p.base_geo) as distance_m
  from public.jobs j
  join public.professionals p
    on p.is_active = true
   and p.kvk_verified_at is not null
   and (j.category_id::text = any(p.services_offered) or j.category_id is null)
   and (j.geo is null or p.base_geo is null or st_dwithin(j.geo, p.base_geo, p.service_radius_km * 1000))
  where j.id = p_job_id
    and j.status = 'pending'
  order by distance_m nulls last
  limit 50;
$$;

revoke all on function public.find_pros_for_job(uuid) from public;
grant execute on function public.find_pros_for_job(uuid) to service_role;
