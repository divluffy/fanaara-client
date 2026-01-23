import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

const Components = () => {
  return (
    <div className="flex items-center gap-2">
      <br />
      <br />
      <hr />
      <span className="font-semibold text-white">dev.luffy</span>
      <VerifiedBadge size={80} />
      <hr />
      <br />
    </div>
  );
};

export default Components;
