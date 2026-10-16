import { connection } from "next/server";
import { getPhones } from "@/features/phones/api";
import PhoneBook from "../PhoneBook/PhoneBook";

export default async function PhoneBookLoader() {
  await connection();
  const phones = await getPhones();
  return <PhoneBook initialPhones={phones} />;
}
