import Link from "next/link";

const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export default async function BookPage({ params }) {
  const resolvedParams = await params;
  const { bookId } = resolvedParams;
  let bookData = null;
  let error = null;

  try {
    const res = await fetch(`${API_BASE_URL}/${bookId}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("요청하신 도서를 찾을 수 없습니다.");
      }
      throw new Error(`API fetch Failed: ${res.status}`);
    }

    const data = await res.json();
    bookData = data.volumeInfo;
  } catch (e) {
    error = e.message;
    console.error(e);
  }

  const title = bookData.title || "타이틀이 없습니다.";
  const authors = bookData.authors ? bookData.authors.join(", ") : "저자 미상";
  const description = bookData.description || "상세 설명이 없습니다.";
  const coverUrl = bookData.imageLinks?.thumbnail || null;

  return (
    <div className="container mx-auto p-8">
      <Link
        href="/search"
        className="text-indigo-600 hover:underline mb-4 inline-block"
      >
        &larr; 검색 결과로 돌아가기
      </Link>

      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-xl shadow-lg">
        {coverUrl && (
          <div className="flex-shrink-0">
            <img
              src={coverUrl}
              alt={`${title} 커버`}
              className="w-48 h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="flex-grow">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900">
            {title}
          </h1>
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            {authors}
          </h2>

          <p className="text-gray-500 mb-6">
            출판사: {bookData.publisher || "정보 없음"} | 출판일:{" "}
            {bookData.publishedDate || "정보 없음"}
          </p>

          <hr className="my-6" />

          <h3 className="text-2xl font-bold mb-3 text-gray-800">책 소개</h3>
          <div
            className="text-gray-700 leading-relaxed max-h-96 overflow-y-auto pr-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <div className="mt-8">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md mr-4">
              ✨ 찜하기 (북마크)
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md">
              📝 내 메모 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
