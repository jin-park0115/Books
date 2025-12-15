import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold mb-6 text-indigo-700">
        나만의 도서 관리 서비스
      </h1>
      <p className="text-xl mb-8 text-gray-600">
        Next.JS로 구현하는 도서 검색 및 개인 서재 관리 앱
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/search"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150 shadow-md"
        >
          도서 검색 시작
        </Link>
        <Link
          href="/mybook"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150 shadow-md"
        >
          내 서재 보기
        </Link>
        <Link
          href="/chat"
          className="bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-400 font-bold py-3 px-6 rounded-lg transition duration-150 shadow-md"
        >
          AI 추천 받기
        </Link>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <Link href="/login" className="hover:underline">
          로그인 / 회원가입
        </Link>
      </div>
    </div>
  );
}
