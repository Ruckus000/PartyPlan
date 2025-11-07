Awesome—let’s turn that mockup into a tiny, cheap, real-world React Native app plan you can spin up fast. I’ll keep this laser-focused, with copy-paste bits you can drop in today.

MVP goal (v0.1, 1–2 evenings)

A simple festival companion where a small squad can:
• See the event timeline (stages → artists → times)
• Add artists or meeting points (locally)
• See where friends say they’ll be (basic real-time presence)
• Do all of the above with no custom backend—just Supabase (auth + DB + realtime)

⸻

Tech Stack (ultra-light)
• React Native (Expo) — easiest CI-free start.
• react-navigation — simple tabs. (Avoids the Expo Router issues you hit.)
• Zustand — tiny global state.
• Supabase JS — auth + Postgres + Realtime (broadcast + row changes).
• AsyncStorage — offline cache / local-first editing.
• (Optional) Tamagui or NativeWind — if you want a Shadcn-ish feel later. Start with StyleSheet to keep it lean.

⸻

App structure (tabs + 3 screens)

/app
/src
/components
/screens
TimelineScreen.tsx
SquadScreen.tsx
MapScreen.tsx
/data
seedLineup.ts // JSON seed for stages/artists/sets
/lib
supabase.ts
store.ts // Zustand store
presence.ts // presence helpers
App.tsx

⸻

Data model (Supabase)

Keep it minimal. One organization concept: squad; users join via short invite code. Presence is ephemeral.

Tables 1. profiles

    •	id uuid pk (auth.uid)
    •	display_name text
    •	emoji text (two-letter badge like “ME”, “SC”)
    •	color text  (accent)
    •	created_at timestamptz

    2.	squads

    •	id uuid pk default gen_random_uuid()
    •	name text
    •	invite_code text unique (e.g., 6 chars)
    •	created_by uuid (profiles.id)
    •	created_at timestamptz

    3.	squad_members

    •	squad_id uuid fk -> squads.id
    •	profile_id uuid fk -> profiles.id
    •	role text (‘owner’ | ‘member’)
    •	PK (squad_id,profile_id)

    4.	sets

(static for an event; seed once, can be local too)

    •	id uuid pk
    •	day date (or text)
    •	start_at timestamptz
    •	end_at timestamptz
    •	stage text   // Kinetic Field, etc.
    •	artist text
    •	slug text unique  // convenience

    5.	plans

(what the squad plans to attend / meeting points)

    •	id uuid pk
    •	squad_id uuid
    •	created_by uuid
    •	type text (‘set’ | ‘meetup’)
    •	set_id uuid null  // when type=‘set’
    •	meet_time timestamptz null
    •	meet_location text null
    •	note text null
    •	created_at timestamptz

    6.	presence

(lightweight “where I am/going next”, updated often; not historized)

    •	profile_id uuid pk
    •	squad_id uuid
    •	now_label text        // e.g., “Porter Robinson”
    •	now_stage text
    •	now_window text       // “9:00–10:00 PM”
    •	status text           // online | busy | offline | lost
    •	next_label text null  // e.g., “Meeting point 10:00 PM”
    •	updated_at timestamptz

You can skip sets server-side completely and ship it purely local as JSON for the first night. Then add server sync later.

RLS (row-level security)
Enable RLS on all tables. Policies (pseudo-SQL you can paste in Supabase SQL editor):

-- Everyone must be authenticated
create policy "auth read own profile" on profiles
for select using (auth.uid() = id);
create policy "auth upsert own profile" on profiles
for insert with check (auth.uid() = id)
, for update using (auth.uid() = id);

-- Squad membership gate
create policy "squad readable to members" on squads
for select using (
exists (select 1 from squad_members m
where m.squad_id = id and m.profile_id = auth.uid())
);

create policy "memberships read-write self" on squad_members
for select using (profile_id = auth.uid())
, for insert with check (profile_id = auth.uid())
, for delete using (profile_id = auth.uid());

