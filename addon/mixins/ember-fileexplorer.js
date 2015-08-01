import Ember from 'ember';

var isServiceInjectionSupported = Ember.inject && Ember.inject.service;

var PICK_METHOD_NAME = 'choose',
	PICK_MULTIPLE_METHOD_NAME = 'choose',
	PICK_AND_STORE_METHOD_NAME = 'choose';

export default Ember.Mixin.create({
	injectFileexplorerService: function() {
		if (!isServiceInjectionSupported) {
			this.set('fileexplorer', this.container.lookup('service:fileexplorer'));
		}
	}.on('init'),
	handleSelection: function(data) {
		if (this.get('onSelection')) {
			this.sendAction('onSelection', data);
		}
	},
	handleError: function(data) {
		if (data.code === 101 && this.get('onClose')) {
			this.sendAction('onClose');
		} else if (this.get('onError')) {
			this.sendAction('onError', data);
		}
	},
	onSelection: null,
	onError: null,
	onClose: null,
	options: null,
	pickerOptions: {},
	storeOptions: null,
	multiple: false,
	fileexplorer: Ember.inject ? Ember.inject.service() : null,
	openFileexplorer: Ember.on('didInsertElement', function() {
		Ember.run.scheduleOnce('afterRender', this, function() {
      console.log('fileexplorer :: running afterRender');
			this.get('fileexplorer.promise').then(Ember.run.bind(this, function(fileexplorer) {
        console.log('fileexplorer :: fileexplorer.promise succeeded.');

        var pickerOptions, storeOptions,
					options = this.get('options'),
					usePickAndStore,
					fileexplorerMethod,
					args = [];

				if (options) {

					pickerOptions = options.picker;
					storeOptions = options.store;
					usePickAndStore = (pickerOptions && options.useStore);
					Ember.deprecate("'options' was passed instead of 'pickerOptions' and possibly 'storeOptions'. The options parameter has been split into these parameters.");

				} else {

					pickerOptions = this.get('pickerOptions');
					storeOptions = this.get('storeOptions');
					usePickAndStore = (pickerOptions && storeOptions);

				}

				if (usePickAndStore) {

					if (this.get('multiple') && (pickerOptions && !pickerOptions.multiple)) {
						pickerOptions = Ember.merge({
							multiple: true
						}, pickerOptions);
					}
          fileexplorerMethod = PICK_AND_STORE_METHOD_NAME;
					args.push(pickerOptions);
					args.push(storeOptions);

				} else {
					args.push(pickerOptions);
				}

				args.push(Ember.run.bind(this, this.handleSelection));
				args.push(Ember.run.bind(this, this.handleError));

				if (!fileexplorerMethod) {
					if (this.get('multiple')) {
            fileexplorerMethod = PICK_MULTIPLE_METHOD_NAME;
					} else {
            fileexplorerMethod = PICK_METHOD_NAME;
					}
				}

				fileexplorer[fileexplorerMethod].apply(fileexplorer, args);
			}));
		});
	})

});