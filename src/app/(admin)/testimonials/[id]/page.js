import TestimonialEditor from "@/components/testimonials/TestimonialEditor";

export default async function EditTestimonialPage({ params }) {
  const { id } = await params;
  return <TestimonialEditor id={id} />;
}
