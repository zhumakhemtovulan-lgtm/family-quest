import { SiteHeader } from "@/components/ui";
import FamilyBook from "@/components/FamilyBook";

export const metadata = { title: "Our family book — Family Quest" };

export default function BookPage() {
  return (
    <>
      <SiteHeader />
      <FamilyBook />
    </>
  );
}
