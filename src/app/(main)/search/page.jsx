import SearchBar from "../../../components/SearchBar";
import Link from "next/link";

const BOOK_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes?q=";

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentQuery = resolvedSearchParams.query || "";

  let books = [];
  let error = null;

  if (currentQuery) {
    try {
      const res = await fetch(`${API_BASE_URL}${currentQuery}&maxResult=10 `);
      if (!res.ok) {
        throw new Error(`API fetch failed: ${res.status}`);
      }
      console.log(res);
      const data = await res.json();
      books = data.items || [];
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/search" className="text-3xl font-bold mb-6">
        📚 도서 검색
      </Link>
      <SearchBar />

      {currentQuery && (
        <p className="text-xl mb-4">
          **"{currentQuery}"**에 대한 검색 결과 ({books.length}건)
        </p>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map((book) => {
          const info = book.volumeInfo;
          const coverUrl =
            book.imageLinks?.smallThumbnail ||
            info.imageLinks?.thumbnail ||
            null;
          return (
            <div
              key={book.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              {coverUrl && (
                <div className="mb-3 flex justify-center">
                  <img
                    src={coverUrl}
                    alt={`${info.title} 표지`}
                    className="h-40 w-auto object-contain rounded"
                  />
                </div>
              )}
              <div className="flex-grow">
                <h2 className="text-lg font-semibold truncate">{info.title}</h2>
                <p className="text-sm text-gray-600">
                  {info.authors ? info.authors.join(", ") : "저자 미상"}
                </p>
              </div>
              <Link
                href={`/books/${book.id}`}
                className="text-indigo-600 hover:underline mt-2 inline-block"
              >
                상세 보기
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
