export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
      <main className="container mx-auto flex max-md:justify-center px-10 py-5 justify-center w-full h-screen">
          <div>
              {children}
          </div>
      </main>
  )
}