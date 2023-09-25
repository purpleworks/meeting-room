import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// 환경변수로 node에서 허가되지 않은 인증TLS통신을 거부하지 않겠다고 설정
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
  })
    .then((res) => {
      console.log("응답", res);
      return res.data;
    })
    .catch((err) => {
      console.log("에러", err);
    });
  // const response = await fetch(url, {
  //   headers: injectHasuraAdminSecret(request.headers),
  //   method,
  //   body: body ? JSON.stringify(body) : null,
  // });
  const response = await res.data;
  return { response, status: response.status };
}
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
