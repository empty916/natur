import React from 'react';
import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
	store,
	App,
	AppWithNoModule,
	AppWithLoadErrorModule,
} from './ui-demo/injectHoc';

configure({ adapter: new Adapter() });

test('Inject Hoc', () => {
	let app = mount(<App />);
	let appWithoutModule = mount(<AppWithNoModule />);
	let appWithLoadErrorModule = mount(<AppWithLoadErrorModule />);
	expect(app.text()).toBe('loading');

	expect(appWithoutModule.text()).toBe('aaa');
	return new Promise(res => setTimeout(res, 1000))
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
	let app = mount(<App />);
	return new Promise(res => setTimeout(res, 1000))
		.then(() => {
			app.update();
			expect(app.find('#count').text()).toBe('0');
			app.find('button').simulate('click');
			expect(app.find('#count').text()).toBe('0');
			expect(store.getModule('name').state.count).toBe(1);

			app.find('#name-input').simulate('change', {target: {value: 'name1'}});
			expect(app.find('#count').text()).toBe('1');
			expect(store.getModule('name').state.count).toBe(1);
			app.unmount();
		})
});



