
create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table public.books (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (btrim(title) <> ''),
 author text not null check (btrim(author) <> ''),
 isbn text,
 external_source text,
 external_id text,
 created_at timestamptz not null default now(),
 unique(user_id,id),
 unique(user_id,external_source,external_id)
);
create table public.user_books (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 book_id uuid not null,
 status text not null default 'saved' check(status in ('saved','reading','finished')),
 progress numeric check(progress between 0 and 100),
 rating smallint check(rating between 0 and 5),
 date_read date,
 date_added date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,id),
 unique(user_id,book_id),
 foreign key(user_id,book_id) references public.books(user_id,id) on delete cascade
);
create table public.highlights (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 user_book_id uuid not null,
 content text not null check(btrim(content)<>''),
 location text,
 favorite boolean not null default false,
 source text not null default 'manual',
 source_id text,
 source_date text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,id),
 unique(user_id,id,user_book_id),
 foreign key(user_id,user_book_id) references public.user_books(user_id,id) on delete cascade
);
create unique index highlights_source_id_idx on public.highlights(user_id,source,source_id) where source_id is not null;
create index highlights_book_idx on public.highlights(user_id,user_book_id);
create table public.connections (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 left_highlight_id uuid not null,
 right_highlight_id uuid not null,
 left_user_book_id uuid not null,
 right_user_book_id uuid not null,
 state text not null default 'suggested' check(state in ('suggested','saved','dismissed')),
 relation text check(relation in ('agreement','contrast','complement','recurring_question','other')),
 ai_interpretation text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,id),
 check(left_highlight_id<>right_highlight_id and left_user_book_id<>right_user_book_id),
 check(state<>'saved' or relation is not null),
 foreign key(user_id,left_highlight_id,left_user_book_id) references public.highlights(user_id,id,user_book_id) on delete cascade,
 foreign key(user_id,right_highlight_id,right_user_book_id) references public.highlights(user_id,id,user_book_id) on delete cascade
);
create unique index connections_pair_idx on public.connections(user_id,least(left_highlight_id,right_highlight_id),greatest(left_highlight_id,right_highlight_id));
create index connections_left_idx on public.connections(user_id,left_highlight_id,left_user_book_id);
create index connections_right_idx on public.connections(user_id,right_highlight_id,right_user_book_id);
create table public.notes (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 user_book_id uuid,
 highlight_id uuid,
 connection_id uuid,
 content text not null check(btrim(content)<>''),
 kind text not null default 'reflection' check(kind in ('reflection','review','private_note')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(num_nonnulls(user_book_id,highlight_id,connection_id)=1),
 foreign key(user_id,user_book_id) references public.user_books(user_id,id) on delete cascade,
 foreign key(user_id,highlight_id) references public.highlights(user_id,id) on delete cascade,
 foreign key(user_id,connection_id) references public.connections(user_id,id) on delete cascade
);
create index notes_book_idx on public.notes(user_id,user_book_id);
create index notes_highlight_idx on public.notes(user_id,highlight_id);
create index notes_connection_idx on public.notes(user_id,connection_id);
create extension if not exists vector with schema extensions;
create table public.embeddings (
 user_id uuid not null references auth.users(id) on delete cascade,
 highlight_id uuid not null,
 model text not null check(btrim(model)<>''),
 content_hash text not null,
 embedding extensions.vector not null,
 created_at timestamptz not null default now(),
 primary key(user_id,highlight_id,model),
 foreign key(user_id,highlight_id) references public.highlights(user_id,id) on delete cascade
);
create table public.conversations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text,
 created_at timestamptz not null default now(),
 unique(user_id,id)
);
create table public.messages (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 conversation_id uuid not null,
 role text not null check(role in ('reader','assistant')),
 content text not null check(btrim(content)<>''),
 created_at timestamptz not null default now(),
 foreign key(user_id,conversation_id) references public.conversations(user_id,id) on delete cascade
);
create index messages_conversation_idx on public.messages(user_id,conversation_id,created_at,id);
create table public.reading_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 ai_enabled boolean not null default false,
 share_notes_with_ai boolean not null default false,
 reminders_enabled boolean not null default false,
 reminder_time time,
 timezone text,
 lock_screen_preview boolean not null default false,
 updated_at timestamptz not null default now()
);
do $$
declare t text;
begin
 foreach t in array array['profiles','books','user_books','highlights','notes','connections','embeddings','conversations','messages','reading_preferences']
 loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public, anon, authenticated',t);
  execute format('grant select, insert, update, delete on public.%I to authenticated',t);
  execute format('create policy owner_select on public.%I for select to authenticated using (user_id = (select auth.uid()))',t);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',t);
  execute format('create policy owner_update on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',t);
  execute format('create policy owner_delete on public.%I for delete to authenticated using (user_id = (select auth.uid()))',t);
 end loop;
end $$;
-- Embeddings are derived data and must be generated by a trusted server, not written by public clients.
revoke insert, update, delete on public.embeddings from authenticated;

