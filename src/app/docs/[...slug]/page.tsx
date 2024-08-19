import { notFound } from "next/navigation"

export default async function Docs({ params }: { params: { slug: string[] } }) {
  try{
    const component = await import(`@/docs/${params.slug.join("/")}.mdx`)
    return <component.default />
  } catch (e) {
    return notFound()
  }
}