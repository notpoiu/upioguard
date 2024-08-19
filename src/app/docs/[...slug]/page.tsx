export default async function Docs({ params }: { params: { slug: string[] } }) {
  const component = await import(`@/docs/${params.slug.join("/")}.mdx`)
  return <component.default />
}