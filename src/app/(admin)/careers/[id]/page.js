import CareerEditor from "@/components/careers/CareerEditor";

export default async function EditCareerPage({ params }) {
  const { id } = await params;
  return <CareerEditor id={id} />;
}
