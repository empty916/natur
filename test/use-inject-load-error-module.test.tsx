/**
 * @jest-environment jsdom
 */
import React, { StrictMode } from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { App } from './ui-demo/use-inject-load-error-module';


test('use inject invalid module', async () => {
  render((
    <StrictMode>
      <App />
    </StrictMode>
  ))
  expect(screen.getByRole('loading')).toHaveTextContent('loading');
  await waitFor(() => screen.getByRole('error'))
});