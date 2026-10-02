create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  role text not null default 'librarian' check (role in ('librarian', 'computer_manager'))
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  category text not null default 'General',
  total integer not null default 1 check (total >= 0),
  available integer not null default 1 check (available >= 0 and available <= total),
  book_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  photo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('S1', 'S2', 'S3', 'S4', 'S5', 'S6')),
  combination text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level, combination)
);

create table if not exists public.computers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serial_number text not null unique,
  type text not null default 'computer' check (type in ('computer', 'cable')),
  total integer not null default 1 check (total >= 0),
  available integer not null default 1 check (available >= 0 and available <= total),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.borrows (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  due_date date not null,
  status text not null default 'borrowed' check (status in ('borrowed', 'returned')),
  date timestamptz not null default now()
);

create table if not exists public.borrow_items (
  id uuid primary key default gen_random_uuid(),
  borrow_id uuid not null references public.borrows(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  title text not null,
  quantity integer not null default 1 check (quantity > 0),
  returned integer not null default 0 check (returned >= 0 and returned <= quantity)
);

create table if not exists public.computer_borrows (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  due_date date not null,
  status text not null default 'borrowed' check (status in ('borrowed', 'returned')),
  date timestamptz not null default now()
);

create table if not exists public.computer_borrow_items (
  id uuid primary key default gen_random_uuid(),
  computer_borrow_id uuid not null references public.computer_borrows(id) on delete cascade,
  computer_id uuid not null references public.computers(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  returned integer not null default 0 check (returned >= 0 and returned <= quantity)
);

create index if not exists borrow_items_borrow_id_idx on public.borrow_items(borrow_id);
create index if not exists computer_borrow_items_borrow_id_idx on public.computer_borrow_items(computer_borrow_id);
create index if not exists borrows_teacher_id_idx on public.borrows(teacher_id);
create index if not exists computer_borrows_teacher_id_idx on public.computer_borrows(teacher_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at before update on public.books for each row execute function public.set_updated_at();
drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at before update on public.teachers for each row execute function public.set_updated_at();
drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at before update on public.classes for each row execute function public.set_updated_at();
drop trigger if exists computers_set_updated_at on public.computers;
create trigger computers_set_updated_at before update on public.computers for each row execute function public.set_updated_at();

create or replace function public.create_book_borrow(p_teacher_id uuid, p_books jsonb, p_due_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borrow_id uuid := gen_random_uuid();
  v_line jsonb;
  v_book_id uuid;
  v_quantity integer;
  v_title text;
begin
  if not exists (select 1 from teachers where id = p_teacher_id) then
    raise exception 'Teacher not found' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_books) <> 'array' or jsonb_array_length(p_books) = 0 then
    raise exception 'At least one book is required' using errcode = 'P0001';
  end if;

  insert into borrows (id, teacher_id, due_date) values (v_borrow_id, p_teacher_id, p_due_date);
  for v_line in select value from jsonb_array_elements(p_books)
  loop
    v_book_id := (v_line->>'bookId')::uuid;
    v_quantity := greatest(coalesce((v_line->>'quantity')::integer, 1), 1);
    select title into v_title from books where id = v_book_id and available >= v_quantity for update;
    if not found then
      if not exists (select 1 from books where id = v_book_id) then
        raise exception 'Book not found' using errcode = 'P0001';
      end if;
      raise exception 'Not enough stock available' using errcode = 'P0001';
    end if;
    update books set available = available - v_quantity where id = v_book_id;
    insert into borrow_items (borrow_id, book_id, title, quantity)
    values (v_borrow_id, v_book_id, v_title, v_quantity);
  end loop;
  return v_borrow_id;
end;
$$;

create or replace function public.return_book_borrow(p_borrow_id uuid, p_returns jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line jsonb;
  v_book_id uuid;
  v_quantity integer;
  v_item_quantity integer;
  v_returned integer;
  v_delta integer;
begin
  if not exists (select 1 from borrows where id = p_borrow_id) then
    raise exception 'Borrow transaction not found' using errcode = 'P0001';
  end if;
  for v_line in select value from jsonb_array_elements(coalesce(p_returns, '[]'::jsonb))
  loop
    v_book_id := (v_line->>'bookId')::uuid;
    v_quantity := greatest(coalesce((v_line->>'quantity')::integer, 0), 0);
    select quantity, returned into v_item_quantity, v_returned
      from borrow_items where borrow_id = p_borrow_id and book_id = v_book_id for update;
    if not found then
      raise exception 'Book entry not in borrow' using errcode = 'P0001';
    end if;
    v_delta := least(v_quantity, v_item_quantity - v_returned);
    if v_delta > 0 then
      update borrow_items set returned = returned + v_delta where borrow_id = p_borrow_id and book_id = v_book_id;
      update books set available = least(total, available + v_delta) where id = v_book_id;
    end if;
  end loop;
  update borrows set status = case
    when not exists (select 1 from borrow_items where borrow_id = p_borrow_id and returned < quantity) then 'returned'
    else 'borrowed'
  end where id = p_borrow_id;
  return p_borrow_id;
end;
$$;

create or replace function public.create_computer_borrow(p_teacher_id uuid, p_items jsonb, p_due_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borrow_id uuid := gen_random_uuid();
  v_line jsonb;
  v_computer_id uuid;
  v_quantity integer;
  v_name text;
begin
  if not exists (select 1 from teachers where id = p_teacher_id) then
    raise exception 'Teacher not found' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one item is required' using errcode = 'P0001';
  end if;

  insert into computer_borrows (id, teacher_id, due_date) values (v_borrow_id, p_teacher_id, p_due_date);
  for v_line in select value from jsonb_array_elements(p_items)
  loop
    v_computer_id := (v_line->>'computerId')::uuid;
    v_quantity := greatest(coalesce((v_line->>'quantity')::integer, 1), 1);
    select name into v_name from computers where id = v_computer_id and available >= v_quantity for update;
    if not found then
      if not exists (select 1 from computers where id = v_computer_id) then
        raise exception 'Item not found' using errcode = 'P0001';
      end if;
      raise exception 'Not enough stock available' using errcode = 'P0001';
    end if;
    update computers set available = available - v_quantity where id = v_computer_id;
    insert into computer_borrow_items (computer_borrow_id, computer_id, quantity)
    values (v_borrow_id, v_computer_id, v_quantity);
  end loop;
  return v_borrow_id;
end;
$$;

create or replace function public.return_computer_borrow(p_borrow_id uuid, p_returns jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line jsonb;
  v_computer_id uuid;
  v_quantity integer;
  v_item_quantity integer;
  v_returned integer;
  v_delta integer;
begin
  if not exists (select 1 from computer_borrows where id = p_borrow_id) then
    raise exception 'Borrow transaction not found' using errcode = 'P0001';
  end if;
  for v_line in select value from jsonb_array_elements(coalesce(p_returns, '[]'::jsonb))
  loop
    v_computer_id := (v_line->>'computerId')::uuid;
    v_quantity := greatest(coalesce((v_line->>'quantity')::integer, 0), 0);
    select quantity, returned into v_item_quantity, v_returned
      from computer_borrow_items where computer_borrow_id = p_borrow_id and computer_id = v_computer_id for update;
    if not found then
      raise exception 'Item entry not in borrow record' using errcode = 'P0001';
    end if;
    v_delta := least(v_quantity, v_item_quantity - v_returned);
    if v_delta > 0 then
      update computer_borrow_items set returned = returned + v_delta
        where computer_borrow_id = p_borrow_id and computer_id = v_computer_id;
      update computers set available = least(total, available + v_delta) where id = v_computer_id;
    end if;
  end loop;
  update computer_borrows set status = case
    when not exists (select 1 from computer_borrow_items where computer_borrow_id = p_borrow_id and returned < quantity) then 'returned'
    else 'borrowed'
  end where id = p_borrow_id;
  return p_borrow_id;
end;
$$;

alter table public.admins enable row level security;
alter table public.books enable row level security;
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.computers enable row level security;
alter table public.borrows enable row level security;
alter table public.borrow_items enable row level security;
alter table public.computer_borrows enable row level security;
alter table public.computer_borrow_items enable row level security;

grant all on table public.admins, public.books, public.teachers, public.classes, public.computers,
  public.borrows, public.borrow_items, public.computer_borrows, public.computer_borrow_items to service_role;

revoke all on function public.create_book_borrow(uuid, jsonb, date) from public, anon, authenticated;
revoke all on function public.return_book_borrow(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.create_computer_borrow(uuid, jsonb, date) from public, anon, authenticated;
revoke all on function public.return_computer_borrow(uuid, jsonb) from public, anon, authenticated;

grant execute on function public.create_book_borrow(uuid, jsonb, date) to service_role;
grant execute on function public.return_book_borrow(uuid, jsonb) to service_role;
grant execute on function public.create_computer_borrow(uuid, jsonb, date) to service_role;
grant execute on function public.return_computer_borrow(uuid, jsonb) to service_role;
