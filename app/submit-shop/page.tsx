import SubmitShopForm from "./SubmitShopForm";
import streets from "@/data/streets.json";

export default function SubmitShopPage() {
  return <SubmitShopForm streets={streets} />;
}
