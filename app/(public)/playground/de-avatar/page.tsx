// app/(public)/playground/de-avatar/page.tsx
import { Avatar, AvatarGroup } from "@/design";

const FRAME_CAT = "/borders/cat.png";
const FRAME_FIRE = "/borders/fire.png";
const FRAME_NEON = "/borders/neon.png";
const FRAME_WOLF = "/borders/wolf.png";

const users = [
  {
    id: "luffy",
    name: "Luffy",
    handle: "pirateking",
    src: "https://images.alphacoders.com/131/thumbbig-1311951.webp",
    blurHash: "LEGGr7xb00sr0fJ~}[xH54oM=}t8",
    frameSrc: FRAME_WOLF,
    level: 27,
    rank: "S-RANK",
  },
  {
    id: "nami",
    name: "Nami",
    handle: "navigator",
    src: "https://images.unsplash.com/photo-1731709544663-a66cb7acdcd8?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blurHash: "L4AJ$YX;?[0000E2#jT100$_sE^*",
    frameSrc: FRAME_NEON,
    level: 12,
    rank: "#12",
  },
  {
    id: "zoro",
    name: "Zoro",
    handle: "swordsman",
    src: "https://images3.alphacoders.com/132/thumbbig-1328396.webp",
    blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
    frameSrc: FRAME_FIRE,
    level: 40,
    rank: "A-RANK",
  },
  {
    id: "usopp",
    name: "Usopp",
    handle: "sniperking",
    src: "https://images5.alphacoders.com/481/thumbbig-481903.webp",
    blurHash: "L+SPFEe.%joznRaekVkCtAj[WRaf",
    frameSrc: FRAME_CAT,
    level: 5,
    rank: "B-RANK",
  },
] as const;

function VerifiedBadge() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-400 text-[10px] font-black text-slate-950 shadow">
      ✓
    </span>
  );
}

export default function Page() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-10 p-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">DeAvatar Playground</h1>
          <p className="text-sm text-white/60">
            Frame outside the image + bottom badges + avatar stacks (+N).
          </p>
        </header>

        {/* Profile header example */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar
              src={users[0].src}
              blurHash={users[0].blurHash}
              name={users[0].name}
              size="24"
              frameSrc={users[0].frameSrc}
              frameThickness={10}
              topRight={<VerifiedBadge />}
              bottomBadge={{ type: "level", value: users[0].level }}
              href="/profile/123"
            />

            <div className="min-w-[240px] space-y-1">
              <div className="text-lg font-semibold">{users[0].name}</div>
              <div className="text-sm text-white/60">@{users[0].handle}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                  Creator Program
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                  12k XP
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                  {users[0].rank}
                </span>
              </div>
            </div>

            <div className="ml-auto flex gap-3">
              <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                Follow
              </button>
              <button className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5">
                Message
              </button>
            </div>
          </div>
        </section>

        {/* Followed by +5 friends example */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <AvatarGroup
              users={[
                { id: users[1].id, name: users[1].name, src: users[1].src, blurHash: users[1].blurHash },
                { id: users[2].id, name: users[2].name, src: users[2].src, blurHash: users[2].blurHash },
                { id: users[3].id, name: users[3].name, src: users[3].src, blurHash: users[3].blurHash },
              ]}
              size="10"
              max={3}
              totalCount={8}  // ✅ This creates "+5"
              plusHref="/followers"
            />

            <div className="text-sm text-white/80">
              Followed by{" "}
              <span className="font-semibold">{users[1].name}</span>,{" "}
              <span className="font-semibold">{users[2].name}</span>{" "}
              and <span className="font-semibold">+5 friends</span>
            </div>
          </div>
        </section>

        {/* Party / Watch Room example */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Watch Room</div>
                <div className="text-xs text-white/60">One Piece — Episode 1015</div>
              </div>

              <AvatarGroup
                users={[
                  { id: users[0].id, name: users[0].name, src: users[0].src, blurHash: users[0].blurHash },
                  { id: users[1].id, name: users[1].name, src: users[1].src, blurHash: users[1].blurHash },
                  { id: users[2].id, name: users[2].name, src: users[2].src, blurHash: users[2].blurHash },
                ]}
                size="9"
                max={3}
                totalCount={14}
              />
            </div>

            <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 px-4 py-3 text-sm font-semibold text-white hover:from-fuchsia-500/40 hover:to-cyan-500/40">
              Join Room
            </button>
          </div>

          {/* Leaderboard item with rank badge */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={users[2].src}
                blurHash={users[2].blurHash}
                name={users[2].name}
                size="14"
                frameSrc={users[2].frameSrc}
                bottomBadge={{ type: "rank", label: "S-RANK" }}
                frameThickness={8}
                effects={false}
              />

              <div className="flex-1">
                <div className="text-sm font-semibold">Weekly Top Creator</div>
                <div className="text-xs text-white/60">{users[2].name}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold">12,480</div>
                <div className="text-xs text-white/60">XP</div>
              </div>
            </div>
          </div>
        </section>

        {/* Post card + comment example */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Avatar
                src={users[0].src}
                blurHash={users[0].blurHash}
                name={users[0].name}
                size="12"
                bottomBadge={{ type: "level", value: users[0].level }}
                effects={false}
              />

              <div className="leading-tight">
                <div className="font-semibold">{users[0].name}</div>
                <div className="text-xs text-white/60">@{users[0].handle}</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/80">
              Just finished episode 1015… the animation quality is unreal 🔥
            </p>

            <div className="mt-4 flex gap-4 text-xs text-white/60">
              <span>❤️ 3.2k</span>
              <span>💬 412</span>
              <span>🔁 98</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-3">
              <Avatar
                src={users[1].src}
                blurHash={users[1].blurHash}
                name={users[1].name}
                size="10"
                effects={false}
              />

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-sm font-semibold">{users[1].name}</div>
                  <div className="text-[11px] text-white/50">@{users[1].handle}</div>
                </div>

                <p className="mt-2 text-sm text-white/80">
                  The pacing was perfect. Also the OST choice was 💯.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-2 text-xs text-white/50">
          Tip: if bottom badges collide in tight layouts, add container padding-bottom (e.g. pb-6).
        </footer>
      </div>
    </div>
  );
}
