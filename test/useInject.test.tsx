/**
 * @jest-environment jsdom
 */
import React, { StrictMode } from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { store, App } from './ui-demo/useInject-normal';
import { getDepValue } from '../src/useInject';

beforeEach(() => {
  store.globalResetStates();
})

test('get dep value', () => {
    expect(getDepValue({
        state: {
            a: 1,
            b: {}
        },
        actions: {

        }
    }, {})).toEqual([]);

    expect(getDepValue({
        state: {
            a: 1,
            b: {}
        },
        actions: {

        }
    }, {
        state: ['a']
    })).toEqual([1]);

    const b = {};
    const r1 = getDepValue({
        state: {
            a: 1,
            b
        },
        actions: {

        }
    }, {
        state: ['a', 'b']
    });
    expect(r1).toEqual([1, b]);
    expect(r1[1]).toBe(b);


    expect(getDepValue({
        state: {
            a: 1,
            b: {}
        },
        actions: {

        }
    }, {
        state: ['a']
    })).toEqual([1]);

    const r2 = getDepValue({
        maps: {
            a: 1,
            b
        },
        state: undefined,
        actions: {

        }
    }, {
        maps: ['a', 'b']
    });
    expect(r2).toEqual([1, b]);
    expect(r2[1]).toBe(b);

    const b2 = {}
    const r3 = getDepValue({
        state: {
            a: 2,
            b2, 
        },
        maps: {
            a: 1,
            b
        },
        actions: {

        }
    }, {
        state: ['a', s => s.b2],
        maps: ['a', 'b']
    });
    expect(r3).toEqual([2, b2, 1, b]);
    expect(r3[1]).toBe(b2);

})

test('use inject normal', async () => {
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
  expect(screen.getByRole('count')).toHaveTextContent('0');
  expect(screen.getByRole('text-split')).toHaveTextContent('name1'.split('').join(','));

})

