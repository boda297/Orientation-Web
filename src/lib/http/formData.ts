/**
 * Converts a JavaScript object with primitive values, Files, or arrays to a FormData instance.
 */
export function toFormData(data: Record<string, unknown> | FormData): FormData {
  if (data instanceof FormData) {
    return data;
  }

  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) return;
        if (item instanceof File) {
          formData.append(key, item);
        } else {
          formData.append(key, String(item));
        }
      });
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      formData.append(key, String(value));
    } else if (typeof value === 'string') {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      // In case an object is passed, stringify it
      formData.append(key, JSON.stringify(value));
    }
  }

  return formData;
}
