import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  return (
    <main>
      <h1>Hi idc about frontend rn</h1>
      {!session && (
        <form action={async () => {
          "use server";
          await signIn("discord", {redirectTo: "/dashboard"});
        }}>
          <Button>Login/Sign in via Discord</Button>
        </form>
      )}

      {session && (
        <>
          <h2>Logged in as {session?.user?.name}</h2>
          <p>ID: {session?.user?.id}</p>
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <Button>Logout</Button>
          </form>
        </>
      )}
    </main>
  );
}
