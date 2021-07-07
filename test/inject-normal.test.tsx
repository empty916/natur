import React, { StrictMode } from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { App } from './ui-demo/inject-normal';


test('inject normal', async () => {
  render((
    <StrictMode>
      <App />
    </StrictMode>
  ))
  expect(screen.getByRole('loading')).toHaveTextContent('loading');
  
  await waitFor(() => screen.getByRole('name-input'));

  expect(screen.getByRole('lazy-name-input')).toHaveValue('name');

  expect(screen.getByRole('name-input')).toHaveValue('name');
  expect(screen.getByRole('count')).toHaveTextContent('0');
  expect(screen.getByRole('text-split')).toHaveTextContent('name'.split('').join(','));

  fireEvent.change(screen.getByRole('name-input'), {
    target: {
      value: 'name1',
    }
  });

  fireEvent.click(screen.getByRole('btn-inc'));

  expect(screen.getByRole('lazy-name-input')).toHaveValue('name');
  
  expect(screen.getByRole('name-input')).toHaveValue('name1');
  expect(screen.getByRole('count')).toHaveTextContent('0');
  expect(screen.getByRole('text-split')).toHaveTextContent('name1'.split('').join(','));


  fireEvent.change(screen.getByRole('lazy-name-input'), {
    target: {
      value: 'name2',
    }
  });


  expect(screen.getByRole('lazy-name-input')).toHaveValue('name2');
  
  expect(screen.getByRole('name-input')).toHaveValue('name1');
  expect(screen.getByRole('count')).toHaveTextContent('1');
  expect(screen.getByRole('text-split')).toHaveTextContent('name1'.split('').join(','));

})