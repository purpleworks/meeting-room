import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const baseUrl = "https://hasura.meetingroom.purpleworks.co.kr";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// function injectHasuraAdminSecret(headers: Headers) {
//   const newHeaders = new Headers(headers);

//   newHeaders.set(
//     "x-hasura-admin-secret",
//     process.env.NEXT_PUBLIC_HASURA_SECRET_KEY || ""
//   );

//   return newHeaders;
// }

async function fetchToHasura(
  request: NextRequest,
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body: BodyInit | null | undefined = null
) {
  const res = await axios({
    url,
    method: method,
    headers: {
      "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_SECRET_KEY || "",
    },
    data: body ? JSON.stringify(body) : null,
  });
  // const response = await fetch(url, {
  //   headers: injectHasuraAdminSecret(request.headers),
  //   method,
  //   body: body ? JSON.stringify(body) : null,
  // });
  const response = await res.data;
  return { response, status: response.status };
}

export async function GET(request: NextRequest) {
  const { pathname, search } = new URL(request.url);
  let fetchUrl = `${baseUrl}${pathname}`;
  if (search) fetchUrl += search;
  const { response, status } = await fetchToHasura(request, fetchUrl, "GET");
  return NextResponse.json(response, { status: status });
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  let fetchUrl = `${baseUrl}${pathname}`;
  const body = await request.json();
  const { response, status } = await fetchToHasura(
    request,
    fetchUrl,
    "POST",
    body
  );
  return NextResponse.json(response, { status: status });
}

export async function PATCH(request: NextRequest) {
  const { pathname } = new URL(request.url);
  let fetchUrl = `${baseUrl}${pathname}`;
  const body = await request.json();
  const { response, status } = await fetchToHasura(
    request,
    fetchUrl,
    "PATCH",
    body
  );
  return NextResponse.json(response, { status: status });
}

export async function DELETE(request: NextRequest) {
  const { pathname } = new URL(request.url);
  let fetchUrl = `${baseUrl}${pathname}`;
  const { response, status } = await fetchToHasura(request, fetchUrl, "DELETE");
  return NextResponse.json(response, { status: status });
}
