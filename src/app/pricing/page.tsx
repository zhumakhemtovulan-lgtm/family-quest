import { Container, SiteHeader } from "@/components/ui";
import PricingPlans from "@/components/PricingPlans";

export const metadata = { title: "Pricing — Family Quest" };

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <Container>
        <PricingPlans />
      </Container>
    </>
  );
}
