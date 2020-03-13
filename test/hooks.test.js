import React from 'react';
// import renderer from 'react-test-renderer';
import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
	App,
	AppWithErrorModuleName,
	AppWithLoadErrorModule,
	AppWithNoModule,
	initStore
} from './ui-demo/injectHooks';

import {
	App as AppChangeModule,
	initStore as initStore1,
} from './ui-demo/injectHooksChange';

import { setInjectStoreGetter } from '../src'

configure({ adapter: new Adapter() });


test('Inject hooks', () => {
	const s = initStore();
	setInjectStoreGetter(() => s);
	let app = mount(<App />);
	let appWithLoadErrorModule = mount(<AppWithLoadErrorModule />)
	expect(() => mount(<AppWithErrorModuleName />)).toThrow();
	expect(() => mount(<AppWithNoModule />)).toThrow();
	return new Promise(res => setTimeout(res))
		.then(() => {
			appWithLoadErrorModule.update();
			expect(appWithLoadErrorModule.text()).toBe('loading');

			app.update();
			expect(app.find('input').props().value).toBe('name');

			app.find('input').simulate('change', {target: {value: 'name1'}});

			expect(app.find('input').props().value).toBe('name1');
			expect(app.find('#textSplit').text()).toBe('name1'.split('').join(','));


			app.unmount();
		})
});


test('Inject hooks update only depends text', () => {
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

			app.find('input').simulate('change', {target: {value: 'name1'}});
			expect(app.find('#count').text()).toBe('1');
			expect(s.getModule('name').state.count).toBe(1);
			app.unmount();
		})
});




test('Inject hooks base', () => {
	const s = initStore1();
	setInjectStoreGetter(() => s);
	let app = mount(<AppChangeModule />);
	const count = () => app.find('#count').text();
	const name = () => app.find('#name').text();
	const inc = () => app.find('#inc').simulate('click');
	const dec = () => app.find('#dec').simulate('click');

	const changeName = newName => app.find('input').simulate('change', {target: {value: newName}});
	expect(count()).toBe('0')
	expect(name()).toBe('name')


	inc();
	expect(count()).toBe('1')

	inc();
	expect(count()).toBe('2')

	dec();
	expect(count()).toBe('1')

	dec();
	expect(count()).toBe('0')

	changeName('111')
	expect(name()).toBe('111')


});

