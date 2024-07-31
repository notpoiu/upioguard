import { auth } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function middleware(request: NextApiRequest, response: NextApiResponse) {
  auth(request, response);


}