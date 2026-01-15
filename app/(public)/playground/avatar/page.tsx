import { Avatar } from "@/design";

const BORDER_LUFFY_REMOTE = "/borders/cat.png";
const BORDER_ZORO_REMOTE = "/borders/fire.png";
const BORDER_NAMI_REMOTE = "/borders/neon.png";
const BORDER_USOPP_REMOTE = "/borders/wolf.png";

export const mockImages = [
  {
    id: "alpha-1311951",
    src: "https://images.alphacoders.com/131/thumbbig-1311951.webp",
    blurHash: "LEGGr7xb00sr0fJ~}[xH54oM=}t8",
    rankBorder: BORDER_USOPP_REMOTE,
  },
  {
    id: "unsplash-1",
    src: "https://images.unsplash.com/photo-1731709544663-a66cb7acdcd8?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blurHash: "L4AJ$YX;?[0000E2#jT100$_sE^*",
    rankBorder: BORDER_NAMI_REMOTE,
  },
  {
    id: "alpha-1sdfgh311951",
    src: "https://images3.alphacoders.com/132/thumbbig-1328396.webp",
    blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
    rankBorder: BORDER_ZORO_REMOTE,
  },
  {
    id: "unspgglash-1",
    src: "https://images5.alphacoders.com/481/thumbbig-481903.webp",
    blurHash: "L+SPFEe.%joznRaekVkCtAj[WRaf",
    rankBorder: BORDER_LUFFY_REMOTE,
  },
];

const page = () => {
  return (
    <div className="flex gap-8 p-4 bg-amber-50 items-center">
      <Avatar
        rankBorder={mockImages[0]?.rankBorder}
        src={mockImages[0].src}
        blurHash={mockImages[0].blurHash}
        size="12"
        name="Luffy"
      />
      <Avatar
        rankBorder={mockImages[1]?.rankBorder}
        src={mockImages[1].src}
        blurHash={mockImages[1].blurHash}
        size="20"
        path="/profile/123"
        effects={false}
      />
      <Avatar
        rankBorder={mockImages[2]?.rankBorder}
        src={mockImages[2].src}
        blurHash={mockImages[2].blurHash}
        size="28"
      />
      <Avatar
        rankBorder={mockImages[3]?.rankBorder}
        src={mockImages[3].src}
        blurHash={mockImages[3].blurHash}
        size="32"
      />
    </div>
  );
};

export default page;
