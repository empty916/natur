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
			expect(app.find('input').props().value).toBe('name');
			app.find('input').simulate('change', {target: {value: 'name1'}});
			expect(app.find('input').props().value).toBe('name1');
			expect(app.text()).toBe('name1'.split('').join(','));
			app.unmount();
		});
});



