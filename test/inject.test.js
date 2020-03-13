import React from 'react';
import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
	App,
	AppWithNoModule,
	AppWithLoadErrorModule,
	initStore
} from './ui-demo/injectHoc';

import { setInjectStoreGetter } from '../src'

configure({ adapter: new Adapter() });

test('Inject without createStore', () => {
	expect(() => mount(<App />)).toThrow();
});

test('Inject Hoc', () => {
	const s = initStore();
	setInjectStoreGetter(() => s);
	let app = mount(<App />);
	let appWithoutModule = mount(<AppWithNoModule />);
	let appWithLoadErrorModule = mount(<AppWithLoadErrorModule />);
	expect(app.text()).toBe('loading');

	expect(appWithoutModule.text()).toBe('aaa');
	return new Promise(res => setTimeout(res))
		.then(() => {
			appWithLoadErrorModule.update();
			expect(appWithLoadErrorModule.text()).toBe('loading');

			app.update();
			expect(app.find('#lazy-name-input').props().value).toBe('name');

			app.find('#lazy-name-input').simulate('change', {target: {value: 'name1'}});
			app.update();
			expect(app.find('#lazy-name-input').props().value).toBe('name1');
			expect(app.find('#textSplit').text()).toBe('name'.split('').join(','));
			app.unmount();
		});
});


test('Inject hoc update only depends text', () => {
	const s = initStore();
	setInjectStoreGetter(() => s);
	let app = mount(<App />);
	return new Promise(res => setTimeout(res))
		.then(() => {
			app.update();
			expect(app.find('#count').text()).toBe('0');
			app.find('button').simulate('click');
			expect(app.find('#count').text()).toBe('0');
			expect(s.getModule('name').state.count).toBe(1);

			app.find('#name-input').simulate('change', {target: {value: 'name1'}});
			expect(app.find('#count').text()).toBe('1');
			expect(s.getModule('name').state.count).toBe(1);
			app.unmount();
		})
});



