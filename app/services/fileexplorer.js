import config from '../config/environment';
import injectScript from 'ember-inject-script';
import Ember from 'ember';


export default (Ember.Service || Ember.Object).extend({

	_isPromiseFulfilled: false,
	_initFilepicker: Ember.on('init', function() {
		var _resolveFn, _rejectFn,
			_isPromiseFulfilled = false;
			
		this.set('promise', new Ember.RSVP.Promise(function(resolve, reject) {
			_resolveFn = resolve;
			_rejectFn = reject;
		}));

		injectScript(this.get('scriptURL'))
			.then(Ember.run.bind(this, function() {

        var fileexplorer = window.Kloudless.explorer({
          // Explorer Initialization options here.
          app_id: this.get('key'),
          multiselect: true,
          computer: true,
          link: true,
          services: ['all'],
          types: ['all'],
          display_backdrop: true
        });

        //here we check that fileexplorer is an object that contains a choose function
				if (fileexplorer && fileexplorer.choose) {

					if (!(this.isDestroyed || this.isDestroying)) {
						this.set('instance', fileexplorer);
					}
					_resolveFn.call(null, fileexplorer);
					_isPromiseFulfilled = true;
				} else {
					_rejectFn.call(null, new Error("Could not load fileexplorer. Please check 'scriptURL' directs to fileexplorer script."));
				}
				
			}))
			.catch(Ember.run.bind(this, function(error) {
				_rejectFn.call(null, error);
			}));

		Ember.run.later(this, function(){
			if (!_isPromiseFulfilled){
				_rejectFn.call(null, new Error('fileexplorer script load timeout.'));
			}
		}, this.get('scriptLoadTimeout'));

	}),
	key: config.fileexplorerKey || config.APP.fileexplorerKey,
	scriptURL : config.fileexplorerURL || config.APP.fileexplorerURL || 'https://static-cdn.kloudless.com/p/platform/sdk/kloudless.explorer.js',
	scriptLoadTimeout: config.fileexplorerScriptLoadTimeout || config.APP.fileexplorerScriptLoadTimeout || 10000,
	promise: null,
	instance: null
});
