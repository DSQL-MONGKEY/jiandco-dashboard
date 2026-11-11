import { ApiError } from './api-client';

type UploadEnvelope<T> = {
  success?: boolean;
  data?: T;
  code?: number;
  message?: string;
};

export function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api${path}`);
    xhr.withCredentials = true;
    xhr.timeout = 120_000;
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    });

    xhr.addEventListener('load', () => {
      let payload: UploadEnvelope<T> | null = null;
      try {
        payload = JSON.parse(xhr.responseText) as UploadEnvelope<T>;
      } catch {
        payload = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload?.success && payload.data) {
        resolve(payload.data);
        return;
      }

      reject(
        new ApiError(xhr.status, payload?.code ?? xhr.status, payload?.message ?? 'Upload failed')
      );
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError(0, 0, 'Upload failed. Check your connection and try again.'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new ApiError(0, 0, 'Upload timed out. Try a smaller file or retry.'));
    });

    xhr.send(formData);
  });
}
