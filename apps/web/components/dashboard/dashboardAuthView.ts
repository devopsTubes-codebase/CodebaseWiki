export type ProjectsResponseHandling =
  | { kind: 'ok' }
  | { kind: 'redirect'; target: string }
  | { kind: 'error'; message: string };

export function classifyProjectsResponse(status: number): ProjectsResponseHandling {
  if (status === 401) {
    return {
      kind: 'redirect',
      target: '/auth/sign-in?callbackUrl=/dashboard',
    };
  }

  if (status >= 200 && status < 300) {
    return { kind: 'ok' };
  }

  return {
    kind: 'error',
    message: 'Could not load projects.',
  };
}
