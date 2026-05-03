-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Places Table
create table public.places (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  description text,
  location_area text not null,
  duration_mins integer default 60,
  google_maps_url text,
  image_url text,
  tags text[],
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.places enable row level security;
create policy "Places are viewable by everyone." on public.places for select using (true);
create policy "Authenticated users can insert places." on public.places for insert with check (auth.role() = 'authenticated');

-- 3. Plans Table (Jadwals)
create table public.plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  date date not null,
  start_time time not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.plans enable row level security;
create policy "Public plans are viewable by everyone." on public.plans for select using (is_public = true);
create policy "Users can view their own plans." on public.plans for select using (auth.uid() = user_id);
create policy "Users can insert their own plans." on public.plans for insert with check (auth.uid() = user_id);
create policy "Users can update their own plans." on public.plans for update using (auth.uid() = user_id);
create policy "Users can delete their own plans." on public.plans for delete using (auth.uid() = user_id);

-- 4. Plan Stops Table
create table public.plan_stops (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.plans(id) on delete cascade not null,
  place_id uuid references public.places(id) not null,
  arrival_time text not null,
  duration_mins integer default 60,
  notes text,
  order_index integer not null
);

alter table public.plan_stops enable row level security;
create policy "Stops are viewable if plan is viewable." on public.plan_stops for select using (
  exists (select 1 from public.plans where plans.id = plan_stops.plan_id and (plans.is_public = true or plans.user_id = auth.uid()))
);
create policy "Users can manage stops for their plans." on public.plan_stops for all using (
  exists (select 1 from public.plans where plans.id = plan_stops.plan_id and plans.user_id = auth.uid())
);
