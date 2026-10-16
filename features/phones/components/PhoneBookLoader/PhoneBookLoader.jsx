import { getPhones } from "@/features/phones/api";
import PhoneBook from "../PhoneBook/PhoneBook";

export default async function PhoneBookLoader() {
  const phones = await getPhones();
  return <PhoneBook initialPhones={phones} />;
}
