import { cn } from "@/lib/utils";

export function PageContainer({className, children}: {className?: string, children: React.ReactNode}) {
  return (
      <main className={cn("container mx-auto flex px-10 py-5 justify-start w-full h-screen", className)}>
          {children}
      </main>
  )
}