-- Plans visible to squad members
create policy "plans squad read" on plans
for select using (
exists (select 1 from squad_members m
where m.squad_id = plans.squad_id and m.profile_id = auth.uid())
);
create policy "plans create by member" on plans
for insert with check (
exists (select 1 from squad_members m
where m.squad_id = squad_id and m.profile_id = auth.uid())
);
create policy "plans update own or owner" on plans
for update using (
created_by = auth.uid() OR
exists (select 1 from squad_members m
where m.squad_id = plans.squad_id and m.profile_id = auth.uid() and m.role = 'owner')
);

-- Presence: each user controls their row; squad can read
create policy "presence read squad" on presence
for select using (
exists (select 1 from squad_members m
where m.squad_id = presence.squad_id and m.profile_id = auth.uid())
);
create policy "presence upsert self" on presence
for insert with check (profile_id = auth.uid())
, for update using (profile_id = auth.uid());

⸻

Auth flow (cheap & reliable)
• Email OTP (magic link) with Supabase.
• On first open, let the user choose a display name + emoji and either:
• Create squad → generates invite_code
• Join squad → enter invite_code

If cell service is rough, allow Local-only Mode that works without login and lets the user export a squad code later to sync—simple toggle in Settings.

⸻

Realtime presence (2 lines of code thinking)

Use Supabase Realtime two ways: 1. Table changes on presence and plans for persistent updates. 2. Broadcast channel (ephemeral) for super-quick “I just moved to Stage X” pings without writes every tap.

// presence.ts
import { supabase } from './supabase';

export function subscribePresence(squadId: string, onChange: (rows:any[]) => void) {
return supabase
.channel(`presence:${squadId}`)
.on('postgres_changes',
{ event: '*', schema: 'public', table: 'presence', filter: `squad_id=eq.${squadId}` },
() => refresh()) // requery or just patch the row
.subscribe();

async function refresh() {
const { data } = await supabase.from('presence')
.select('*').eq('squad_id', squadId);
onChange(data ?? []);
}
}

Broadcast (optional):

const chan = supabase.channel(`squad:${squadId}`, { config: { broadcast: { ack: true } }});
chan.subscribe();
chan.send({ type:'broadcast', event:'jump', payload:{ stage:'Circuit Grounds', at: Date.now() }});
chan.on('broadcast', { event:'jump' }, ({ payload }) => {/_ update UI fast _/});

⸻

Local-first strategy (works offline)
• Cache sets, plans, and last presence in AsyncStorage.
• Queue writes when offline; flush when online.
• UI always reads from local store; realtime patches it.

⸻

Minimal UI mapping (your mock → components)
• TimelineScreen
• MeetingPointCard
• TimeBlock → renders 4 StageLane rows
• ArtistPill with variants (friend/conflict/maybe)
• SquadScreen
• MemberCard with status dot + now/next labels
• MapScreen
• Start with the ASCII venue map as a <MonoPanel/>
• AddModal
• Tabs: Artist / Meeting Point
• Search artists (local JSON filter first; later server search)

⸻

Seed lineup (pure local first)

Create src/data/seedLineup.ts with simple JSON—copy your mock examples. Example item:

export const seedSets = [
{ id:'vr-2200', day:'2025-05-17', start:'2025-05-17T22:00:00-07:00', end:'2025-05-17T23:00:00-07:00', stage:'Circuit Grounds', artist:'Virtual Riot' },
// ...
];

You can migrate to server sets later and just replace the data source.

⸻

Supabase client & store (drop-in)

// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: true, autoRefreshToken: true }});

// lib/store.ts
import { create } from 'zustand';
type Presence = { profile_id:string; now_label:string; now_stage:string; status:'online'|'busy'|'offline'|'lost'; next_label?:string };
type Plan = { id:string; type:'set'|'meetup'; set_id?:string; meet_time?:string; meet_location?:string };

