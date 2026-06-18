import type { Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/utils/constants';

export const isSupportedLanguage = (value: string): value is Language =>
  SUPPORTED_LANGUAGES.includes(value as Language);

// Ứng dụng chỉ hỗ trợ tiếng Việt — luôn khởi tạo bằng 'vi'.
export const getInitialLanguage = (): Language => 'vi';
