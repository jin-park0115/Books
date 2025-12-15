import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_ENDPOINT = "https://www.googleapis.com/books/v1/volumes";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
당신은 한국어 도서 큐레이션 어시스턴트입니다.
사용자의 취향/분위기/목적을 파악하고 2~3권의 책을 추천하세요.
각 책의 핵심 분위기, 줄거리, 어울리는 독자 유형을 짧게 설명하고 따뜻한 톤을 유지하세요.
`.trim();

function buildSearchQuery(rawMessage) {
  if (!rawMessage) return "bestseller";
  return rawMessage.trim().replace(/\s+/g, " ").slice(0, 180);
}

function normalizeBook(item) {
  const info = item?.volumeInfo || {};
  const image = info.imageLinks || {};

  return {
    id: item.id,
    title: info.title || "제목 미상",
    authors: info.authors || [],
    description: info.description || "",
    categories: info.categories || [],
    thumbnail:
      image.thumbnail ||
      image.smallThumbnail ||
      "https://books.google.com/googlebooks/images/no_cover_thumb.gif",
    infoLink: info.infoLink || info.previewLink || "",
    publishedDate: info.publishedDate || "",
    pageCount: info.pageCount || null,
  };
}

async function fetchBooks(query) {
  try {
    const url = new URL(GOOGLE_BOOKS_ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "6");
    url.searchParams.set("printType", "books");
    url.searchParams.set("langRestrict", "ko");
    if (GOOGLE_BOOKS_API_KEY) {
      url.searchParams.set("key", GOOGLE_BOOKS_API_KEY);
    }

    const apiResponse = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!apiResponse.ok) {
      console.error("Google Books API error:", apiResponse.status);
      return [];
    }

    const payload = await apiResponse.json();
    return (payload.items || []).map(normalizeBook);
  } catch (error) {
    console.error("Google Books API fetch failed:", error);
    return [];
  }
}

async function createAiResponse(userMessage, books) {
  const bookSnippets = books.slice(0, 3).map((book, index) => {
    const authors = book.authors?.length ? book.authors.join(", ") : "저자 미상";
    return `${index + 1}. ${book.title} (${authors}) - ${book.description?.slice(
      0,
      160
    )}`;
  });

  const prompt = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        `사용자 요청: ${userMessage}`,
        bookSnippets.length
          ? `참고 가능한 후보 도서:\n${bookSnippets.join("\n")}`
          : "현재 참고할 도서 데이터가 없습니다. 일반적인 추천을 생성하세요.",
      ].join("\n\n"),
    },
  ];

  const chatResponse = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
    max_output_tokens: 500,
  });

  return chatResponse.output_text?.trim();
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 서버에 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const userMessage = body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "찾고 싶은 책에 대해 먼저 말씀해 주세요." },
        { status: 400 }
      );
    }

    const query = buildSearchQuery(userMessage);
    const books = await fetchBooks(query);
    const responseText =
      (await createAiResponse(userMessage, books)) ||
      "추천 응답을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.";

    return NextResponse.json({ response: responseText, books });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "추천 과정에서 문제가 발생했어요. 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}