type S = {
squadId?: string;
presence: Record<string, Presence>;
plans: Plan[];
setPresence: (p:Presence)=>void;
setPlans: (ps:Plan[])=>void;
};
export const useStore = create<S>((set) => ({
presence:{}, plans:[],
setPresence:(p)=>set(s=>({ presence:{...s.presence, [p.profile_id]:p} })),
setPlans:(ps)=>set({ plans: ps }),
}));

Updating your presence (one call):

export async function upsertPresence(input: Omit<Presence,'profile_id'>, profileId: string, squadId: string) {
await supabase.from('presence').upsert({
profile_id: profileId,
squad_id: squadId,
...input,
updated_at: new Date().toISOString(),
});
}

⸻

Dev setup (15–30 mins) 1. Create Supabase project
• Add tables above (copy SQL), enable RLS.
• Create an initial squad + invite_code. 2. Expo app

npx create-expo-app edc-squad-sync
cd edc-squad-sync
npm i @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
npm i zustand @supabase/supabase-js
npx expo install expo-linking

    3.	Env
    •	In app.json:

{ "expo": { "extra": { "eas": { "projectId": "local-dev" } },
"plugins": [], "scheme": "edcsquad",
"runtimeVersion": { "policy": "sdkVersion" } } }

    •	In .env:

EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

    4.	Navigation scaffold

// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TimelineScreen from './src/screens/TimelineScreen';
import SquadScreen from './src/screens/SquadScreen';
import MapScreen from './src/screens/MapScreen';

const Tab = createBottomTabNavigator();
export default function App() {
return (
<NavigationContainer>
<Tab.Navigator screenOptions={{ headerShown:false }}>
<Tab.Screen name="Timeline" component={TimelineScreen} />
<Tab.Screen name="Squad" component={SquadScreen} />
<Tab.Screen name="Map" component={MapScreen} />
</Tab.Navigator>
</NavigationContainer>
);
}

⸻

Feature slices & acceptance criteria

Phase 0 – Skeleton (today)
• Tabs render 3 screens
• Local seed lineup shows blocks (hardcoded list)
• Modal to add a meeting point (local state)

Phase 1 – Auth & Squads (½ day)
• Email OTP auth (Supabase)
• Create squad & join via invite code
• Profile edit (name, emoji, color)

Phase 2 – Presence & Plans (½ day)
• Upsert presence from Squad screen
• Subscribe to presence changes; cards update within 1–2s
• Add “plan” items (set/meetup) and show on Timeline

Phase 3 – Offline & polish (½ day)
• Cache presence, plans, seedSets in AsyncStorage
• “Lost mode” banner when offline
• Quick actions: “I’m at X”, “Going to Y”

Phase 4 – Nice-to-haves
• Broadcast quick pings (less DB chatter)
• CSV/JSON import for lineups (Supabase Storage or local)
• Map zones (tap to set presence by zone)

⸻

Cost & ops
• Supabase Free will carry your first squads easily.
• Expo: dev client locally; ad-hoc builds later if needed.
• No servers, no lambdas, no billing surprises.

⸻

CSV template for lineups (if you want quick bulk import)

artist,stage,day,start_local,end_local
Porter Robinson,Circuit Grounds,2025-05-17,21:00,22:00
Chris Lake,Kinetic Field,2025-05-17,21:00,22:00
Virtual Riot,Circuit Grounds,2025-05-17,22:00,23:00
Zedd,Kinetic Field,2025-05-17,23:00,00:00
Excision,Circuit Grounds,2025-05-17,23:00,00:00

You can store this in-app first; add a simple parser later.

⸻

Risks & mitigations
• Connectivity at venue → local-first UI; writes queue; presence degrades gracefully.
• Auth friction → OTP only; allow “Local-only Mode” toggle.
• Lineup data source → start with bundled JSON; import later.

⸻

What I can deliver next (just ask)
• A ready-to-run Expo repo scaffold with the three screens, modal, seed lineup, Zustand store, Supabase client, and presence subscription wired.
• The exact SQL to paste in Supabase (DDL + policies + starter rows).
• A minimal design token file to mirror your mock’s colors and pills.

If you want, I’ll generate the initial SQL + three RN screen files in the next message so you can paste & go.