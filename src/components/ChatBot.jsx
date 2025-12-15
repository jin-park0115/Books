"use client";

import { useState } from "react";

const initialMessage = {
  role: "assistant",
  content:
    "안녕하세요! 원하는 책의 분위기, 장르, 목적을 자유롭게 말씀해 주세요. 맞춤 도서를 찾아드릴게요.",
};

export default function ChatBot() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "추천 요청에 실패했어요.");
      }

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.response,
        books: data.books || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "추천 중 문제가 발생했어요. 잠시 후 다시 시도해 주시겠어요?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[480px] overflow-y-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`mb-4 flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>

              {message.books && message.books.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {message.books.map((book) => (
                    <article
                      key={book.id}
                      className="rounded-xl bg-white p-3 text-gray-900 shadow-sm ring-1 ring-gray-200"
                    >
                      <div className="flex gap-3">
                        <img
                          src={book.thumbnail}
                          alt={`${book.title} 표지`}
                          className="h-24 w-16 rounded-md object-cover"
                        />
                        <div className="space-y-1">
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-xs text-gray-500">
                            {book.authors?.length
                              ? book.authors.join(", ")
                              : "저자 미상"}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {book.description || "상세 설명이 제공되지 않았어요."}
                          </p>
                          {book.infoLink && (
                            <a
                              href={book.infoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                              자세히 보기
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="예: 잔잔한 힐링 소설 추천해줘"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? "검색 중..." : "보내기"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-xs text-gray-500">
          “장르/분위기/읽는 목적”을 함께 적으면 더 정확한 추천을 받을 수 있어요.
        </p>
      </form>
    </div>
  );
}

