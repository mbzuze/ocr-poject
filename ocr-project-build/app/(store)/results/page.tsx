async function ResultsPage({
    searchParams,
}:{
    searchParams :{
        'first-name'?: string;
    'last-name'?: string;
    dob?: string;
    'extraction-method'?: string;

    };
}) {
    const {
        'first-name': firstName,
        'last-name': lastName,
        dob,
        'extraction-method': method,
      } = await searchParams;
    
  return (
    <div className="space-y-4">
    <h1 className="text-xl font-bold">Submitted Data</h1>
    <p><strong>First Name:</strong> {firstName ?? 'N/A'}</p>
    <p><strong>Last Name:</strong> {lastName ?? 'N/A'}</p>
    <p><strong>Date of Birth:</strong> {dob ?? 'N/A'}</p>
    <p><strong>Extraction Method:</strong> {method ?? 'N/A'}</p>
  </div>

  )
}

export default ResultsPage;