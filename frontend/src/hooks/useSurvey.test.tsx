import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useSurvey } from './useSurvey';
import { apiFetch } from '../services/api/apiClient';

vi.mock('../services/api/apiClient', () => ({ apiFetch: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks(); });
afterEach(cleanup);

it('fetches fresh questions instead of using the stale session cache', async () => {
  sessionStorage.setItem('survey_questions_cache_v7', JSON.stringify([{ id: 'stale' }]));
  vi.mocked(apiFetch).mockResolvedValue([{ id: 'fresh', type: 'short_text', block_name: 'A' }]);
  const { result } = renderHook(() => useSurvey());
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(apiFetch).toHaveBeenCalledWith('/questions', { cache: 'no-store' });
  expect(result.current.questions.map(q => q.id)).toEqual(['fresh']);
  expect(sessionStorage.getItem('survey_questions_cache_v7')).toBeNull();
});

it('refetches the saved question order on a later survey visit', async () => {
  const first = { id: 'first', type: 'short_text', block_name: 'A' };
  const second = { id: 'second', type: 'short_text', block_name: 'B' };
  vi.mocked(apiFetch).mockResolvedValueOnce([first, second]).mockResolvedValueOnce([second, first]);
  const initial = renderHook(() => useSurvey());
  await waitFor(() => expect(initial.result.current.isLoading).toBe(false));
  initial.unmount();
  const later = renderHook(() => useSurvey());
  await waitFor(() => expect(later.result.current.isLoading).toBe(false));
  expect(later.result.current.questions.map(q => q.id)).toEqual(['second', 'first']);
});

it('submits only currently visible answers', async () => {
  vi.mocked(apiFetch).mockImplementation(async endpoint => endpoint === '/questions' ? [
    { id: 'role', type: 'single_choice', block_name: 'A' },
    { id: 'hidden', type: 'short_text', block_name: 'B', conditional_logic: { questionId: 'role', expectedValue: 'Founder' } },
  ] : { success: true });
  const { result } = renderHook(() => useSurvey());
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  act(() => {
    result.current.handleAnswerChange('role', 'Worker');
    result.current.handleAnswerChange('hidden', 'previously entered');
  });
  await act(async () => { await result.current.handleSubmit(); });
  const request = vi.mocked(apiFetch).mock.calls.find(([endpoint]) => endpoint === '/responses');
  expect(JSON.parse(request![1]!.body as string).answers).toEqual({ role: 'Worker' });
  expect(result.current.isSubmitted).toBe(true);
});
