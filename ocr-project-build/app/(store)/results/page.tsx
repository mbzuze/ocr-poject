

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
    <main style={{ maxWidth: 800, margin: '2rem auto', lineHeight: 1.6 }}>
      <div className="space-y-12">

        <div className="border-b border-white/10 pb-12">
        
      <h1>Processing Results</h1>

      <section>
                  <h2 className="text-base/7 font-semibold text-white">Personal Information</h2>

        <ul>
          <li>Full Name: {data.fullName}</li>
          <li>Age: {data.age}</li>
          <li>Method: {data.extractionMethod}</li>
        </ul>
      </section>

      {data.parserText && (
        <section>
          <h2 className="text-base/7 font-semibold text-white">Parser/OCR Text</h2>

          <pre style={{ padding: '1rem', whiteSpace: 'pre-wrap' }}>
            {data.parserText}
          </pre>
        </section>
      )}

            {data.aiText && (
        <section>
          <h2 className="text-base/7 font-semibold text-white">AI-Extracted Text</h2>
          <pre style={{padding: '1rem', whiteSpace: 'pre-wrap' }}>
            {data.aiText}
          </pre>
        </section>
      )}
      </div>
      </div>
    </main>
  );
}