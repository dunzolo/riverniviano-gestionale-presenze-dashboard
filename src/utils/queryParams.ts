export const deleteQueryParams = (
  searchParams: URLSearchParams,
  keys: string[]
) => {
  const params = new URLSearchParams(searchParams.toString());
  keys.map((key) => params.delete(key));
  return createQueryString(params);
};

export const createQueryString = (
  searchParams: URLSearchParams | undefined,
  newValues?: Record<string, string | number | boolean | null | undefined>
) => {
  const params = new URLSearchParams(searchParams?.toString?.() ?? '');

  if (newValues) {
    for (const [key, value] of Object.entries(newValues)) {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
  }

  return params.toString();
};
