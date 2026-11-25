CREATE OR REPLACE FUNCTION public.save_library(p_user_id uuid, p_revision bigint, p_library jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
 rev bigint;
 item jsonb; 
 b_id uuid; ub_id uuid; h_id uuid; l_id uuid; r_id uuid; l_book uuid; r_book uuid; c_id uuid;
 slot text; note_text text; note_kind text;
begin
 if p_user_id is null or (select auth.uid()) is distinct from p_user_id then raise exception 'Unauthorized' using errcode='42501'; end if;
 if p_revision is null or p_revision<0 or p_library is null or pg_column_size(p_library)>16000000 or
 jsonb_typeof(p_library->'books') is distinct from 'array' or jsonb_typeof(p_library->'highlights') is distinct from 'array' or
 jsonb_typeof(coalesce(p_library->'connections','[]'::jsonb)) is distinct from 'array' then raise exception 'Invalid or oversized library' using errcode='22023'; end if;
 insert into public.profiles(user_id) values(p_user_id) on conflict(user_id) do nothing;
 select library_revision into rev from public.profiles where user_id=p_user_id for update;
 if rev is distinct from p_revision then raise exception 'Library changed on another device. Reload before saving.' using errcode='40001'; end if;
 -- Current mobile client does not delete books or highlights. Reject omissions rather than treating them as deletions.
 if exists(select 1 from public.books b where b.user_id=p_user_id and not exists(select 1 from jsonb_array_elements(p_library->'books') a where a->>'id'=b.client_id))
 or exists(select 1 from public.highlights h where h.user_id=p_user_id and not exists(select 1 from jsonb_array_elements(p_library->'highlights') a where a->>'id'=h.client_id))
 or exists(select 1 from public.connections c join public.highlights l on l.user_id=c.user_id and l.id=c.left_highlight_id join public.highlights r on r.user_id=c.user_id and r.id=c.right_highlight_id where c.user_id=p_user_id and c.state in ('saved','dismissed') and not exists(select 1 from jsonb_array_elements(coalesce(p_library->'connections','[]'::jsonb)) a where (a->>'leftId'=l.client_id and a->>'rightId'=r.client_id) or (a->>'leftId'=r.client_id and a->>'rightId'=l.client_id))) then
 raise exception 'Library is incomplete. Reload before saving.' using errcode='22023'; end if;
 for item in select value from jsonb_array_elements(p_library->'books') loop
  if nullif(item->>'id','') is null then raise exception 'Missing book ID' using errcode='22023'; end if;
  insert into public.books(user_id,client_id,title,author,isbn,cover_color,about,external_source,external_id)
   values(p_user_id,item->>'id',item->>'title',item->>'author',item->>'isbn',coalesce(item->>'color','#45464D'),coalesce(item->>'about',''),item->>'source',case when item->>'source'='goodreads' then regexp_replace(item->>'id','^goodreads-','') end)
   on conflict(user_id,client_id) do update set title=excluded.title,author=excluded.author,isbn=excluded.isbn,cover_color=excluded.cover_color,about=excluded.about,external_source=excluded.external_source,external_id=excluded.external_id returning id into b_id;
  insert into public.user_books(user_id,book_id,status,progress,rating,date_read,date_added)
   values(p_user_id,b_id,lower(item->>'status'),(item->>'progress')::numeric,case when trunc(nullif(btrim(item->>'rating'),'')::numeric) = nullif(btrim(item->>'rating'),'')::numeric then nullif(btrim(item->>'rating'),'')::numeric::smallint else nullif(btrim(item->>'rating'),'')::smallint end,nullif(replace(item->>'dateRead','/','-'),'')::date,nullif(replace(item->>'dateAdded','/','-'),'')::date)
   on conflict(user_id,book_id) do update set status=excluded.status,progress=excluded.progress,rating=excluded.rating,date_read=excluded.date_read,date_added=excluded.date_added,updated_at=now() returning id into ub_id;
  foreach note_kind in array array['review','private_note'] loop
   slot:=note_kind||':'||(item->>'id'); note_text:=case note_kind when 'review' then item->>'review' else item->>'privateNote' end;
   if nullif(btrim(note_text),'') is not null then
    insert into public.notes(user_id,user_book_id,kind,content,client_slot) values(p_user_id,ub_id,note_kind,note_text,slot)
    on conflict(user_id,client_slot) do update set content=excluded.content,updated_at=now();
   else delete from public.notes where user_id=p_user_id and client_slot=slot; end if;
  end loop;
 end loop;
 for item in select value from jsonb_array_elements(p_library->'highlights') loop
  if nullif(item->>'id','') is null then raise exception 'Missing highlight ID' using errcode='22023'; end if;
  select ub.id into strict ub_id from public.user_books ub join public.books b on b.user_id=ub.user_id and b.id=ub.book_id where ub.user_id=p_user_id and b.client_id=item->>'bookId';
  insert into public.highlights(user_id,client_id,user_book_id,content,location,favorite,source,source_id,source_date,created_at)
   values(p_user_id,item->>'id',ub_id,item->>'text',item->>'location',coalesce((item->>'favorite')::boolean,false),coalesce(item->>'source','manual'),item->>'sourceId',item->>'sourceDate',(item->>'createdAt')::timestamptz)
   on conflict(user_id,client_id) do update set content=excluded.content,location=excluded.location,favorite=excluded.favorite,source=excluded.source,source_id=excluded.source_id,source_date=excluded.source_date,updated_at=now()
   where public.highlights.user_book_id=excluded.user_book_id returning id into h_id;
  if h_id is null then raise exception 'Highlight book cannot be reassigned' using errcode='22023'; end if;
  slot:='highlight:'||(item->>'id'); note_text:=item->>'note';
  if nullif(btrim(note_text),'') is not null then
   insert into public.notes(user_id,highlight_id,kind,content,client_slot) values(p_user_id,h_id,'reflection',note_text,slot)
   on conflict(user_id,client_slot) do update set content=excluded.content,updated_at=now();
  else delete from public.notes where user_id=p_user_id and client_slot=slot; end if;
 end loop;
 for item in select value from jsonb_array_elements(coalesce(p_library->'connections','[]'::jsonb)) loop
  select id,user_book_id into strict l_id,l_book from public.highlights where user_id=p_user_id and client_id=item->>'leftId';
  select id,user_book_id into strict r_id,r_book from public.highlights where user_id=p_user_id and client_id=item->>'rightId';
  if item->>'state' not in ('saved','dismissed') or item->>'state' is null then raise exception 'Invalid connection state' using errcode='22023'; end if;
  insert into public.connections(user_id,left_highlight_id,right_highlight_id,left_user_book_id,right_user_book_id,state,relation,created_at)
   values(p_user_id,l_id,r_id,l_book,r_book,item->>'state',case when item->>'state'='saved' then replace(lower(item->>'relation'),' ','_') end,(item->>'createdAt')::timestamptz)
   on conflict(user_id,(least(left_highlight_id,right_highlight_id)),(greatest(left_highlight_id,right_highlight_id))) do update set state=excluded.state,relation=excluded.relation,updated_at=now() returning id into c_id;
  slot:='connection:'||c_id::text; note_text:=case when item->>'state'='saved' then item->>'reflection' end;
  if nullif(btrim(note_text),'') is not null then
   insert into public.notes(user_id,connection_id,kind,content,client_slot) values(p_user_id,c_id,'reflection',note_text,slot)
   on conflict(user_id,client_slot) do update set content=excluded.content,updated_at=now();
  else delete from public.notes where user_id=p_user_id and client_slot=slot; end if;
 end loop;
 update public.profiles set library_revision=rev+1 where user_id=p_user_id;
 return public.read_library(p_user_id);
end $function$;

