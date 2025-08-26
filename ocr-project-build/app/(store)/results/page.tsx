

import { redirect } from 'next/navigation';
import { Metadata } from 'next';

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

// build a dynamic title using the payload
export async function generateMetadata({
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  // await the async searchParams API
  const { payload } = await searchParams;

  if (!payload) {
    return { title: 'Results' };
  }

  try {
    const json = JSON.parse(decodeURIComponent(payload));
    return { title: `Results – ${json.fullName}` };
  } catch {
    return { title: 'Results' };
  }
}

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  // await the async searchParams API
  const { payload } = await searchParams;

  // no payload? ship them back home
  if (!payload) {
    redirect('/');
  }

  let data: ProcessResult;
  try {
    data = JSON.parse(decodeURIComponent(payload));
  } catch {
    // malformed JSON → go home
    redirect('/');
  }

  return (
       <div className="isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">Processed Results</h2>
        <p className="mt-2 text-lg/8 text-gray-400">From the ultimate OCR Tool, here are your results...</p>
      </div>
<div>
    <br></br>
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label htmlFor="full-name" className="block text-sm/6 font-semibold text-white">
              Full name
            </label>
            <div className="mt-2.5">
                {data.fullName}
            </div>
          </div>
          <div>
            <label htmlFor="age" className="block text-sm/6 font-semibold text-white">
              Age
            </label>
            <div className="mt-2.5">
                {data.age}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="company" className="block text-sm/6 font-semibold text-white">
              Extraction Method Selected
            </label>
            <div className="mt-2.5">
                {data.extractionMethod}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm/6 font-semibold text-white">
              Parser/OCR Text
            </label>
            <div className="mt-2.5">
                {data.parserText && (
                    <section>
                    <pre style={{ padding: '1rem', whiteSpace: 'pre-wrap' }}>
                        {data.parserText}
                    </pre>
                    </section>
                )}
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm/6 font-semibold text-white">
              AI-Extracted Text
            </label>
            <div className="mt-2.5">
                {data.aiText && (
                    <section>
                    <pre style={{padding: '1rem', whiteSpace: 'pre-wrap' }}>
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