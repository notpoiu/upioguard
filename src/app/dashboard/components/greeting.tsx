"use client";

export default function GreetingDashText({name}: {name: string}) {


  return (
    <>
      {new Date().getHours() < 12 && <h1 className="text-3xl font-bold">Good morning, {name}!</h1>}
      {new Date().getHours() >= 12 && new Date().getHours() < 18 && <h1 className="text-3xl font-bold">Good afternoon, {name}!</h1>}
      {new Date().getHours() >= 18 && new Date().getHours() < 24 && <h1 className="text-3xl font-bold">Good evening, {name}!</h1>}
    </>
  )

}