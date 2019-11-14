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
			expect(app.text()).toBe('name1'.split('').join(','));
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


test('Inject hooks change module', () => {
	const s = initStore1();
	setInjectStoreGetter(() => s);
	let app = mount(<AppChangeModule />);
	const count = () => app.find('#count').text();
	const name = () => app.find('#name').text();
	const inc = () => app.find('#inc').simulate('click');
	const dec = () => app.find('#dec').simulate('click');
	const changeName = newName => app.find('input').simulate('change', {target: {value: newName}});

	const changeModuleToCountName = () => app.find('#btn00').simulate('click');
	const changeModuleToCount1Name = () => app.find('#btn10').simulate('click');
	const changeModuleToCountName1 = () => app.find('#btn01').simulate('click');
	const changeModuleToCount1Name1 = () => app.find('#btn11').simulate('click');

	expect(count()).toBe('0')
	expect(name()).toBe('name')

	/**
	 * count: 1
	 * name: name0
	 */
	inc()
	changeName('name0')
	expect(count()).toBe('1')
	expect(name()).toBe('name0')

	changeModuleToCount1Name();
	return new Promise(res => setTimeout(res))
		.then(() => {
			app.update();
			/**
			 * count1: 2
			 * name: name1
			 */
			inc();inc();
			changeName('name1')
			expect(count()).toBe('2')
			expect(name()).toBe('name1')

			/**
			 * count: 0
			 * name1: name11
			 */
			changeModuleToCountName1();
			dec();
			changeName('name11')

			expect(count()).toBe('0')
			expect(name()).toBe('name11');

			/**
			 * count1: 2
			 * name1: name11
			 */
			changeModuleToCount1Name1();
			expect(count()).toBe('2')
			expect(name()).toBe('name11');


			changeModuleToCountName();
			expect(count()).toBe('0')
			expect(name()).toBe('name1');


			changeModuleToCount1Name();
			expect(count()).toBe('2')
			expect(name()).toBe('name1');

			changeModuleToCountName1();
			expect(count()).toBe('0')
			expect(name()).toBe('name11');
		})

});
