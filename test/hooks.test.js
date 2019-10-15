import React from 'react';
// import renderer from 'react-test-renderer';
import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
	App,
	AppWithErrorModuleName,
	AppWithLoadErrorModule,
	initStore
} from './ui-demo/injectHooks';

configure({ adapter: new Adapter() });


test('Inject hooks', () => {
	initStore();
	let app = mount(<App />);
	let appWithLoadErrorModule = mount(<AppWithLoadErrorModule />)
	expect(() => mount(<AppWithErrorModuleName />)).toThrow();
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
