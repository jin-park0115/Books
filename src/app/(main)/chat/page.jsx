import ChatBot from "../../../components/ChatBot";
import Link from "next/link";

export const metadata = {
  title: "AI 도서 추천 챗봇",
  description: "원하는 분위기의 책을 자연어로 추천받아 보세요.",
};

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-3">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">AI 도서 추천 챗봇</h1>
          <p className="text-base text-gray-600">
            “잔잔한 에세이 추천해줘”처럼 자연어로 요청하면 챗봇이 Google Books
            데이터를 바탕으로 어울리는 책을 찾아드려요.
          </p>
        </div>

        <ChatBot />
      </div>
    </div>
  );
}

