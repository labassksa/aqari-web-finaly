import AddListingClient from './AddListingClient';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AddListingPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }

  const presetPropertyType = Array.isArray(query.propertyType)
    ? query.propertyType[0]
    : query.propertyType;
  const suffix = params.toString();

  return (
    <AddListingClient
      presetPropertyType={presetPropertyType}
      returnTarget={`/add-listing${suffix ? `?${suffix}` : ''}`}
    />
  );
}
