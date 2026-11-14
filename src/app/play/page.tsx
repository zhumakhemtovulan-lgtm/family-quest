import { SiteHeader } from "@/components/ui";
import QuestPlayer from "@/components/QuestPlayer";

export const metadata = { title: "Play — Family Quest" };

export default function PlayPage() {
  return (
    <>
      <SiteHeader />
      <QuestPlayer />
    </>
  );
}
