-- Allow users to INSERT their own profile if it's missing (e.g. legacy users or failed trigger)
create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);
