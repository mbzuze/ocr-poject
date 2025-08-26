//-----------------------------------------------------------------------------
// Imports: next/navigation for redirecting, next for Metadata type
//-----------------------------------------------------------------------------
import { redirect } from 'next/navigation';
import { Metadata } from 'next';


//-----------------------------------------------------------------------------
// Data Interfaces
//
// ProcessResult    : shape of the parsed payload, including fields returned
// ResultsPageProps : props passed to both generateMetadata and page component
//-----------------------------------------------------------------------------
interface ProcessResult {
  fullName: string;
  age: number;
  extractionMethod: string;
  aiText: string | null;
  parserText: string;
}

interface ResultsPageProps {
  searchParams: { payload?: string };
}


//-----------------------------------------------------------------------------
// generateMetadata:
// Dynamically builds the page title based on the decoded payload.fullName.
// Falls back to a generic title if payload is missing or malformed.
//-----------------------------------------------------------------------------
export async function generateMetadata({
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  // extract the raw payload query parameter
  const { payload } = await searchParams;

  // if there's no payload at all, use default title
  if (!payload) {
    return { title: 'Results' };
  }

  try {
    // decode and parse JSON to grab fullName
    const json = JSON.parse(decodeURIComponent(payload));
    return { title: `Results – ${json.fullName}` };
  } catch {
    // malformed JSON → revert to default
    return { title: 'Results' };
  }
}


//-----------------------------------------------------------------------------
// ResultsPage Component:
// Renders the processed results, or redirects home if payload is absent/bad.
//-----------------------------------------------------------------------------
export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  // get the raw payload parameter
  const { payload } = await searchParams;

  // missing payload? redirect back to homepage
  if (!payload) {
    redirect('/');
  }

  let data: ProcessResult;

  try {
    // decode URL-encoded JSON into our ProcessResult shape
    data = JSON.parse(decodeURIComponent(payload));
  } catch {
    // invalid JSON → bounce back to homepage
    redirect('/');
  }

  //-----------------------------------------------------------------------------
  // JSX Layout:
  // - Header area with title and subtitle
  // - Responsive grid displaying each field from the payload
  //-----------------------------------------------------------------------------
  return (
    <div className="isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      {/* decorative blurred background element */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      ></div>

      {/* centered page header */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Processed Results
        </h2>
        <p className="mt-2 text-lg/8 text-gray-400">
          From the ultimate OCR Tool, here are your results...
        </p>
      </div>

      <div>
        <br />

        {/* grid for displaying each result field */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* Full Name */}
          <div>
            <label
              htmlFor="full-name"
              className="block text-sm/6 font-semibold text-white"
            >
              Full name
            </label>
            <div className="mt-2.5">{data.fullName}</div>
          </div>

          {/* Age */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm/6 font-semibold text-white"
            >
              Age
            </label>
            <div className="mt-2.5">{data.age}</div>
          </div>

          {/* Extraction Method */}
          <div className="sm:col-span-2">
            <label
              htmlFor="company"
              className="block text-sm/6 font-semibold text-white"
            >
              Extraction Method Selected
            </label>
            <div className="mt-2.5">{data.extractionMethod}</div>
          </div>

          {/* Parser/OCR Text */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-semibold text-white"
            >
              Parser/OCR Text
            </label>
            <div className="mt-2.5">
              {data.parserText && (
                <section>
                  <pre
                    className="p-4 whitespace-pre-wrap"
                  >
                    {data.parserText}
                  </pre>
                </section>
              )}
            </div>
          </div>

          {/* AI-Extracted Text */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm/6 font-semibold text-white"
            >
              AI-Extracted Text
            </label>
            <div className="mt-2.5">
              {data.aiText && (
                <section>
                  <pre
                    className="p-4 whitespace-pre-wrap"
                  >
                    {data.aiText}
                  </pre>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}