import { Container, SiteHeader } from "@/components/ui";
import SetupForm from "@/components/SetupForm";

export const metadata = { title: "Set up your adventure — Family Quest" };

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string; mode?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader />
      <Container>
        <SetupForm sample={params.sample === "1"} newStory={params.mode === "new"} />
      </Container>
    </>
  );
}
