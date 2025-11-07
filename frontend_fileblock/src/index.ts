import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset 및 전역 스타일 */
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
      Arial, sans-serif;
    background-color: #f4f7f6;
    color: #333;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1 {
    font-size: 1.875rem; /* 3xl */
    font-weight: bold;
    color: #1f2937; /* gray-800 */
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb; /* gray-200 */
    padding-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.5rem; /* 2xl */
    font-weight: 600;
    color: #374151; /* gray-700 */
    margin-bottom: 1rem;
  }

  p {
    margin: 0 0 1rem 0;
    color: #6b7280; /* gray-600 */
  }

  button {
    cursor: pointer;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    transition: background-color 0.2s;
  }

  input[type="text"], input[type="file"] {
    border: 1px solid #d1d5db; /* gray-300 */
    border-radius: 6px;
    font-size: 1rem;
  }

  input[type="text"] {
    padding: 0.75rem 1rem;
    width: 100%;
  }
`;