"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('ember-on-fhir/acceptance-tests/index', ['exports', 'ember-cli-spinjs/acceptance-tests/index'], function (exports, _emberCliSpinjsAcceptanceTestsIndex) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliSpinjsAcceptanceTestsIndex['default'];
    }
  });
});
define('ember-on-fhir/adapters/application', ['exports', 'ember', 'ember-data', 'ember-simple-auth/mixins/data-adapter-mixin'], function (exports, _ember, _emberData, _emberSimpleAuthMixinsDataAdapterMixin) {
  exports['default'] = _emberData['default'].RESTAdapter.extend(_emberSimpleAuthMixinsDataAdapterMixin['default'], {
    authorizer: 'authorizer:ie',

    pathForType: function pathForType(type) {
      return _ember['default'].String.capitalize(_ember['default'].String.camelize(type));
    }
  });
});
define('ember-on-fhir/adapters/risk', ['exports', 'ember-on-fhir/adapters/application'], function (exports, _emberOnFhirAdaptersApplication) {
  exports['default'] = _emberOnFhirAdaptersApplication['default'].extend({
    buildURL: function buildURL() /* modelName, id, snapshot, requestType, query */{
      // TODO Figure out a method of specifying the risk model to use.
      return this.urlPrefix() + '/Patient?_query=risk&MedicationStatement=count&MedicationStatementWeight=1&Condition=count&ConditionWeight=1&min=5';
    }
  });
});
define('ember-on-fhir/app', ['exports', 'ember', 'ember-on-fhir/resolver', 'ember-load-initializers', 'ember-on-fhir/config/environment'], function (exports, _ember, _emberOnFhirResolver, _emberLoadInitializers, _emberOnFhirConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _emberOnFhirConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _emberOnFhirConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberOnFhirResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _emberOnFhirConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('ember-on-fhir/authenticators/ie', ['exports', 'ember', 'ember-simple-auth/authenticators/base', 'ember-service/inject', 'ember-runloop', 'ember-utils'], function (exports, _ember, _emberSimpleAuthAuthenticatorsBase, _emberServiceInject, _emberRunloop, _emberUtils) {
  var Promise = _ember['default'].RSVP.Promise;
  exports['default'] = _emberSimpleAuthAuthenticatorsBase['default'].extend({
    ajax: (0, _emberServiceInject['default'])(),

    tokenEndpoint: '/auth',

    restore: function restore(data) {
      return new Promise(function (resolve, reject) {
        if (!(0, _emberUtils.isEmpty)(data.token)) {
          resolve(data);
        } else {
          reject();
        }
      });
    },

    authenticate: function authenticate(identification, password) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var request = _this.get('ajax').request(_this.get('tokenEndpoint'), {
          type: 'POST',
          data: JSON.stringify({
            session: { identification: identification, password: password }
          }),
          contentType: 'application/json',
          dataType: 'json'
        });

        request.then(function (response) {
          (0, _emberRunloop['default'])(function () {
            resolve({
              token: response.session.token
            });
          });
        });

        request['catch'](function (error) {
          var response = error.payload;
          (0, _emberRunloop['default'])(function () {
            reject(response.error);
          });
        });
      });
    },

    invalidate: function invalidate() {
      var _this2 = this;

      return new Promise(function (resolve) {
        _this2.get('ajax').request(_this2.get('tokenEndpoint'), { type: 'DELETE' }).then(resolve, resolve);
      });
    }
  });
});

// import RSVP from 'rsvp';
define('ember-on-fhir/authorizers/ie', ['exports', 'ember', 'ember-simple-auth/authorizers/base'], function (exports, _ember, _emberSimpleAuthAuthorizersBase) {
  exports['default'] = _emberSimpleAuthAuthorizersBase['default'].extend({
    authorize: function authorize(data, block) {
      var token = data.token;

      if (!_ember['default'].isEmpty(token)) {
        block('Authorization', token);
      }
    }
  });
});
define('ember-on-fhir/components/add-intervention-modal', ['exports', 'ember', 'ember-on-fhir/utils/true-null-property'], function (exports, _ember, _emberOnFhirUtilsTrueNullProperty) {
  var computed = _ember['default'].computed;

  var interventionTypes = [{ 'iconClassnames': 'fa fa-calendar', 'name': 'Schedule Appointment' }, { 'iconClassnames': 'fa fa-home', 'name': 'Home Visit' }, { 'iconClassnames': 'fa fa-phone', 'name': 'Phone Call' }, { 'iconClassnames': 'icon-medication', 'name': 'Medication' }, { 'iconClassnames': 'fa fa-cutlery', 'name': 'Diet' }, { 'iconClassnames': 'fa fa-heartbeat', 'name': 'Exercise' }];

  exports['default'] = _ember['default'].Component.extend({
    interventionTypes: interventionTypes,

    _items: null,
    _selectedItem: null,

    init: function init() {
      this._super.apply(this, arguments);
      this._items = new _ember['default'].A();
    },

    hasNoSelectedItem: computed.empty('_selectedItem'),
    saveBtnDisabled: (0, _emberOnFhirUtilsTrueNullProperty['default'])('hasNoSelectedItem'),

    actions: {
      registerDetailItem: function registerDetailItem(item) {
        this.get('_items').addObject(item);
      },

      expandItem: function expandItem(item) {
        var selectedItem = this.get('_selectedItem');

        if (selectedItem === item) {
          return;
        } else if (selectedItem) {
          selectedItem.slideUp();
        }

        this.set('_selectedItem', item);
        item.slideDown();
      },

      save: function save(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var selectedItem = this.get('_selectedItem');
        if (!selectedItem) {
          return;
        }

        var intervention = selectedItem.get('intervention.name');
        var detail = selectedItem.get('detail');

        console.log('SAVE: intervention(%s), detail(%s)', intervention, detail);

        // TODO: create intervention here
        // `intervention` is the `name` attribute from above (e.g., "Home Visit")
        // `detail` is the text typed in the text area (can be empty)
      }
    }
  });
});
define('ember-on-fhir/components/add-intervention-modal/intervention-detail', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    classNames: ['intervention-list-group-item'],
    classNameBindings: ['_active:active'],

    _registeredParent: null,
    _active: false,

    intervention: null,
    detail: '',

    init: function init() {
      this._super.apply(this, arguments);
      _ember['default'].run.scheduleOnce('actions', this, this._registerWithParent);
    },

    click: function click() {
      this.attrs.expand(this);
    },

    slideUp: function slideUp() {
      this.$('.collapsible-panel').slideUp();
      this.set('_active', false);
    },

    slideDown: function slideDown() {
      this.$('.collapsible-panel').slideDown();
      this.set('_active', true);
    },

    _registerWithParent: function _registerWithParent() {
      this.attrs.registerDetailItem(this);
    }
  });
});
define('ember-on-fhir/components/add-to-huddle-modal', ['exports', 'ember-component', 'ember-computed', 'ember-service/inject', 'ember-runloop', 'moment', 'ember-on-fhir/mixins/has-stylesheet', 'ember-on-fhir/models/huddle', 'ember-on-fhir/models/huddle-patient', 'ember-on-fhir/utils/create-stylesheet'], function (exports, _emberComponent, _emberComputed, _emberServiceInject, _emberRunloop, _moment, _emberOnFhirMixinsHasStylesheet, _emberOnFhirModelsHuddle, _emberOnFhirModelsHuddlePatient, _emberOnFhirUtilsCreateStylesheet) {
  exports['default'] = _emberComponent['default'].extend(_emberOnFhirMixinsHasStylesheet['default'], {
    ajax: (0, _emberServiceInject['default'])(),
    store: (0, _emberServiceInject['default'])(),

    defaultDate: null,
    huddle: null,
    huddles: null,
    patientHuddles: null, // master huddle list from the patient viewer controller

    huddleDate: (0, _emberComputed['default'])('defaultDate', {
      get: function get() {
        return this.get('defaultDate') || new Date();
      }
    }),

    huddleLeader: (0, _emberComputed['default'])('huddle.displayLeader', {
      get: function get() {
        var huddle = this.get('huddle');
        if (huddle != null) {
          return huddle.get('displayLeader');
        }
        return '';
      }
    }),

    huddleReasonText: (0, _emberComputed['default'])('huddle', {
      get: function get() {
        var huddle = this.get('huddle');
        if (huddle != null) {
          return huddle.getHuddlePatient(this.get('patient')).get('reasonText');
        }
        return '';
      }
    }),

    patient: null,
    isLoading: true,
    huddleLeaderDisabled: _emberComputed['default'].notEmpty('existingHuddle'),

    huddleReasonTextDisabled: (0, _emberComputed['default'])('patientInExistingHuddle', {
      get: function get() {
        if (this.get('patientInExistingHuddle')) {
          var huddlePatient = this.get('existingHuddle').getHuddlePatient(this.get('patient'));
          return huddlePatient.get('reason') !== _emberOnFhirModelsHuddlePatient.REASON_CODES.MANUAL_ADDITION;
        }

        return false;
      }
    }),

    formSaving: false,

    saveBtnDisabled: (0, _emberComputed['default'])('formSaving', 'patientInExistingHuddle', 'huddleReasonText', {
      get: function get() {
        if (this.get('formSaving')) {
          return true;
        }

        if (this.get('patientInExistingHuddle')) {
          var huddlePatient = this.get('existingHuddle').getHuddlePatient(this.get('patient'));
          if (huddlePatient.get('reason') === _emberOnFhirModelsHuddlePatient.REASON_CODES.MANUAL_ADDITION) {
            return huddlePatient.get('reasonText') === this.get('huddleReasonText');
          }

          return true;
        }

        return false;
      }
    }),

    removeBtnDisabled: _emberComputed['default'].alias('formSaving'),

    title: (0, _emberComputed['default'])('huddle', {
      get: function get() {
        if (this.get('huddle') == null) {
          return 'Add to Huddle';
        } else {
          return 'Edit Huddle Patient';
        }
      }
    }).readOnly(),

    existingHuddle: (0, _emberComputed['default'])('huddles.[]', 'huddleDate', {
      get: function get() {
        var huddleDate = (0, _moment['default'])(this.get('huddleDate'));
        var huddles = this.get('huddles');
        var huddle = null;

        for (var i = 0; i < huddles.length; i++) {
          if (huddleDate.isSame(huddles[i].get('date'), 'day')) {
            huddle = huddles[i];
            break;
          }
        }

        return huddle;
      }
    }),

    patientInExistingHuddle: (0, _emberComputed['default'])('existingHuddle', 'patient.id', {
      get: function get() {
        var existingHuddle = this.get('existingHuddle');
        if (existingHuddle == null) {
          return;
        }

        var patientId = this.get('patient.id');
        return existingHuddle.get('patientIds').contains(patientId);
      }
    }),

    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);

      this.get('ajax').request('/Group', {
        data: {
          code: 'http://interventionengine.org/fhir/cs/huddle|HUDDLE'
        }
      }).then(function (response) {
        _this.set('isLoading', false);
        _this.set('huddles', (0, _emberOnFhirModelsHuddle.parseHuddles)(response.entry || []));
        (0, _emberRunloop.schedule)('afterRender', _this, _this.setStyles);
      });
    },

    setStyles: function setStyles() {
      var huddles = this.get('huddles');
      var patient = this.get('patient');
      var pikadayThemeName = this.elementId + '-pikaday';
      var sheet = this.sheet.sheet;

      for (var i = 0; i < huddles.length; i++) {
        var date = (0, _moment['default'])(huddles[i].get('date'));
        var year = date.year();
        var month = date.month();
        var day = date.date();

        var cssRule = 'border: 1px dashed #5D8FAE; border-radius: 3px;';
        if (huddles[i].hasPatient(patient)) {
          cssRule = 'background-color: #5D8FAE; color: #fff; border-radius: 3px; box-shadow: inset 0 1px 3px #53809c';
        }

        (0, _emberOnFhirUtilsCreateStylesheet.addCSSRule)(sheet, '.' + pikadayThemeName + ' [data-pika-year="' + year + '"][data-pika-month="' + month + '"][data-pika-day="' + day + '"]', cssRule);
      }
    },

    rescheduleHuddles: function rescheduleHuddles() {
      return this.get('ajax').request('/ScheduleHuddles');
    },

    deleteHuddle: function deleteHuddle() {
      var huddle = this.get('huddle');
      if (huddle == null) {
        return;
      }

      return this.get('ajax').request('/Group/' + huddle.get('id'), {
        type: 'DELETE',
        contentType: 'application/json; charset=UTF-8'
      });
    },

    actions: {
      save: function save(event) {
        var _this2 = this;

        event.preventDefault();
        event.stopImmediatePropagation();

        this.set('formSaving', true);

        var patient = this.get('patient');
        var huddle = this.get('existingHuddle');
        var newHuddle = false;

        if (huddle == null) {
          huddle = _emberOnFhirModelsHuddle['default'].create({
            date: this.get('huddleDate'),
            leader: 'Practitioner/' + this.get('huddleLeader'),
            name: (0, _moment['default'])(this.get('huddleDate')).format('MMMM D, YYYY') // TODO: change this
          });

          newHuddle = true;
        }

        huddle.addPatient(patient, this.get('huddleReasonText'));

        var url = newHuddle ? '/Group' : '/Group/' + huddle.get('id');
        var type = newHuddle ? 'POST' : 'PUT';

        this.get('ajax').request(url, {
          data: JSON.stringify(huddle.toFhirJson()),
          type: type,
          contentType: 'application/json; charset=UTF-8'
        }).then(function (response) {
          if (newHuddle) {
            huddle.set('id', response.id);
          }

          _this2.get('patientHuddles').pushObject(huddle);

          var oldHuddle = _this2.get('huddle');
          if (oldHuddle != null && oldHuddle.get('id') !== huddle.get('id')) {
            var promise = undefined;
            if (oldHuddle.get('patients.length') === 1) {
              // simple case, huddle has only one patient: destroy the huddle
              promise = _this2.deleteHuddle();
            } else {
              oldHuddle.removePatient(patient);
              promise = _this2.get('ajax').request('/Group/' + oldHuddle.get('id'), {
                data: JSON.stringify(oldHuddle.toFhirJson()),
                type: 'PUT',
                contentType: 'application/json; charset=UTF-8'
              });
            }

            promise.then(function () {
              _this2.get('patientHuddles').removeObject(oldHuddle);
              _this2.rescheduleHuddles()['finally'](_this2.attrs.onClose);
            });

            return;
          }

          _this2.rescheduleHuddles()['finally'](_this2.attrs.onClose);
        })['catch'](function () {
          alert('Failed to save huddle, please try your request again');
          _this2.set('formSaving', false);
        });
      },

      removePatientFromHuddle: function removePatientFromHuddle(event) {
        var _this3 = this;

        event.preventDefault();
        event.stopImmediatePropagation();

        var huddle = this.get('huddle');
        if (huddle == null) {
          return;
        }

        this.set('formSaving', true);

        var patient = this.get('patient');
        var promise = undefined;

        if (huddle.get('patients.length') === 1) {
          // simple case, huddle has only one patient: destroy the huddle
          promise = this.deleteHuddle();
        } else {
          huddle.removePatient(patient);
          promise = this.get('ajax').request('/Group/' + huddle.get('id'), {
            data: JSON.stringify(huddle.toFhirJson()),
            type: 'PUT',
            contentType: 'application/json; charset=UTF-8'
          });
        }

        promise.then(function () {
          _this3.get('patientHuddles').removeObject(huddle);
          _this3.rescheduleHuddles()['finally'](_this3.attrs.onClose);
        })['catch'](function () {
          alert('Failed to save huddle, please try your request again');
          _this3.set('formSaving', false);
        });
      }
    }
  });
});
define('ember-on-fhir/components/age-filter', ['exports', 'ember-component', 'ember-computed', 'ember-on-fhir/mixins/filter-component'], function (exports, _emberComponent, _emberComputed, _emberOnFhirMixinsFilterComponent) {
  exports['default'] = _emberComponent['default'].extend(_emberOnFhirMixinsFilterComponent['default'], {
    checkboxBaseName: 'age-filter',

    timePeriods: ['years', 'months', 'weeks', 'days'],
    comparators: ['between', 'exactly', 'less than', 'less than or equal to', 'greater than', 'greater than or equal to'],

    selectedTimePeriod: 'years',
    selectedComparator: 'between',
    highValueExists: _emberComputed['default'].equal('selectedComparator', 'between'),

    lowValue: (0, _emberComputed['default'])({
      get: function get() {
        return 0;
      },

      set: function set(key, newValue) {
        if (newValue !== null && newValue !== undefined) {
          var characteristic = this.get('characteristic');
          if (characteristic) {
            characteristic.set('valueRange.low.value', newValue);
          }
        }

        return newValue;
      }
    }),

    highValue: (0, _emberComputed['default'])({
      get: function get() {},

      set: function set(key, newValue) {
        if (newValue !== null && newValue !== undefined) {
          var characteristic = this.get('characteristic');
          if (characteristic) {
            characteristic.set('valueRange.high.value', newValue);
          }
        }

        return newValue;
      }
    }),

    init: function init() {
      this._super.apply(this, arguments);
      this.set('lowValue', this.get('characteristic.valueRange.low.value'));
      this.set('highValue', this.get('characteristic.valueRange.high.value'));
    },

    onToggle: function onToggle(active) {
      if (active) {
        this.set('lowValue', this.get('characteristic.valueRange.low.value'));
        this.set('highValue', this.get('characteristic.valueRange.high.value'));
      }
    },

    actions: {
      updateValue: function updateValue(field, event) {
        this.set(field, event.target.value);
        this.attrs.onChange();
      },

      selectTimePeriod: function selectTimePeriod(period) {
        this.set('selectedTimePeriod', period);
        this.attrs.onChange();
      },

      selectComparator: function selectComparator(comparator) {
        this.set('selectedComparator', comparator);
        this.attrs.onChange();
      }
    }
  });
});
define('ember-on-fhir/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'ember-on-fhir/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _emberOnFhirConfigEnvironment) {

  var name = _emberOnFhirConfigEnvironment['default'].APP.name;
  var version = _emberOnFhirConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('ember-on-fhir/components/aster-plot-chart', ['exports', 'ember-component', 'ember-metal/observer', 'ember-computed'], function (exports, _emberComponent, _emberMetalObserver, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    data: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),

    svg: null,
    patient: null,
    padding: 5,
    size: 600,
    selectedCategory: null,

    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      var svg = d3.select(this.element).select('svg');
      var width = this.get('size') - 2 * this.get('padding');
      var height = width;

      var g = svg.append('g').attr('transform', 'translate(' + (width / 2 + this.get('padding')) + ', ' + (height / 2 + this.get('padding')) + ')');

      g.append('g').classed('outer', true);
      g.append('g').classed('inner', true);

      this.updateChart();
      this.selectedCategoryObserver();
    },

    selectedCategoryObserver: (0, _emberMetalObserver['default'])('selectedCategory', function selectedCategoryObserver() {
      var svg = d3.select(this.element).select('svg');

      if (svg == null) {
        return;
      }

      svg.selectAll('.category').classed('active', false);

      var category = this.get('selectedCategory');
      if (category != null) {
        svg.selectAll('.category' + category.name.camelize().capitalize()).classed('active', true);
      }
    }),

    tip: (0, _emberComputed['default'])({
      get: function get() {
        return d3.tip().attr('class', 'd3-tip').html(function (d) {
          return d.data.name + ' : ' + d.data.value;
        });
      }
    }),

    updateChart: (0, _emberMetalObserver['default'])('data', function updateChart() {
      var _this = this;

      var svg = d3.select(this.element).select('svg');
      if (svg == null || !this.get('data')) {
        return;
      }

      var data = this.get('data');
      var width = this.get('size') - 2 * this.get('padding');
      var height = width;
      var maxValue = d3.max(data, function (d) {
        return d.value;
      });
      var outerRadius = d3.min([width, height]) / 2;
      var radius = outerRadius * 0.80;
      var innerRadius = 0.17 * radius;
      var minRadius = 0.34 * radius;
      var maxSliceRadius = 0.8 * radius;

      var selectCategory = function selectCategory(d) {
        if (_this.get('selectedCategory') === d.data) {
          _this.attrs.selectCategory(null);
        } else {
          _this.attrs.selectCategory(d.data);
        }
      };

      var tip = this.get('tip');

      svg.call(tip);

      var pie = d3.layout.pie().padAngle(0.03).sort(null).value(function (d) {
        return d.weight;
      });

      var radiusScale = d3.scale.linear().domain([0, 1]).range([minRadius, maxSliceRadius]).clamp(true);
      var opacityScale = d3.scale.linear().domain([0, 1]).range([0.4, 1]);
      var outerArc = d3.svg.arc().innerRadius(200).outerRadius(radius).cornerRadius(5);

      var outerpath = svg.select('g').select('.outer').selectAll('path').data(pie(data));
      outerpath.enter().append('path');
      outerpath.exit().remove();
      outerpath.on('mouseover', tip.show).on('mouseout', tip.hide).attr('d', outerArc).attr('fill-opacity', function (d) {
        return opacityScale(d3.max([d.data.value, 0]) / (d.data.maxValue || maxValue));
      }).attr('class', function (d) {
        return 'category category' + d.data.name.camelize().capitalize();
      }).on('click', selectCategory);

      var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function (d) {
        return radiusScale(d3.max([d.data.value, 0]) / (d.data.maxValue || maxValue));
      }).cornerRadius(5);

      var pathingData = svg.select('g').select('.inner').selectAll('path').data(pie(data));
      pathingData.enter().append('path');
      pathingData.exit().remove();
      pathingData.on('mouseover', tip.show).on('mouseout', tip.hide).attr('d', arc).attr('fill-opacity', function (d) {
        return opacityScale(d3.max([d.data.value, 0]) / (d.data.maxValue || maxValue));
      }).attr('class', function (d) {
        return 'category category' + d.data.name.camelize().capitalize();
      }).on('click', selectCategory);
    })
  });
});
define('ember-on-fhir/components/bootstrap-modal', ['exports', 'jquery', 'ember-modal-dialog/components/modal-dialog', 'ember-on-fhir/templates/components/bootstrap-modal', 'ember-computed', 'ember-runloop'], function (exports, _jquery, _emberModalDialogComponentsModalDialog, _emberOnFhirTemplatesComponentsBootstrapModal, _emberComputed, _emberRunloop) {
  exports['default'] = _emberModalDialogComponentsModalDialog['default'].extend({
    layout: _emberOnFhirTemplatesComponentsBootstrapModal['default'],

    hasOverlay: true,
    clickOutsideToClose: true,
    containerClassNames: ['modal', 'fade'],
    overlayClassNames: ['modal-backdrop', 'fade'],
    extraClasses: '',
    disableClickToClose: false,
    showCloseButton: true,
    targetAttachment: null,

    title: '',
    hasNoTitle: _emberComputed['default'].empty('title'),

    didInsertElement: function didInsertElement() {
      this._registerClickHandler();
      this._addEscListener();
      (0, _emberRunloop.next)(this, animateModalIn);

      (0, _jquery['default'])(document.body).addClass('modal-open');

      callAttrFunction(this.attrs.onOpen);
    },

    willDestroyElement: function willDestroyElement() {
      this._removeEscListener();
      (0, _jquery['default'])(document.body).removeClass('modal-open');
      this._super.apply(this, arguments);
    },

    _addEscListener: function _addEscListener() {
      var _this = this;

      (0, _jquery['default'])(document.body).on('keyup.modal-dialog', function (event) {
        if (_this.get('disableClickToClose')) {
          return;
        }

        if (event.keyCode === 27) {
          _this.send('close');
        }
      });
    },

    _removeEscListener: function _removeEscListener() {
      (0, _jquery['default'])(document.body).off('keyup.modal-dialog');
    },

    _registerClickHandler: function _registerClickHandler() {
      var _this2 = this;

      var handleClick = function handleClick(event) {
        if (!_this2.get('clickOutsideToClose') || _this2.get('disableClickToClose')) {
          return;
        }

        if (!(0, _jquery['default'])(event.target).closest('.modal-dialog').length) {
          _this2.send('close');
        }
      };
      var registerClick = function registerClick() {
        return (0, _jquery['default'])(document).on('click.ember-modal-dialog', handleClick);
      };

      // setTimeout needed or else the click handler will catch the click that spawned this modal dialog
      setTimeout(registerClick);
    },

    actions: {
      close: function close() {
        callAttrFunction(this.attrs.onClose);
      }
    }
  });

  function animateModalIn() {
    (0, _jquery['default'])('.modal').addClass('in');
    (0, _jquery['default'])('.modal-backdrop').addClass('in');
  }

  function callAttrFunction(fn) {
    if (fn && _jquery['default'].isFunction(fn)) {
      fn();
    }
  }
});
define('ember-on-fhir/components/bootstrap-tooltip', ['exports', 'ember'], function (exports, _ember) {
  var computed = _ember['default'].computed;
  exports['default'] = _ember['default'].Component.extend({
    tooltip: '',
    tooltipPlacement: 'top',
    tooltipTrigger: 'hover focus',

    config: computed({
      get: function get() {
        var _this = this;

        return {
          container: 'body',
          placement: this.get('tooltipPlacement'),
          title: function title() {
            return _this.get('tooltip');
          },
          trigger: this.get('tooltipTrigger')
        };
      }
    }),

    didInsertElement: function didInsertElement() {
      this.$().tooltip(this.get('config'));
    },

    willDestroyElement: function willDestroyElement() {
      this.$().tooltip('destroy');
    }
  });
});
define('ember-on-fhir/components/c3-chart', ['exports', 'ember-cli-c3/components/c3-chart'], function (exports, _emberCliC3ComponentsC3Chart) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliC3ComponentsC3Chart['default'];
    }
  });
});
define('ember-on-fhir/components/category-details', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    category: null
  });
});
define('ember-on-fhir/components/coding-typeahead', ['exports', 'ember-component', 'ember-computed', 'ember-service/inject'], function (exports, _emberComponent, _emberComputed, _emberServiceInject) {

  var AUTOCOMPLETE_ITEM_MAX = 10;

  exports['default'] = _emberComponent['default'].extend({
    ajax: (0, _emberServiceInject['default'])(),

    tagName: 'span',

    classNames: ['pane-input'],

    type: null,
    placeholder: null,
    coding: null,

    displayValue: (0, _emberComputed['default'])({
      get: function get() {
        return this.get('coding.code');
      },

      set: function set(key, value) {
        return value;
      }
    }),

    didInsertElement: function didInsertElement() {
      var self = this;

      this.$('.typeahead').typeahead({
        delay: 750,
        items: AUTOCOMPLETE_ITEM_MAX,
        displayText: function displayText(item) {
          return item.code + ': ' + item.name;
        },
        matcher: function matcher() {
          return true;
        },
        sorter: function sorter(items) {
          return items;
        },
        source: function source(query, process) {
          var codesystem = self.get('coding.display');
          var queryParams = {
            codesystem: codesystem,
            query: query,
            limit: AUTOCOMPLETE_ITEM_MAX
          };

          var request = self.get('ajax').request('/CodeLookup', {
            type: 'POST',
            data: JSON.stringify(queryParams),
            contentType: 'application/json'
          });

          request.then(function (results) {
            process(results.map(function (result) {
              return { name: result.Name, code: result.Code };
            }));
          });
        },

        // FROM: https://github.com/bassjobsen/Bootstrap-3-Typeahead/blob/master/bootstrap3-typeahead.js#L75
        select: function select() {
          var val = this.$menu.find('.active').data('value');
          this.$element.data('active', val);

          if (this.autoSelect || val) {
            var newVal = this.updater(val);
            this.$element.val(this.displayText(newVal) || newVal).change();
            this.afterSelect(newVal);
          }

          // custom code
          self.set('displayValue', val ? val.code + ': ' + val.name : null);
          self.get('coding').set('code', val ? val.code : null);

          return this.hide();
        }
      });
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);

      if (this.isDestroyed) {
        return;
      }

      this.$('.typeahead').typeahead('destroy');
    },

    actions: {
      updateCode: function updateCode(event) {
        var val = event.target.value;
        if (val === '') {
          val = null;
        }

        this.get('coding').set('code', val);
        this.set('displayValue', val);
      }
    }
  });
});
define('ember-on-fhir/components/condition-code-filter', ['exports', 'ember', 'ember-on-fhir/mixins/filter-component', 'ember-on-fhir/mixins/condition-encounter-code-filters'], function (exports, _ember, _emberOnFhirMixinsFilterComponent, _emberOnFhirMixinsConditionEncounterCodeFilters) {
  exports['default'] = _ember['default'].Component.extend(_emberOnFhirMixinsFilterComponent['default'], _emberOnFhirMixinsConditionEncounterCodeFilters['default'], {
    checkboxBaseName: 'condition-filter',

    codingSystems: [{ url: 'http://hl7.org/fhir/sid/icd-9', system: 'ICD-9' }, { url: 'http://hl7.org/fhir/sid/icd-10', system: 'ICD-10' }]
  });
});
define('ember-on-fhir/components/draggable-object-target', ['exports', 'ember-drag-drop/components/draggable-object-target'], function (exports, _emberDragDropComponentsDraggableObjectTarget) {
  exports['default'] = _emberDragDropComponentsDraggableObjectTarget['default'];
});
define('ember-on-fhir/components/draggable-object', ['exports', 'ember-drag-drop/components/draggable-object'], function (exports, _emberDragDropComponentsDraggableObject) {
  exports['default'] = _emberDragDropComponentsDraggableObject['default'];
});
define('ember-on-fhir/components/ember-modal-dialog-positioned-container', ['exports', 'ember-modal-dialog/components/positioned-container'], function (exports, _emberModalDialogComponentsPositionedContainer) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberModalDialogComponentsPositionedContainer['default'];
    }
  });
});
define('ember-on-fhir/components/ember-spinner', ['exports', 'ember', 'ember-cli-spinjs/components/ember-spinner'], function (exports, _ember, _emberCliSpinjsComponentsEmberSpinner) {
  exports['default'] = _emberCliSpinjsComponentsEmberSpinner['default'];
});
/* global Spinner */
define('ember-on-fhir/components/ember-wormhole', ['exports', 'ember-wormhole/components/ember-wormhole'], function (exports, _emberWormholeComponentsEmberWormhole) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberWormholeComponentsEmberWormhole['default'];
    }
  });
});
define('ember-on-fhir/components/encounter-code-filter', ['exports', 'ember', 'ember-on-fhir/mixins/filter-component', 'ember-on-fhir/mixins/condition-encounter-code-filters'], function (exports, _ember, _emberOnFhirMixinsFilterComponent, _emberOnFhirMixinsConditionEncounterCodeFilters) {
  exports['default'] = _ember['default'].Component.extend(_emberOnFhirMixinsFilterComponent['default'], _emberOnFhirMixinsConditionEncounterCodeFilters['default'], {
    checkboxBaseName: 'encounter-filter',

    codingSystems: [{ url: 'http://www.ama-assn.org/go/cpt', system: 'CPT' }, { url: 'http://snomed.info/sct', system: 'SNOMED CT' }]
  });
});
define('ember-on-fhir/components/filter-builder', ['exports', 'ember', 'ember-component', 'ember-runloop', 'ember-service/inject'], function (exports, _ember, _emberComponent, _emberRunloop, _emberServiceInject) {
  var computed = _ember['default'].computed;
  var generateGuid = _ember['default'].generateGuid;
  exports['default'] = _emberComponent['default'].extend({
    routing: (0, _emberServiceInject['default'])('-routing'),

    filterName: computed({
      get: function get() {
        return this.get('group.name') || '';
      },

      set: function set(key, newValue) {
        return newValue;
      }
    }),

    group: null,
    panes: null,

    _filterCounts: null,

    hasFilterPane: computed.gt('panes.length', 0),

    patientAgeObject: { type: 'age-filter' },
    patientGenderObject: { type: 'gender-filter' },
    conditionObject: { type: 'condition-code-filter' },
    encounterObject: { type: 'encounter-code-filter' },

    canAddAgeFilter: computed('panes.@each.type', function () {
      return !this.get('panes').mapBy('type').contains('age-filter');
    }),

    canAddGenderFilter: computed('panes.@each.type', function () {
      return !this.get('panes').mapBy('type').contains('gender-filter');
    }),

    init: function init() {
      this.set('panes', this.get('group.characteristic').map(function (characteristic) {
        return { type: characteristic.get('filter'), characteristic: characteristic };
      }));
      this._super.apply(this, arguments);
    },

    registerFilterCounts: function registerFilterCounts(filterCounts) {
      this.set('_filterCounts', filterCounts);
      filterCounts.updateCounts();
    },

    unregisterFilterCounts: function unregisterFilterCounts(filterCounts) {
      var currentFilterCounts = this.get('_filterCounts');
      if (currentFilterCounts === filterCounts) {
        this.set('_filterCounts', null);
      }
    },

    _updateCounts: function _updateCounts() {
      var filterCounts = this.get('_filterCounts');
      if (filterCounts) {
        filterCounts.updateCounts();
      }
    },

    actions: {
      saveFilter: function saveFilter() {
        var _this = this;

        this.set('group.name', this.get('filterName') || generateGuid({}, 'Population '));
        this.get('group').save().then(function () {
          _this.get('routing').transitionTo('patients.index');
        });
      },

      addPane: function addPane(pane) {
        this.get('panes').addObject(_ember['default'].Object.create(pane));
      },

      removePane: function removePane(pane) {
        this.get('panes').removeObject(pane);
      },

      updateCounts: function updateCounts() {
        _emberRunloop['default'].later(this, this._updateCounts);
      }
    }
  });
});
define('ember-on-fhir/components/filter-counts', ['exports', 'ember-component', 'ember-computed', 'ember-service/inject', 'ember-runloop'], function (exports, _emberComponent, _emberComputed, _emberServiceInject, _emberRunloop) {
  exports['default'] = _emberComponent['default'].extend({
    classNames: ['filter-counts'],

    ajax: (0, _emberServiceInject['default'])(),

    patientCount: 0,
    conditionCount: 0,
    encounterCount: 0,
    timeSpan: 'year',
    group: null,
    loading: false,

    _registeredParent: null,

    characteristics: _emberComputed['default'].reads('group.characteristic'),

    init: function init() {
      this._super.apply(this, arguments);

      _emberRunloop['default'].scheduleOnce('actions', this, this._registerWithParent);
    },

    _registerWithParent: function _registerWithParent() {
      var parent = this.get('parentView');
      parent.registerFilterCounts(this);
      this.set('_registeredParent', parent);
    },

    willDestroyElement: function willDestroyElement() {
      var parent = this.get('_registeredParent');
      if (parent) {
        parent.unregisterFilterCounts(this);
      }
    },

    updateCounts: function updateCounts() {
      var _this = this;

      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      this.set('loading', true);

      var group = this.get('group');

      var request = this.get('ajax').request('/InstaCountAll', {
        type: 'POST',
        data: JSON.stringify(group ? group.serialize() : {}),
        contentType: 'application/json'
      });

      request.then(function (res) {
        if (_this.isDestroyed || _this.isDestroying) {
          return;
        }

        _this.set('patientCount', res.patients);
        _this.set('conditionCount', res.conditions);
        _this.set('encounterCount', res.encounters);
        _this.set('loading', false);
      });

      request['catch'](function () {
        if (_this.isDestroyed || _this.isDestroying) {
          return;
        }

        _this.set('patientCount', 0);
        _this.set('conditionCount', 0);
        _this.set('encounterCount', 0);
        _this.set('loading', false);
      });
    }
  });
});
define('ember-on-fhir/components/filter-pane', ['exports', 'ember', 'ember-runloop', 'ember-on-fhir/utils/group-characteristic-generator'], function (exports, _ember, _emberRunloop, _emberOnFhirUtilsGroupCharacteristicGenerator) {
  var computed = _ember['default'].computed;
  exports['default'] = _ember['default'].Component.extend({
    store: _ember['default'].inject.service(),

    classNames: ['row', 'pane'],

    pane: null,
    characteristic: computed.alias('pane.characteristic'),
    group: null,

    filterType: computed.reads('pane.type'),

    icon: computed('filterType', function () {
      var filterType = this.get('filterType');

      if (filterType === 'age-filter') {
        return 'fa-birthday-cake';
      } else if (filterType === 'condition-code-filter') {
        return 'icon-med-clipboard';
      } else if (filterType === 'encounter-code-filter') {
        return 'fa-hospital-o';
      }

      return 'fa-user';
    }),

    actions: {
      createCharacteristic: function createCharacteristic() {
        var _this = this;

        (0, _emberRunloop['default'])(function () {
          var characteristic = (0, _emberOnFhirUtilsGroupCharacteristicGenerator['default'])(_this, _this.get('filterType'));
          _this.set('characteristic', characteristic);
          _this.get('group.characteristic').addObject(characteristic);
        });
        this.attrs.onChange();
      },

      destroyCharacteristic: function destroyCharacteristic() {
        var _this2 = this;

        if (_ember['default'].isEmpty(this.get('characteristic'))) {
          return;
        }

        (0, _emberRunloop['default'])(function () {
          _this2.get('group.characteristic').removeObject(_this2.get('characteristic'));
          _this2.set('characteristic', null);
        });
        this.attrs.onChange();
      },

      removePane: function removePane() {
        this.send('destroyCharacteristic');
        this.attrs.removePane(this.get('pane'));
      }
    }
  });
});
define('ember-on-fhir/components/form-validation-tooltip', ['exports', 'ember-component', 'ember-computed'], function (exports, _emberComponent, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    tagName: 'i',
    attributeBindings: ['ariaHidden:aria-hidden'],
    classNames: ['form-control-feedback', 'form-control-feedback-clear'],
    classNameBindings: ['iconClassNames'],

    ariaHidden: true,
    errors: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),
    displayErrors: false,

    iconClassNames: (0, _emberComputed['default'])('displayErrors', 'errors.length', function iconClassNames() {
      var classNames = [];
      if (this.get('errors').length === 0) {
        classNames.push('fa-check');
      } else if (this.get('displayErrors')) {
        classNames.push('fa-times');
      }

      if (classNames.length > 0) {
        classNames.unshift('fa');
      }

      return classNames.join(' ');
    }),

    errorMessages: (0, _emberComputed['default'])('errors.[]', function errorMessages() {
      return this.get('errors').join('; ');
    }),

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      this.$().tooltip({
        container: document.body,
        placement: 'right',
        title: function title() {
          if (!_this.get('displayErrors')) {
            return '';
          }

          return _this.get('errorMessages');
        }
      });
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);

      if (this.isDestroyed) {
        return;
      }

      this.$().tooltip('destroy');
    }
  });
});
define('ember-on-fhir/components/gender-filter', ['exports', 'ember', 'ember-computed', 'ember-on-fhir/mixins/filter-component'], function (exports, _ember, _emberComputed, _emberOnFhirMixinsFilterComponent) {
  exports['default'] = _ember['default'].Component.extend(_emberOnFhirMixinsFilterComponent['default'], {
    checkboxBaseName: 'gender-filter',

    genders: ['male', 'female', 'unknown', 'other'],

    genderValue: (0, _emberComputed['default'])('characteristic.valueCodeableConcept.coding.firstObject.code', {
      get: function get() {
        return this.get('characteristic.valueCodeableConcept.coding.firstObject.code');
      },

      set: function set(keyName, value) {
        this.set('characteristic.valueCodeableConcept.coding.firstObject.code', value);
        this.attrs.onChange();
        return value;
      }
    })
  });
});
define('ember-on-fhir/components/horizontal-bar-chart', ['exports', 'ember-component', 'ember-metal/observer'], function (exports, _emberComponent, _emberMetalObserver) {
  exports['default'] = _emberComponent['default'].extend({
    width: 200,
    height: 10,
    max: 0,
    value: 0,

    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);
      this._renderChart();
    },

    _renderChart: (0, _emberMetalObserver['default'])('width', 'height', 'max', 'value', function _renderChart() {
      var width = parseInt(this.get('width'), 10);
      var height = parseInt(this.get('height'), 10);

      var value = parseFloat(this.get('value')) || 0;
      var max = parseFloat(this.get('max')) || 0;

      var widthScale = d3.scale.linear().domain([0, Math.max.call(Math, max, value)]).range([0, width]);

      var element = d3.select(this.element);
      element.selectAll('svg').remove();

      var svg = d3.select(this.element).append('svg').attr('width', width).attr('height', height);

      svg.append('rect').attr('width', width).attr('height', height).classed('background', true);

      svg.append('rect').attr('width', widthScale(value)).attr('height', height).classed('bar', true);
    })
  });
});
define('ember-on-fhir/components/huddle-discussed-icon', ['exports', 'ember-component', 'ember-computed', 'moment'], function (exports, _emberComponent, _emberComputed, _moment) {
  exports['default'] = _emberComponent['default'].extend({
    tagName: 'i',
    classNameBindings: ['iconClass'],

    huddle: null,
    patient: null,

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      this.$().tooltip({
        container: 'body',
        title: function title() {
          var reviewed = _this.get('reviewed');
          if (reviewed != null) {
            return 'Discussed on ' + (0, _moment['default'])(reviewed).format('ll');
          }
        }
      });
    },

    willDestoryElement: function willDestoryElement() {
      this._super.apply(this, arguments);
      this.$().tooltip('destroy');
    },

    huddlePatient: (0, _emberComputed['default'])('huddle', 'patient', {
      get: function get() {
        var huddle = this.get('huddle');
        if (huddle) {
          return huddle.getHuddlePatient(this.get('patient'));
        }
      }
    }),

    reviewed: _emberComputed['default'].oneWay('huddlePatient.reviewed'),

    iconClass: (0, _emberComputed['default'])('reviewed', {
      get: function get() {
        if (this.get('reviewed') != null) {
          return 'fa fa-fw fa-check-square-o';
        }
        return 'hidden';
      }
    })
  });
});
define('ember-on-fhir/components/huddle-reason-icon', ['exports', 'ember-component', 'ember-computed', 'ember-on-fhir/models/huddle-patient'], function (exports, _emberComponent, _emberComputed, _emberOnFhirModelsHuddlePatient) {
  exports['default'] = _emberComponent['default'].extend({
    tagName: 'i',
    classNameBindings: ['reasonIconClass'],

    huddle: null,
    patient: null,

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      this.$().tooltip({
        container: 'body',
        title: function title() {
          return _this.get('huddlePatient.codedReasonText');
        }
      });
    },

    willDestoryElement: function willDestoryElement() {
      this._super.apply(this, arguments);
      this.$().tooltip('destroy');
    },

    huddlePatient: (0, _emberComputed['default'])('huddle', 'patient', {
      get: function get() {
        var huddle = this.get('huddle');
        if (huddle) {
          return huddle.getHuddlePatient(this.get('patient'));
        }
      }
    }),

    reasonIconClass: (0, _emberComputed['default'])('huddlePatient.reason', {
      get: function get() {
        switch (this.get('huddlePatient.reason')) {
          case _emberOnFhirModelsHuddlePatient.REASON_CODES.ROLL_OVER:
            return 'fa fa-fw fa-arrow-circle-o-right';
          case _emberOnFhirModelsHuddlePatient.REASON_CODES.MANUAL_ADDITION:
            return 'fa fa-fw fa-pencil';
          case _emberOnFhirModelsHuddlePatient.REASON_CODES.RECENT_ENCOUNTER:
            return 'fa fa-fw fa-hospital-o';
          case _emberOnFhirModelsHuddlePatient.REASON_CODES.RISK_SCORE:
            return 'fa fa-fw fa-pie-chart';
          default:
            return 'hidden';
        }
      }
    })
  });
});
define('ember-on-fhir/components/ie-navbar', ['exports', 'ember-component'], function (exports, _emberComponent) {
  exports['default'] = _emberComponent['default'].extend({
    showLogoutModal: false,

    actions: {
      openLogoutModal: function openLogoutModal(event) {
        event.preventDefault();
        this.set('showLogoutModal', true);
      }
    }
  });
});
define('ember-on-fhir/components/labeled-radio-button', ['exports', 'ember-radio-button/components/labeled-radio-button'], function (exports, _emberRadioButtonComponentsLabeledRadioButton) {
  exports['default'] = _emberRadioButtonComponentsLabeledRadioButton['default'];
});
define('ember-on-fhir/components/login-register', ['exports', 'ember-component', 'ember-service/inject', 'jquery'], function (exports, _emberComponent, _emberServiceInject, _jquery) {
  exports['default'] = _emberComponent['default'].extend({
    displayNavbar: (0, _emberServiceInject['default'])(),

    logoLargeURL: 'assets/images/logo-darkbg-lg.png',

    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      this.get('displayNavbar').hide();
      (0, _jquery['default'])(document.body).addClass('login-register-content');
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);

      if (this.isDestroyed) {
        return;
      }

      this.get('displayNavbar').show();
      (0, _jquery['default'])(document.body).removeClass('login-register-content');
    }
  });
});
define('ember-on-fhir/components/modal-dialog-overlay', ['exports', 'ember-modal-dialog/components/modal-dialog-overlay'], function (exports, _emberModalDialogComponentsModalDialogOverlay) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberModalDialogComponentsModalDialogOverlay['default'];
    }
  });
});
define('ember-on-fhir/components/modal-dialog', ['exports', 'ember-modal-dialog/components/modal-dialog'], function (exports, _emberModalDialogComponentsModalDialog) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberModalDialogComponentsModalDialog['default'];
    }
  });
});
define('ember-on-fhir/components/navbar-active-link', ['exports', 'ember-component', 'ember-computed', 'ember-runloop'], function (exports, _emberComponent, _emberComputed, _emberRunloop) {
  exports['default'] = _emberComponent['default'].extend({
    tagName: 'li',
    classNameBindings: ['active'],

    active: (0, _emberComputed['default'])('childLinkViews.firstObject.active', function active() {
      return this.get('childLinkViews.firstObject.active');
    }),

    init: function init() {
      this._super.apply(this, arguments);
      this.set('childLinkViews', []);
    },

    didRender: function didRender() {
      this._super.apply(this, arguments);

      _emberRunloop['default'].schedule('afterRender', this, function () {
        var _this = this;

        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        var childLinkElements = this.$('a.ember-view');
        var childLinkViews = childLinkElements.toArray().map(function (view) {
          return _this._viewRegistry[view.id];
        });

        this.set('childLinkViews', childLinkViews);
      });
    }
  });
});
define('ember-on-fhir/components/nested-panel', ['exports', 'ember-component', 'ember-computed'], function (exports, _emberComponent, _emberComputed) {

  var uuid = 0;

  exports['default'] = _emberComponent['default'].extend({
    panelName: '',
    panelId: (0, _emberComputed['default'])({
      get: function get() {
        return 'panel' + ++uuid;
      }
    })
  });
});
define('ember-on-fhir/components/object-bin', ['exports', 'ember-drag-drop/components/object-bin'], function (exports, _emberDragDropComponentsObjectBin) {
  exports['default'] = _emberDragDropComponentsObjectBin['default'];
});
define('ember-on-fhir/components/page-numbers', ['exports', 'ember', 'ember-cli-pagination/util', 'ember-cli-pagination/lib/page-items', 'ember-cli-pagination/validate'], function (exports, _ember, _emberCliPaginationUtil, _emberCliPaginationLibPageItems, _emberCliPaginationValidate) {
  exports['default'] = _ember['default'].Component.extend({
    currentPageBinding: "content.page",
    totalPagesBinding: "content.totalPages",

    hasPages: _ember['default'].computed.gt('totalPages', 1),

    watchInvalidPage: (function () {
      var me = this;
      var c = this.get('content');
      if (c && c.on) {
        c.on('invalidPage', function (e) {
          me.sendAction('invalidPageAction', e);
        });
      }
    }).observes("content"),

    truncatePages: true,
    numPagesToShow: 10,

    validate: function validate() {
      if (_emberCliPaginationUtil['default'].isBlank(this.get('currentPage'))) {
        _emberCliPaginationValidate['default'].internalError("no currentPage for page-numbers");
      }
      if (_emberCliPaginationUtil['default'].isBlank(this.get('totalPages'))) {
        _emberCliPaginationValidate['default'].internalError('no totalPages for page-numbers');
      }
    },

    pageItemsObj: (function () {
      return _emberCliPaginationLibPageItems['default'].create({
        parent: this,
        currentPageBinding: "parent.currentPage",
        totalPagesBinding: "parent.totalPages",
        truncatePagesBinding: "parent.truncatePages",
        numPagesToShowBinding: "parent.numPagesToShow",
        showFLBinding: "parent.showFL"
      });
    }).property(),

    //pageItemsBinding: "pageItemsObj.pageItems",

    pageItems: (function () {
      this.validate();
      return this.get("pageItemsObj.pageItems");
    }).property("pageItemsObj.pageItems", "pageItemsObj"),

    canStepForward: (function () {
      var page = Number(this.get("currentPage"));
      var totalPages = Number(this.get("totalPages"));
      return page < totalPages;
    }).property("currentPage", "totalPages"),

    canStepBackward: (function () {
      var page = Number(this.get("currentPage"));
      return page > 1;
    }).property("currentPage"),

    actions: {
      pageClicked: function pageClicked(number) {
        _emberCliPaginationUtil['default'].log("PageNumbers#pageClicked number " + number);
        this.set("currentPage", number);
        this.sendAction('action', number);
      },
      incrementPage: function incrementPage(num) {
        var currentPage = Number(this.get("currentPage")),
            totalPages = Number(this.get("totalPages"));

        if (currentPage === totalPages && num === 1) {
          return false;
        }
        if (currentPage <= 1 && num === -1) {
          return false;
        }
        this.incrementProperty('currentPage', num);

        var newPage = this.get('currentPage');
        this.sendAction('action', newPage);
      }
    }
  });
});
define('ember-on-fhir/components/patient-badge', ['exports', 'ember-component', 'ember-computed', 'ember-service/inject', 'ember-on-fhir/mixins/patient-icon-class-names', 'ember-on-fhir/helpers/is-today-or-after'], function (exports, _emberComponent, _emberComputed, _emberServiceInject, _emberOnFhirMixinsPatientIconClassNames, _emberOnFhirHelpersIsTodayOrAfter) {
  exports['default'] = _emberComponent['default'].extend(_emberOnFhirMixinsPatientIconClassNames['default'], {
    classNames: ['patient-badge'],

    routing: (0, _emberServiceInject['default'])('-routing'),

    patient: null,
    assessment: null,
    maxRisk: 4, // TODO: get max risk for currentAssessment from Risk Assessment Service

    nextHuddle: (0, _emberComputed['default'])('huddles.@each.date', {
      get: function get() {
        var huddles = this.get('huddles').filter(function (huddle) {
          return (0, _emberOnFhirHelpersIsTodayOrAfter.isTodayOrAfter)([huddle.get('date')]);
        });
        return huddles.sortBy('date').objectAt(0);
      }
    }),

    computedRisk: (0, _emberComputed['default'])('patient.currentRisk', 'assessment', {
      get: function get() {
        var assessment = this.get('assessment');
        var risks = this.get('patient.currentRisk');

        if (assessment && risks.length > 0) {
          return risks.filterBy('key', assessment).get('firstObject.value.value') || null;
        }

        return 0;
      }
    }).readOnly(),

    displayRiskScore: _emberComputed['default'].gt('computedRisk', 0),

    didRender: function didRender() {
      this._super.apply(this, arguments);

      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      var riskBar = this.element.querySelector('.patient-risk-bar');

      if (riskBar) {
        var width = Math.floor(100 / this.get('maxRisk') * this.get('computedRisk'));
        riskBar.style.width = width + '%';
      }
    },

    click: function click(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      this.get('routing').transitionTo('patients.show', [this.get('patient')]);
    }
  });
});
define('ember-on-fhir/components/patient-print-badge', ['exports', 'ember-component', 'ember-computed', 'ember-on-fhir/helpers/is-today-or-after'], function (exports, _emberComponent, _emberComputed, _emberOnFhirHelpersIsTodayOrAfter) {
  exports['default'] = _emberComponent['default'].extend({
    tagName: 'tr',

    patient: null,
    huddles: null,
    riskAssessment: null,

    nextHuddle: (0, _emberComputed['default'])('huddles.@each.date', {
      get: function get() {
        var huddles = this.get('huddles').filter(function (huddle) {
          return (0, _emberOnFhirHelpersIsTodayOrAfter.isTodayOrAfter)([huddle.get('date')]);
        });
        return huddles.sortBy('date').objectAt(0);
      }
    }),

    huddlePatient: (0, _emberComputed['default'])('nextHuddle', 'patient', {
      get: function get() {
        var nextHuddle = this.get('nextHuddle');
        if (nextHuddle) {
          return nextHuddle.getHuddlePatient(this.get('patient'));
        }

        return null;
      }
    }),

    computedRisk: (0, _emberComputed['default'])('riskAssessment', {
      get: function get() {
        var riskAssessment = this.get('riskAssessment');
        if (riskAssessment) {
          return riskAssessment.get('value') || null;
        }
        return null;
      }
    }).readOnly()
  });
});
define('ember-on-fhir/components/patient-risk-chart', ['exports', 'ember', 'ember-cli-c3/components/c3-chart', 'moment', 'ember-metal/get', 'ember-runloop'], function (exports, _ember, _emberCliC3ComponentsC3Chart, _moment, _emberMetalGet, _emberRunloop) {
  var computed = _ember['default'].computed;
  exports['default'] = _emberCliC3ComponentsC3Chart['default'].extend({
    classNames: ['patient-risk-chart'],

    selectedRisk: null,

    offsetTime: 4, // default time offset numeral
    offsetUnit: 'years', // default time offset unit
    height: 54, // default height of chart

    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      this.get('chart').select(null, [this.get('filteredChartData.length') - 1]);
    },

    filteredChartData: computed('chartData.[]', 'offsetTime', 'offsetUnit', function filteredChartData() {
      var startDate = (0, _moment['default'])().subtract(this.get('offsetTime'), this.get('offsetUnit'));

      return this.get('chartData').filter(function (datum) {
        return !startDate.isAfter(datum.get('date'));
      });
    }),

    data: computed('filteredChartData.[]', function () {
      var _this = this;

      var data = this.get('filteredChartData');

      // group data by dates
      var nestedData = d3.nest().key(function (d) {
        return (0, _moment['default'])(d.get('date')).toDate();
      }).entries(data);

      var labels = nestedData.map(function (value) {
        return (0, _moment['default'])(value.key).format('YYYY-MM-DD');
      });

      var chartData = nestedData.map(function (value) {
        return d3.max(value.values, function (v) {
          return v.get('value');
        });
      });

      return {
        x: 'x',
        columns: [['x'].concat(labels), ['risk'].concat(chartData)],
        types: {
          risk: 'area-spline'
        },
        selection: {
          enabled: true,
          multiple: false
        },
        onselected: function onselected() {
          var index = (0, _emberMetalGet['default'])(_this.get('chart').selected(), 'firstObject.index');
          if (index != null) {
            var selectedDataPoint = data.objectAt(index);
            if (selectedDataPoint !== _this.get('selectedRisk')) {
              _this.attrs.setSelectedRisk(selectedDataPoint);
            }
          }
        },
        onunselected: function onunselected() {
          (0, _emberRunloop['default'])(function () {
            return _this.attrs.setSelectedRisk(null);
          });

          _emberRunloop['default'].later(function () {
            if (_this.get('chart').selected().length === 0) {
              var index = _this.get('filteredChartData').indexOf(_this.get('selectedRisk'));
              if (index !== -1) {
                _this.get('chart').select(null, [index]);
              }
            }
          });
        }
      };
    }),

    // http://c3js.org/reference.html
    config: computed('height', {
      get: function get() {
        return {
          axis: {
            x: {
              type: 'timeseries',
              show: false,
              tick: {
                format: '%Y-%m-%d'
              }
            },
            y: {
              show: false
            }
          },
          color: {
            pattern: ['#FFFFFF']
          },
          grid: {
            focus: {
              show: false
            }
          },
          legend: {
            show: false
          },
          padding: {
            left: 0,
            right: 0
          },
          point: {
            r: 5,
            focus: {
              expand: {
                r: 5.5
              }
            },
            select: {
              r: 6.5
            }
          },
          size: {
            height: this.get('height')
          },
          spline: {
            interpolation: {
              type: 'linear'
            }
          },
          tooltip: {
            format: {
              name: function name(_name) {
                return _ember['default'].String.capitalize(_name);
              }
            }
          }
        };
      }
    })
  });
});
define('ember-on-fhir/components/patient-search/huddle-list', ['exports', 'ember-component', 'ember-computed', 'ember-metal/get', 'ember-on-fhir/helpers/is-today-or-after', 'moment', 'pikaday'], function (exports, _emberComponent, _emberComputed, _emberMetalGet, _emberOnFhirHelpersIsTodayOrAfter, _moment, _pikaday) {
  exports['default'] = _emberComponent['default'].extend({
    selectedHuddle: null,

    huddles: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),

    firstHuddle: (0, _emberComputed['default'])('huddles.@each.date', {
      get: function get() {
        return this.get('huddles').filter(function (huddle) {
          return (0, _emberOnFhirHelpersIsTodayOrAfter.isTodayOrAfter)([huddle.get('date')]);
        }).sortBy('date').objectAt(0);
      }
    }),

    huddleDateMap: (0, _emberComputed['default'])('huddles.@each.date', {
      get: function get() {
        var map = {};
        var huddles = this.get('huddles');

        for (var i = 0; i < huddles.length; i++) {
          var date = (0, _moment['default'])(huddles[i].get('date')).format('YYYY-MM-DD');
          map[date] = huddles[i];
        }

        return map;
      }
    }),

    minDate: (0, _emberComputed['default'])('huddles.@each.date', {
      get: function get() {
        var huddles = this.get('huddles');
        if (huddles.length === 0) {
          return null;
        }
        return (0, _emberMetalGet['default'])(this.get('huddles').sortBy('date').objectAt(0), 'date');
      }
    }),

    maxDate: (0, _emberComputed['default'])('huddles.@each.date', {
      get: function get() {
        var huddles = this.get('huddles');
        if (huddles.length === 0) {
          return null;
        }
        return huddles.sortBy('date').get('lastObject.date');
      }
    }),

    active: _emberComputed['default'].notEmpty('selectedHuddle'),

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      var defaultDate = null;
      var setDefaultDate = false;
      var selectedHuddle = this.get('selectedHuddle');
      var firstHuddle = this.get('firstHuddle');
      if (selectedHuddle) {
        defaultDate = selectedHuddle.get('date');
        setDefaultDate = true;
      } else if (firstHuddle) {
        defaultDate = firstHuddle.get('date');
      }

      this.pikaday = new _pikaday['default']({
        field: document.getElementById('huddleFilterInput'),
        trigger: document.getElementById('huddleFilterSelector'),
        defaultDate: defaultDate,
        setDefaultDate: setDefaultDate,
        minDate: this.get('minDate'),
        maxDate: this.get('maxDate'),
        disableDayFn: function disableDayFn(date) {
          var huddleDateMap = _this.get('huddleDateMap');
          return huddleDateMap[(0, _moment['default'])(date).format('YYYY-MM-DD')] === undefined;
        },
        onSelect: function onSelect(date) {
          var huddleDateMap = _this.get('huddleDateMap');
          _this.attrs.selectHuddle(huddleDateMap[(0, _moment['default'])(date).format('YYYY-MM-DD')]);
        }
      });
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);

      if (this.pikaday) {
        this.pikaday.destroy();
        this.pikaday = null;
      }
    },

    actions: {
      toggle: function toggle(event) {
        var selectedHuddle = this.get('selectedHuddle');
        if (selectedHuddle) {
          this.attrs.selectHuddle(null);
          this.pikaday.setDate(null, true);
        } else {
          var firstHuddle = this.get('firstHuddle');

          // do nothing if there are no huddles to select
          if (firstHuddle == null) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }

          this.attrs.selectHuddle(firstHuddle);
          this.pikaday.setDate(firstHuddle.get('date'), true);
        }
      }
    }
  });
});
define('ember-on-fhir/components/patient-search/population-filter', ['exports', 'ember-component', 'ember-computed'], function (exports, _emberComponent, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    populations: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),

    selectedPopulation: null,

    actions: {
      togglePopulation: function togglePopulation(population, event) {
        this.attrs.togglePopulation(population, event.target.checked);
      }
    }
  });
});
define('ember-on-fhir/components/patient-search/risk-assessment', ['exports', 'ember-component', 'ember-computed'], function (exports, _emberComponent, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    currentAssessment: null,
    riskAssessments: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    })
  });
});
define('ember-on-fhir/components/patient-search/risk-score', ['exports', 'ember-component'], function (exports, _emberComponent) {
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  exports['default'] = _emberComponent['default'].extend({
    maxValue: 4,
    minValue: 1,

    lowValue: 1,
    highValue: 1,

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      var slider = this.$('#riskSlider').slider({
        min: this.get('minValue'),
        max: this.get('maxValue'),
        range: true,
        value: [this.get('lowValue'), this.get('highValue')],
        formatter: function formatter(val) {
          if (Array.isArray(val)) {
            if (val[0] === val[1]) {
              return val[0];
            }

            return val.join(' - ');
          }
          return val;
        }
      });

      slider.on('slideStop', function (event) {
        var _attrs;

        (_attrs = _this.attrs).onChange.apply(_attrs, _toConsumableArray(event.value));
      });
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);

      if (this.isDestroyed) {
        return;
      }

      this.$('#riskSlider').slider('destroy');
    }
  });
});
define('ember-on-fhir/components/patient-search/sort-by', ['exports', 'ember-component', 'ember-computed'], function (exports, _emberComponent, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    sortDescending: false,
    sortBy: 'riskScore',

    sortOptions: (0, _emberComputed['default'])({
      get: function get() {
        return [{ name: 'Name', sortKey: 'name,birthdate', sortIcon: 'alpha' }, { name: 'Age', sortKey: 'birthdate,name', sortIcon: 'numeric', invert: true }, { name: 'Gender', sortKey: 'gender,name', sortIcon: 'alpha' }
        // { name: 'Location', sortKey: 'address,name', sortIcon: 'alpha' },
        // { name: 'Risk Score', sortKey: 'riskScore,name', sortIcon: 'numeric', defaultSortDescending: true },
        // { name: 'Notifications', sortKey: 'notifications,name', sortIcon: 'numeric', defaultSortDescending: true }
        ];
      }
    })
  });
});
define('ember-on-fhir/components/patient-stats', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    classNames: ['patient-stats'],

    condition: null,

    conditionText: _ember['default'].computed.reads('condition.displayText')
  });
});
define('ember-on-fhir/components/patient-summary', ['exports', 'ember', 'ember-service/inject', 'ember-on-fhir/mixins/patient-icon-class-names'], function (exports, _ember, _emberServiceInject, _emberOnFhirMixinsPatientIconClassNames) {
  exports['default'] = _ember['default'].Component.extend(_emberOnFhirMixinsPatientIconClassNames['default'], {
    classNames: ['patient-summary'],
    store: (0, _emberServiceInject['default'])(),

    patient: null,
    currentAssessment: null,
    selectedRisk: null,
    huddle: null,
    hasRisks: false,

    risksWithBirthdayStart: _ember['default'].computed('patient.sortedRisks', 'patient.birthDate', 'currentAssessment', function () {
      var currentAssessment = this.get('currentAssessment');
      if (_ember['default'].isNone(currentAssessment)) {
        return [];
      }

      var store = this.get('store');

      var birthRisk = store.createRecord('risk-assessment', { date: this.get('patient.birthDate') });
      var riskCode = store.createRecord('codeable-concept', { text: currentAssessment });
      var rapc = store.createRecord('risk-assessment-prediction-component', { probabilityDecimal: 0 });
      rapc.set('outcome', riskCode);
      birthRisk.get('prediction').pushObject(rapc);
      var risks = [birthRisk];
      risks.pushObjects(this.get('patient.sortedRisks'));
      return risks.filterBy('prediction.firstObject.outcome.displayText', currentAssessment);
    }),

    patientPhoto: _ember['default'].computed.reads('patient.photo')
  });
});
define('ember-on-fhir/components/patient-timeline', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    patient: null,
    searchTimeline: '',

    filteredEvents: _ember['default'].computed('patient.events.[]', 'searchTimeline', function () {
      var rx = new RegExp(this.get('searchTimeline'), 'gi');
      return this.get('patient.events').filter(function (e) {
        return e.get('event.displayText').match(rx);
      });
    })
  });
});
define('ember-on-fhir/components/patient-viewer', ['exports', 'ember-component', 'ember-computed', 'ember-metal/observer', 'ember-on-fhir/mixins/has-stylesheet', 'ember-on-fhir/utils/create-stylesheet', 'ember-on-fhir/helpers/is-today-or-after', 'moment', 'pikaday', 'ember-data'], function (exports, _emberComponent, _emberComputed, _emberMetalObserver, _emberOnFhirMixinsHasStylesheet, _emberOnFhirUtilsCreateStylesheet, _emberOnFhirHelpersIsTodayOrAfter, _moment, _pikaday, _emberData) {
  exports['default'] = _emberComponent['default'].extend(_emberOnFhirMixinsHasStylesheet['default'], {
    patient: null,
    riskAssessments: null,
    currentAssessment: null,
    naRiskAssessment: (0, _emberComputed['default'])('patientRisks.[]', {
      get: function get() {
        var firstRisk = this.get('patientRisks.firstObject');
        if (firstRisk) {
          var code = firstRisk.get('prediction.firstObject.probabilityCodeableConcept.coding.firstObject');
          if (code) {
            return code.get('system') === 'http://snomed.info/sct' && code.get('code') === '385432009';
          }
        }

        return false;
      }
    }),
    selectedCategory: null,
    oldCategoryName: null,
    nextScheduledHuddle: null,
    displayEditHuddleModal: false,
    displayClearDiscussedModal: false,
    selectedPatientRisk: null,

    selectedScheduleDate: (0, _emberComputed['default'])({
      get: function get() {
        return new Date();
      }
    }),

    huddles: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),

    init: function init() {
      this._super.apply(this, arguments);
      this.unreviewedHuddles = {};
    },

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);
      this.attrs.registerPatientViewer(this);

      this.picker = new _pikaday['default']({
        defaultDate: this.get('selectedScheduleDate'),
        setDefaultDate: true,
        onSelect: function onSelect(date) {
          _this.set('selectedScheduleDate', date);
        }
      });
      var field = document.getElementById('patientViewerPikadayCalendar');
      field.appendChild(this.picker.el);

      this.setScheduleStyles();
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);
      this.attrs.unregisterPatientViewer();
      if (this.picker) {
        this.picker.destroy();
        this.picker = null;
      }
    },

    setScheduleStyles: (0, _emberMetalObserver['default'])('huddles.@each.date', 'nextScheduledHuddle', function setScheduleStyles() {
      this.resetStylesheet();

      var huddles = this.get('huddles');
      var patient = this.get('patient');
      var sheet = this.sheet.sheet;

      for (var i = 0; i < huddles.length; i++) {
        var date = (0, _moment['default'])(huddles[i].get('date'));
        var patientReviewed = huddles[i].patientReviewed(patient);

        var year = date.year();
        var month = date.month();
        var day = date.date();

        var backgroundColor = '#5D8FAE';
        var boxShadow = '#53809c';
        if (patientReviewed) {
          backgroundColor = '#5C5C5C';
          boxShadow = '#525252';
        }

        var cssRule = 'background-color: ' + backgroundColor + '; color: #fff; border-radius: 3px; box-shadow: inset 0 1px 3px ' + boxShadow + ';';
        (0, _emberOnFhirUtilsCreateStylesheet.addCSSRule)(sheet, '#patientViewerPikadayCalendar [data-pika-year="' + year + '"][data-pika-month="' + month + '"][data-pika-day="' + day + '"]', cssRule);
      }
    }),

    futureHuddles: (0, _emberComputed['default'])('huddles.@each.date', 'nextScheduledHuddle', {
      get: function get() {
        return this.get('huddles').filter(function (huddle) {
          return (0, _emberOnFhirHelpersIsTodayOrAfter.isTodayOrAfter)([huddle.get('date')]);
        }).sort(function (a, b) {
          return a.get('date') - b.get('date');
        });
      }
    }),

    futureDisplayHuddle: (0, _emberComputed['default'])('futureHuddles.[]', {
      get: function get() {
        return this.get('futureHuddles').objectAt(0);
      }
    }),

    selectedScheduleHuddle: (0, _emberComputed['default'])('huddles.@each.date', 'selectedScheduleDate', {
      get: function get() {
        var selectedScheduleDate = this.get('selectedScheduleDate');
        if (selectedScheduleDate == null) {
          return;
        }

        var huddles = this.get('huddles');
        selectedScheduleDate = (0, _moment['default'])(selectedScheduleDate);

        for (var i = 0; i < huddles.length; i++) {
          var huddle = huddles[i];
          if (selectedScheduleDate.isSame(huddle.get('date'), 'day')) {
            return huddle;
          }
        }
      }
    }),

    selectedScheduleHuddlePatient: (0, _emberComputed['default'])('selectedScheduleHuddle', 'patient', {
      get: function get() {
        var selectedScheduleHuddle = this.get('selectedScheduleHuddle');
        if (selectedScheduleHuddle == null) {
          return;
        }

        return selectedScheduleHuddle.get('patients').findBy('patientId', this.get('patient.id'));
      }
    }),

    patientRisks: (0, _emberComputed['default'])('patient', 'currentAssessment', 'patient.sortedRisks.[]', {
      get: function get() {
        return this.get('patient.sortedRisks').filterBy('prediction.firstObject.outcome.displayText', this.get('currentAssessment'));
      }
    }),

    selectedPatientRiskOrLast: (0, _emberComputed['default'])('patient', 'currentAssessment', 'selectedPatientRisk', 'patientRisks.lastObject', {
      get: function get() {
        return this.get('selectedPatientRisk') || this.get('patientRisks.lastObject');
      }
    }),

    pie: (0, _emberComputed['default'])('patient', 'currentAssessment', 'selectedPatientRiskOrLast', function pie() {
      var _this2 = this;

      var selectedPatientRiskOrLast = this.get('selectedPatientRiskOrLast');

      if (selectedPatientRiskOrLast == null) {
        return null;
      }

      var promise = selectedPatientRiskOrLast.get('pie').then(function (pie) {
        var oldCategoryName = _this2.get('oldCategoryName');

        if (oldCategoryName) {
          var slices = pie.get('sliceArray');
          var slice = slices.findBy('name', oldCategoryName);
          _this2.attrs.selectCategory(slice);

          _this2.set('oldCategoryName', null);
        }

        return pie;
      });

      return _emberData['default'].PromiseObject.create({ promise: promise });
    }),

    pieIsLoading: _emberComputed['default'].reads('pie.isPending'),

    slices: (0, _emberComputed['default'])('selectedPatientRiskOrLast', 'pie', 'pie.isFulfilled', function () {
      var selectedPatientRiskOrLast = this.get('selectedPatientRiskOrLast');
      if (selectedPatientRiskOrLast == null) {
        return [];
      }

      return this.get('pie.sliceArray') || [];
    }),

    hasRisks: (0, _emberComputed['default'])('patientRisks.length', 'naRiskAssessment', {
      get: function get() {
        if (this.get('naRiskAssessment')) {
          return false;
        }

        return this.get('patientRisks.length') > 0;
      }
    }),

    computedRisk: (0, _emberComputed['default'])('patient.currentRisk', 'currentAssessment', function () {
      var currentAssessment = this.get('currentAssessment');
      var risks = this.get('patient.currentRisk');

      if (currentAssessment && risks.length > 0) {
        return risks.filterBy('key', currentAssessment)[0].value.get('value');
      }

      return 0;
    }),

    noRiskAssessmentReason: (0, _emberComputed['default'])('naRiskAssessment', function () {
      return this.get('naRiskAssessment') ? 'Risk Assessment Not Applicable' : 'No Risk Assessment';
    }),

    actions: {
      closeReviewPatientModal: function closeReviewPatientModal() {
        this.set('displayClearDiscussedModal', false);
        this.notifyPropertyChange('nextScheduledHuddle');
      },

      closeEditHuddleModal: function closeEditHuddleModal() {
        this.set('displayEditHuddleModal', false);
        this.attrs.refreshHuddles();
      },

      setSelectedRisk: function setSelectedRisk(risk) {
        var selectedCategory = this.get('selectedCategory');
        this.set('oldCategoryName', selectedCategory == null ? null : selectedCategory.name);
        this.set('selectedPatientRisk', risk);
      }
    }
  });
});
define('ember-on-fhir/components/pikaday-input', ['exports', 'ember', 'ember-pikaday/components/pikaday-input'], function (exports, _ember, _emberPikadayComponentsPikadayInput) {
  exports['default'] = _emberPikadayComponentsPikadayInput['default'];
});
define('ember-on-fhir/components/radio-button-input', ['exports', 'ember-radio-button/components/radio-button-input'], function (exports, _emberRadioButtonComponentsRadioButtonInput) {
  exports['default'] = _emberRadioButtonComponentsRadioButtonInput['default'];
});
define('ember-on-fhir/components/radio-button', ['exports', 'ember-radio-button/components/radio-button'], function (exports, _emberRadioButtonComponentsRadioButton) {
  exports['default'] = _emberRadioButtonComponentsRadioButton['default'];
});
define('ember-on-fhir/components/remove-discussed-patient-modal', ['exports', 'ember-component', 'ember-service/inject', 'ember-computed'], function (exports, _emberComponent, _emberServiceInject, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    ajax: (0, _emberServiceInject['default'])(),

    huddle: null,
    patient: null,

    huddlePatient: (0, _emberComputed['default'])('huddle', 'patient', {
      get: function get() {
        return this.get('huddle.patients').findBy('patientId', this.get('patient.id'));
      }
    }),

    actions: {
      save: function save(event) {
        var _this = this;

        event.preventDefault();
        event.stopImmediatePropagation();

        this.get('huddlePatient').set('reviewed', null);

        var huddle = this.get('huddle');
        var promise = this.get('ajax').request('/Group/' + huddle.get('id'), {
          data: JSON.stringify(huddle.toFhirJson()),
          type: 'PUT',
          contentType: 'application/json; charset=UTF-8'
        });

        promise.then(function () {
          return _this.attrs.onClose();
        });
        promise['catch'](function () {
          _this.get('huddlePatient').set('reviewed', null);
          alert('Failed to save to the server, please try your request again');
        });
      }
    }
  });
});
define('ember-on-fhir/components/review-patient-modal', ['exports', 'ember-component', 'ember-service/inject', 'ember-computed'], function (exports, _emberComponent, _emberServiceInject, _emberComputed) {
  exports['default'] = _emberComponent['default'].extend({
    ajax: (0, _emberServiceInject['default'])(),

    huddle: null,
    patient: null,
    skippable: false,

    modalTitle: (0, _emberComputed['default'])('skippable', function modalTitle() {
      return 'Mark Patient as Discussed' + (this.get('skippable') ? '?' : '');
    }),

    huddlePatient: (0, _emberComputed['default'])('huddle', 'patient', {
      get: function get() {
        return this.get('huddle.patients').findBy('patientId', this.get('patient.id'));
      }
    }),

    reviewDate: (0, _emberComputed['default'])({
      get: function get() {
        return new Date();
      }
    }),

    actions: {
      save: function save(event) {
        var _this = this;

        event.preventDefault();
        event.stopImmediatePropagation();

        this.get('huddlePatient').set('reviewed', this.get('reviewDate'));

        var huddle = this.get('huddle');
        var promise = this.get('ajax').request('/Group/' + huddle.get('id'), {
          data: JSON.stringify(huddle.toFhirJson()),
          type: 'PUT',
          contentType: 'application/json; charset=UTF-8'
        });

        promise.then(function () {
          if (_this.get('skippable')) {
            _this.attrs.onSkip();
          } else {
            _this.attrs.onClose();
          }
        });
        promise['catch'](function () {
          _this.get('huddlePatient').set('reviewed', null);
          alert('Failed to save to the server, please try your request again');
        });
      }
    }
  });
});
define('ember-on-fhir/components/select-fx', ['exports', 'ember', 'jquery'], function (exports, _ember, _jquery) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var isNone = _ember['default'].isNone;
  var get = _ember['default'].get;
  var SelectFx = window.SelectFx;
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    placeholder: null,
    options: null,
    value: null,
    valuePath: null,
    _selectFx: null,

    proxiedOptions: _ember['default'].computed('options.[]', 'value', 'valuePath', function () {
      var valuePath = this.get('valuePath');
      var value = valuePath ? this.get('value.' + valuePath) : this.get('value');

      return this.get('options').map(function (currentValue) {
        var optionValue = valuePath ? get(currentValue, valuePath) : currentValue;
        return {
          value: optionValue,
          selected: value === optionValue ? true : null
        };
      });
    }),

    placeholderSelected: _ember['default'].computed('placeholder', 'value', 'valuePath', function () {
      var valuePath = this.get('valuePath');
      var value = valuePath ? this.get('value.' + valuePath) : this.get('value');

      if (isNone(value)) {
        return true;
      }
      return null;
    }),

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      var _$$find = (0, _jquery['default'])(this.element).find('select');

      var _$$find2 = _slicedToArray(_$$find, 1);

      var element = _$$find2[0];

      this._selectFx = new SelectFx(element, {
        onChange: function onChange(value) {
          _this.attrs.onChange(value);
        }
      });
    }
  });
});
define('ember-on-fhir/components/sortable-objects', ['exports', 'ember-drag-drop/components/sortable-objects'], function (exports, _emberDragDropComponentsSortableObjects) {
  exports['default'] = _emberDragDropComponentsSortableObjects['default'];
});
define('ember-on-fhir/components/tether-dialog', ['exports', 'ember-modal-dialog/components/tether-dialog'], function (exports, _emberModalDialogComponentsTetherDialog) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberModalDialogComponentsTetherDialog['default'];
    }
  });
});
define('ember-on-fhir/components/timeline-event', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    event: null,
    isCondition: _ember['default'].computed.equal('event.type', 'condition'),
    isMedication: _ember['default'].computed.equal('event.type', 'medication'),
    isEncounter: _ember['default'].computed.equal('event.type', 'encounter'),
    isRiskIncrease: _ember['default'].computed.equal('event.type', 'riskIncreased'),
    isRiskDecrease: _ember['default'].computed.equal('event.type', 'riskDecreased'),

    eventClass: _ember['default'].computed('event', function () {
      if (this.get('isCondition')) {
        return 'event-condition';
      } else if (this.get('isMedication')) {
        return 'event-medication';
      } else if (this.get('isEncounter')) {
        return 'event-encounter';
      } else if (this.get('isRiskIncrease')) {
        return 'event-risk-increase';
      } else if (this.get('isRiskDecrease')) {
        return 'event-risk-decrease';
      }
      return 'event-unknown';
    }),

    iconClass: _ember['default'].computed('event', function () {
      if (this.get('isCondition')) {
        return 'icon-med-clipboard';
      } else if (this.get('isMedication')) {
        return 'icon-medication';
      } else if (this.get('isEncounter')) {
        return 'fa fa-hospital-o';
      } else if (this.get('isRiskIncrease')) {
        return 'fa fa-arrow-circle-up text-danger';
      } else if (this.get('isRiskDecrease')) {
        return 'fa fa-arrow-circle-down text-success';
      }
      return 'event-unknown';
    })
  });
});
define('ember-on-fhir/components/vertical-bar-chart', ['exports', 'ember-component', 'ember-computed', 'ember-metal/observer'], function (exports, _emberComponent, _emberComputed, _emberMetalObserver) {
  exports['default'] = _emberComponent['default'].extend({
    data: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),

    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      var svg = d3.select(this.element).select('svg');

      this.padding = 0;
      this.width = (this.width || 600) - this.padding * 2;

      svg.attr('height', this.height).attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

      var data = this.data.toArray();

      this.barScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeRoundBands([this.padding, this.width], this.bandPadding || 0);

      this.heightScale = d3.scale.linear().domain([0, d3.max(data, function (d) {
        return d.get('valueQuantity.value');
      })]).range([this.padding, this.height]);

      this.opacityScale = d3.scale.linear().domain([0, d3.max(data, function (d) {
        return d.get('valueQuantity.value');
      })]).range([0.2, 1]);

      this.g = svg.append('g');

      var gEnter = this.g.selectAll('rect').data(data).enter();

      gEnter.append('rect').attr('x', function (d, i) {
        return _this.barScale(i);
      }).attr('y', function () {
        return _this.height;
      }).attr('width', this.barScale.rangeBand()).attr('height', 0).attr('fill-opacity', function (d) {
        return _this.opacityScale(d.get('valueQuantity.value'));
      });

      this.g.selectAll('rect').transition().attr('x', function (d, i) {
        return _this.barScale(i);
      }).attr('y', function (d) {
        return _this.height - _this.heightScale(d.get('valueQuantity.value'));
      }).attr('width', this.barScale.rangeBand()).attr('height', function (d) {
        return _this.heightScale(d.get('valueQuantity.value'));
      }).attr('fill-opacity', function (d) {
        return _this.opacityScale(d.get('valueQuantity.value'));
      });
    },

    updateGraph: (0, _emberMetalObserver['default'])('data.[]', function updateGraph() {
      var _this2 = this;

      var svg = d3.select(this.element).select('svg');

      this.padding = 0;
      this.width = (this.width || 600) - this.padding * 2;

      svg.attr('height', this.height).attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

      var data = this.get('data').toArray();

      // If we don't have data let's just return until we have data.
      if (data.length === 0) {
        return;
      }

      this.barScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeRoundBands([this.padding, this.width], this.bandPadding || 0);
      this.heightScale = d3.scale.linear().domain([0, d3.max(data, function (d) {
        return d.get('valueQuantity.value');
      })]).range([this.padding, this.height]);

      this.opacityScale = d3.scale.linear().domain([0, d3.max(data, function (d) {
        return d.get('valueQuantity.value');
      })]).range([0.2, 1]);

      var gData = this.g.selectAll('rect').data(data);

      gData.exit().transition().attr('height', function () {
        return 0;
      }).remove();

      var gEnter = gData.enter();

      gEnter.append('rect').attr('x', function (d, i) {
        return _this2.barScale(i);
      }).attr('y', function () {
        return _this2.height;
      }).attr('width', this.barScale.rangeBand()).attr('height', 0).attr('fill-opacity', function (d) {
        return _this2.opacityScale(d.get('valueQuantity.value'));
      });

      this.g.selectAll('rect').transition().attr('x', function (d, i) {
        return _this2.barScale(i);
      }).attr('y', function (d) {
        return _this2.height - _this2.heightScale(d.get('valueQuantity.value'));
      }).attr('width', this.barScale.rangeBand()).attr('height', function (d) {
        return _this2.heightScale(d.get('valueQuantity.value'));
      }).attr('fill-opacity', function (d) {
        return _this2.opacityScale(d.get('valueQuantity.value'));
      });
    })
  });
});
define("ember-on-fhir/config/ember-spinner/large", ["exports"], function (exports) {
  exports["default"] = {
    lines: 11,
    length: 8,
    width: 4,
    radius: 8,
    speed: 1
  };
});
define("ember-on-fhir/config/ember-spinner/small", ["exports"], function (exports) {
  exports["default"] = {
    lines: 11,
    length: 4,
    width: 2,
    radius: 4,
    speed: 1
  };
});
define('ember-on-fhir/controllers/application', ['exports', 'ember-controller', 'ember-service/inject', 'ember-computed'], function (exports, _emberController, _emberServiceInject, _emberComputed) {
  exports['default'] = _emberController['default'].extend({
    displayNavbarService: (0, _emberServiceInject['default'])('display-navbar'),
    displayNavbar: _emberComputed['default'].reads('displayNavbarService.displayNavbar')
  });
});
define('ember-on-fhir/controllers/array', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('ember-on-fhir/controllers/filters/new', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('ember-on-fhir/controllers/filters/show', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('ember-on-fhir/controllers/index', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('ember-on-fhir/controllers/login', ['exports', 'ember-controller', 'ember-computed', 'ember-validations', 'ember-service/inject', 'ember-on-fhir/utils/email-validation-regex', 'ember-on-fhir/utils/validation-group-classnames'], function (exports, _emberController, _emberComputed, _emberValidations, _emberServiceInject, _emberOnFhirUtilsEmailValidationRegex, _emberOnFhirUtilsValidationGroupClassnames) {
  exports['default'] = _emberController['default'].extend(_emberValidations['default'], {
    queryParams: ['registered'],

    session: (0, _emberServiceInject['default'])(),

    mitreURL: 'http://www.mitre.org/',
    interventionEnginURL: 'http://www.interventionengine.org',

    identification: null,
    password: null,
    registered: false,
    loginFailed: false,
    loggingIn: false,
    displayErrors: false,

    disableLoginBtn: (0, _emberComputed['default'])('loggingIn', 'displayErrors', 'isValid', function disableLoginBtn() {
      if (this.get('loggingIn') || this.get('displayErrors') && !this.get('isValid')) {
        return true;
      }

      return null;
    }),

    validations: {
      identification: {
        presence: true,
        format: {
          'with': _emberOnFhirUtilsEmailValidationRegex['default'],
          allowBlank: true,
          message: 'not a valid email'
        }
      },
      password: {
        length: {
          minimum: 8,
          messages: {
            tooShort: 'must be at least 8 characters'
          }
        }
      }
    },

    identificationClassNames: (0, _emberOnFhirUtilsValidationGroupClassnames['default'])('identification'),
    passwordClassNames: (0, _emberOnFhirUtilsValidationGroupClassnames['default'])('password'),

    actions: {
      authenticate: function authenticate() {
        var _this = this;

        if (this.get('loggingIn')) {
          return;
        }

        this.set('displayErrors', true);
        this.validate().then(function () {
          _this.set('loggingIn', true);

          var _getProperties = _this.getProperties('identification', 'password');

          var identification = _getProperties.identification;
          var password = _getProperties.password;

          _this.get('session').authenticate('authenticator:ie', identification, password).then(loginSuccess.bind(_this))['catch'](loginError.bind(_this));
        });
      },

      clearErrors: function clearErrors() {
        this.set('errorMessage', null);
      },

      clearRegistered: function clearRegistered() {
        this.set('registered', false);
      }
    }
  });

  function loginSuccess() {
    this.set('loggingIn', false);
  }

  function loginError(message) {
    this.set('loggingIn', false);
    this.set('errorMessage', message);
  }
});
define('ember-on-fhir/controllers/object', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('ember-on-fhir/controllers/patients/index', ['exports', 'ember-controller', 'ember-computed', 'ember-metal/observer', 'ember-runloop', 'ember-service/inject', 'ember-utils'], function (exports, _emberController, _emberComputed, _emberMetalObserver, _emberRunloop, _emberServiceInject, _emberUtils) {
  exports['default'] = _emberController['default'].extend({
    queryParams: ['page', { currentAssessment: 'risk_assessment' }, 'sortBy', 'sortDescending', 'groupId', 'huddleId'],

    router: (0, _emberServiceInject['default'])('-routing'),

    page: 1,
    perPage: 8,

    currentAssessment: 'Catastrophic Health Event', // default
    selectedPopulation: (0, _emberComputed['default'])('groupId', {
      get: function get() {
        var groupId = this.get('groupId');
        if (groupId == null || groupId === '') {
          return null;
        }

        return this.get('populations').findBy('id', groupId);
      }
    }),
    selectedHuddle: (0, _emberComputed['default'])('huddleId', {
      get: function get() {
        var huddleId = this.get('huddleId');
        if (huddleId == null || huddleId === '') {
          return null;
        }

        return this.get('model.huddles').findBy('id', this.get('huddleId'));
      }
    }),
    patientSearch: '',
    currentPatient: null,
    sortBy: 'name,birthdate',
    sortDescending: false,
    riskLowValue: 1,
    riskHighValue: 4,
    interventionTypes: [],
    huddleId: '',
    groupId: '',

    patientSearchObserver: (0, _emberMetalObserver['default'])('patientSearch', function () {
      _emberRunloop['default'].debounce(this, this.refetch, 150);
    }),

    populations: (0, _emberComputed['default'])('model.groups.[]', {
      get: function get() {
        return this.get('model.groups').filter(function (group) {
          var code = group.get('code.coding.firstObject.code');
          return code == null || code.toUpperCase() !== 'HUDDLE';
        });
      }
    }),

    huddlePatientIds: (0, _emberComputed['default'])('selectedHuddle', {
      get: function get() {
        var selectedHuddle = this.get('selectedHuddle');
        if (selectedHuddle == null) {
          return [];
        }
        return selectedHuddle.get('patients').mapBy('patientId');
      }
    }),

    totalPatients: _emberComputed['default'].reads('model.patients.meta.total'),

    riskAssessments: (0, _emberComputed['default'])({
      get: function get() {
        // TODO: get this list from the backend
        return ['Catastrophic Health Event'];
      }
    }),

    populationPatients: _emberComputed['default'].reads('model.patients'),

    refetch: function refetch() {
      var _this = this;

      (0, _emberRunloop['default'])(function () {
        _this.set('page', 1);
        var groupIds = [_this.get('huddleId'), _this.get('groupId')].filter(function (n) {
          return n;
        });

        var patientsRemoteArray = _this.get('model.patients');
        patientsRemoteArray.set('sortBy', _this.get('sortBy'));
        patientsRemoteArray.set('sortDescending', _this.get('sortDescending'));
        patientsRemoteArray.set('groupId', groupIds);
        // patientsRemoteArray.set('patientIds', this.get('huddlePatientIds'));
        patientsRemoteArray.set('patientSearch', _this.get('patientSearch'));
        patientsRemoteArray.set('page', 1);
        patientsRemoteArray.pageChanged();
      });
    },

    actions: {
      selectRiskAssessment: function selectRiskAssessment(assessment) {
        this.set('currentAssessment', assessment);
      },

      selectHuddle: function selectHuddle(huddle) {
        this.set('selectedHuddle', huddle);
        this.set('huddleId', huddle ? huddle.get('id') : '');

        this.refetch();
      },

      togglePopulation: function togglePopulation(population, active) {
        if (active) {
          this.set('groupId', population.get('id'));
        } else {
          this.set('groupId', '');
        }

        this.refetch();
      },

      setRiskScore: function setRiskScore(lowValue, highValue) {
        this.set('riskLowValue', lowValue);
        this.set('riskHighValue', highValue);
      },

      selectSortBy: function selectSortBy(sortBy, sortDescending) {
        var currentSortBy = this.get('sortBy');
        var currentSortDesc = this.get('sortDescending');

        // do nothing if nothing has changed
        if (currentSortBy === sortBy && currentSortDesc === sortDescending) {
          return;
        }

        this.set('sortBy', sortBy);
        this.set('sortDescending', sortDescending);

        this.refetch();
      },

      setPage: function setPage(page) {
        this.set('page', page);
      },

      openPatientPrintList: function openPatientPrintList(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var queryParams = {
          sortBy: this.get('sortBy'),
          sortDescending: this.get('sortDescending'),
          assessment: this.get('currentAssessment')
        };

        var huddleId = this.get('huddleId');
        var groupId = this.get('groupId');

        if (huddleId) {
          queryParams.huddleId = huddleId;
        }

        if (groupId) {
          queryParams.groupId = groupId;
        }

        var patientSearch = this.get('patientSearch');
        if (!(0, _emberUtils.isEmpty)(patientSearch)) {
          queryParams.name = patientSearch;
        }

        var url = this.get('router.router').generate('patients.print', { queryParams: queryParams });
        window.open(url, 'patientPrintList', 'menubar=no,toolbar=no,location=no,status=yes,resizable=yes,scrollbars=yes');
      }
    }
  });
});
define('ember-on-fhir/controllers/patients/print', ['exports', 'ember-controller', 'ember-computed'], function (exports, _emberController, _emberComputed) {
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  exports['default'] = _emberController['default'].extend({
    queryParams: ['sortBy', 'sortDescending', 'assessment', 'huddleId', 'groupId', 'name'],

    assessment: 'Catastrophic Health Event',
    sortBy: null,
    sortDescending: null,
    huddleId: null,
    groupId: null,
    name: null,

    currentHuddle: (0, _emberComputed['default'])('huddleId', 'model.huddles', function currentHuddle() {
      var huddleId = this.get('huddleId');
      if (huddleId) {
        return this.get('model.huddles').findBy('id', huddleId);
      }
    }),

    risksByPatient: (0, _emberComputed['default'])('model.risks', function risksByPatient() {
      return this.get('model.risks').reduce(risksByPatientReducer, {});
    }),

    sortByDisplayText: (0, _emberComputed['default'])('sortBy', 'sortDescending', function sortByDisplayText() {
      var sortBy = this.get('sortBy');
      var sortDescending = this.get('sortDescending') === 'true';
      var text = '';

      if (sortBy === 'name,birthdate') {
        text = 'Name';
      } else if (sortBy === 'birthdate,name') {
        text = 'Age';
        sortDescending = !sortDescending;
      } else if (sortBy === 'gender,name') {
        text = 'Gender';
      }

      return text + ' (' + (sortDescending ? 'descending' : 'ascending') + ')';
    }),

    actions: {
      closeWindow: function closeWindow(event) {
        event.preventDefault();
        window.close();
      },

      print: function print(event) {
        event.preventDefault();
        window.print();
      }
    }
  });

  function risksByPatientReducer(memo, item) {
    var patientId = (item.get('subject.reference') || '').replace(/^Patient\//, '');
    return Object.assign(memo, _defineProperty({}, patientId, item));
  }
});
define('ember-on-fhir/controllers/patients/show', ['exports', 'ember-controller', 'ember-computed', 'ember-service/inject', 'ember-controller/inject', 'ember-on-fhir/models/huddle'], function (exports, _emberController, _emberComputed, _emberServiceInject, _emberControllerInject, _emberOnFhirModelsHuddle) {
  exports['default'] = _emberController['default'].extend({
    indexController: (0, _emberControllerInject['default'])('patients.index'),
    ajax: (0, _emberServiceInject['default'])(),

    currentAssessment: 'Catastrophic Health Event',
    selectedCategory: null,
    showAddInterventionModal: false,
    showAddHuddleModal: false,
    showReviewPatientModal: false,
    reviewPatientModalSkippable: false,
    defaultAddHuddleDate: null,

    patientViewerComponent: null,

    huddles: (0, _emberComputed['default'])({
      get: function get() {
        return [];
      }
    }),
    huddlePatients: _emberComputed['default'].alias('indexController.model.patients'),
    huddleCount: _emberComputed['default'].alias('indexController.model.patients.meta.total'),
    huddleOffset: _emberComputed['default'].alias('huddlePatients.paramsForBackend._offset'),
    currentPatientIndex: (0, _emberComputed['default'])('huddlePatients', 'model', 'nextPatient', {
      get: function get() {
        return this.get('huddlePatients').indexOf(this.get('model')) + 1 + this.get('huddleOffset');
      }
    }),

    nextPatient: (0, _emberComputed['default'])('currentPatientIndex', {
      get: function get() {
        var params = this.get('indexController.model.patients.searchParams');
        var index = this.get('currentPatientIndex');
        return this.store.find('patient', Object.assign(params, { _count: 1, _offset: index }));
      }
    }),

    prevPatient: (0, _emberComputed['default'])('currentPatientIndex', {
      get: function get() {
        var params = this.get('indexController.model.patients.searchParams');
        var index = this.get('currentPatientIndex');
        return this.store.find('patient', Object.assign(params, { _count: 1, _offset: index - 2 }));
      }
    }),

    riskAssessments: (0, _emberComputed['default'])({
      get: function get() {
        // TODO: get this list from the backend
        return ['Catastrophic Health Event'];
      }
    }),

    refreshHuddles: function refreshHuddles() {
      var _this = this;

      this.get('ajax').request('/Group', {
        data: {
          code: 'http://interventionengine.org/fhir/cs/huddle|HUDDLE',
          member: 'Patient/' + this.get('model.id')
        }
      }).then(function (response) {
        _this.set('huddles', (0, _emberOnFhirModelsHuddle.parseHuddles)(response.entry || []));
      });
    },

    actions: {
      moveToNextPatient: function moveToNextPatient() {
        var _this2 = this;

        var skip = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var newIndex = this.get('currentPatientIndex') + 1;
        if (newIndex > this.get('huddleCount')) {
          return;
        }

        var selectedHuddleId = this.get('indexController.selectedHuddle.id');
        var selectedHuddle = selectedHuddleId ? this.get('huddles').findBy('id', selectedHuddleId) : null;
        var patientReviewed = true;
        if (selectedHuddle != null) {
          patientReviewed = selectedHuddle.patientReviewed(this.get('model'));
        }

        if (!skip && !patientReviewed) {
          this.set('reviewPatientModalSkippable', true);
          this.set('showReviewPatientModal', true);
          this.set('reviewPatientHuddle', selectedHuddle);

          return;
        }

        this.set('reviewPatientModalSkippable', false);
        this.set('showReviewPatientModal', false);

        this.get('nextPatient').then(function (nextPatient) {
          _this2.set('currentPatientIndex', newIndex);
          _this2.transitionToRoute('patients.show', nextPatient.get('firstObject'));
        });
      },

      moveToPrevPatient: function moveToPrevPatient() {
        var _this3 = this;

        var newIndex = this.get('currentPatientIndex') - 1;
        if (newIndex <= 0) {
          return;
        }

        this.get('prevPatient').then(function (prevPatient) {
          _this3.set('currentPatientIndex', newIndex);
          _this3.transitionToRoute('patients.show', prevPatient.get('firstObject'));
        });
      },

      changeCurrentPatientIndex: function changeCurrentPatientIndex(amount) {
        var newIndex = this.get('currentPatientIndex') + amount;
        if (newIndex > this.get('huddleCount') || newIndex <= 0) {
          return;
        }
        this.set('currentPatientIndex', newIndex);
      },

      setRiskAssessment: function setRiskAssessment(riskAssessment) {
        this.set('currentAssessment', riskAssessment);
        this.set('selectedCategory', null);
      },

      selectCategory: function selectCategory(category) {
        this.set('selectedCategory', category);
      },

      openAddInterventionModal: function openAddInterventionModal() {
        this.set('showAddInterventionModal', true);
      },

      hideAddInterventionModal: function hideAddInterventionModal() {
        this.set('showAddInterventionModal', false);
      },

      openAddHuddleModal: function openAddHuddleModal(date) {
        this.set('showAddHuddleModal', true);
        this.set('defaultAddHuddleDate', date);
      },

      hideAddHuddleModal: function hideAddHuddleModal() {
        this.set('showAddHuddleModal', false);
        this.refreshHuddles();
      },

      refreshHuddles: function refreshHuddles() {
        this.refreshHuddles();
      },

      openReviewPatientModal: function openReviewPatientModal(huddle) {
        this.set('showReviewPatientModal', true);
        this.set('reviewPatientHuddle', huddle);
      },

      hideReviewPatientModal: function hideReviewPatientModal() {
        this.set('showReviewPatientModal', false);
        this.set('reviewPatientModalSkippable', false);
        var patientViewer = this.get('patientViewerComponent');
        if (patientViewer) {
          patientViewer.notifyPropertyChange('nextScheduledHuddle');
        }
      },

      registerPatientViewer: function registerPatientViewer(component) {
        this.set('patientViewerComponent', component);
      },

      unregisterPatientViewer: function unregisterPatientViewer() {
        this.set('patientViewerComponent', null);
      },

      nextPatient: function nextPatient() {
        this.set('selectedCategory', null);
      }
    }
  });
});
define('ember-on-fhir/controllers/register', ['exports', 'ember-controller', 'ember-computed', 'ember-runloop', 'ember-service/inject', 'ember-validations', 'ember-on-fhir/utils/email-validation-regex', 'ember-on-fhir/utils/validation-group-classnames'], function (exports, _emberController, _emberComputed, _emberRunloop, _emberServiceInject, _emberValidations, _emberOnFhirUtilsEmailValidationRegex, _emberOnFhirUtilsValidationGroupClassnames) {
  exports['default'] = _emberController['default'].extend(_emberValidations['default'], {
    ajax: (0, _emberServiceInject['default'])(),

    registering: false,
    identification: null,
    password: null,
    passwordConfirmation: null,
    displayErrors: false,
    errorMessage: null,

    disableRegisterBtn: (0, _emberComputed['default'])('registering', 'displayErrors', 'isValid', function disableRegisterBtn() {
      if (this.get('registering') || this.get('displayErrors') && !this.get('isValid')) {
        return true;
      }

      return null;
    }),

    validations: {
      identification: {
        presence: true,
        format: {
          'with': _emberOnFhirUtilsEmailValidationRegex['default'],
          allowBlank: true,
          message: 'not a valid email'
        }
      },
      password: {
        confirmation: true,
        length: {
          minimum: 8,
          messages: {
            tooShort: 'must be at least 8 characters'
          }
        }
      },
      passwordConfirmation: {
        presence: true
      }
    },

    identificationClassNames: (0, _emberOnFhirUtilsValidationGroupClassnames['default'])('identification'),
    passwordClassNames: (0, _emberOnFhirUtilsValidationGroupClassnames['default'])('password'),
    passwordConfirmationClassNames: (0, _emberOnFhirUtilsValidationGroupClassnames['default'])('passwordConfirmation'),

    actions: {
      register: function register() {
        var _this = this;

        if (this.get('registering')) {
          return;
        }

        this.set('displayErrors', true);
        this.validate().then(function () {
          _this.set('registering', true);

          var credentials = {
            identification: _this.get('identification'),
            password: _this.get('password'),
            confirmation: _this.get('passwordConfirmation')
          };

          var ajaxParams = {
            type: 'POST',
            data: JSON.stringify(credentials),
            contentType: 'application/json'
          };

          _this.get('ajax').request('/register', ajaxParams).then(registerSuccess.bind(_this), registerError.bind(_this));
        });
      },

      clearErrors: function clearErrors() {
        this.set('errorMessage', null);
      }
    }
  });

  function registerSuccess() {
    this.transitionTo('login', {
      queryParams: {
        registered: true
      }
    });
  }

  function registerError(error) {
    var _this2 = this;

    (0, _emberRunloop['default'])(function () {
      var response = JSON.parse(error.payload);
      _this2.set('errorMessage', response.error);
      _this2.set('registering', false);
    });
  }
});
define('ember-on-fhir/helpers/and', ['exports', 'ember', 'ember-truth-helpers/helpers/and'], function (exports, _ember, _emberTruthHelpersHelpersAnd) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersAnd.andHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersAnd.andHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/array-contains', ['exports', 'ember-helper', 'ember-array/utils'], function (exports, _emberHelper, _emberArrayUtils) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.arrayContains = arrayContains;

  function arrayContains(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var array = _ref2[0];
    var value = _ref2[1];

    if (!(0, _emberArrayUtils.isEmberArray)(array)) {
      return false;
    }

    return array.contains(value);
  }

  exports['default'] = (0, _emberHelper.helper)(arrayContains);
});
define('ember-on-fhir/helpers/eq', ['exports', 'ember', 'ember-truth-helpers/helpers/equal'], function (exports, _ember, _emberTruthHelpersHelpersEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersEqual.equalHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersEqual.equalHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/generate-uuid', ['exports', 'ember', 'ember-helper'], function (exports, _ember, _emberHelper) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.generateUuid = generateUuid;
  var uuid = _ember['default'].uuid;

  function generateUuid(_ref /*, hash*/) {
    var _ref2 = _slicedToArray(_ref, 1);

    var base = _ref2[0];

    return '' + base + uuid();
  }

  exports['default'] = (0, _emberHelper.helper)(generateUuid);
});
define('ember-on-fhir/helpers/gt', ['exports', 'ember', 'ember-truth-helpers/helpers/gt'], function (exports, _ember, _emberTruthHelpersHelpersGt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGt.gtHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGt.gtHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/gte', ['exports', 'ember', 'ember-truth-helpers/helpers/gte'], function (exports, _ember, _emberTruthHelpersHelpersGte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGte.gteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGte.gteHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/is-array', ['exports', 'ember', 'ember-truth-helpers/helpers/is-array'], function (exports, _ember, _emberTruthHelpersHelpersIsArray) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/is-today-or-after', ['exports', 'ember-helper', 'moment'], function (exports, _emberHelper, _moment) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.isTodayOrAfter = isTodayOrAfter;

  function isTodayOrAfter(_ref /*, hash*/) {
    var _ref2 = _slicedToArray(_ref, 1);

    var date = _ref2[0];

    var now = (0, _moment['default'])();

    return now.isSame(date, 'day') || now.isBefore(date, 'day');
  }

  exports['default'] = (0, _emberHelper.helper)(isTodayOrAfter);
});
define("ember-on-fhir/helpers/log", ["exports"], function (exports) {
  exports["default"] = function () {
    //console.debug(str);
  };

  ;
});
define('ember-on-fhir/helpers/lt', ['exports', 'ember', 'ember-truth-helpers/helpers/lt'], function (exports, _ember, _emberTruthHelpersHelpersLt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLt.ltHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLt.ltHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/lte', ['exports', 'ember', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersHelpersLte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLte.lteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/moment-calendar', ['exports', 'ember', 'ember-on-fhir/config/environment', 'ember-moment/helpers/moment-calendar'], function (exports, _ember, _emberOnFhirConfigEnvironment, _emberMomentHelpersMomentCalendar) {
  exports['default'] = _emberMomentHelpersMomentCalendar['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_emberOnFhirConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('ember-on-fhir/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, _emberMomentHelpersMomentDuration) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersMomentDuration['default'];
    }
  });
});
define('ember-on-fhir/helpers/moment-format', ['exports', 'ember', 'ember-on-fhir/config/environment', 'ember-moment/helpers/moment-format'], function (exports, _ember, _emberOnFhirConfigEnvironment, _emberMomentHelpersMomentFormat) {
  exports['default'] = _emberMomentHelpersMomentFormat['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_emberOnFhirConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('ember-on-fhir/helpers/moment-from-now', ['exports', 'ember', 'ember-on-fhir/config/environment', 'ember-moment/helpers/moment-from-now'], function (exports, _ember, _emberOnFhirConfigEnvironment, _emberMomentHelpersMomentFromNow) {
  exports['default'] = _emberMomentHelpersMomentFromNow['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_emberOnFhirConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('ember-on-fhir/helpers/moment-to-now', ['exports', 'ember', 'ember-on-fhir/config/environment', 'ember-moment/helpers/moment-to-now'], function (exports, _ember, _emberOnFhirConfigEnvironment, _emberMomentHelpersMomentToNow) {
  exports['default'] = _emberMomentHelpersMomentToNow['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_emberOnFhirConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('ember-on-fhir/helpers/not-eq', ['exports', 'ember', 'ember-truth-helpers/helpers/not-equal'], function (exports, _ember, _emberTruthHelpersHelpersNotEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/not', ['exports', 'ember', 'ember-truth-helpers/helpers/not'], function (exports, _ember, _emberTruthHelpersHelpersNot) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNot.notHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNot.notHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/now', ['exports', 'ember-moment/helpers/now'], function (exports, _emberMomentHelpersNow) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersNow['default'];
    }
  });
});
define('ember-on-fhir/helpers/numeral-format', ['exports', 'ember-helper', 'numeral'], function (exports, _emberHelper, _numeral) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.numeralFormat = numeralFormat;

  function numeralFormat(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var number = _ref2[0];
    var format = _ref2[1];

    return (0, _numeral['default'])(number).format(format);
  }

  exports['default'] = (0, _emberHelper.helper)(numeralFormat);
});
define('ember-on-fhir/helpers/or', ['exports', 'ember', 'ember-truth-helpers/helpers/or'], function (exports, _ember, _emberTruthHelpersHelpersOr) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersOr.orHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersOr.orHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/helpers/patient-huddles', ['exports', 'ember-helper'], function (exports, _emberHelper) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.patientHuddles = patientHuddles;

  function patientHuddles(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var huddles = _ref2[0];
    var patient = _ref2[1];

    return huddles.filter(function (huddle) {
      return huddle.hasPatient(patient);
    });
  }

  exports['default'] = (0, _emberHelper.helper)(patientHuddles);
});
define('ember-on-fhir/helpers/sort-descending', ['exports', 'ember-helper'], function (exports, _emberHelper) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.sortDescending = sortDescending;

  function sortDescending(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var sortDescending = _ref2[0];
    var _ref2$1 = _ref2[1];
    var invert = _ref2$1 === undefined ? false : _ref2$1;

    if (invert) {
      return !sortDescending;
    }

    return sortDescending;
  }

  exports['default'] = (0, _emberHelper.helper)(sortDescending);
});
define('ember-on-fhir/helpers/uniqBy', ['exports', 'ember-helper', 'ember'], function (exports, _emberHelper, _ember) {
  exports.uniqBy = uniqBy;

  function uniqBy(array, by) {
    var ret = _ember['default'].A();
    var seen = {};

    array.forEach(function (item) {
      var guid = item.get(by);
      if (!(guid in seen)) {
        seen[guid] = true;
        ret.push(item);
      }
    });
    return ret;
  }

  exports['default'] = (0, _emberHelper.helper)(uniqBy);
});
define('ember-on-fhir/helpers/xor', ['exports', 'ember', 'ember-truth-helpers/helpers/xor'], function (exports, _ember, _emberTruthHelpersHelpersXor) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersXor.xorHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersXor.xorHelper);
  }

  exports['default'] = forExport;
});
define('ember-on-fhir/initalizers/ie-simple-auth', ['exports', 'ember-on-fhir/authorizers/ie', 'ember-on-fhir/authenticators/ie'], function (exports, _emberOnFhirAuthorizersIe, _emberOnFhirAuthenticatorsIe) {
  exports.initialize = initialize;

  function initialize(container, application) {
    application.register('authorizer:ie', _emberOnFhirAuthorizersIe['default']);
    application.register('authenticator:ie', _emberOnFhirAuthenticatorsIe['default']);
  }

  exports['default'] = {
    name: 'ie-simple-auth',
    before: 'simple-auth',
    initialize: initialize
  };
});
define('ember-on-fhir/initializers/add-modals-container', ['exports', 'ember-modal-dialog/initializers/add-modals-container'], function (exports, _emberModalDialogInitializersAddModalsContainer) {
  exports['default'] = {
    name: 'add-modals-container',
    initialize: _emberModalDialogInitializersAddModalsContainer['default']
  };
});
define('ember-on-fhir/initializers/allow-link-action', ['exports', 'ember-link-action/initializers/allow-link-action'], function (exports, _emberLinkActionInitializersAllowLinkAction) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberLinkActionInitializersAllowLinkAction['default'];
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function get() {
      return _emberLinkActionInitializersAllowLinkAction.initialize;
    }
  });
});
define('ember-on-fhir/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-on-fhir/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _emberOnFhirConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_emberOnFhirConfigEnvironment['default'].APP.name, _emberOnFhirConfigEnvironment['default'].APP.version)
  };
});
define('ember-on-fhir/initializers/application', ['exports', 'ember-fhir-adapter/initializers/application'], function (exports, _emberFhirAdapterInitializersApplication) {
  exports['default'] = _emberFhirAdapterInitializersApplication['default'];
});
define('ember-on-fhir/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define("ember-on-fhir/initializers/coordinator-setup", ["exports", "ember-on-fhir/models/coordinator"], function (exports, _emberOnFhirModelsCoordinator) {
  exports["default"] = {
    name: "setup coordinator",

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];
      app.register("drag:coordinator", _emberOnFhirModelsCoordinator["default"]);
      app.inject("component", "coordinator", "drag:coordinator");
    }
  };
});
define('ember-on-fhir/initializers/ember-simple-auth', ['exports', 'ember', 'ember-on-fhir/config/environment', 'ember-simple-auth/configuration', 'ember-simple-auth/initializers/setup-session', 'ember-simple-auth/initializers/setup-session-service'], function (exports, _ember, _emberOnFhirConfigEnvironment, _emberSimpleAuthConfiguration, _emberSimpleAuthInitializersSetupSession, _emberSimpleAuthInitializersSetupSessionService) {
  exports['default'] = {
    name: 'ember-simple-auth',
    initialize: function initialize(registry) {
      var config = _emberOnFhirConfigEnvironment['default']['ember-simple-auth'] || {};
      config.baseURL = _emberOnFhirConfigEnvironment['default'].baseURL;
      _emberSimpleAuthConfiguration['default'].load(config);

      (0, _emberSimpleAuthInitializersSetupSession['default'])(registry);
      (0, _emberSimpleAuthInitializersSetupSessionService['default'])(registry);
    }
  };
});
define('ember-on-fhir/initializers/ember-spinner', ['exports', 'ember-on-fhir/config/environment'], function (exports, _emberOnFhirConfigEnvironment) {

  var emberSpinnerPrefix = {
    modulePrefix: _emberOnFhirConfigEnvironment['default'].modulePrefix
  };

  exports['default'] = {
    name: 'ember-spinner-prefix',

    initialize: function initialize() {
      var application = arguments[1] || arguments[0];
      application.register('ember-spinner:main', emberSpinnerPrefix, { instantiate: false });
      application.inject('component:ember-spinner', 'emberSpinnerPrefixConfig', 'ember-spinner:main');
    }
  };
});
define('ember-on-fhir/initializers/export-application-global', ['exports', 'ember', 'ember-on-fhir/config/environment'], function (exports, _ember, _emberOnFhirConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_emberOnFhirConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var value = _emberOnFhirConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_emberOnFhirConfigEnvironment['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('ember-on-fhir/initializers/truth-helpers', ['exports', 'ember', 'ember-truth-helpers/utils/register-helper', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/is-array', 'ember-truth-helpers/helpers/not-equal', 'ember-truth-helpers/helpers/gt', 'ember-truth-helpers/helpers/gte', 'ember-truth-helpers/helpers/lt', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersUtilsRegisterHelper, _emberTruthHelpersHelpersAnd, _emberTruthHelpersHelpersOr, _emberTruthHelpersHelpersEqual, _emberTruthHelpersHelpersNot, _emberTruthHelpersHelpersIsArray, _emberTruthHelpersHelpersNotEqual, _emberTruthHelpersHelpersGt, _emberTruthHelpersHelpersGte, _emberTruthHelpersHelpersLt, _emberTruthHelpersHelpersLte) {
  exports.initialize = initialize;

  function initialize() /* container, application */{

    // Do not register helpers from Ember 1.13 onwards, starting from 1.13 they
    // will be auto-discovered.
    if (_ember['default'].Helper) {
      return;
    }

    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('and', _emberTruthHelpersHelpersAnd.andHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('or', _emberTruthHelpersHelpersOr.orHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('eq', _emberTruthHelpersHelpersEqual.equalHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not', _emberTruthHelpersHelpersNot.notHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('is-array', _emberTruthHelpersHelpersIsArray.isArrayHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not-eq', _emberTruthHelpersHelpersNotEqual.notEqualHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gt', _emberTruthHelpersHelpersGt.gtHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gte', _emberTruthHelpersHelpersGte.gteHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lt', _emberTruthHelpersHelpersLt.ltHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lte', _emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = {
    name: 'truth-helpers',
    initialize: initialize
  };
});
define('ember-on-fhir/instance-initializers/ember-simple-auth', ['exports', 'ember-simple-auth/instance-initializers/setup-session-restoration'], function (exports, _emberSimpleAuthInstanceInitializersSetupSessionRestoration) {
  exports['default'] = {
    name: 'ember-simple-auth',
    initialize: function initialize(instance) {
      (0, _emberSimpleAuthInstanceInitializersSetupSessionRestoration['default'])(instance);
    }
  };
});
define('ember-on-fhir/mixins/codeable', ['exports', 'ember-metal/mixin', 'ember-array/utils'], function (exports, _emberMetalMixin, _emberArrayUtils) {
  exports['default'] = _emberMetalMixin['default'].create({
    hasCode: function hasCode(field, code) {
      var thing = this.get(field);
      if ((0, _emberArrayUtils.isEmberArray)(thing)) {
        var matchedCodes = thing.map(function (c) {
          return c.hasCode(code);
        });

        return matchedCodes.any(function (d) {
          return d;
        });
      } else if (thing.get('content.hasCode')) {
        return thing.get('content.hasCode').call(thing.get('content'), code);
      } else {
        return thing.hasCode(code);
      }
    }
  });
});
define('ember-on-fhir/mixins/condition-encounter-code-filters', ['exports', 'ember', 'ember-runloop'], function (exports, _ember, _emberRunloop) {
  exports['default'] = _ember['default'].Mixin.create({
    codeChangedObserver: _ember['default'].observer('characteristic.valueCodeableConcept.coding.@each.system', 'characteristic.valueCodeableConcept.coding.@each.code', function () {
      _emberRunloop['default'].debounce(this, this.attrs.onChange, 150);
    }),

    // since we're not using 2 way binding on the select-fx component, the only way
    // to set the default value to ICD-9 is to use an observer
    onToggle: function onToggle(active) {
      this._super(active);

      if (active) {
        this.send('selectCodingSystem', this.get('characteristic.valueCodeableConcept.coding.firstObject'), this.get('codingSystems.firstObject.system'));
      }
    },

    actions: {
      selectCodingSystem: function selectCodingSystem(coding, codeSystem) {
        var codingSystem = this.get('codingSystems').findBy('system', codeSystem);

        coding.set('system', codingSystem.url);
        coding.set('display', codingSystem.system);
      },

      addCode: function addCode(context) {
        var conditionCoding = context.get('store').createRecord('coding');
        conditionCoding.set('system', this.get('codingSystems.firstObject').url);
        conditionCoding.set('display', this.get('codingSystems.firstObject').system);
        context.get('coding').pushObject(conditionCoding);
      },

      removeCode: function removeCode(context, code) {
        context.get('coding').removeObject(code);
      }
    }
  });
});
define('ember-on-fhir/mixins/dateable', ['exports', 'ember-metal/mixin', 'moment'], function (exports, _emberMetalMixin, _moment) {
  exports['default'] = _emberMetalMixin['default'].create({
    // Method to check if something has happened in the last val*period
    inLast: function inLast(field, val, period) {
      return this.sinceDate(field, val, period, new Date());
    },

    // Method to check if something will happen in the next val*period
    inNext: function inNext(field, val, period) {
      return this.untilDate(field, val, period, new Date());
    },

    // Checks if something happened in val*period from startDate
    sinceDate: function sinceDate(field, val, period, startDate) {
      var periodAgo = (0, _moment['default'])(startDate).subtract(val, period).toDate();
      return new Date(this.get(field)) > periodAgo;
    },

    untilDate: function untilDate(field, val, period, startDate) {
      var periodTo = (0, _moment['default'])(startDate).add(val, period).toDate();
      return new Date(this.get(field)) < periodTo;
    },

    // Check if something has occured, ie the date isn't in the future
    hasOccured: function hasOccured(field) {
      return new Date(this.get(field)) <= new Date();
    },

    isActive: function isActive(field) {
      return this.get(field) === undefined || !this.hasOccured(field);
    }
  });
});
define('ember-on-fhir/mixins/filter-component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Mixin.create({
    characteristic: null,
    checkboxBaseName: null,

    active: _ember['default'].computed.notEmpty('characteristic'),

    checkboxName: _ember['default'].computed('checkboxBaseName', function () {
      return 'checkbox-' + this.get('checkboxBaseName') + '-' + _ember['default'].guidFor({});
    }),

    checkboxChecked: _ember['default'].computed('active', function () {
      if (this.get('active')) {
        return true;
      }
      return null;
    }),

    onToggle: function onToggle() /* active */{
      // no-op
    },

    actions: {
      toggle: function toggle() {
        if (this.get('active')) {
          this.attrs.destroyCharacteristic();
          this.onToggle(false);
        } else {
          this.attrs.createCharacteristic();
          this.onToggle(true);
        }
      }
    }
  });
});
define('ember-on-fhir/mixins/has-stylesheet', ['exports', 'ember-metal/mixin', 'ember-on-fhir/utils/create-stylesheet'], function (exports, _emberMetalMixin, _emberOnFhirUtilsCreateStylesheet) {
  exports['default'] = _emberMetalMixin['default'].create({
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);
      this.sheet = (0, _emberOnFhirUtilsCreateStylesheet['default'])();
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);
      if (this.sheet) {
        document.head.removeChild(this.sheet);
        this.sheet = null;
      }
    },

    resetStylesheet: function resetStylesheet() {
      if (this.sheet) {
        document.head.removeChild(this.sheet);
      }
      this.sheet = (0, _emberOnFhirUtilsCreateStylesheet['default'])();
    }
  });
});
define('ember-on-fhir/mixins/link-action', ['exports', 'ember-link-action/mixins/link-action'], function (exports, _emberLinkActionMixinsLinkAction) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberLinkActionMixinsLinkAction['default'];
    }
  });
});
define('ember-on-fhir/mixins/patient-icon-class-names', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Mixin.create({
    genderIconClassName: _ember['default'].computed('patient.computedGender', function () {
      var gender = this.get('patient.computedGender');

      if (gender === 'Male') {
        return 'fa-male';
      } else if (gender === 'Female') {
        return 'fa-female';
      }

      return 'fa-user';
    }),

    ageIconClassName: _ember['default'].computed('patient.computedAge', function () {
      var age = this.get('patient.computedAge');

      if (age <= 3) {
        return 'icon-baby';
      } else if (age <= 17) {
        return 'icon-child';
      } else if (age <= 64) {
        return 'icon-adult';
      } else if (age >= 65) {
        return 'icon-elderly';
      }

      return 'fa fa-birthday-cake';
    })
  });
});
define('ember-on-fhir/mixins/selectable', ['exports', 'ember-metal/mixin'], function (exports, _emberMetalMixin) {
  exports['default'] = _emberMetalMixin['default'].create({
    selected: false
  });
});
define('ember-on-fhir/models/account', ['exports', 'ember-fhir-adapter/models/account'], function (exports, _emberFhirAdapterModelsAccount) {
  exports['default'] = _emberFhirAdapterModelsAccount['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/address', ['exports', 'ember-fhir-adapter/models/address'], function (exports, _emberFhirAdapterModelsAddress) {
  exports['default'] = _emberFhirAdapterModelsAddress['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/allergy-intolerance-reaction-component', ['exports', 'ember-fhir-adapter/models/allergy-intolerance-reaction-component'], function (exports, _emberFhirAdapterModelsAllergyIntoleranceReactionComponent) {
  exports['default'] = _emberFhirAdapterModelsAllergyIntoleranceReactionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/allergy-intolerance', ['exports', 'ember-fhir-adapter/models/allergy-intolerance'], function (exports, _emberFhirAdapterModelsAllergyIntolerance) {
  exports['default'] = _emberFhirAdapterModelsAllergyIntolerance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/annotation', ['exports', 'ember-fhir-adapter/models/annotation'], function (exports, _emberFhirAdapterModelsAnnotation) {
  exports['default'] = _emberFhirAdapterModelsAnnotation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/appointment-participant-component', ['exports', 'ember-fhir-adapter/models/appointment-participant-component'], function (exports, _emberFhirAdapterModelsAppointmentParticipantComponent) {
  exports['default'] = _emberFhirAdapterModelsAppointmentParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/appointment-response', ['exports', 'ember-fhir-adapter/models/appointment-response'], function (exports, _emberFhirAdapterModelsAppointmentResponse) {
  exports['default'] = _emberFhirAdapterModelsAppointmentResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/appointment', ['exports', 'ember-fhir-adapter/models/appointment'], function (exports, _emberFhirAdapterModelsAppointment) {
  exports['default'] = _emberFhirAdapterModelsAppointment['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/attachment', ['exports', 'ember-fhir-adapter/models/attachment'], function (exports, _emberFhirAdapterModelsAttachment) {
  exports['default'] = _emberFhirAdapterModelsAttachment['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event-event-component', ['exports', 'ember-fhir-adapter/models/audit-event-event-component'], function (exports, _emberFhirAdapterModelsAuditEventEventComponent) {
  exports['default'] = _emberFhirAdapterModelsAuditEventEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event-object-component', ['exports', 'ember-fhir-adapter/models/audit-event-object-component'], function (exports, _emberFhirAdapterModelsAuditEventObjectComponent) {
  exports['default'] = _emberFhirAdapterModelsAuditEventObjectComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event-object-detail-component', ['exports', 'ember-fhir-adapter/models/audit-event-object-detail-component'], function (exports, _emberFhirAdapterModelsAuditEventObjectDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsAuditEventObjectDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event-participant-component', ['exports', 'ember-fhir-adapter/models/audit-event-participant-component'], function (exports, _emberFhirAdapterModelsAuditEventParticipantComponent) {
  exports['default'] = _emberFhirAdapterModelsAuditEventParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event-participant-network-component', ['exports', 'ember-fhir-adapter/models/audit-event-participant-network-component'], function (exports, _emberFhirAdapterModelsAuditEventParticipantNetworkComponent) {
  exports['default'] = _emberFhirAdapterModelsAuditEventParticipantNetworkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event-source-component', ['exports', 'ember-fhir-adapter/models/audit-event-source-component'], function (exports, _emberFhirAdapterModelsAuditEventSourceComponent) {
  exports['default'] = _emberFhirAdapterModelsAuditEventSourceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/audit-event', ['exports', 'ember-fhir-adapter/models/audit-event'], function (exports, _emberFhirAdapterModelsAuditEvent) {
  exports['default'] = _emberFhirAdapterModelsAuditEvent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/backbone-element', ['exports', 'ember-fhir-adapter/models/backbone-element'], function (exports, _emberFhirAdapterModelsBackboneElement) {
  exports['default'] = _emberFhirAdapterModelsBackboneElement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/basic', ['exports', 'ember-fhir-adapter/models/basic'], function (exports, _emberFhirAdapterModelsBasic) {
  exports['default'] = _emberFhirAdapterModelsBasic['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/binary', ['exports', 'ember-fhir-adapter/models/binary'], function (exports, _emberFhirAdapterModelsBinary) {
  exports['default'] = _emberFhirAdapterModelsBinary['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/body-site', ['exports', 'ember-fhir-adapter/models/body-site'], function (exports, _emberFhirAdapterModelsBodySite) {
  exports['default'] = _emberFhirAdapterModelsBodySite['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/bundle-entry-component', ['exports', 'ember-fhir-adapter/models/bundle-entry-component'], function (exports, _emberFhirAdapterModelsBundleEntryComponent) {
  exports['default'] = _emberFhirAdapterModelsBundleEntryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/bundle-entry-request-component', ['exports', 'ember-fhir-adapter/models/bundle-entry-request-component'], function (exports, _emberFhirAdapterModelsBundleEntryRequestComponent) {
  exports['default'] = _emberFhirAdapterModelsBundleEntryRequestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/bundle-entry-response-component', ['exports', 'ember-fhir-adapter/models/bundle-entry-response-component'], function (exports, _emberFhirAdapterModelsBundleEntryResponseComponent) {
  exports['default'] = _emberFhirAdapterModelsBundleEntryResponseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/bundle-entry-search-component', ['exports', 'ember-fhir-adapter/models/bundle-entry-search-component'], function (exports, _emberFhirAdapterModelsBundleEntrySearchComponent) {
  exports['default'] = _emberFhirAdapterModelsBundleEntrySearchComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/bundle-link-component', ['exports', 'ember-fhir-adapter/models/bundle-link-component'], function (exports, _emberFhirAdapterModelsBundleLinkComponent) {
  exports['default'] = _emberFhirAdapterModelsBundleLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/bundle', ['exports', 'ember-fhir-adapter/models/bundle'], function (exports, _emberFhirAdapterModelsBundle) {
  exports['default'] = _emberFhirAdapterModelsBundle['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/care-plan-activity-component', ['exports', 'ember-fhir-adapter/models/care-plan-activity-component'], function (exports, _emberFhirAdapterModelsCarePlanActivityComponent) {
  exports['default'] = _emberFhirAdapterModelsCarePlanActivityComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/care-plan-activity-detail-component', ['exports', 'ember-fhir-adapter/models/care-plan-activity-detail-component'], function (exports, _emberFhirAdapterModelsCarePlanActivityDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsCarePlanActivityDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/care-plan-participant-component', ['exports', 'ember-fhir-adapter/models/care-plan-participant-component'], function (exports, _emberFhirAdapterModelsCarePlanParticipantComponent) {
  exports['default'] = _emberFhirAdapterModelsCarePlanParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/care-plan-related-plan-component', ['exports', 'ember-fhir-adapter/models/care-plan-related-plan-component'], function (exports, _emberFhirAdapterModelsCarePlanRelatedPlanComponent) {
  exports['default'] = _emberFhirAdapterModelsCarePlanRelatedPlanComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/care-plan', ['exports', 'ember-fhir-adapter/models/care-plan'], function (exports, _emberFhirAdapterModelsCarePlan) {
  exports['default'] = _emberFhirAdapterModelsCarePlan['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-coverage-component', ['exports', 'ember-fhir-adapter/models/claim-coverage-component'], function (exports, _emberFhirAdapterModelsClaimCoverageComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimCoverageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-detail-component', ['exports', 'ember-fhir-adapter/models/claim-detail-component'], function (exports, _emberFhirAdapterModelsClaimDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-diagnosis-component', ['exports', 'ember-fhir-adapter/models/claim-diagnosis-component'], function (exports, _emberFhirAdapterModelsClaimDiagnosisComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimDiagnosisComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-items-component', ['exports', 'ember-fhir-adapter/models/claim-items-component'], function (exports, _emberFhirAdapterModelsClaimItemsComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimItemsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-missing-teeth-component', ['exports', 'ember-fhir-adapter/models/claim-missing-teeth-component'], function (exports, _emberFhirAdapterModelsClaimMissingTeethComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimMissingTeethComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-payee-component', ['exports', 'ember-fhir-adapter/models/claim-payee-component'], function (exports, _emberFhirAdapterModelsClaimPayeeComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimPayeeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-prosthesis-component', ['exports', 'ember-fhir-adapter/models/claim-prosthesis-component'], function (exports, _emberFhirAdapterModelsClaimProsthesisComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimProsthesisComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-added-item-adjudication-component', ['exports', 'ember-fhir-adapter/models/claim-response-added-item-adjudication-component'], function (exports, _emberFhirAdapterModelsClaimResponseAddedItemAdjudicationComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseAddedItemAdjudicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-added-item-component', ['exports', 'ember-fhir-adapter/models/claim-response-added-item-component'], function (exports, _emberFhirAdapterModelsClaimResponseAddedItemComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseAddedItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-added-item-detail-adjudication-component', ['exports', 'ember-fhir-adapter/models/claim-response-added-item-detail-adjudication-component'], function (exports, _emberFhirAdapterModelsClaimResponseAddedItemDetailAdjudicationComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseAddedItemDetailAdjudicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-added-items-detail-component', ['exports', 'ember-fhir-adapter/models/claim-response-added-items-detail-component'], function (exports, _emberFhirAdapterModelsClaimResponseAddedItemsDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseAddedItemsDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-coverage-component', ['exports', 'ember-fhir-adapter/models/claim-response-coverage-component'], function (exports, _emberFhirAdapterModelsClaimResponseCoverageComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseCoverageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-detail-adjudication-component', ['exports', 'ember-fhir-adapter/models/claim-response-detail-adjudication-component'], function (exports, _emberFhirAdapterModelsClaimResponseDetailAdjudicationComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseDetailAdjudicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-errors-component', ['exports', 'ember-fhir-adapter/models/claim-response-errors-component'], function (exports, _emberFhirAdapterModelsClaimResponseErrorsComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseErrorsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-item-adjudication-component', ['exports', 'ember-fhir-adapter/models/claim-response-item-adjudication-component'], function (exports, _emberFhirAdapterModelsClaimResponseItemAdjudicationComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseItemAdjudicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-item-detail-component', ['exports', 'ember-fhir-adapter/models/claim-response-item-detail-component'], function (exports, _emberFhirAdapterModelsClaimResponseItemDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseItemDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-items-component', ['exports', 'ember-fhir-adapter/models/claim-response-items-component'], function (exports, _emberFhirAdapterModelsClaimResponseItemsComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseItemsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-notes-component', ['exports', 'ember-fhir-adapter/models/claim-response-notes-component'], function (exports, _emberFhirAdapterModelsClaimResponseNotesComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseNotesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-sub-detail-component', ['exports', 'ember-fhir-adapter/models/claim-response-sub-detail-component'], function (exports, _emberFhirAdapterModelsClaimResponseSubDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseSubDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response-subdetail-adjudication-component', ['exports', 'ember-fhir-adapter/models/claim-response-subdetail-adjudication-component'], function (exports, _emberFhirAdapterModelsClaimResponseSubdetailAdjudicationComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimResponseSubdetailAdjudicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-response', ['exports', 'ember-fhir-adapter/models/claim-response'], function (exports, _emberFhirAdapterModelsClaimResponse) {
  exports['default'] = _emberFhirAdapterModelsClaimResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim-sub-detail-component', ['exports', 'ember-fhir-adapter/models/claim-sub-detail-component'], function (exports, _emberFhirAdapterModelsClaimSubDetailComponent) {
  exports['default'] = _emberFhirAdapterModelsClaimSubDetailComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/claim', ['exports', 'ember-fhir-adapter/models/claim'], function (exports, _emberFhirAdapterModelsClaim) {
  exports['default'] = _emberFhirAdapterModelsClaim['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/clinical-impression-finding-component', ['exports', 'ember-fhir-adapter/models/clinical-impression-finding-component'], function (exports, _emberFhirAdapterModelsClinicalImpressionFindingComponent) {
  exports['default'] = _emberFhirAdapterModelsClinicalImpressionFindingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/clinical-impression-investigations-component', ['exports', 'ember-fhir-adapter/models/clinical-impression-investigations-component'], function (exports, _emberFhirAdapterModelsClinicalImpressionInvestigationsComponent) {
  exports['default'] = _emberFhirAdapterModelsClinicalImpressionInvestigationsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/clinical-impression-ruled-out-component', ['exports', 'ember-fhir-adapter/models/clinical-impression-ruled-out-component'], function (exports, _emberFhirAdapterModelsClinicalImpressionRuledOutComponent) {
  exports['default'] = _emberFhirAdapterModelsClinicalImpressionRuledOutComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/clinical-impression', ['exports', 'ember-fhir-adapter/models/clinical-impression'], function (exports, _emberFhirAdapterModelsClinicalImpression) {
  exports['default'] = _emberFhirAdapterModelsClinicalImpression['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/codeable-concept', ['exports', 'ember-fhir-adapter/models/codeable-concept', 'ember-computed'], function (exports, _emberFhirAdapterModelsCodeableConcept, _emberComputed) {

  // We don't want to display the URI of the system, it's ugly, so here's a lookup table
  // TODO the better way to do this would be have it hucked in some config file.
  var SYSTEM_LOOKUP = {
    'http://snomed.info/sct': 'SNOMED',
    'http://www.nlm.nih.gov/research/umls/rxnorm': 'RxNorm',
    'http://loinc.org': 'LOINC',
    'http://www.ama-assn.org/go/cpt': 'CPT',
    'http://hl7.org/fhir/sid/icd-9': 'ICD9',
    'http://hl7.org/fhir/sid/icd-10': 'ICD10'
  };

  exports['default'] = _emberFhirAdapterModelsCodeableConcept['default'].extend({
    hasCode: function hasCode(code) {
      var matchedCodes = this.get('coding').map(function (c) {
        return c.get('system') === code.system && c.get('code') === code.code;
      });
      return matchedCodes.any(function (d) {
        return d;
      });
    },

    displayText: (0, _emberComputed['default'])('text', 'coding.firstObject.display', 'coding.firstObject.system', 'coding.firstObject.code', {
      get: function get() {
        return this.get('text') || this.get('coding.firstObject.display') || (SYSTEM_LOOKUP[this.get('coding.firstObject.system')] || this.get('coding.firstObject.system')) + ' ' + this.get('coding.firstObject.code');
      }
    }).readOnly()
  });
});
define('ember-on-fhir/models/coding', ['exports', 'ember-fhir-adapter/models/coding'], function (exports, _emberFhirAdapterModelsCoding) {
  exports['default'] = _emberFhirAdapterModelsCoding['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/communication-payload-component', ['exports', 'ember-fhir-adapter/models/communication-payload-component'], function (exports, _emberFhirAdapterModelsCommunicationPayloadComponent) {
  exports['default'] = _emberFhirAdapterModelsCommunicationPayloadComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/communication-request-payload-component', ['exports', 'ember-fhir-adapter/models/communication-request-payload-component'], function (exports, _emberFhirAdapterModelsCommunicationRequestPayloadComponent) {
  exports['default'] = _emberFhirAdapterModelsCommunicationRequestPayloadComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/communication-request', ['exports', 'ember-fhir-adapter/models/communication-request'], function (exports, _emberFhirAdapterModelsCommunicationRequest) {
  exports['default'] = _emberFhirAdapterModelsCommunicationRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/communication', ['exports', 'ember-fhir-adapter/models/communication'], function (exports, _emberFhirAdapterModelsCommunication) {
  exports['default'] = _emberFhirAdapterModelsCommunication['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/composition-attester-component', ['exports', 'ember-fhir-adapter/models/composition-attester-component'], function (exports, _emberFhirAdapterModelsCompositionAttesterComponent) {
  exports['default'] = _emberFhirAdapterModelsCompositionAttesterComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/composition-event-component', ['exports', 'ember-fhir-adapter/models/composition-event-component'], function (exports, _emberFhirAdapterModelsCompositionEventComponent) {
  exports['default'] = _emberFhirAdapterModelsCompositionEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/composition-section-component', ['exports', 'ember-fhir-adapter/models/composition-section-component'], function (exports, _emberFhirAdapterModelsCompositionSectionComponent) {
  exports['default'] = _emberFhirAdapterModelsCompositionSectionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/composition', ['exports', 'ember-fhir-adapter/models/composition'], function (exports, _emberFhirAdapterModelsComposition) {
  exports['default'] = _emberFhirAdapterModelsComposition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/concept-map-contact-component', ['exports', 'ember-fhir-adapter/models/concept-map-contact-component'], function (exports, _emberFhirAdapterModelsConceptMapContactComponent) {
  exports['default'] = _emberFhirAdapterModelsConceptMapContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/concept-map-other-element-component', ['exports', 'ember-fhir-adapter/models/concept-map-other-element-component'], function (exports, _emberFhirAdapterModelsConceptMapOtherElementComponent) {
  exports['default'] = _emberFhirAdapterModelsConceptMapOtherElementComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/concept-map-source-element-component', ['exports', 'ember-fhir-adapter/models/concept-map-source-element-component'], function (exports, _emberFhirAdapterModelsConceptMapSourceElementComponent) {
  exports['default'] = _emberFhirAdapterModelsConceptMapSourceElementComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/concept-map-target-element-component', ['exports', 'ember-fhir-adapter/models/concept-map-target-element-component'], function (exports, _emberFhirAdapterModelsConceptMapTargetElementComponent) {
  exports['default'] = _emberFhirAdapterModelsConceptMapTargetElementComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/concept-map', ['exports', 'ember-fhir-adapter/models/concept-map'], function (exports, _emberFhirAdapterModelsConceptMap) {
  exports['default'] = _emberFhirAdapterModelsConceptMap['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/condition-evidence-component', ['exports', 'ember-fhir-adapter/models/condition-evidence-component'], function (exports, _emberFhirAdapterModelsConditionEvidenceComponent) {
  exports['default'] = _emberFhirAdapterModelsConditionEvidenceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/condition-stage-component', ['exports', 'ember-fhir-adapter/models/condition-stage-component'], function (exports, _emberFhirAdapterModelsConditionStageComponent) {
  exports['default'] = _emberFhirAdapterModelsConditionStageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/condition', ['exports', 'ember', 'ember-on-fhir/mixins/codeable', 'ember-on-fhir/mixins/dateable', 'ember-fhir-adapter/models/condition'], function (exports, _ember, _emberOnFhirMixinsCodeable, _emberOnFhirMixinsDateable, _emberFhirAdapterModelsCondition) {

  var displayNameRegex = /^[^:]+:\s*(.*)\s*\(Code List:.*\)$/;

  exports['default'] = _emberFhirAdapterModelsCondition['default'].extend(_emberOnFhirMixinsCodeable['default'], _emberOnFhirMixinsDateable['default'], {
    displayText: _ember['default'].computed('code.displayText', function () {
      var code = this.get('code.displayText');
      var matches = code.match(displayNameRegex);

      if (!_ember['default'].isNone(matches) && matches[1]) {
        return matches[1];
      }

      return code;
    }),

    endDate: _ember['default'].computed.reads('abatementDateTime'),
    startDate: _ember['default'].computed.reads('onsetDateTime')
  });
});
define('ember-on-fhir/models/conformance-contact-component', ['exports', 'ember-fhir-adapter/models/conformance-contact-component'], function (exports, _emberFhirAdapterModelsConformanceContactComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-document-component', ['exports', 'ember-fhir-adapter/models/conformance-document-component'], function (exports, _emberFhirAdapterModelsConformanceDocumentComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceDocumentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-implementation-component', ['exports', 'ember-fhir-adapter/models/conformance-implementation-component'], function (exports, _emberFhirAdapterModelsConformanceImplementationComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceImplementationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-messaging-component', ['exports', 'ember-fhir-adapter/models/conformance-messaging-component'], function (exports, _emberFhirAdapterModelsConformanceMessagingComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceMessagingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-messaging-endpoint-component', ['exports', 'ember-fhir-adapter/models/conformance-messaging-endpoint-component'], function (exports, _emberFhirAdapterModelsConformanceMessagingEndpointComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceMessagingEndpointComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-messaging-event-component', ['exports', 'ember-fhir-adapter/models/conformance-messaging-event-component'], function (exports, _emberFhirAdapterModelsConformanceMessagingEventComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceMessagingEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-resource-interaction-component', ['exports', 'ember-fhir-adapter/models/conformance-resource-interaction-component'], function (exports, _emberFhirAdapterModelsConformanceResourceInteractionComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceResourceInteractionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-rest-component', ['exports', 'ember-fhir-adapter/models/conformance-rest-component'], function (exports, _emberFhirAdapterModelsConformanceRestComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceRestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-rest-operation-component', ['exports', 'ember-fhir-adapter/models/conformance-rest-operation-component'], function (exports, _emberFhirAdapterModelsConformanceRestOperationComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceRestOperationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-rest-resource-component', ['exports', 'ember-fhir-adapter/models/conformance-rest-resource-component'], function (exports, _emberFhirAdapterModelsConformanceRestResourceComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceRestResourceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-rest-resource-search-param-component', ['exports', 'ember-fhir-adapter/models/conformance-rest-resource-search-param-component'], function (exports, _emberFhirAdapterModelsConformanceRestResourceSearchParamComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceRestResourceSearchParamComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-rest-security-certificate-component', ['exports', 'ember-fhir-adapter/models/conformance-rest-security-certificate-component'], function (exports, _emberFhirAdapterModelsConformanceRestSecurityCertificateComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceRestSecurityCertificateComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-rest-security-component', ['exports', 'ember-fhir-adapter/models/conformance-rest-security-component'], function (exports, _emberFhirAdapterModelsConformanceRestSecurityComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceRestSecurityComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-software-component', ['exports', 'ember-fhir-adapter/models/conformance-software-component'], function (exports, _emberFhirAdapterModelsConformanceSoftwareComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceSoftwareComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance-system-interaction-component', ['exports', 'ember-fhir-adapter/models/conformance-system-interaction-component'], function (exports, _emberFhirAdapterModelsConformanceSystemInteractionComponent) {
  exports['default'] = _emberFhirAdapterModelsConformanceSystemInteractionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/conformance', ['exports', 'ember-fhir-adapter/models/conformance'], function (exports, _emberFhirAdapterModelsConformance) {
  exports['default'] = _emberFhirAdapterModelsConformance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contact-point', ['exports', 'ember-fhir-adapter/models/contact-point'], function (exports, _emberFhirAdapterModelsContactPoint) {
  exports['default'] = _emberFhirAdapterModelsContactPoint['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-actor-component', ['exports', 'ember-fhir-adapter/models/contract-actor-component'], function (exports, _emberFhirAdapterModelsContractActorComponent) {
  exports['default'] = _emberFhirAdapterModelsContractActorComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-computable-language-component', ['exports', 'ember-fhir-adapter/models/contract-computable-language-component'], function (exports, _emberFhirAdapterModelsContractComputableLanguageComponent) {
  exports['default'] = _emberFhirAdapterModelsContractComputableLanguageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-friendly-language-component', ['exports', 'ember-fhir-adapter/models/contract-friendly-language-component'], function (exports, _emberFhirAdapterModelsContractFriendlyLanguageComponent) {
  exports['default'] = _emberFhirAdapterModelsContractFriendlyLanguageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-legal-language-component', ['exports', 'ember-fhir-adapter/models/contract-legal-language-component'], function (exports, _emberFhirAdapterModelsContractLegalLanguageComponent) {
  exports['default'] = _emberFhirAdapterModelsContractLegalLanguageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-signatory-component', ['exports', 'ember-fhir-adapter/models/contract-signatory-component'], function (exports, _emberFhirAdapterModelsContractSignatoryComponent) {
  exports['default'] = _emberFhirAdapterModelsContractSignatoryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-term-actor-component', ['exports', 'ember-fhir-adapter/models/contract-term-actor-component'], function (exports, _emberFhirAdapterModelsContractTermActorComponent) {
  exports['default'] = _emberFhirAdapterModelsContractTermActorComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-term-component', ['exports', 'ember-fhir-adapter/models/contract-term-component'], function (exports, _emberFhirAdapterModelsContractTermComponent) {
  exports['default'] = _emberFhirAdapterModelsContractTermComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-term-valued-item-component', ['exports', 'ember-fhir-adapter/models/contract-term-valued-item-component'], function (exports, _emberFhirAdapterModelsContractTermValuedItemComponent) {
  exports['default'] = _emberFhirAdapterModelsContractTermValuedItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract-valued-item-component', ['exports', 'ember-fhir-adapter/models/contract-valued-item-component'], function (exports, _emberFhirAdapterModelsContractValuedItemComponent) {
  exports['default'] = _emberFhirAdapterModelsContractValuedItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/contract', ['exports', 'ember-fhir-adapter/models/contract'], function (exports, _emberFhirAdapterModelsContract) {
  exports['default'] = _emberFhirAdapterModelsContract['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/coordinator', ['exports', 'ember', 'ember-on-fhir/models/obj-hash'], function (exports, _ember, _emberOnFhirModelsObjHash) {
  exports['default'] = _ember['default'].Object.extend(_ember['default'].Evented, {
    objectMap: _ember['default'].computed(function () {
      return _emberOnFhirModelsObjHash['default'].create();
    }),

    getObject: function getObject(id, ops) {
      ops = ops || {};
      var payload = this.get('objectMap').getObj(id);

      if (payload.ops.source) {
        payload.ops.source.sendAction('action', payload.obj);
      }

      if (payload.ops.target) {
        payload.ops.target.sendAction('action', payload.obj);
      }

      this.trigger("objectMoved", { obj: payload.obj, source: payload.ops.source, target: ops.target });

      return payload.obj;
    },

    setObject: function setObject(obj, ops) {
      ops = ops || {};
      return this.get('objectMap').add({ obj: obj, ops: ops });
    }
  });
});
define('ember-on-fhir/models/coverage', ['exports', 'ember-fhir-adapter/models/coverage'], function (exports, _emberFhirAdapterModelsCoverage) {
  exports['default'] = _emberFhirAdapterModelsCoverage['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/data-element-contact-component', ['exports', 'ember-fhir-adapter/models/data-element-contact-component'], function (exports, _emberFhirAdapterModelsDataElementContactComponent) {
  exports['default'] = _emberFhirAdapterModelsDataElementContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/data-element-mapping-component', ['exports', 'ember-fhir-adapter/models/data-element-mapping-component'], function (exports, _emberFhirAdapterModelsDataElementMappingComponent) {
  exports['default'] = _emberFhirAdapterModelsDataElementMappingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/data-element', ['exports', 'ember-fhir-adapter/models/data-element'], function (exports, _emberFhirAdapterModelsDataElement) {
  exports['default'] = _emberFhirAdapterModelsDataElement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/detected-issue-mitigation-component', ['exports', 'ember-fhir-adapter/models/detected-issue-mitigation-component'], function (exports, _emberFhirAdapterModelsDetectedIssueMitigationComponent) {
  exports['default'] = _emberFhirAdapterModelsDetectedIssueMitigationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/detected-issue', ['exports', 'ember-fhir-adapter/models/detected-issue'], function (exports, _emberFhirAdapterModelsDetectedIssue) {
  exports['default'] = _emberFhirAdapterModelsDetectedIssue['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device-component-production-specification-component', ['exports', 'ember-fhir-adapter/models/device-component-production-specification-component'], function (exports, _emberFhirAdapterModelsDeviceComponentProductionSpecificationComponent) {
  exports['default'] = _emberFhirAdapterModelsDeviceComponentProductionSpecificationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device-component', ['exports', 'ember-fhir-adapter/models/device-component'], function (exports, _emberFhirAdapterModelsDeviceComponent) {
  exports['default'] = _emberFhirAdapterModelsDeviceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device-metric-calibration-component', ['exports', 'ember-fhir-adapter/models/device-metric-calibration-component'], function (exports, _emberFhirAdapterModelsDeviceMetricCalibrationComponent) {
  exports['default'] = _emberFhirAdapterModelsDeviceMetricCalibrationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device-metric', ['exports', 'ember-fhir-adapter/models/device-metric'], function (exports, _emberFhirAdapterModelsDeviceMetric) {
  exports['default'] = _emberFhirAdapterModelsDeviceMetric['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device-use-request', ['exports', 'ember-fhir-adapter/models/device-use-request'], function (exports, _emberFhirAdapterModelsDeviceUseRequest) {
  exports['default'] = _emberFhirAdapterModelsDeviceUseRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device-use-statement', ['exports', 'ember-fhir-adapter/models/device-use-statement'], function (exports, _emberFhirAdapterModelsDeviceUseStatement) {
  exports['default'] = _emberFhirAdapterModelsDeviceUseStatement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/device', ['exports', 'ember-fhir-adapter/models/device'], function (exports, _emberFhirAdapterModelsDevice) {
  exports['default'] = _emberFhirAdapterModelsDevice['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/diagnostic-order-event-component', ['exports', 'ember-fhir-adapter/models/diagnostic-order-event-component'], function (exports, _emberFhirAdapterModelsDiagnosticOrderEventComponent) {
  exports['default'] = _emberFhirAdapterModelsDiagnosticOrderEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/diagnostic-order-item-component', ['exports', 'ember-fhir-adapter/models/diagnostic-order-item-component'], function (exports, _emberFhirAdapterModelsDiagnosticOrderItemComponent) {
  exports['default'] = _emberFhirAdapterModelsDiagnosticOrderItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/diagnostic-order', ['exports', 'ember-fhir-adapter/models/diagnostic-order'], function (exports, _emberFhirAdapterModelsDiagnosticOrder) {
  exports['default'] = _emberFhirAdapterModelsDiagnosticOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/diagnostic-report-image-component', ['exports', 'ember-fhir-adapter/models/diagnostic-report-image-component'], function (exports, _emberFhirAdapterModelsDiagnosticReportImageComponent) {
  exports['default'] = _emberFhirAdapterModelsDiagnosticReportImageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/diagnostic-report', ['exports', 'ember-fhir-adapter/models/diagnostic-report'], function (exports, _emberFhirAdapterModelsDiagnosticReport) {
  exports['default'] = _emberFhirAdapterModelsDiagnosticReport['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-manifest-content-component', ['exports', 'ember-fhir-adapter/models/document-manifest-content-component'], function (exports, _emberFhirAdapterModelsDocumentManifestContentComponent) {
  exports['default'] = _emberFhirAdapterModelsDocumentManifestContentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-manifest-related-component', ['exports', 'ember-fhir-adapter/models/document-manifest-related-component'], function (exports, _emberFhirAdapterModelsDocumentManifestRelatedComponent) {
  exports['default'] = _emberFhirAdapterModelsDocumentManifestRelatedComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-manifest', ['exports', 'ember-fhir-adapter/models/document-manifest'], function (exports, _emberFhirAdapterModelsDocumentManifest) {
  exports['default'] = _emberFhirAdapterModelsDocumentManifest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-reference-content-component', ['exports', 'ember-fhir-adapter/models/document-reference-content-component'], function (exports, _emberFhirAdapterModelsDocumentReferenceContentComponent) {
  exports['default'] = _emberFhirAdapterModelsDocumentReferenceContentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-reference-context-component', ['exports', 'ember-fhir-adapter/models/document-reference-context-component'], function (exports, _emberFhirAdapterModelsDocumentReferenceContextComponent) {
  exports['default'] = _emberFhirAdapterModelsDocumentReferenceContextComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-reference-context-related-component', ['exports', 'ember-fhir-adapter/models/document-reference-context-related-component'], function (exports, _emberFhirAdapterModelsDocumentReferenceContextRelatedComponent) {
  exports['default'] = _emberFhirAdapterModelsDocumentReferenceContextRelatedComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-reference-relates-to-component', ['exports', 'ember-fhir-adapter/models/document-reference-relates-to-component'], function (exports, _emberFhirAdapterModelsDocumentReferenceRelatesToComponent) {
  exports['default'] = _emberFhirAdapterModelsDocumentReferenceRelatesToComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/document-reference', ['exports', 'ember-fhir-adapter/models/document-reference'], function (exports, _emberFhirAdapterModelsDocumentReference) {
  exports['default'] = _emberFhirAdapterModelsDocumentReference['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition-base-component', ['exports', 'ember-fhir-adapter/models/element-definition-base-component'], function (exports, _emberFhirAdapterModelsElementDefinitionBaseComponent) {
  exports['default'] = _emberFhirAdapterModelsElementDefinitionBaseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition-binding-component', ['exports', 'ember-fhir-adapter/models/element-definition-binding-component'], function (exports, _emberFhirAdapterModelsElementDefinitionBindingComponent) {
  exports['default'] = _emberFhirAdapterModelsElementDefinitionBindingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition-constraint-component', ['exports', 'ember-fhir-adapter/models/element-definition-constraint-component'], function (exports, _emberFhirAdapterModelsElementDefinitionConstraintComponent) {
  exports['default'] = _emberFhirAdapterModelsElementDefinitionConstraintComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition-mapping-component', ['exports', 'ember-fhir-adapter/models/element-definition-mapping-component'], function (exports, _emberFhirAdapterModelsElementDefinitionMappingComponent) {
  exports['default'] = _emberFhirAdapterModelsElementDefinitionMappingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition-slicing-component', ['exports', 'ember-fhir-adapter/models/element-definition-slicing-component'], function (exports, _emberFhirAdapterModelsElementDefinitionSlicingComponent) {
  exports['default'] = _emberFhirAdapterModelsElementDefinitionSlicingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition-type-ref-component', ['exports', 'ember-fhir-adapter/models/element-definition-type-ref-component'], function (exports, _emberFhirAdapterModelsElementDefinitionTypeRefComponent) {
  exports['default'] = _emberFhirAdapterModelsElementDefinitionTypeRefComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/element-definition', ['exports', 'ember-fhir-adapter/models/element-definition'], function (exports, _emberFhirAdapterModelsElementDefinition) {
  exports['default'] = _emberFhirAdapterModelsElementDefinition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/eligibility-request', ['exports', 'ember-fhir-adapter/models/eligibility-request'], function (exports, _emberFhirAdapterModelsEligibilityRequest) {
  exports['default'] = _emberFhirAdapterModelsEligibilityRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/eligibility-response', ['exports', 'ember-fhir-adapter/models/eligibility-response'], function (exports, _emberFhirAdapterModelsEligibilityResponse) {
  exports['default'] = _emberFhirAdapterModelsEligibilityResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/encounter-hospitalization-component', ['exports', 'ember-fhir-adapter/models/encounter-hospitalization-component'], function (exports, _emberFhirAdapterModelsEncounterHospitalizationComponent) {
  exports['default'] = _emberFhirAdapterModelsEncounterHospitalizationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/encounter-location-component', ['exports', 'ember-fhir-adapter/models/encounter-location-component'], function (exports, _emberFhirAdapterModelsEncounterLocationComponent) {
  exports['default'] = _emberFhirAdapterModelsEncounterLocationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/encounter-participant-component', ['exports', 'ember-fhir-adapter/models/encounter-participant-component'], function (exports, _emberFhirAdapterModelsEncounterParticipantComponent) {
  exports['default'] = _emberFhirAdapterModelsEncounterParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/encounter-status-history-component', ['exports', 'ember-fhir-adapter/models/encounter-status-history-component'], function (exports, _emberFhirAdapterModelsEncounterStatusHistoryComponent) {
  exports['default'] = _emberFhirAdapterModelsEncounterStatusHistoryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/encounter', ['exports', 'ember', 'ember-on-fhir/mixins/codeable', 'ember-on-fhir/mixins/dateable', 'ember-fhir-adapter/models/encounter'], function (exports, _ember, _emberOnFhirMixinsCodeable, _emberOnFhirMixinsDateable, _emberFhirAdapterModelsEncounter) {

  var codeListRegex = /^(.+)\(Code List:.*\)$/;

  exports['default'] = _emberFhirAdapterModelsEncounter['default'].extend(_emberOnFhirMixinsCodeable['default'], _emberOnFhirMixinsDateable['default'], {
    displayText: _ember['default'].computed('type.firstObject.displayText', function () {
      var code = this.get('type.firstObject.displayText');
      if (code) {
        var matches = code.match(codeListRegex);
        if (!_ember['default'].isNone(matches) && matches[1]) {
          return matches[1];
        }

        return code;
      }

      return 'unknown';
    }),

    endDate: _ember['default'].computed.reads('period.end'),
    startDate: _ember['default'].computed.reads('period.start')
  });
});
define('ember-on-fhir/models/enrollment-request', ['exports', 'ember-fhir-adapter/models/enrollment-request'], function (exports, _emberFhirAdapterModelsEnrollmentRequest) {
  exports['default'] = _emberFhirAdapterModelsEnrollmentRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/enrollment-response', ['exports', 'ember-fhir-adapter/models/enrollment-response'], function (exports, _emberFhirAdapterModelsEnrollmentResponse) {
  exports['default'] = _emberFhirAdapterModelsEnrollmentResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/episode-of-care-care-team-component', ['exports', 'ember-fhir-adapter/models/episode-of-care-care-team-component'], function (exports, _emberFhirAdapterModelsEpisodeOfCareCareTeamComponent) {
  exports['default'] = _emberFhirAdapterModelsEpisodeOfCareCareTeamComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/episode-of-care-status-history-component', ['exports', 'ember-fhir-adapter/models/episode-of-care-status-history-component'], function (exports, _emberFhirAdapterModelsEpisodeOfCareStatusHistoryComponent) {
  exports['default'] = _emberFhirAdapterModelsEpisodeOfCareStatusHistoryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/episode-of-care', ['exports', 'ember-fhir-adapter/models/episode-of-care'], function (exports, _emberFhirAdapterModelsEpisodeOfCare) {
  exports['default'] = _emberFhirAdapterModelsEpisodeOfCare['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/explanation-of-benefit', ['exports', 'ember-fhir-adapter/models/explanation-of-benefit'], function (exports, _emberFhirAdapterModelsExplanationOfBenefit) {
  exports['default'] = _emberFhirAdapterModelsExplanationOfBenefit['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/extension', ['exports', 'ember-fhir-adapter/models/extension'], function (exports, _emberFhirAdapterModelsExtension) {
  exports['default'] = _emberFhirAdapterModelsExtension['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/family-member-history-condition-component', ['exports', 'ember-fhir-adapter/models/family-member-history-condition-component'], function (exports, _emberFhirAdapterModelsFamilyMemberHistoryConditionComponent) {
  exports['default'] = _emberFhirAdapterModelsFamilyMemberHistoryConditionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/family-member-history', ['exports', 'ember-fhir-adapter/models/family-member-history'], function (exports, _emberFhirAdapterModelsFamilyMemberHistory) {
  exports['default'] = _emberFhirAdapterModelsFamilyMemberHistory['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/flag', ['exports', 'ember-fhir-adapter/models/flag'], function (exports, _emberFhirAdapterModelsFlag) {
  exports['default'] = _emberFhirAdapterModelsFlag['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/goal-outcome-component', ['exports', 'ember-fhir-adapter/models/goal-outcome-component'], function (exports, _emberFhirAdapterModelsGoalOutcomeComponent) {
  exports['default'] = _emberFhirAdapterModelsGoalOutcomeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/goal', ['exports', 'ember-fhir-adapter/models/goal'], function (exports, _emberFhirAdapterModelsGoal) {
  exports['default'] = _emberFhirAdapterModelsGoal['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/group-characteristic-component', ['exports', 'ember', 'ember-on-fhir/mixins/codeable', 'ember-fhir-adapter/models/group-characteristic-component'], function (exports, _ember, _emberOnFhirMixinsCodeable, _emberFhirAdapterModelsGroupCharacteristicComponent) {
  exports['default'] = _emberFhirAdapterModelsGroupCharacteristicComponent['default'].extend(_emberOnFhirMixinsCodeable['default'], {
    filter: _ember['default'].computed('code', function () {
      if (this.hasCode('code', { code: '21612-7', system: 'http://loinc.org' })) {
        return 'age-filter';
      }

      if (this.hasCode('code', { code: '21840-4', system: 'http://loinc.org' })) {
        return 'gender-filter';
      }

      if (this.hasCode('code', { code: '11450-4', system: 'http://loinc.org' })) {
        return 'condition-code-filter';
      }

      if (this.hasCode('code', { code: '46240-8', system: 'http://loinc.org' })) {
        return 'encounter-code-filter';
      }
    }),

    icon: _ember['default'].computed('filter', function () {
      var filter = this.get('filter');

      if (filter === 'age-filter') {
        return 'fa-birthday-cake';
      } else if (filter === 'gender-filter') {
        return 'fa-user';
      } else if (filter === 'condition-code-filter') {
        return 'icon-med-clipboard';
      } else if (filter === 'encounter-code-filter') {
        return 'fa-hospital-o';
      }

      return 'fa-user';
    })
  });
});
define('ember-on-fhir/models/group-list', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    patientids: _emberData['default'].hasMany('patient', { inverseOf: 'id', async: true })
  });
});
define('ember-on-fhir/models/group-member-component', ['exports', 'ember-fhir-adapter/models/group-member-component'], function (exports, _emberFhirAdapterModelsGroupMemberComponent) {
  exports['default'] = _emberFhirAdapterModelsGroupMemberComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/group', ['exports', 'ember-data', 'ember-on-fhir/mixins/selectable', 'ember-fhir-adapter/models/group'], function (exports, _emberData, _emberOnFhirMixinsSelectable, _emberFhirAdapterModelsGroup) {
  exports['default'] = _emberFhirAdapterModelsGroup['default'].extend(_emberOnFhirMixinsSelectable['default'], {
    groupList: _emberData['default'].belongsTo('group-list', { async: true })
  });
});
define('ember-on-fhir/models/healthcare-service-available-time-component', ['exports', 'ember-fhir-adapter/models/healthcare-service-available-time-component'], function (exports, _emberFhirAdapterModelsHealthcareServiceAvailableTimeComponent) {
  exports['default'] = _emberFhirAdapterModelsHealthcareServiceAvailableTimeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/healthcare-service-not-available-component', ['exports', 'ember-fhir-adapter/models/healthcare-service-not-available-component'], function (exports, _emberFhirAdapterModelsHealthcareServiceNotAvailableComponent) {
  exports['default'] = _emberFhirAdapterModelsHealthcareServiceNotAvailableComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/healthcare-service-service-type-component', ['exports', 'ember-fhir-adapter/models/healthcare-service-service-type-component'], function (exports, _emberFhirAdapterModelsHealthcareServiceServiceTypeComponent) {
  exports['default'] = _emberFhirAdapterModelsHealthcareServiceServiceTypeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/healthcare-service', ['exports', 'ember-fhir-adapter/models/healthcare-service'], function (exports, _emberFhirAdapterModelsHealthcareService) {
  exports['default'] = _emberFhirAdapterModelsHealthcareService['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/huddle-patient', ['exports', 'ember-object', 'ember-computed', 'ember-utils', 'moment'], function (exports, _emberObject, _emberComputed, _emberUtils, _moment) {
  var REASON_CODES = {
    ROLL_OVER: 'ROLL_OVER',
    MANUAL_ADDITION: 'MANUAL_ADDITION',
    RECENT_ENCOUNTER: 'RECENT_ENCOUNTER',
    RISK_SCORE: 'RISK_SCORE'
  };

  exports.REASON_CODES = REASON_CODES;
  exports['default'] = _emberObject['default'].extend({
    patientId: null,
    reason: null,
    reasonText: null,
    reviewed: null,

    codedReasonText: (0, _emberComputed['default'])('reason', 'reasonText', {
      get: function get() {
        if (this.get('reason') === REASON_CODES.MANUAL_ADDITION) {
          return 'Manually Added';
        }

        return this.get('reasonText');
      }
    }).readOnly(),

    displayReasonText: (0, _emberComputed['default'])('reason', 'reasonText', {
      get: function get() {
        var reasonText = this.get('reasonText');

        if (this.get('reason') === REASON_CODES.MANUAL_ADDITION) {
          return 'Manually Added' + ((0, _emberUtils.isEmpty)(reasonText) ? '' : ' - ' + reasonText);
        }

        return reasonText;
      }
    }).readOnly(),

    toFhirJson: function toFhirJson() {
      var obj = {
        entity: {
          reference: 'Patient/' + this.get('patientId')
        },
        extension: [{
          url: 'http://interventionengine.org/fhir/extension/group/member/reason',
          valueCodeableConcept: {
            coding: [{
              system: 'http://interventionengine.org/fhir/cs/huddle-member-reason',
              code: this.get('reason')
            }],
            text: this.get('reasonText')
          }
        }]
      };

      var reviewed = this.get('reviewed');
      if (reviewed) {
        obj.extension.push({
          url: 'http://interventionengine.org/fhir/extension/group/member/reviewed',

          // TODO: probably needs to change back to YYY-MM-DD once https://www.pivotaltracker.com/n/projects/1179330/stories/116585331 is fixed
          valueDateTime: (0, _moment['default'])(reviewed).format('YYYY-MM-DDTHH:mm:ssZ')
        });
      }

      return obj;
    }
  });
});
define('ember-on-fhir/models/huddle', ['exports', 'ember-object', 'ember-metal/get', 'ember-computed', 'ember-array/utils', 'ember-metal/utils', 'ember-on-fhir/models/huddle-patient', 'moment'], function (exports, _emberObject, _emberMetalGet, _emberComputed, _emberArrayUtils, _emberMetalUtils, _emberOnFhirModelsHuddlePatient, _moment) {
  exports.parseHuddles = parseHuddles;

  var Huddle = _emberObject['default'].extend({
    id: null,
    date: null,
    leader: null,
    type: 'person',
    actual: true,
    name: '',
    patients: (0, _emberComputed['default'])({
      get: function get() {
        return new _emberArrayUtils.A();
      }
    }),
    patientIds: _emberComputed['default'].mapBy('patients', 'patientId'),

    displayLeader: (0, _emberComputed['default'])('leader', {
      get: function get() {
        return ('' + this.get('leader')).replace(/^[^/]+\//, '');
      }
    }).readOnly(),

    addPatient: function addPatient(patient, reasonText) {
      var huddlePatient = this.getHuddlePatient(patient);

      if (huddlePatient != null) {
        huddlePatient.setProperties({
          reason: 'MANUAL_ADDITION',
          reasonText: reasonText
        });
      } else {
        huddlePatient = _emberOnFhirModelsHuddlePatient['default'].create({
          patientId: patient.get('id'),
          reason: 'MANUAL_ADDITION',
          reasonText: reasonText
        });
        this.get('patients').pushObject(huddlePatient);
      }
    },

    removePatient: function removePatient(patient) {
      var huddlePatient = this.getHuddlePatient(patient);
      if (huddlePatient != null) {
        this.get('patients').removeObject(huddlePatient);
        return huddlePatient;
      }
    },

    getHuddlePatient: function getHuddlePatient(patient) {
      if (patient != null) {
        return this.get('patients').findBy('patientId', (0, _emberMetalGet['default'])(patient, 'id'));
      }
    },

    hasPatient: function hasPatient(patient) {
      if (patient == null) {
        return false;
      }
      return this.get('patientIds').contains((0, _emberMetalGet['default'])(patient, 'id'));
    },

    patientReviewed: function patientReviewed(patient) {
      var huddlePatient = this.getHuddlePatient(patient);
      if (huddlePatient != null) {
        return huddlePatient.get('reviewed') != null;
      }

      return false;
    },

    toFhirJson: function toFhirJson() {
      var id = this.get('id');
      // TODO: probably needs to change back to YYY-MM-DD once https://www.pivotaltracker.com/n/projects/1179330/stories/116585331 is fixed
      var huddleDate = (0, _moment['default'])(this.get('date')).format('YYYY-MM-DDTHH:mm:ssZ');
      var obj = {
        resourceType: 'Group',
        meta: {
          profile: ['http://interventionengine.org/fhir/profile/huddle']
        },
        extension: [{ url: 'http://interventionengine.org/fhir/extension/group/activeDateTime', valueDateTime: huddleDate }, { url: 'http://interventionengine.org/fhir/extension/group/leader', valueReference: { reference: this.get('leader') } }],
        type: this.get('type'),
        actual: this.get('actual'),
        code: {
          coding: [{ system: 'http://interventionengine.org/fhir/cs/huddle', code: 'HUDDLE' }],
          text: 'Huddle'
        },
        name: this.get('name'),
        member: this.get('patients').map(function (patient) {
          return patient.toFhirJson();
        })
      };
      if (id) {
        obj.id = id;
      }

      return obj;
    }
  });

  exports['default'] = Huddle;

  function parseHuddles(huddleList) {
    if ((0, _emberArrayUtils.isEmberArray)(huddleList)) {
      var huddles = new Array(huddleList.length);
      for (var i = 0; i < huddleList.length; i++) {
        var group = huddleList[i];
        huddles[i] = huddleFromGroup(group);
      }

      return huddles;
    } else {
      return huddleFromGroup({ resource: huddleList });
    }
  }

  function huddleFromGroup(group) {
    var resource = group.resource;

    var code = (0, _emberMetalGet['default'])(resource, 'code.coding.firstObject.code');

    (0, _emberMetalUtils.assert)('Found non-huddle group (code `' + code + '`) when expecting huddle', ('' + code).toUpperCase() === 'HUDDLE');

    var options = {
      id: (0, _emberMetalGet['default'])(resource, 'id'),
      name: (0, _emberMetalGet['default'])(resource, 'name'),
      type: (0, _emberMetalGet['default'])(resource, 'type'),
      actual: (0, _emberMetalGet['default'])(resource, 'actual')
    };

    extractExtensions(options, resource.extension || []);
    extractPatients(options, resource.member || []);

    return Huddle.create(options);
  }

  function extractExtensions(options, extensions) {
    for (var i = 0; i < extensions.length; i++) {
      var extension = extensions[i];
      var url = extension.url;

      if (url === 'http://interventionengine.org/fhir/extension/group/activeDateTime') {
        options.date = (0, _moment['default'])(extension.valueDateTime).toDate();
      } else if (url === 'http://interventionengine.org/fhir/extension/group/leader') {
        options.leader = extension.valueReference.reference;
      }
    }
  }

  function extractPatients(options, members) {
    var patients = new Array(members.length);
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      var patientOptions = {
        patientId: ('' + (0, _emberMetalGet['default'])(member, 'entity.reference')).replace(/^Patient\//, '')
      };
      extractPatientExtensions(patientOptions, (0, _emberMetalGet['default'])(member, 'extension') || []);
      patients[i] = _emberOnFhirModelsHuddlePatient['default'].create(patientOptions);
    }

    options.patients = new _emberArrayUtils.A(patients);
  }

  function extractPatientExtensions(options, extensions) {
    for (var i = 0; i < extensions.length; i++) {
      var extension = extensions[i];
      var url = extension.url;

      if (url === 'http://interventionengine.org/fhir/extension/group/member/reason') {
        options.reason = (0, _emberMetalGet['default'])(extension, 'valueCodeableConcept.coding.firstObject.code');
        options.reasonText = (0, _emberMetalGet['default'])(extension, 'valueCodeableConcept.text');
      } else if (url === 'http://interventionengine.org/fhir/extension/group/member/reviewed') {
        options.reviewed = (0, _moment['default'])(extension.valueDateTime).toDate();
      }
    }
  }
});
define('ember-on-fhir/models/human-name', ['exports', 'ember-fhir-adapter/models/human-name'], function (exports, _emberFhirAdapterModelsHumanName) {
  exports['default'] = _emberFhirAdapterModelsHumanName['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/identifier', ['exports', 'ember-fhir-adapter/models/identifier'], function (exports, _emberFhirAdapterModelsIdentifier) {
  exports['default'] = _emberFhirAdapterModelsIdentifier['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-object-selection-frames-component', ['exports', 'ember-fhir-adapter/models/imaging-object-selection-frames-component'], function (exports, _emberFhirAdapterModelsImagingObjectSelectionFramesComponent) {
  exports['default'] = _emberFhirAdapterModelsImagingObjectSelectionFramesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-object-selection-instance-component', ['exports', 'ember-fhir-adapter/models/imaging-object-selection-instance-component'], function (exports, _emberFhirAdapterModelsImagingObjectSelectionInstanceComponent) {
  exports['default'] = _emberFhirAdapterModelsImagingObjectSelectionInstanceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-object-selection-series-component', ['exports', 'ember-fhir-adapter/models/imaging-object-selection-series-component'], function (exports, _emberFhirAdapterModelsImagingObjectSelectionSeriesComponent) {
  exports['default'] = _emberFhirAdapterModelsImagingObjectSelectionSeriesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-object-selection-study-component', ['exports', 'ember-fhir-adapter/models/imaging-object-selection-study-component'], function (exports, _emberFhirAdapterModelsImagingObjectSelectionStudyComponent) {
  exports['default'] = _emberFhirAdapterModelsImagingObjectSelectionStudyComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-object-selection', ['exports', 'ember-fhir-adapter/models/imaging-object-selection'], function (exports, _emberFhirAdapterModelsImagingObjectSelection) {
  exports['default'] = _emberFhirAdapterModelsImagingObjectSelection['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-study-series-component', ['exports', 'ember-fhir-adapter/models/imaging-study-series-component'], function (exports, _emberFhirAdapterModelsImagingStudySeriesComponent) {
  exports['default'] = _emberFhirAdapterModelsImagingStudySeriesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-study-series-instance-component', ['exports', 'ember-fhir-adapter/models/imaging-study-series-instance-component'], function (exports, _emberFhirAdapterModelsImagingStudySeriesInstanceComponent) {
  exports['default'] = _emberFhirAdapterModelsImagingStudySeriesInstanceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/imaging-study', ['exports', 'ember-fhir-adapter/models/imaging-study'], function (exports, _emberFhirAdapterModelsImagingStudy) {
  exports['default'] = _emberFhirAdapterModelsImagingStudy['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-explanation-component', ['exports', 'ember-fhir-adapter/models/immunization-explanation-component'], function (exports, _emberFhirAdapterModelsImmunizationExplanationComponent) {
  exports['default'] = _emberFhirAdapterModelsImmunizationExplanationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-reaction-component', ['exports', 'ember-fhir-adapter/models/immunization-reaction-component'], function (exports, _emberFhirAdapterModelsImmunizationReactionComponent) {
  exports['default'] = _emberFhirAdapterModelsImmunizationReactionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-recommendation-recommendation-component', ['exports', 'ember-fhir-adapter/models/immunization-recommendation-recommendation-component'], function (exports, _emberFhirAdapterModelsImmunizationRecommendationRecommendationComponent) {
  exports['default'] = _emberFhirAdapterModelsImmunizationRecommendationRecommendationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-recommendation-recommendation-date-criterion-component', ['exports', 'ember-fhir-adapter/models/immunization-recommendation-recommendation-date-criterion-component'], function (exports, _emberFhirAdapterModelsImmunizationRecommendationRecommendationDateCriterionComponent) {
  exports['default'] = _emberFhirAdapterModelsImmunizationRecommendationRecommendationDateCriterionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-recommendation-recommendation-protocol-component', ['exports', 'ember-fhir-adapter/models/immunization-recommendation-recommendation-protocol-component'], function (exports, _emberFhirAdapterModelsImmunizationRecommendationRecommendationProtocolComponent) {
  exports['default'] = _emberFhirAdapterModelsImmunizationRecommendationRecommendationProtocolComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-recommendation', ['exports', 'ember-fhir-adapter/models/immunization-recommendation'], function (exports, _emberFhirAdapterModelsImmunizationRecommendation) {
  exports['default'] = _emberFhirAdapterModelsImmunizationRecommendation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization-vaccination-protocol-component', ['exports', 'ember-fhir-adapter/models/immunization-vaccination-protocol-component'], function (exports, _emberFhirAdapterModelsImmunizationVaccinationProtocolComponent) {
  exports['default'] = _emberFhirAdapterModelsImmunizationVaccinationProtocolComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/immunization', ['exports', 'ember-fhir-adapter/models/immunization'], function (exports, _emberFhirAdapterModelsImmunization) {
  exports['default'] = _emberFhirAdapterModelsImmunization['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide-contact-component', ['exports', 'ember-fhir-adapter/models/implementation-guide-contact-component'], function (exports, _emberFhirAdapterModelsImplementationGuideContactComponent) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuideContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide-dependency-component', ['exports', 'ember-fhir-adapter/models/implementation-guide-dependency-component'], function (exports, _emberFhirAdapterModelsImplementationGuideDependencyComponent) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuideDependencyComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide-global-component', ['exports', 'ember-fhir-adapter/models/implementation-guide-global-component'], function (exports, _emberFhirAdapterModelsImplementationGuideGlobalComponent) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuideGlobalComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide-package-component', ['exports', 'ember-fhir-adapter/models/implementation-guide-package-component'], function (exports, _emberFhirAdapterModelsImplementationGuidePackageComponent) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuidePackageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide-package-resource-component', ['exports', 'ember-fhir-adapter/models/implementation-guide-package-resource-component'], function (exports, _emberFhirAdapterModelsImplementationGuidePackageResourceComponent) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuidePackageResourceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide-page-component', ['exports', 'ember-fhir-adapter/models/implementation-guide-page-component'], function (exports, _emberFhirAdapterModelsImplementationGuidePageComponent) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuidePageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/implementation-guide', ['exports', 'ember-fhir-adapter/models/implementation-guide'], function (exports, _emberFhirAdapterModelsImplementationGuide) {
  exports['default'] = _emberFhirAdapterModelsImplementationGuide['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/list-entry-component', ['exports', 'ember-fhir-adapter/models/list-entry-component'], function (exports, _emberFhirAdapterModelsListEntryComponent) {
  exports['default'] = _emberFhirAdapterModelsListEntryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/list', ['exports', 'ember-fhir-adapter/models/list'], function (exports, _emberFhirAdapterModelsList) {
  exports['default'] = _emberFhirAdapterModelsList['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/location-position-component', ['exports', 'ember-fhir-adapter/models/location-position-component'], function (exports, _emberFhirAdapterModelsLocationPositionComponent) {
  exports['default'] = _emberFhirAdapterModelsLocationPositionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/location', ['exports', 'ember-fhir-adapter/models/location'], function (exports, _emberFhirAdapterModelsLocation) {
  exports['default'] = _emberFhirAdapterModelsLocation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/media', ['exports', 'ember-fhir-adapter/models/media'], function (exports, _emberFhirAdapterModelsMedia) {
  exports['default'] = _emberFhirAdapterModelsMedia['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-administration-dosage-component', ['exports', 'ember-fhir-adapter/models/medication-administration-dosage-component'], function (exports, _emberFhirAdapterModelsMedicationAdministrationDosageComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationAdministrationDosageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-administration', ['exports', 'ember-fhir-adapter/models/medication-administration'], function (exports, _emberFhirAdapterModelsMedicationAdministration) {
  exports['default'] = _emberFhirAdapterModelsMedicationAdministration['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-dispense-dosage-instruction-component', ['exports', 'ember-fhir-adapter/models/medication-dispense-dosage-instruction-component'], function (exports, _emberFhirAdapterModelsMedicationDispenseDosageInstructionComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationDispenseDosageInstructionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-dispense-substitution-component', ['exports', 'ember-fhir-adapter/models/medication-dispense-substitution-component'], function (exports, _emberFhirAdapterModelsMedicationDispenseSubstitutionComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationDispenseSubstitutionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-dispense', ['exports', 'ember-fhir-adapter/models/medication-dispense'], function (exports, _emberFhirAdapterModelsMedicationDispense) {
  exports['default'] = _emberFhirAdapterModelsMedicationDispense['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-order-dispense-request-component', ['exports', 'ember-fhir-adapter/models/medication-order-dispense-request-component'], function (exports, _emberFhirAdapterModelsMedicationOrderDispenseRequestComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationOrderDispenseRequestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-order-dosage-instruction-component', ['exports', 'ember-fhir-adapter/models/medication-order-dosage-instruction-component'], function (exports, _emberFhirAdapterModelsMedicationOrderDosageInstructionComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationOrderDosageInstructionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-order-substitution-component', ['exports', 'ember-fhir-adapter/models/medication-order-substitution-component'], function (exports, _emberFhirAdapterModelsMedicationOrderSubstitutionComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationOrderSubstitutionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-order', ['exports', 'ember-fhir-adapter/models/medication-order'], function (exports, _emberFhirAdapterModelsMedicationOrder) {
  exports['default'] = _emberFhirAdapterModelsMedicationOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-package-component', ['exports', 'ember-fhir-adapter/models/medication-package-component'], function (exports, _emberFhirAdapterModelsMedicationPackageComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationPackageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-package-content-component', ['exports', 'ember-fhir-adapter/models/medication-package-content-component'], function (exports, _emberFhirAdapterModelsMedicationPackageContentComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationPackageContentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-product-batch-component', ['exports', 'ember-fhir-adapter/models/medication-product-batch-component'], function (exports, _emberFhirAdapterModelsMedicationProductBatchComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationProductBatchComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-product-component', ['exports', 'ember-fhir-adapter/models/medication-product-component'], function (exports, _emberFhirAdapterModelsMedicationProductComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationProductComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-product-ingredient-component', ['exports', 'ember-fhir-adapter/models/medication-product-ingredient-component'], function (exports, _emberFhirAdapterModelsMedicationProductIngredientComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationProductIngredientComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-statement-dosage-component', ['exports', 'ember-fhir-adapter/models/medication-statement-dosage-component'], function (exports, _emberFhirAdapterModelsMedicationStatementDosageComponent) {
  exports['default'] = _emberFhirAdapterModelsMedicationStatementDosageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/medication-statement', ['exports', 'ember', 'ember-on-fhir/mixins/codeable', 'ember-on-fhir/mixins/dateable', 'ember-fhir-adapter/models/medication-statement'], function (exports, _ember, _emberOnFhirMixinsCodeable, _emberOnFhirMixinsDateable, _emberFhirAdapterModelsMedicationStatement) {

  var displayNameRegex = /^[^:]+:\s*(.*)\s*\(Code List:.*\)$/;

  exports['default'] = _emberFhirAdapterModelsMedicationStatement['default'].extend(_emberOnFhirMixinsCodeable['default'], _emberOnFhirMixinsDateable['default'], {
    displayText: _ember['default'].computed('medicationCodeableConcept.displayText', function () {
      var text = this.get('medicationCodeableConcept.displayText') || '';
      var matches = text.match(displayNameRegex);

      if (!_ember['default'].isNone(matches) && matches[1]) {
        return matches[1];
      }

      return text;
    }),

    endDate: _ember['default'].computed.reads('effectivePeriod.end'),
    startDate: _ember['default'].computed.reads('effectivePeriod.start')
  });
});
define('ember-on-fhir/models/medication', ['exports', 'ember-fhir-adapter/models/medication'], function (exports, _emberFhirAdapterModelsMedication) {
  exports['default'] = _emberFhirAdapterModelsMedication['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/message-header-message-destination-component', ['exports', 'ember-fhir-adapter/models/message-header-message-destination-component'], function (exports, _emberFhirAdapterModelsMessageHeaderMessageDestinationComponent) {
  exports['default'] = _emberFhirAdapterModelsMessageHeaderMessageDestinationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/message-header-message-source-component', ['exports', 'ember-fhir-adapter/models/message-header-message-source-component'], function (exports, _emberFhirAdapterModelsMessageHeaderMessageSourceComponent) {
  exports['default'] = _emberFhirAdapterModelsMessageHeaderMessageSourceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/message-header-response-component', ['exports', 'ember-fhir-adapter/models/message-header-response-component'], function (exports, _emberFhirAdapterModelsMessageHeaderResponseComponent) {
  exports['default'] = _emberFhirAdapterModelsMessageHeaderResponseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/message-header', ['exports', 'ember-fhir-adapter/models/message-header'], function (exports, _emberFhirAdapterModelsMessageHeader) {
  exports['default'] = _emberFhirAdapterModelsMessageHeader['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/meta', ['exports', 'ember-fhir-adapter/models/meta'], function (exports, _emberFhirAdapterModelsMeta) {
  exports['default'] = _emberFhirAdapterModelsMeta['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/naming-system-contact-component', ['exports', 'ember-fhir-adapter/models/naming-system-contact-component'], function (exports, _emberFhirAdapterModelsNamingSystemContactComponent) {
  exports['default'] = _emberFhirAdapterModelsNamingSystemContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/naming-system-unique-id-component', ['exports', 'ember-fhir-adapter/models/naming-system-unique-id-component'], function (exports, _emberFhirAdapterModelsNamingSystemUniqueIdComponent) {
  exports['default'] = _emberFhirAdapterModelsNamingSystemUniqueIdComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/naming-system', ['exports', 'ember-fhir-adapter/models/naming-system'], function (exports, _emberFhirAdapterModelsNamingSystem) {
  exports['default'] = _emberFhirAdapterModelsNamingSystem['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/narrative', ['exports', 'ember-fhir-adapter/models/narrative'], function (exports, _emberFhirAdapterModelsNarrative) {
  exports['default'] = _emberFhirAdapterModelsNarrative['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/notification-count', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    patient: _emberData['default'].belongsTo('patient', { async: true, inverse: 'notifications' }),
    count: _emberData['default'].attr('number')
  });
});
define('ember-on-fhir/models/nutrition-order-enteral-formula-administration-component', ['exports', 'ember-fhir-adapter/models/nutrition-order-enteral-formula-administration-component'], function (exports, _emberFhirAdapterModelsNutritionOrderEnteralFormulaAdministrationComponent) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrderEnteralFormulaAdministrationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/nutrition-order-enteral-formula-component', ['exports', 'ember-fhir-adapter/models/nutrition-order-enteral-formula-component'], function (exports, _emberFhirAdapterModelsNutritionOrderEnteralFormulaComponent) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrderEnteralFormulaComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/nutrition-order-oral-diet-component', ['exports', 'ember-fhir-adapter/models/nutrition-order-oral-diet-component'], function (exports, _emberFhirAdapterModelsNutritionOrderOralDietComponent) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrderOralDietComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/nutrition-order-oral-diet-nutrient-component', ['exports', 'ember-fhir-adapter/models/nutrition-order-oral-diet-nutrient-component'], function (exports, _emberFhirAdapterModelsNutritionOrderOralDietNutrientComponent) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrderOralDietNutrientComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/nutrition-order-oral-diet-texture-component', ['exports', 'ember-fhir-adapter/models/nutrition-order-oral-diet-texture-component'], function (exports, _emberFhirAdapterModelsNutritionOrderOralDietTextureComponent) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrderOralDietTextureComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/nutrition-order-supplement-component', ['exports', 'ember-fhir-adapter/models/nutrition-order-supplement-component'], function (exports, _emberFhirAdapterModelsNutritionOrderSupplementComponent) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrderSupplementComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/nutrition-order', ['exports', 'ember-fhir-adapter/models/nutrition-order'], function (exports, _emberFhirAdapterModelsNutritionOrder) {
  exports['default'] = _emberFhirAdapterModelsNutritionOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/obj-hash', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Object.extend({
    content: {},
    contentLength: 0,

    add: function add(obj) {
      var id = this.generateId();
      this.get('content')[id] = obj;
      this.incrementProperty("contentLength");
      return id;
    },

    getObj: function getObj(key) {
      var res = this.get('content')[key];
      if (!res) {
        throw "no obj for key " + key;
      }
      return res;
    },

    generateId: function generateId() {
      var num = Math.random() * 1000000000000.0;
      num = parseInt(num);
      num = "" + num;
      return num;
    },

    keys: function keys() {
      var res = [];
      for (var key in this.get('content')) {
        res.push(key);
      }
      return _ember['default'].A(res);
    },

    lengthBinding: "contentLength"
  });
});
define('ember-on-fhir/models/observation-component-component', ['exports', 'ember-fhir-adapter/models/observation-component-component'], function (exports, _emberFhirAdapterModelsObservationComponentComponent) {
  exports['default'] = _emberFhirAdapterModelsObservationComponentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/observation-reference-range-component', ['exports', 'ember-fhir-adapter/models/observation-reference-range-component'], function (exports, _emberFhirAdapterModelsObservationReferenceRangeComponent) {
  exports['default'] = _emberFhirAdapterModelsObservationReferenceRangeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/observation-related-component', ['exports', 'ember-fhir-adapter/models/observation-related-component'], function (exports, _emberFhirAdapterModelsObservationRelatedComponent) {
  exports['default'] = _emberFhirAdapterModelsObservationRelatedComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/observation', ['exports', 'ember-fhir-adapter/models/observation'], function (exports, _emberFhirAdapterModelsObservation) {
  exports['default'] = _emberFhirAdapterModelsObservation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/operation-definition-contact-component', ['exports', 'ember-fhir-adapter/models/operation-definition-contact-component'], function (exports, _emberFhirAdapterModelsOperationDefinitionContactComponent) {
  exports['default'] = _emberFhirAdapterModelsOperationDefinitionContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/operation-definition-parameter-binding-component', ['exports', 'ember-fhir-adapter/models/operation-definition-parameter-binding-component'], function (exports, _emberFhirAdapterModelsOperationDefinitionParameterBindingComponent) {
  exports['default'] = _emberFhirAdapterModelsOperationDefinitionParameterBindingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/operation-definition-parameter-component', ['exports', 'ember-fhir-adapter/models/operation-definition-parameter-component'], function (exports, _emberFhirAdapterModelsOperationDefinitionParameterComponent) {
  exports['default'] = _emberFhirAdapterModelsOperationDefinitionParameterComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/operation-definition', ['exports', 'ember-fhir-adapter/models/operation-definition'], function (exports, _emberFhirAdapterModelsOperationDefinition) {
  exports['default'] = _emberFhirAdapterModelsOperationDefinition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/operation-outcome-issue-component', ['exports', 'ember-fhir-adapter/models/operation-outcome-issue-component'], function (exports, _emberFhirAdapterModelsOperationOutcomeIssueComponent) {
  exports['default'] = _emberFhirAdapterModelsOperationOutcomeIssueComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/operation-outcome', ['exports', 'ember-fhir-adapter/models/operation-outcome'], function (exports, _emberFhirAdapterModelsOperationOutcome) {
  exports['default'] = _emberFhirAdapterModelsOperationOutcome['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/order-response', ['exports', 'ember-fhir-adapter/models/order-response'], function (exports, _emberFhirAdapterModelsOrderResponse) {
  exports['default'] = _emberFhirAdapterModelsOrderResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/order-when-component', ['exports', 'ember-fhir-adapter/models/order-when-component'], function (exports, _emberFhirAdapterModelsOrderWhenComponent) {
  exports['default'] = _emberFhirAdapterModelsOrderWhenComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/order', ['exports', 'ember-fhir-adapter/models/order'], function (exports, _emberFhirAdapterModelsOrder) {
  exports['default'] = _emberFhirAdapterModelsOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/organization-contact-component', ['exports', 'ember-fhir-adapter/models/organization-contact-component'], function (exports, _emberFhirAdapterModelsOrganizationContactComponent) {
  exports['default'] = _emberFhirAdapterModelsOrganizationContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/organization', ['exports', 'ember-fhir-adapter/models/organization'], function (exports, _emberFhirAdapterModelsOrganization) {
  exports['default'] = _emberFhirAdapterModelsOrganization['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/patient-animal-component', ['exports', 'ember-fhir-adapter/models/patient-animal-component'], function (exports, _emberFhirAdapterModelsPatientAnimalComponent) {
  exports['default'] = _emberFhirAdapterModelsPatientAnimalComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/patient-communication-component', ['exports', 'ember-fhir-adapter/models/patient-communication-component'], function (exports, _emberFhirAdapterModelsPatientCommunicationComponent) {
  exports['default'] = _emberFhirAdapterModelsPatientCommunicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/patient-contact-component', ['exports', 'ember-fhir-adapter/models/patient-contact-component'], function (exports, _emberFhirAdapterModelsPatientContactComponent) {
  exports['default'] = _emberFhirAdapterModelsPatientContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/patient-event', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    type: _emberData['default'].attr('string'),
    event: _emberData['default'].attr(),
    isEnd: _emberData['default'].attr('boolean', { defaultValue: false }),
    displayText: _ember['default'].computed.reads('event.displayText'),
    effectiveDate: _ember['default'].computed('isEnd', 'event', function () {
      if (this.get('isEnd')) {
        return this.get('event.endDate');
      }
      return this.get('event.startDate');
    })
  });
});
define('ember-on-fhir/models/patient-link-component', ['exports', 'ember-fhir-adapter/models/patient-link-component'], function (exports, _emberFhirAdapterModelsPatientLinkComponent) {
  exports['default'] = _emberFhirAdapterModelsPatientLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/patient', ['exports', 'ember', 'ember-data', 'ember-fhir-adapter/models/patient', 'ember-on-fhir/helpers/uniqBy', 'moment'], function (exports, _ember, _emberData, _emberFhirAdapterModelsPatient, _emberOnFhirHelpersUniqBy, _moment) {
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  exports['default'] = _emberFhirAdapterModelsPatient['default'].extend({
    encounters: _emberData['default'].hasMany('encounter', { 'async': true }),
    conditions: _emberData['default'].hasMany('condition', { 'async': true }),
    medications: _emberData['default'].hasMany('medication-statement', { 'async': true }),
    appointments: _emberData['default'].hasMany('appointment', { 'async': true }),
    risks: _emberData['default'].hasMany('risk-assessment', { 'async': true }),
    name: _emberData['default'].hasMany('human-name', { async: false }),
    notifications: _emberData['default'].belongsTo('notification-count', { 'async': true, inverse: 'patient' }),
    location: 'Home', // TODO: hook up

    fullName: _ember['default'].computed('name', function () {
      var firstHumanName = this.get('name');
      if (firstHumanName) {
        return firstHumanName.get('firstObject.family') + ', ' + firstHumanName.get('firstObject.given');
      }
      return 'Unknown';
    }),

    computedAge: _ember['default'].computed('birthDate', function () {
      return (0, _moment['default'])().diff((0, _moment['default'])(this.get('birthDate')), 'years');
    }),

    computedGender: _ember['default'].computed('gender', function () {
      var gender = this.get('gender');
      if (gender !== undefined) {
        return gender.capitalize();
      } else {
        return '';
      }
    }),

    inpatientAdmissions: _ember['default'].computed.filter('encounters', function (item) {
      return item.hasCode('type', { code: '99221', system: 'http://www.ama-assn.org/go/cpt' }) || item.hasCode('type', { code: '99222', system: 'http://www.ama-assn.org/go/cpt' }) || item.hasCode('type', { code: '99223', system: 'http://www.ama-assn.org/go/cpt' });
    }),

    events: _ember['default'].computed('encounters.[]', 'conditions.[]', 'medications.[]', 'sortedRisks.[]', function () {
      var events = _ember['default'].A([]);

      this.get('encounters').map(function (e) {
        var patientEvent = e.store.createRecord('patient-event', { event: e, type: 'encounter', isEnd: e.hasOccured('endDate') });
        events.push(patientEvent);
      });

      this.get('conditions').map(function (e) {
        if (e.get('verificationStatus') === 'confirmed') {
          var patientEvent = e.store.createRecord('patient-event', { event: e, type: 'condition', isEnd: e.hasOccured('endDate') });
          events.push(patientEvent);
        }
      });

      this.get('medications').map(function (e) {
        var patientEvent = e.store.createRecord('patient-event', { event: e, type: 'medication', isEnd: e.hasOccured('endDate') });
        events.push(patientEvent);
      });

      this.get('risksByOutcome').map(function (outcome) {
        var riskTransitions = outcome.values.map(function (e, i) {
          var previousRisk = outcome.values[i - 1];

          if (!previousRisk) {
            var _displayText = 'Risk of \'' + outcome.key + '\' started at ' + e.get('value');
            return e.store.createRecord('risk-event', { event: e, displayText: _displayText, deltaRisk: e.get('value'), type: 'riskIncreased' });
          }

          var deltaRisk = e.get('value') - previousRisk.get('value');
          var direction = deltaRisk > 0 ? 'increased' : 'decreased';
          var displayText = 'Risk of \'' + outcome.key + '\' ' + direction + ' from ' + previousRisk.get('value') + ' to ' + e.get('value');
          return e.store.createRecord('risk-event', { event: e, displayText: displayText, deltaRisk: deltaRisk, type: 'risk' + direction.capitalize() });
        });

        events.push.apply(events, _toConsumableArray(riskTransitions.filter(function (e) {
          return e.get('deltaRisk') !== 0;
        })));
      });

      return events.sortBy('event.startDate').reverse();
    }),

    activeMedications: _ember['default'].computed.filter('medications', function (med) {
      return med.isActive('endDate');
    }),

    uniqueActiveMedications: _ember['default'].computed('activeMedications', function () {
      return (0, _emberOnFhirHelpersUniqBy.uniqBy)(this.get('activeMedications').toArray(), 'displayText');
    }),

    activeConditions: _ember['default'].computed.filter('conditions', function (cond) {
      return cond.isActive('endDate') && cond.get('verificationStatus') === 'confirmed';
    }),

    uniqueActiveConditions: _ember['default'].computed('activeConditions', function () {
      return (0, _emberOnFhirHelpersUniqBy.uniqBy)(this.get('activeConditions').toArray(), 'displayText');
    }),

    futureAppointments: _ember['default'].computed.filter('appointments', function (appointment) {
      return !appointment.hasOccured('start');
    }),

    sortedRisks: _ember['default'].computed('risks.[]', function () {
      return this.get('risks').sortBy('date');
    }),

    risksByOutcome: _ember['default'].computed('sortedRisks.[]', function () {
      var nest = d3.nest();
      nest.key(function (el) {
        return el.get('prediction.firstObject.outcome.displayText');
      });
      return nest.entries(this.get('sortedRisks'));
    }),

    currentRisk: _ember['default'].computed('risksByOutcome', function () {
      return this.get('risksByOutcome').map(function (risk) {
        return { key: risk.key, value: risk.values[risk.values.length - 1] };
      });
    })
  });
});
define('ember-on-fhir/models/payment-notice', ['exports', 'ember-fhir-adapter/models/payment-notice'], function (exports, _emberFhirAdapterModelsPaymentNotice) {
  exports['default'] = _emberFhirAdapterModelsPaymentNotice['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/payment-reconciliation-details-component', ['exports', 'ember-fhir-adapter/models/payment-reconciliation-details-component'], function (exports, _emberFhirAdapterModelsPaymentReconciliationDetailsComponent) {
  exports['default'] = _emberFhirAdapterModelsPaymentReconciliationDetailsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/payment-reconciliation-notes-component', ['exports', 'ember-fhir-adapter/models/payment-reconciliation-notes-component'], function (exports, _emberFhirAdapterModelsPaymentReconciliationNotesComponent) {
  exports['default'] = _emberFhirAdapterModelsPaymentReconciliationNotesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/payment-reconciliation', ['exports', 'ember-fhir-adapter/models/payment-reconciliation'], function (exports, _emberFhirAdapterModelsPaymentReconciliation) {
  exports['default'] = _emberFhirAdapterModelsPaymentReconciliation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/period', ['exports', 'ember-fhir-adapter/models/period'], function (exports, _emberFhirAdapterModelsPeriod) {
  exports['default'] = _emberFhirAdapterModelsPeriod['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/person-link-component', ['exports', 'ember-fhir-adapter/models/person-link-component'], function (exports, _emberFhirAdapterModelsPersonLinkComponent) {
  exports['default'] = _emberFhirAdapterModelsPersonLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/person', ['exports', 'ember-fhir-adapter/models/person'], function (exports, _emberFhirAdapterModelsPerson) {
  exports['default'] = _emberFhirAdapterModelsPerson['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/pie', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    slices: _emberData['default'].hasMany('slice', { embedded: true, async: false }),

    sliceArray: _ember['default'].computed('slices.[]', function () {
      var maxWeight = Math.max.apply(Math, this.get('slices').mapBy('weight'));

      return this.get('slices').map(function (slice) {
        return {
          weight: slice.get('weight'),
          value: slice.get('value'),
          name: slice.get('name'),
          maxValue: slice.get('maxValue'),
          maxWeight: maxWeight
        };
      });
    })
  });
});
define('ember-on-fhir/models/practitioner-practitioner-role-component', ['exports', 'ember-fhir-adapter/models/practitioner-practitioner-role-component'], function (exports, _emberFhirAdapterModelsPractitionerPractitionerRoleComponent) {
  exports['default'] = _emberFhirAdapterModelsPractitionerPractitionerRoleComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/practitioner-qualification-component', ['exports', 'ember-fhir-adapter/models/practitioner-qualification-component'], function (exports, _emberFhirAdapterModelsPractitionerQualificationComponent) {
  exports['default'] = _emberFhirAdapterModelsPractitionerQualificationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/practitioner', ['exports', 'ember-fhir-adapter/models/practitioner'], function (exports, _emberFhirAdapterModelsPractitioner) {
  exports['default'] = _emberFhirAdapterModelsPractitioner['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/procedure-focal-device-component', ['exports', 'ember-fhir-adapter/models/procedure-focal-device-component'], function (exports, _emberFhirAdapterModelsProcedureFocalDeviceComponent) {
  exports['default'] = _emberFhirAdapterModelsProcedureFocalDeviceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/procedure-performer-component', ['exports', 'ember-fhir-adapter/models/procedure-performer-component'], function (exports, _emberFhirAdapterModelsProcedurePerformerComponent) {
  exports['default'] = _emberFhirAdapterModelsProcedurePerformerComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/procedure-request', ['exports', 'ember-fhir-adapter/models/procedure-request'], function (exports, _emberFhirAdapterModelsProcedureRequest) {
  exports['default'] = _emberFhirAdapterModelsProcedureRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/procedure', ['exports', 'ember-fhir-adapter/models/procedure'], function (exports, _emberFhirAdapterModelsProcedure) {
  exports['default'] = _emberFhirAdapterModelsProcedure['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/process-request-items-component', ['exports', 'ember-fhir-adapter/models/process-request-items-component'], function (exports, _emberFhirAdapterModelsProcessRequestItemsComponent) {
  exports['default'] = _emberFhirAdapterModelsProcessRequestItemsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/process-request', ['exports', 'ember-fhir-adapter/models/process-request'], function (exports, _emberFhirAdapterModelsProcessRequest) {
  exports['default'] = _emberFhirAdapterModelsProcessRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/process-response-notes-component', ['exports', 'ember-fhir-adapter/models/process-response-notes-component'], function (exports, _emberFhirAdapterModelsProcessResponseNotesComponent) {
  exports['default'] = _emberFhirAdapterModelsProcessResponseNotesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/process-response', ['exports', 'ember-fhir-adapter/models/process-response'], function (exports, _emberFhirAdapterModelsProcessResponse) {
  exports['default'] = _emberFhirAdapterModelsProcessResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/provenance-agent-component', ['exports', 'ember-fhir-adapter/models/provenance-agent-component'], function (exports, _emberFhirAdapterModelsProvenanceAgentComponent) {
  exports['default'] = _emberFhirAdapterModelsProvenanceAgentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/provenance-agent-related-agent-component', ['exports', 'ember-fhir-adapter/models/provenance-agent-related-agent-component'], function (exports, _emberFhirAdapterModelsProvenanceAgentRelatedAgentComponent) {
  exports['default'] = _emberFhirAdapterModelsProvenanceAgentRelatedAgentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/provenance-entity-component', ['exports', 'ember-fhir-adapter/models/provenance-entity-component'], function (exports, _emberFhirAdapterModelsProvenanceEntityComponent) {
  exports['default'] = _emberFhirAdapterModelsProvenanceEntityComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/provenance', ['exports', 'ember-fhir-adapter/models/provenance'], function (exports, _emberFhirAdapterModelsProvenance) {
  exports['default'] = _emberFhirAdapterModelsProvenance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/quantity', ['exports', 'ember-fhir-adapter/models/quantity'], function (exports, _emberFhirAdapterModelsQuantity) {
  exports['default'] = _emberFhirAdapterModelsQuantity['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire-group-component', ['exports', 'ember-fhir-adapter/models/questionnaire-group-component'], function (exports, _emberFhirAdapterModelsQuestionnaireGroupComponent) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaireGroupComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire-question-component', ['exports', 'ember-fhir-adapter/models/questionnaire-question-component'], function (exports, _emberFhirAdapterModelsQuestionnaireQuestionComponent) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaireQuestionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire-response-group-component', ['exports', 'ember-fhir-adapter/models/questionnaire-response-group-component'], function (exports, _emberFhirAdapterModelsQuestionnaireResponseGroupComponent) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaireResponseGroupComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire-response-question-answer-component', ['exports', 'ember-fhir-adapter/models/questionnaire-response-question-answer-component'], function (exports, _emberFhirAdapterModelsQuestionnaireResponseQuestionAnswerComponent) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaireResponseQuestionAnswerComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire-response-question-component', ['exports', 'ember-fhir-adapter/models/questionnaire-response-question-component'], function (exports, _emberFhirAdapterModelsQuestionnaireResponseQuestionComponent) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaireResponseQuestionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire-response', ['exports', 'ember-fhir-adapter/models/questionnaire-response'], function (exports, _emberFhirAdapterModelsQuestionnaireResponse) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaireResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/questionnaire', ['exports', 'ember-fhir-adapter/models/questionnaire'], function (exports, _emberFhirAdapterModelsQuestionnaire) {
  exports['default'] = _emberFhirAdapterModelsQuestionnaire['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/range', ['exports', 'ember-fhir-adapter/models/range'], function (exports, _emberFhirAdapterModelsRange) {
  exports['default'] = _emberFhirAdapterModelsRange['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/ratio', ['exports', 'ember-fhir-adapter/models/ratio'], function (exports, _emberFhirAdapterModelsRatio) {
  exports['default'] = _emberFhirAdapterModelsRatio['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/reference', ['exports', 'ember-fhir-adapter/models/reference'], function (exports, _emberFhirAdapterModelsReference) {
  exports['default'] = _emberFhirAdapterModelsReference['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/referral-request', ['exports', 'ember-fhir-adapter/models/referral-request'], function (exports, _emberFhirAdapterModelsReferralRequest) {
  exports['default'] = _emberFhirAdapterModelsReferralRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/related-person', ['exports', 'ember-fhir-adapter/models/related-person'], function (exports, _emberFhirAdapterModelsRelatedPerson) {
  exports['default'] = _emberFhirAdapterModelsRelatedPerson['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/risk-assessment-prediction-component', ['exports', 'ember-data', 'ember-fhir-adapter/models/risk-assessment-prediction-component'], function (exports, _emberData, _emberFhirAdapterModelsRiskAssessmentPredictionComponent) {
  exports['default'] = _emberFhirAdapterModelsRiskAssessmentPredictionComponent['default'].extend({
    outcome: _emberData['default'].belongsTo('codeable-concept'),
    probabilityRange: _emberData['default'].belongsTo('range'),
    probabilityCodeableConcept: _emberData['default'].belongsTo('codeable-concept'),
    whenPeriod: _emberData['default'].belongsTo('period'),
    whenRange: _emberData['default'].belongsTo('range')
  });
});
define('ember-on-fhir/models/risk-assessment', ['exports', 'ember', 'ember-data', 'ember-on-fhir/mixins/dateable', 'ember-fhir-adapter/models/risk-assessment'], function (exports, _ember, _emberData, _emberOnFhirMixinsDateable, _emberFhirAdapterModelsRiskAssessment) {
  exports['default'] = _emberFhirAdapterModelsRiskAssessment['default'].extend(_emberOnFhirMixinsDateable['default'], {
    displayText: _ember['default'].computed('prediction.firstObject', function () {
      return this.get('prediction.firstObject.outcome.displayText') + ' - ' + this.get('value');
    }),
    startDate: _ember['default'].computed.reads('date'),
    pie: _emberData['default'].belongsTo('pie', { async: true }),
    value: _ember['default'].computed.reads('prediction.firstObject.probabilityDecimal')
  });
});
define('ember-on-fhir/models/risk-event', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    displayText: _emberData['default'].attr('string', { defaultValue: '' }),
    isEnd: _emberData['default'].attr('boolean', { defaultValue: false }),
    deltaRisk: _emberData['default'].attr('number', { defaultValue: 0.0 }),
    effectiveDate: _ember['default'].computed('isEnd', 'event', function () {
      if (this.get('isEnd')) {
        return this.get('event.endDate');
      }
      return this.get('event.startDate');
    })
  });
});
define('ember-on-fhir/models/sampled-data', ['exports', 'ember-fhir-adapter/models/sampled-data'], function (exports, _emberFhirAdapterModelsSampledData) {
  exports['default'] = _emberFhirAdapterModelsSampledData['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/schedule', ['exports', 'ember-fhir-adapter/models/schedule'], function (exports, _emberFhirAdapterModelsSchedule) {
  exports['default'] = _emberFhirAdapterModelsSchedule['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/search-parameter-contact-component', ['exports', 'ember-fhir-adapter/models/search-parameter-contact-component'], function (exports, _emberFhirAdapterModelsSearchParameterContactComponent) {
  exports['default'] = _emberFhirAdapterModelsSearchParameterContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/search-parameter', ['exports', 'ember-fhir-adapter/models/search-parameter'], function (exports, _emberFhirAdapterModelsSearchParameter) {
  exports['default'] = _emberFhirAdapterModelsSearchParameter['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/signature', ['exports', 'ember-fhir-adapter/models/signature'], function (exports, _emberFhirAdapterModelsSignature) {
  exports['default'] = _emberFhirAdapterModelsSignature['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/slice', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr('string'),
    weight: _emberData['default'].attr('number'),
    value: _emberData['default'].attr('value'),
    maxValue: _emberData['default'].attr('number')
  });
});
define('ember-on-fhir/models/slot', ['exports', 'ember-fhir-adapter/models/slot'], function (exports, _emberFhirAdapterModelsSlot) {
  exports['default'] = _emberFhirAdapterModelsSlot['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/specimen-collection-component', ['exports', 'ember-fhir-adapter/models/specimen-collection-component'], function (exports, _emberFhirAdapterModelsSpecimenCollectionComponent) {
  exports['default'] = _emberFhirAdapterModelsSpecimenCollectionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/specimen-container-component', ['exports', 'ember-fhir-adapter/models/specimen-container-component'], function (exports, _emberFhirAdapterModelsSpecimenContainerComponent) {
  exports['default'] = _emberFhirAdapterModelsSpecimenContainerComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/specimen-treatment-component', ['exports', 'ember-fhir-adapter/models/specimen-treatment-component'], function (exports, _emberFhirAdapterModelsSpecimenTreatmentComponent) {
  exports['default'] = _emberFhirAdapterModelsSpecimenTreatmentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/specimen', ['exports', 'ember-fhir-adapter/models/specimen'], function (exports, _emberFhirAdapterModelsSpecimen) {
  exports['default'] = _emberFhirAdapterModelsSpecimen['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/structure-definition-contact-component', ['exports', 'ember-fhir-adapter/models/structure-definition-contact-component'], function (exports, _emberFhirAdapterModelsStructureDefinitionContactComponent) {
  exports['default'] = _emberFhirAdapterModelsStructureDefinitionContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/structure-definition-differential-component', ['exports', 'ember-fhir-adapter/models/structure-definition-differential-component'], function (exports, _emberFhirAdapterModelsStructureDefinitionDifferentialComponent) {
  exports['default'] = _emberFhirAdapterModelsStructureDefinitionDifferentialComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/structure-definition-mapping-component', ['exports', 'ember-fhir-adapter/models/structure-definition-mapping-component'], function (exports, _emberFhirAdapterModelsStructureDefinitionMappingComponent) {
  exports['default'] = _emberFhirAdapterModelsStructureDefinitionMappingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/structure-definition-snapshot-component', ['exports', 'ember-fhir-adapter/models/structure-definition-snapshot-component'], function (exports, _emberFhirAdapterModelsStructureDefinitionSnapshotComponent) {
  exports['default'] = _emberFhirAdapterModelsStructureDefinitionSnapshotComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/structure-definition', ['exports', 'ember-fhir-adapter/models/structure-definition'], function (exports, _emberFhirAdapterModelsStructureDefinition) {
  exports['default'] = _emberFhirAdapterModelsStructureDefinition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/subscription-channel-component', ['exports', 'ember-fhir-adapter/models/subscription-channel-component'], function (exports, _emberFhirAdapterModelsSubscriptionChannelComponent) {
  exports['default'] = _emberFhirAdapterModelsSubscriptionChannelComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/subscription', ['exports', 'ember-fhir-adapter/models/subscription'], function (exports, _emberFhirAdapterModelsSubscription) {
  exports['default'] = _emberFhirAdapterModelsSubscription['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/substance-ingredient-component', ['exports', 'ember-fhir-adapter/models/substance-ingredient-component'], function (exports, _emberFhirAdapterModelsSubstanceIngredientComponent) {
  exports['default'] = _emberFhirAdapterModelsSubstanceIngredientComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/substance-instance-component', ['exports', 'ember-fhir-adapter/models/substance-instance-component'], function (exports, _emberFhirAdapterModelsSubstanceInstanceComponent) {
  exports['default'] = _emberFhirAdapterModelsSubstanceInstanceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/substance', ['exports', 'ember-fhir-adapter/models/substance'], function (exports, _emberFhirAdapterModelsSubstance) {
  exports['default'] = _emberFhirAdapterModelsSubstance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/supply-delivery', ['exports', 'ember-fhir-adapter/models/supply-delivery'], function (exports, _emberFhirAdapterModelsSupplyDelivery) {
  exports['default'] = _emberFhirAdapterModelsSupplyDelivery['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/supply-request-when-component', ['exports', 'ember-fhir-adapter/models/supply-request-when-component'], function (exports, _emberFhirAdapterModelsSupplyRequestWhenComponent) {
  exports['default'] = _emberFhirAdapterModelsSupplyRequestWhenComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/supply-request', ['exports', 'ember-fhir-adapter/models/supply-request'], function (exports, _emberFhirAdapterModelsSupplyRequest) {
  exports['default'] = _emberFhirAdapterModelsSupplyRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-contact-component', ['exports', 'ember-fhir-adapter/models/test-script-contact-component'], function (exports, _emberFhirAdapterModelsTestScriptContactComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-fixture-component', ['exports', 'ember-fhir-adapter/models/test-script-fixture-component'], function (exports, _emberFhirAdapterModelsTestScriptFixtureComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptFixtureComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-metadata-capability-component', ['exports', 'ember-fhir-adapter/models/test-script-metadata-capability-component'], function (exports, _emberFhirAdapterModelsTestScriptMetadataCapabilityComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptMetadataCapabilityComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-metadata-component', ['exports', 'ember-fhir-adapter/models/test-script-metadata-component'], function (exports, _emberFhirAdapterModelsTestScriptMetadataComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptMetadataComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-metadata-link-component', ['exports', 'ember-fhir-adapter/models/test-script-metadata-link-component'], function (exports, _emberFhirAdapterModelsTestScriptMetadataLinkComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptMetadataLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-setup-action-assert-component', ['exports', 'ember-fhir-adapter/models/test-script-setup-action-assert-component'], function (exports, _emberFhirAdapterModelsTestScriptSetupActionAssertComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptSetupActionAssertComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-setup-action-component', ['exports', 'ember-fhir-adapter/models/test-script-setup-action-component'], function (exports, _emberFhirAdapterModelsTestScriptSetupActionComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptSetupActionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-setup-action-operation-component', ['exports', 'ember-fhir-adapter/models/test-script-setup-action-operation-component'], function (exports, _emberFhirAdapterModelsTestScriptSetupActionOperationComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptSetupActionOperationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-setup-action-operation-request-header-component', ['exports', 'ember-fhir-adapter/models/test-script-setup-action-operation-request-header-component'], function (exports, _emberFhirAdapterModelsTestScriptSetupActionOperationRequestHeaderComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptSetupActionOperationRequestHeaderComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-setup-component', ['exports', 'ember-fhir-adapter/models/test-script-setup-component'], function (exports, _emberFhirAdapterModelsTestScriptSetupComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptSetupComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-teardown-action-component', ['exports', 'ember-fhir-adapter/models/test-script-teardown-action-component'], function (exports, _emberFhirAdapterModelsTestScriptTeardownActionComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptTeardownActionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-teardown-component', ['exports', 'ember-fhir-adapter/models/test-script-teardown-component'], function (exports, _emberFhirAdapterModelsTestScriptTeardownComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptTeardownComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-test-action-component', ['exports', 'ember-fhir-adapter/models/test-script-test-action-component'], function (exports, _emberFhirAdapterModelsTestScriptTestActionComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptTestActionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-test-component', ['exports', 'ember-fhir-adapter/models/test-script-test-component'], function (exports, _emberFhirAdapterModelsTestScriptTestComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptTestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script-variable-component', ['exports', 'ember-fhir-adapter/models/test-script-variable-component'], function (exports, _emberFhirAdapterModelsTestScriptVariableComponent) {
  exports['default'] = _emberFhirAdapterModelsTestScriptVariableComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/test-script', ['exports', 'ember-fhir-adapter/models/test-script'], function (exports, _emberFhirAdapterModelsTestScript) {
  exports['default'] = _emberFhirAdapterModelsTestScript['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/timing-repeat-component', ['exports', 'ember-fhir-adapter/models/timing-repeat-component'], function (exports, _emberFhirAdapterModelsTimingRepeatComponent) {
  exports['default'] = _emberFhirAdapterModelsTimingRepeatComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/timing', ['exports', 'ember-fhir-adapter/models/timing'], function (exports, _emberFhirAdapterModelsTiming) {
  exports['default'] = _emberFhirAdapterModelsTiming['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-code-system-component', ['exports', 'ember-fhir-adapter/models/value-set-code-system-component'], function (exports, _emberFhirAdapterModelsValueSetCodeSystemComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetCodeSystemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-compose-component', ['exports', 'ember-fhir-adapter/models/value-set-compose-component'], function (exports, _emberFhirAdapterModelsValueSetComposeComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetComposeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-concept-definition-component', ['exports', 'ember-fhir-adapter/models/value-set-concept-definition-component'], function (exports, _emberFhirAdapterModelsValueSetConceptDefinitionComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetConceptDefinitionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-concept-definition-designation-component', ['exports', 'ember-fhir-adapter/models/value-set-concept-definition-designation-component'], function (exports, _emberFhirAdapterModelsValueSetConceptDefinitionDesignationComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetConceptDefinitionDesignationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-concept-reference-component', ['exports', 'ember-fhir-adapter/models/value-set-concept-reference-component'], function (exports, _emberFhirAdapterModelsValueSetConceptReferenceComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetConceptReferenceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-concept-set-component', ['exports', 'ember-fhir-adapter/models/value-set-concept-set-component'], function (exports, _emberFhirAdapterModelsValueSetConceptSetComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetConceptSetComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-concept-set-filter-component', ['exports', 'ember-fhir-adapter/models/value-set-concept-set-filter-component'], function (exports, _emberFhirAdapterModelsValueSetConceptSetFilterComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetConceptSetFilterComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-contact-component', ['exports', 'ember-fhir-adapter/models/value-set-contact-component'], function (exports, _emberFhirAdapterModelsValueSetContactComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-expansion-component', ['exports', 'ember-fhir-adapter/models/value-set-expansion-component'], function (exports, _emberFhirAdapterModelsValueSetExpansionComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetExpansionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-expansion-contains-component', ['exports', 'ember-fhir-adapter/models/value-set-expansion-contains-component'], function (exports, _emberFhirAdapterModelsValueSetExpansionContainsComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetExpansionContainsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set-expansion-parameter-component', ['exports', 'ember-fhir-adapter/models/value-set-expansion-parameter-component'], function (exports, _emberFhirAdapterModelsValueSetExpansionParameterComponent) {
  exports['default'] = _emberFhirAdapterModelsValueSetExpansionParameterComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/value-set', ['exports', 'ember-fhir-adapter/models/value-set'], function (exports, _emberFhirAdapterModelsValueSet) {
  exports['default'] = _emberFhirAdapterModelsValueSet['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/vision-prescription-dispense-component', ['exports', 'ember-fhir-adapter/models/vision-prescription-dispense-component'], function (exports, _emberFhirAdapterModelsVisionPrescriptionDispenseComponent) {
  exports['default'] = _emberFhirAdapterModelsVisionPrescriptionDispenseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/models/vision-prescription', ['exports', 'ember-fhir-adapter/models/vision-prescription'], function (exports, _emberFhirAdapterModelsVisionPrescription) {
  exports['default'] = _emberFhirAdapterModelsVisionPrescription['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('ember-on-fhir/router', ['exports', 'ember', 'ember-on-fhir/config/environment'], function (exports, _ember, _emberOnFhirConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _emberOnFhirConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.resource('filters', function () {
      this.route('new');
      this.route('show', { path: ':id' });
    });

    this.resource('patients', function () {
      this.route('show', { path: ':id' });
      this.route('print');
    });

    this.route('login');
    this.route('utilities');

    // Registration is currently disabled
    // this.route('register');

    this.route('forgotPassword');
  });

  exports['default'] = Router;
});
define('ember-on-fhir/routes/application', ['exports', 'ember-route', 'ember-simple-auth/mixins/application-route-mixin'], function (exports, _emberRoute, _emberSimpleAuthMixinsApplicationRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsApplicationRouteMixin['default']);
});
define('ember-on-fhir/routes/filters/index', ['exports', 'ember-route', 'ember-service/inject', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _emberRoute, _emberServiceInject, _emberSimpleAuthMixinsUnauthenticatedRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsUnauthenticatedRouteMixin['default'], {
    store: (0, _emberServiceInject['default'])(),

    model: function model() {
      return this.get('store').findAll('group');
    }
  });
});
define('ember-on-fhir/routes/filters/new', ['exports', 'ember-route', 'ember-service/inject', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _emberRoute, _emberServiceInject, _emberSimpleAuthMixinsUnauthenticatedRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsUnauthenticatedRouteMixin['default'], {
    store: (0, _emberServiceInject['default'])(),

    model: function model() {
      return this.get('store').createRecord('group');
    },

    resetController: function resetController(controller, isExiting /*, transition*/) {
      if (isExiting) {
        controller.set('filterName', null);
      }
    }
  });
});
define('ember-on-fhir/routes/filters/show', ['exports', 'ember-route', 'ember-service/inject', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _emberRoute, _emberServiceInject, _emberSimpleAuthMixinsUnauthenticatedRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsUnauthenticatedRouteMixin['default'], {
    store: (0, _emberServiceInject['default'])(),

    model: function model(params) {
      return this.get('store').find('group', params.id);
    }
  });
});
define('ember-on-fhir/routes/index', ['exports', 'ember-route', 'ember-simple-auth/mixins/authenticated-route-mixin'], function (exports, _emberRoute, _emberSimpleAuthMixinsAuthenticatedRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsAuthenticatedRouteMixin['default'], {
    beforeModel: function beforeModel() {
      return this.transitionTo('patients');
    }
  });
});
define('ember-on-fhir/routes/login', ['exports', 'ember-route', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _emberRoute, _emberSimpleAuthMixinsUnauthenticatedRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsUnauthenticatedRouteMixin['default'], {
    resetController: function resetController(controller, isExiting) {
      if (isExiting) {
        controller.set('identification', null);
        controller.set('password', null);
        controller.set('displayErrors', false);
        controller.set('errorMessage', null);
        controller.set('disableLoginBtn', null);
      }
    }
  });
});
define('ember-on-fhir/routes/patients/index', ['exports', 'ember', 'ember-route', 'ember-service/inject', 'ember-simple-auth/mixins/unauthenticated-route-mixin', 'ember-cli-pagination/remote/route-mixin', 'ember-on-fhir/utils/fhir-paged-remote-array', 'ember-on-fhir/models/huddle'], function (exports, _ember, _emberRoute, _emberServiceInject, _emberSimpleAuthMixinsUnauthenticatedRouteMixin, _emberCliPaginationRemoteRouteMixin, _emberOnFhirUtilsFhirPagedRemoteArray, _emberOnFhirModelsHuddle) {
  var RSVP = _ember['default'].RSVP;
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsUnauthenticatedRouteMixin['default'], _emberCliPaginationRemoteRouteMixin['default'], {
    store: (0, _emberServiceInject['default'])(),
    ajax: (0, _emberServiceInject['default'])(),

    perPage: 8,
    huddle: null,

    activate: function activate() {
      var controller = this.controllerFor('patients.show');
      if (controller.get('huddlePatients')) {
        // Ember controllers are singletons, this means when we overwrite the computed property we lose being able to compute it.
        // If we have the controller set up when we activate THIS route we want to reset that computed property.
        controller.set('currentPatientIndex', _ember['default'].computed('huddlePatients', 'model', function () {
          return controller.get('huddlePatients').indexOf(controller.get('model')) + 1 + controller.get('huddleOffset');
        }));
      }
    },

    model: function model(params) {
      var paramMapping = {
        page: '_offset',
        perPage: '_count'
      };

      var store = this.get('store');
      var perPage = this.get('perPage');
      var groupIds = [params.huddleId, params.groupId].filter(function (n) {
        return n;
      });

      _ember['default'].$.ajaxSetup({ traditional: true });
      return RSVP.hash({
        // patients: store.findAll('patient'),
        patients: _emberOnFhirUtilsFhirPagedRemoteArray['default'].create({
          modelName: 'patient',
          store: store,
          page: params.page || 1,
          perPage: perPage,
          paramMapping: paramMapping,
          sortBy: params.sortBy || 'family',
          sortDescending: params.sortDescending,
          groupId: groupIds
        }),
        groups: store.query('group', { actual: false }),
        huddles: this.get('ajax').request('/Group', { data: { code: 'http://interventionengine.org/fhir/cs/huddle|HUDDLE' } }).then(function (response) {
          return (0, _emberOnFhirModelsHuddle.parseHuddles)(response.entry || []);
        })
        // risks: store.findAll('risk'),
        // notificationCounts: store.findAll('notification-count')
      });
    }
  });
});
define('ember-on-fhir/routes/patients/print', ['exports', 'ember', 'ember-route', 'ember-service/inject', 'ember-metal/get', 'ember-utils', 'ember-on-fhir/models/huddle'], function (exports, _ember, _emberRoute, _emberServiceInject, _emberMetalGet, _emberUtils, _emberOnFhirModelsHuddle) {
  var RSVP = _ember['default'].RSVP;
  exports['default'] = _emberRoute['default'].extend({
    store: (0, _emberServiceInject['default'])(),
    ajax: (0, _emberServiceInject['default'])(),

    queryParams: {
      sortBy: { refreshModel: true },
      sortDescending: { refreshModel: true },
      assessment: { refreshModel: true },
      huddleId: { refreshModel: true },
      groupId: { refreshModel: true },
      name: { refreshModel: true }
    },

    huddle: null,

    beforeModel: function beforeModel(transition) {
      var _this = this;

      var huddleId = (0, _emberMetalGet['default'])(transition, 'queryParams.huddleId');
      if (huddleId) {
        return this.get('ajax').request('/Group/' + huddleId).then(function (response) {
          _this.set('huddle', (0, _emberOnFhirModelsHuddle.parseHuddles)(response));
        });
      }

      this.set('huddle', null);
    },

    model: function model(params) {
      var _this2 = this;

      var hash = {
        patients: this.get('store').query('patient', patientParams(params, this.get('huddle'))),
        huddles: this.get('ajax').request('/Group', { data: { code: 'http://interventionengine.org/fhir/cs/huddle|HUDDLE' } }).then(function (response) {
          return (0, _emberOnFhirModelsHuddle.parseHuddles)(response.entry || []);
        })
      };

      if (params.groupId) {
        hash.group = this.get('store').find('group', params.groupId);
      }

      return new RSVP.Promise(function (resolve) {
        RSVP.hash(hash).then(function (response) {
          var patientIds = response.patients.mapBy('id');
          var riskParams = {
            _count: patientIds.length,
            method: 'http://interventionengine.org/risk-assessments|' + methodFromAssessment(params.assessment),
            _tag: 'http://interventionengine.org/tags/|MOST_RECENT',
            'subject:Patient': patientIds.join(',')
          };

          _this2.get('store').query('risk-assessment', riskParams).then(function (risks) {
            resolve(Object.assign({ risks: risks }, response));
          });
        });
      });
    }
  });

  function patientParams(params, huddle) {
    var patientParams = { _count: 0 };
    var sortBy = params.sortBy;
    var sortDescending = params.sortDescending;

    if (!(0, _emberUtils.isEmpty)(sortBy)) {
      patientParams._sort = '' + (sortDescending === 'true' ? '-' : '') + sortBy;
    }

    var groupId = params.groupId;

    if (!(0, _emberUtils.isEmpty)(groupId)) {
      Object.assign(patientParams, {
        _query: 'group',
        groupId: groupId
      });
    }

    if (huddle) {
      var patientIds = huddle.get('patients').mapBy('patientId');
      patientParams._id = patientIds.join(',');
    }

    var name = params.name;

    if (name) {
      patientParams.name = name;
    }

    return patientParams;
  }

  // TODO: find a better way to fetch this value
  function methodFromAssessment(assessment) {
    if (assessment === 'Catastrophic Health Event') {
      return 'MultiFactor';
    }
  }
});
define('ember-on-fhir/routes/patients/show', ['exports', 'ember-route', 'ember-service/inject', 'ember-on-fhir/models/huddle'], function (exports, _emberRoute, _emberServiceInject, _emberOnFhirModelsHuddle) {
  exports['default'] = _emberRoute['default'].extend({
    store: (0, _emberServiceInject['default'])(),
    ajax: (0, _emberServiceInject['default'])(),

    model: function model(params /*, transition */) {
      return this.get('store').find('patient', params.id);
    },

    afterModel: function afterModel(model /*, transition */) {
      var _this = this;

      return this.get('ajax').request('/Group', {
        data: {
          code: 'http://interventionengine.org/fhir/cs/huddle|HUDDLE',
          member: 'Patient/' + model.get('id')
        }
      }).then(function (response) {
        var controller = _this.controllerFor('patients.show');
        controller.set('huddles', (0, _emberOnFhirModelsHuddle.parseHuddles)(response.entry || []));
      });
    }
  });
});
define('ember-on-fhir/routes/register', ['exports', 'ember-route', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _emberRoute, _emberSimpleAuthMixinsUnauthenticatedRouteMixin) {
  exports['default'] = _emberRoute['default'].extend(_emberSimpleAuthMixinsUnauthenticatedRouteMixin['default'], {
    resetController: function resetController(controller, isExiting) {
      if (isExiting) {
        controller.set('identification', null);
        controller.set('password', null);
        controller.set('passwordConfirmation', null);
        controller.set('displayErrors', false);
        controller.set('errorMessage', null);
        controller.set('disableRegisterBtn', null);
      }
    }
  });
});
define('ember-on-fhir/serializers/account', ['exports', 'ember-fhir-adapter/serializers/account'], function (exports, _emberFhirAdapterSerializersAccount) {
  exports['default'] = _emberFhirAdapterSerializersAccount['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/address', ['exports', 'ember-fhir-adapter/serializers/address'], function (exports, _emberFhirAdapterSerializersAddress) {
  exports['default'] = _emberFhirAdapterSerializersAddress['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/allergy-intolerance-reaction-component', ['exports', 'ember-fhir-adapter/serializers/allergy-intolerance-reaction-component'], function (exports, _emberFhirAdapterSerializersAllergyIntoleranceReactionComponent) {
  exports['default'] = _emberFhirAdapterSerializersAllergyIntoleranceReactionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/allergy-intolerance', ['exports', 'ember-fhir-adapter/serializers/allergy-intolerance'], function (exports, _emberFhirAdapterSerializersAllergyIntolerance) {
  exports['default'] = _emberFhirAdapterSerializersAllergyIntolerance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/annotation', ['exports', 'ember-fhir-adapter/serializers/annotation'], function (exports, _emberFhirAdapterSerializersAnnotation) {
  exports['default'] = _emberFhirAdapterSerializersAnnotation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/application', ['exports', 'ember-fhir-adapter/serializers/application'], function (exports, _emberFhirAdapterSerializersApplication) {
  exports['default'] = _emberFhirAdapterSerializersApplication['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/appointment-participant-component', ['exports', 'ember-fhir-adapter/serializers/appointment-participant-component'], function (exports, _emberFhirAdapterSerializersAppointmentParticipantComponent) {
  exports['default'] = _emberFhirAdapterSerializersAppointmentParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/appointment-response', ['exports', 'ember-fhir-adapter/serializers/appointment-response'], function (exports, _emberFhirAdapterSerializersAppointmentResponse) {
  exports['default'] = _emberFhirAdapterSerializersAppointmentResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/appointment', ['exports', 'ember-fhir-adapter/serializers/appointment'], function (exports, _emberFhirAdapterSerializersAppointment) {
  exports['default'] = _emberFhirAdapterSerializersAppointment['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/attachment', ['exports', 'ember-fhir-adapter/serializers/attachment'], function (exports, _emberFhirAdapterSerializersAttachment) {
  exports['default'] = _emberFhirAdapterSerializersAttachment['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/audit-event-event-component', ['exports', 'ember-fhir-adapter/serializers/audit-event-event-component'], function (exports, _emberFhirAdapterSerializersAuditEventEventComponent) {
  exports['default'] = _emberFhirAdapterSerializersAuditEventEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/audit-event-object-component', ['exports', 'ember-fhir-adapter/serializers/audit-event-object-component'], function (exports, _emberFhirAdapterSerializersAuditEventObjectComponent) {
  exports['default'] = _emberFhirAdapterSerializersAuditEventObjectComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/audit-event-participant-component', ['exports', 'ember-fhir-adapter/serializers/audit-event-participant-component'], function (exports, _emberFhirAdapterSerializersAuditEventParticipantComponent) {
  exports['default'] = _emberFhirAdapterSerializersAuditEventParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/audit-event-source-component', ['exports', 'ember-fhir-adapter/serializers/audit-event-source-component'], function (exports, _emberFhirAdapterSerializersAuditEventSourceComponent) {
  exports['default'] = _emberFhirAdapterSerializersAuditEventSourceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/audit-event', ['exports', 'ember-fhir-adapter/serializers/audit-event'], function (exports, _emberFhirAdapterSerializersAuditEvent) {
  exports['default'] = _emberFhirAdapterSerializersAuditEvent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/backbone-element', ['exports', 'ember-fhir-adapter/serializers/backbone-element'], function (exports, _emberFhirAdapterSerializersBackboneElement) {
  exports['default'] = _emberFhirAdapterSerializersBackboneElement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/basic', ['exports', 'ember-fhir-adapter/serializers/basic'], function (exports, _emberFhirAdapterSerializersBasic) {
  exports['default'] = _emberFhirAdapterSerializersBasic['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/binary', ['exports', 'ember-fhir-adapter/serializers/binary'], function (exports, _emberFhirAdapterSerializersBinary) {
  exports['default'] = _emberFhirAdapterSerializersBinary['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/body-site', ['exports', 'ember-fhir-adapter/serializers/body-site'], function (exports, _emberFhirAdapterSerializersBodySite) {
  exports['default'] = _emberFhirAdapterSerializersBodySite['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/bundle-entry-component', ['exports', 'ember-fhir-adapter/serializers/bundle-entry-component'], function (exports, _emberFhirAdapterSerializersBundleEntryComponent) {
  exports['default'] = _emberFhirAdapterSerializersBundleEntryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/bundle-link-component', ['exports', 'ember-fhir-adapter/serializers/bundle-link-component'], function (exports, _emberFhirAdapterSerializersBundleLinkComponent) {
  exports['default'] = _emberFhirAdapterSerializersBundleLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/bundle', ['exports', 'ember-fhir-adapter/serializers/bundle'], function (exports, _emberFhirAdapterSerializersBundle) {
  exports['default'] = _emberFhirAdapterSerializersBundle['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/care-plan-activity-component', ['exports', 'ember-fhir-adapter/serializers/care-plan-activity-component'], function (exports, _emberFhirAdapterSerializersCarePlanActivityComponent) {
  exports['default'] = _emberFhirAdapterSerializersCarePlanActivityComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/care-plan-participant-component', ['exports', 'ember-fhir-adapter/serializers/care-plan-participant-component'], function (exports, _emberFhirAdapterSerializersCarePlanParticipantComponent) {
  exports['default'] = _emberFhirAdapterSerializersCarePlanParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/care-plan-related-plan-component', ['exports', 'ember-fhir-adapter/serializers/care-plan-related-plan-component'], function (exports, _emberFhirAdapterSerializersCarePlanRelatedPlanComponent) {
  exports['default'] = _emberFhirAdapterSerializersCarePlanRelatedPlanComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/care-plan', ['exports', 'ember-fhir-adapter/serializers/care-plan'], function (exports, _emberFhirAdapterSerializersCarePlan) {
  exports['default'] = _emberFhirAdapterSerializersCarePlan['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-coverage-component', ['exports', 'ember-fhir-adapter/serializers/claim-coverage-component'], function (exports, _emberFhirAdapterSerializersClaimCoverageComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimCoverageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-diagnosis-component', ['exports', 'ember-fhir-adapter/serializers/claim-diagnosis-component'], function (exports, _emberFhirAdapterSerializersClaimDiagnosisComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimDiagnosisComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-items-component', ['exports', 'ember-fhir-adapter/serializers/claim-items-component'], function (exports, _emberFhirAdapterSerializersClaimItemsComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimItemsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-missing-teeth-component', ['exports', 'ember-fhir-adapter/serializers/claim-missing-teeth-component'], function (exports, _emberFhirAdapterSerializersClaimMissingTeethComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimMissingTeethComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-payee-component', ['exports', 'ember-fhir-adapter/serializers/claim-payee-component'], function (exports, _emberFhirAdapterSerializersClaimPayeeComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimPayeeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-response-added-item-component', ['exports', 'ember-fhir-adapter/serializers/claim-response-added-item-component'], function (exports, _emberFhirAdapterSerializersClaimResponseAddedItemComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimResponseAddedItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-response-coverage-component', ['exports', 'ember-fhir-adapter/serializers/claim-response-coverage-component'], function (exports, _emberFhirAdapterSerializersClaimResponseCoverageComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimResponseCoverageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-response-errors-component', ['exports', 'ember-fhir-adapter/serializers/claim-response-errors-component'], function (exports, _emberFhirAdapterSerializersClaimResponseErrorsComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimResponseErrorsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-response-items-component', ['exports', 'ember-fhir-adapter/serializers/claim-response-items-component'], function (exports, _emberFhirAdapterSerializersClaimResponseItemsComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimResponseItemsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-response-notes-component', ['exports', 'ember-fhir-adapter/serializers/claim-response-notes-component'], function (exports, _emberFhirAdapterSerializersClaimResponseNotesComponent) {
  exports['default'] = _emberFhirAdapterSerializersClaimResponseNotesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim-response', ['exports', 'ember-fhir-adapter/serializers/claim-response'], function (exports, _emberFhirAdapterSerializersClaimResponse) {
  exports['default'] = _emberFhirAdapterSerializersClaimResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/claim', ['exports', 'ember-fhir-adapter/serializers/claim'], function (exports, _emberFhirAdapterSerializersClaim) {
  exports['default'] = _emberFhirAdapterSerializersClaim['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/clinical-impression-finding-component', ['exports', 'ember-fhir-adapter/serializers/clinical-impression-finding-component'], function (exports, _emberFhirAdapterSerializersClinicalImpressionFindingComponent) {
  exports['default'] = _emberFhirAdapterSerializersClinicalImpressionFindingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/clinical-impression-investigations-component', ['exports', 'ember-fhir-adapter/serializers/clinical-impression-investigations-component'], function (exports, _emberFhirAdapterSerializersClinicalImpressionInvestigationsComponent) {
  exports['default'] = _emberFhirAdapterSerializersClinicalImpressionInvestigationsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/clinical-impression-ruled-out-component', ['exports', 'ember-fhir-adapter/serializers/clinical-impression-ruled-out-component'], function (exports, _emberFhirAdapterSerializersClinicalImpressionRuledOutComponent) {
  exports['default'] = _emberFhirAdapterSerializersClinicalImpressionRuledOutComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/clinical-impression', ['exports', 'ember-fhir-adapter/serializers/clinical-impression'], function (exports, _emberFhirAdapterSerializersClinicalImpression) {
  exports['default'] = _emberFhirAdapterSerializersClinicalImpression['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/codeable-concept', ['exports', 'ember-fhir-adapter/serializers/codeable-concept'], function (exports, _emberFhirAdapterSerializersCodeableConcept) {
  exports['default'] = _emberFhirAdapterSerializersCodeableConcept['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/coding', ['exports', 'ember-fhir-adapter/serializers/coding'], function (exports, _emberFhirAdapterSerializersCoding) {
  exports['default'] = _emberFhirAdapterSerializersCoding['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/communication-payload-component', ['exports', 'ember-fhir-adapter/serializers/communication-payload-component'], function (exports, _emberFhirAdapterSerializersCommunicationPayloadComponent) {
  exports['default'] = _emberFhirAdapterSerializersCommunicationPayloadComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/communication-request-payload-component', ['exports', 'ember-fhir-adapter/serializers/communication-request-payload-component'], function (exports, _emberFhirAdapterSerializersCommunicationRequestPayloadComponent) {
  exports['default'] = _emberFhirAdapterSerializersCommunicationRequestPayloadComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/communication-request', ['exports', 'ember-fhir-adapter/serializers/communication-request'], function (exports, _emberFhirAdapterSerializersCommunicationRequest) {
  exports['default'] = _emberFhirAdapterSerializersCommunicationRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/communication', ['exports', 'ember-fhir-adapter/serializers/communication'], function (exports, _emberFhirAdapterSerializersCommunication) {
  exports['default'] = _emberFhirAdapterSerializersCommunication['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/composition-attester-component', ['exports', 'ember-fhir-adapter/serializers/composition-attester-component'], function (exports, _emberFhirAdapterSerializersCompositionAttesterComponent) {
  exports['default'] = _emberFhirAdapterSerializersCompositionAttesterComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/composition-event-component', ['exports', 'ember-fhir-adapter/serializers/composition-event-component'], function (exports, _emberFhirAdapterSerializersCompositionEventComponent) {
  exports['default'] = _emberFhirAdapterSerializersCompositionEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/composition-section-component', ['exports', 'ember-fhir-adapter/serializers/composition-section-component'], function (exports, _emberFhirAdapterSerializersCompositionSectionComponent) {
  exports['default'] = _emberFhirAdapterSerializersCompositionSectionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/composition', ['exports', 'ember-fhir-adapter/serializers/composition'], function (exports, _emberFhirAdapterSerializersComposition) {
  exports['default'] = _emberFhirAdapterSerializersComposition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/concept-map-contact-component', ['exports', 'ember-fhir-adapter/serializers/concept-map-contact-component'], function (exports, _emberFhirAdapterSerializersConceptMapContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersConceptMapContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/concept-map-source-element-component', ['exports', 'ember-fhir-adapter/serializers/concept-map-source-element-component'], function (exports, _emberFhirAdapterSerializersConceptMapSourceElementComponent) {
  exports['default'] = _emberFhirAdapterSerializersConceptMapSourceElementComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/concept-map', ['exports', 'ember-fhir-adapter/serializers/concept-map'], function (exports, _emberFhirAdapterSerializersConceptMap) {
  exports['default'] = _emberFhirAdapterSerializersConceptMap['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/condition-evidence-component', ['exports', 'ember-fhir-adapter/serializers/condition-evidence-component'], function (exports, _emberFhirAdapterSerializersConditionEvidenceComponent) {
  exports['default'] = _emberFhirAdapterSerializersConditionEvidenceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/condition-stage-component', ['exports', 'ember-fhir-adapter/serializers/condition-stage-component'], function (exports, _emberFhirAdapterSerializersConditionStageComponent) {
  exports['default'] = _emberFhirAdapterSerializersConditionStageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/condition', ['exports', 'ember-fhir-adapter/serializers/condition'], function (exports, _emberFhirAdapterSerializersCondition) {
  exports['default'] = _emberFhirAdapterSerializersCondition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance-contact-component', ['exports', 'ember-fhir-adapter/serializers/conformance-contact-component'], function (exports, _emberFhirAdapterSerializersConformanceContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersConformanceContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance-document-component', ['exports', 'ember-fhir-adapter/serializers/conformance-document-component'], function (exports, _emberFhirAdapterSerializersConformanceDocumentComponent) {
  exports['default'] = _emberFhirAdapterSerializersConformanceDocumentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance-implementation-component', ['exports', 'ember-fhir-adapter/serializers/conformance-implementation-component'], function (exports, _emberFhirAdapterSerializersConformanceImplementationComponent) {
  exports['default'] = _emberFhirAdapterSerializersConformanceImplementationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance-messaging-component', ['exports', 'ember-fhir-adapter/serializers/conformance-messaging-component'], function (exports, _emberFhirAdapterSerializersConformanceMessagingComponent) {
  exports['default'] = _emberFhirAdapterSerializersConformanceMessagingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance-rest-component', ['exports', 'ember-fhir-adapter/serializers/conformance-rest-component'], function (exports, _emberFhirAdapterSerializersConformanceRestComponent) {
  exports['default'] = _emberFhirAdapterSerializersConformanceRestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance-software-component', ['exports', 'ember-fhir-adapter/serializers/conformance-software-component'], function (exports, _emberFhirAdapterSerializersConformanceSoftwareComponent) {
  exports['default'] = _emberFhirAdapterSerializersConformanceSoftwareComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/conformance', ['exports', 'ember-fhir-adapter/serializers/conformance'], function (exports, _emberFhirAdapterSerializersConformance) {
  exports['default'] = _emberFhirAdapterSerializersConformance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contact-point', ['exports', 'ember-fhir-adapter/serializers/contact-point'], function (exports, _emberFhirAdapterSerializersContactPoint) {
  exports['default'] = _emberFhirAdapterSerializersContactPoint['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-actor-component', ['exports', 'ember-fhir-adapter/serializers/contract-actor-component'], function (exports, _emberFhirAdapterSerializersContractActorComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractActorComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-computable-language-component', ['exports', 'ember-fhir-adapter/serializers/contract-computable-language-component'], function (exports, _emberFhirAdapterSerializersContractComputableLanguageComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractComputableLanguageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-friendly-language-component', ['exports', 'ember-fhir-adapter/serializers/contract-friendly-language-component'], function (exports, _emberFhirAdapterSerializersContractFriendlyLanguageComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractFriendlyLanguageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-legal-language-component', ['exports', 'ember-fhir-adapter/serializers/contract-legal-language-component'], function (exports, _emberFhirAdapterSerializersContractLegalLanguageComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractLegalLanguageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-signatory-component', ['exports', 'ember-fhir-adapter/serializers/contract-signatory-component'], function (exports, _emberFhirAdapterSerializersContractSignatoryComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractSignatoryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-term-component', ['exports', 'ember-fhir-adapter/serializers/contract-term-component'], function (exports, _emberFhirAdapterSerializersContractTermComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractTermComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract-valued-item-component', ['exports', 'ember-fhir-adapter/serializers/contract-valued-item-component'], function (exports, _emberFhirAdapterSerializersContractValuedItemComponent) {
  exports['default'] = _emberFhirAdapterSerializersContractValuedItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/contract', ['exports', 'ember-fhir-adapter/serializers/contract'], function (exports, _emberFhirAdapterSerializersContract) {
  exports['default'] = _emberFhirAdapterSerializersContract['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/coverage', ['exports', 'ember-fhir-adapter/serializers/coverage'], function (exports, _emberFhirAdapterSerializersCoverage) {
  exports['default'] = _emberFhirAdapterSerializersCoverage['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/data-element-contact-component', ['exports', 'ember-fhir-adapter/serializers/data-element-contact-component'], function (exports, _emberFhirAdapterSerializersDataElementContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersDataElementContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/data-element-mapping-component', ['exports', 'ember-fhir-adapter/serializers/data-element-mapping-component'], function (exports, _emberFhirAdapterSerializersDataElementMappingComponent) {
  exports['default'] = _emberFhirAdapterSerializersDataElementMappingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/data-element', ['exports', 'ember-fhir-adapter/serializers/data-element'], function (exports, _emberFhirAdapterSerializersDataElement) {
  exports['default'] = _emberFhirAdapterSerializersDataElement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/detected-issue-mitigation-component', ['exports', 'ember-fhir-adapter/serializers/detected-issue-mitigation-component'], function (exports, _emberFhirAdapterSerializersDetectedIssueMitigationComponent) {
  exports['default'] = _emberFhirAdapterSerializersDetectedIssueMitigationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/detected-issue', ['exports', 'ember-fhir-adapter/serializers/detected-issue'], function (exports, _emberFhirAdapterSerializersDetectedIssue) {
  exports['default'] = _emberFhirAdapterSerializersDetectedIssue['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device-component-production-specification-component', ['exports', 'ember-fhir-adapter/serializers/device-component-production-specification-component'], function (exports, _emberFhirAdapterSerializersDeviceComponentProductionSpecificationComponent) {
  exports['default'] = _emberFhirAdapterSerializersDeviceComponentProductionSpecificationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device-component', ['exports', 'ember-fhir-adapter/serializers/device-component'], function (exports, _emberFhirAdapterSerializersDeviceComponent) {
  exports['default'] = _emberFhirAdapterSerializersDeviceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device-metric-calibration-component', ['exports', 'ember-fhir-adapter/serializers/device-metric-calibration-component'], function (exports, _emberFhirAdapterSerializersDeviceMetricCalibrationComponent) {
  exports['default'] = _emberFhirAdapterSerializersDeviceMetricCalibrationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device-metric', ['exports', 'ember-fhir-adapter/serializers/device-metric'], function (exports, _emberFhirAdapterSerializersDeviceMetric) {
  exports['default'] = _emberFhirAdapterSerializersDeviceMetric['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device-use-request', ['exports', 'ember-fhir-adapter/serializers/device-use-request'], function (exports, _emberFhirAdapterSerializersDeviceUseRequest) {
  exports['default'] = _emberFhirAdapterSerializersDeviceUseRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device-use-statement', ['exports', 'ember-fhir-adapter/serializers/device-use-statement'], function (exports, _emberFhirAdapterSerializersDeviceUseStatement) {
  exports['default'] = _emberFhirAdapterSerializersDeviceUseStatement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/device', ['exports', 'ember-fhir-adapter/serializers/device'], function (exports, _emberFhirAdapterSerializersDevice) {
  exports['default'] = _emberFhirAdapterSerializersDevice['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/diagnostic-order-event-component', ['exports', 'ember-fhir-adapter/serializers/diagnostic-order-event-component'], function (exports, _emberFhirAdapterSerializersDiagnosticOrderEventComponent) {
  exports['default'] = _emberFhirAdapterSerializersDiagnosticOrderEventComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/diagnostic-order-item-component', ['exports', 'ember-fhir-adapter/serializers/diagnostic-order-item-component'], function (exports, _emberFhirAdapterSerializersDiagnosticOrderItemComponent) {
  exports['default'] = _emberFhirAdapterSerializersDiagnosticOrderItemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/diagnostic-order', ['exports', 'ember-fhir-adapter/serializers/diagnostic-order'], function (exports, _emberFhirAdapterSerializersDiagnosticOrder) {
  exports['default'] = _emberFhirAdapterSerializersDiagnosticOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/diagnostic-report-image-component', ['exports', 'ember-fhir-adapter/serializers/diagnostic-report-image-component'], function (exports, _emberFhirAdapterSerializersDiagnosticReportImageComponent) {
  exports['default'] = _emberFhirAdapterSerializersDiagnosticReportImageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/diagnostic-report', ['exports', 'ember-fhir-adapter/serializers/diagnostic-report'], function (exports, _emberFhirAdapterSerializersDiagnosticReport) {
  exports['default'] = _emberFhirAdapterSerializersDiagnosticReport['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-manifest-content-component', ['exports', 'ember-fhir-adapter/serializers/document-manifest-content-component'], function (exports, _emberFhirAdapterSerializersDocumentManifestContentComponent) {
  exports['default'] = _emberFhirAdapterSerializersDocumentManifestContentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-manifest-related-component', ['exports', 'ember-fhir-adapter/serializers/document-manifest-related-component'], function (exports, _emberFhirAdapterSerializersDocumentManifestRelatedComponent) {
  exports['default'] = _emberFhirAdapterSerializersDocumentManifestRelatedComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-manifest', ['exports', 'ember-fhir-adapter/serializers/document-manifest'], function (exports, _emberFhirAdapterSerializersDocumentManifest) {
  exports['default'] = _emberFhirAdapterSerializersDocumentManifest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-reference-content-component', ['exports', 'ember-fhir-adapter/serializers/document-reference-content-component'], function (exports, _emberFhirAdapterSerializersDocumentReferenceContentComponent) {
  exports['default'] = _emberFhirAdapterSerializersDocumentReferenceContentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-reference-context-component', ['exports', 'ember-fhir-adapter/serializers/document-reference-context-component'], function (exports, _emberFhirAdapterSerializersDocumentReferenceContextComponent) {
  exports['default'] = _emberFhirAdapterSerializersDocumentReferenceContextComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-reference-relates-to-component', ['exports', 'ember-fhir-adapter/serializers/document-reference-relates-to-component'], function (exports, _emberFhirAdapterSerializersDocumentReferenceRelatesToComponent) {
  exports['default'] = _emberFhirAdapterSerializersDocumentReferenceRelatesToComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/document-reference', ['exports', 'ember-fhir-adapter/serializers/document-reference'], function (exports, _emberFhirAdapterSerializersDocumentReference) {
  exports['default'] = _emberFhirAdapterSerializersDocumentReference['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition-base-component', ['exports', 'ember-fhir-adapter/serializers/element-definition-base-component'], function (exports, _emberFhirAdapterSerializersElementDefinitionBaseComponent) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinitionBaseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition-binding-component', ['exports', 'ember-fhir-adapter/serializers/element-definition-binding-component'], function (exports, _emberFhirAdapterSerializersElementDefinitionBindingComponent) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinitionBindingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition-constraint-component', ['exports', 'ember-fhir-adapter/serializers/element-definition-constraint-component'], function (exports, _emberFhirAdapterSerializersElementDefinitionConstraintComponent) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinitionConstraintComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition-mapping-component', ['exports', 'ember-fhir-adapter/serializers/element-definition-mapping-component'], function (exports, _emberFhirAdapterSerializersElementDefinitionMappingComponent) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinitionMappingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition-slicing-component', ['exports', 'ember-fhir-adapter/serializers/element-definition-slicing-component'], function (exports, _emberFhirAdapterSerializersElementDefinitionSlicingComponent) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinitionSlicingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition-type-ref-component', ['exports', 'ember-fhir-adapter/serializers/element-definition-type-ref-component'], function (exports, _emberFhirAdapterSerializersElementDefinitionTypeRefComponent) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinitionTypeRefComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/element-definition', ['exports', 'ember-fhir-adapter/serializers/element-definition'], function (exports, _emberFhirAdapterSerializersElementDefinition) {
  exports['default'] = _emberFhirAdapterSerializersElementDefinition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/eligibility-request', ['exports', 'ember-fhir-adapter/serializers/eligibility-request'], function (exports, _emberFhirAdapterSerializersEligibilityRequest) {
  exports['default'] = _emberFhirAdapterSerializersEligibilityRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/eligibility-response', ['exports', 'ember-fhir-adapter/serializers/eligibility-response'], function (exports, _emberFhirAdapterSerializersEligibilityResponse) {
  exports['default'] = _emberFhirAdapterSerializersEligibilityResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/encounter-hospitalization-component', ['exports', 'ember-fhir-adapter/serializers/encounter-hospitalization-component'], function (exports, _emberFhirAdapterSerializersEncounterHospitalizationComponent) {
  exports['default'] = _emberFhirAdapterSerializersEncounterHospitalizationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/encounter-location-component', ['exports', 'ember-fhir-adapter/serializers/encounter-location-component'], function (exports, _emberFhirAdapterSerializersEncounterLocationComponent) {
  exports['default'] = _emberFhirAdapterSerializersEncounterLocationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/encounter-participant-component', ['exports', 'ember-fhir-adapter/serializers/encounter-participant-component'], function (exports, _emberFhirAdapterSerializersEncounterParticipantComponent) {
  exports['default'] = _emberFhirAdapterSerializersEncounterParticipantComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/encounter-status-history-component', ['exports', 'ember-fhir-adapter/serializers/encounter-status-history-component'], function (exports, _emberFhirAdapterSerializersEncounterStatusHistoryComponent) {
  exports['default'] = _emberFhirAdapterSerializersEncounterStatusHistoryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/encounter', ['exports', 'ember-fhir-adapter/serializers/application'], function (exports, _emberFhirAdapterSerializersApplication) {
  exports['default'] = _emberFhirAdapterSerializersApplication['default'].extend({
    attrs: {
      identifier: { embedded: 'always' },
      statusHistory: { embedded: 'always' },
      type: { embedded: 'always' },
      patient: { embedded: 'always' },
      episodeOfCare: { embedded: 'always' },
      incomingReferralRequest: { embedded: 'always' },
      participant: { embedded: 'always' },
      fulfills: { embedded: 'always' },
      period: { embedded: 'always' },
      // 'length': { embedded: 'always' }, // This is commented out because we don't currently use it and it causes things to break see Issue https://github.com/emberjs/ember.js/issues/12094
      reason: { embedded: 'always' },
      indication: { embedded: 'always' },
      priority: { embedded: 'always' },
      hospitalization: { embedded: 'always' },
      location: { embedded: 'always' },
      serviceProvider: { embedded: 'always' },
      partOf: { embedded: 'always' }
    }
  });
});
define('ember-on-fhir/serializers/enrollment-request', ['exports', 'ember-fhir-adapter/serializers/enrollment-request'], function (exports, _emberFhirAdapterSerializersEnrollmentRequest) {
  exports['default'] = _emberFhirAdapterSerializersEnrollmentRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/enrollment-response', ['exports', 'ember-fhir-adapter/serializers/enrollment-response'], function (exports, _emberFhirAdapterSerializersEnrollmentResponse) {
  exports['default'] = _emberFhirAdapterSerializersEnrollmentResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/episode-of-care-care-team-component', ['exports', 'ember-fhir-adapter/serializers/episode-of-care-care-team-component'], function (exports, _emberFhirAdapterSerializersEpisodeOfCareCareTeamComponent) {
  exports['default'] = _emberFhirAdapterSerializersEpisodeOfCareCareTeamComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/episode-of-care-status-history-component', ['exports', 'ember-fhir-adapter/serializers/episode-of-care-status-history-component'], function (exports, _emberFhirAdapterSerializersEpisodeOfCareStatusHistoryComponent) {
  exports['default'] = _emberFhirAdapterSerializersEpisodeOfCareStatusHistoryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/episode-of-care', ['exports', 'ember-fhir-adapter/serializers/episode-of-care'], function (exports, _emberFhirAdapterSerializersEpisodeOfCare) {
  exports['default'] = _emberFhirAdapterSerializersEpisodeOfCare['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/explanation-of-benefit', ['exports', 'ember-fhir-adapter/serializers/explanation-of-benefit'], function (exports, _emberFhirAdapterSerializersExplanationOfBenefit) {
  exports['default'] = _emberFhirAdapterSerializersExplanationOfBenefit['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/extension', ['exports', 'ember-fhir-adapter/serializers/extension'], function (exports, _emberFhirAdapterSerializersExtension) {
  exports['default'] = _emberFhirAdapterSerializersExtension['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/family-member-history-condition-component', ['exports', 'ember-fhir-adapter/serializers/family-member-history-condition-component'], function (exports, _emberFhirAdapterSerializersFamilyMemberHistoryConditionComponent) {
  exports['default'] = _emberFhirAdapterSerializersFamilyMemberHistoryConditionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/family-member-history', ['exports', 'ember-fhir-adapter/serializers/family-member-history'], function (exports, _emberFhirAdapterSerializersFamilyMemberHistory) {
  exports['default'] = _emberFhirAdapterSerializersFamilyMemberHistory['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/flag', ['exports', 'ember-fhir-adapter/serializers/flag'], function (exports, _emberFhirAdapterSerializersFlag) {
  exports['default'] = _emberFhirAdapterSerializersFlag['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/goal-outcome-component', ['exports', 'ember-fhir-adapter/serializers/goal-outcome-component'], function (exports, _emberFhirAdapterSerializersGoalOutcomeComponent) {
  exports['default'] = _emberFhirAdapterSerializersGoalOutcomeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/goal', ['exports', 'ember-fhir-adapter/serializers/goal'], function (exports, _emberFhirAdapterSerializersGoal) {
  exports['default'] = _emberFhirAdapterSerializersGoal['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/group-characteristic-component', ['exports', 'ember-fhir-adapter/serializers/group-characteristic-component'], function (exports, _emberFhirAdapterSerializersGroupCharacteristicComponent) {
  exports['default'] = _emberFhirAdapterSerializersGroupCharacteristicComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/group-member-component', ['exports', 'ember-fhir-adapter/serializers/group-member-component'], function (exports, _emberFhirAdapterSerializersGroupMemberComponent) {
  exports['default'] = _emberFhirAdapterSerializersGroupMemberComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/group', ['exports', 'ember-fhir-adapter/serializers/group'], function (exports, _emberFhirAdapterSerializersGroup) {
  exports['default'] = _emberFhirAdapterSerializersGroup['default'].extend({
    normalize: function normalize(type, hash) {
      (hash.content || hash).links = {
        groupList: '/GroupList/' + hash.id
      };
      hash.type = hash.type || 'unknown';
      return this._super.apply(this, arguments);
    }
  });
});
define('ember-on-fhir/serializers/healthcare-service-available-time-component', ['exports', 'ember-fhir-adapter/serializers/healthcare-service-available-time-component'], function (exports, _emberFhirAdapterSerializersHealthcareServiceAvailableTimeComponent) {
  exports['default'] = _emberFhirAdapterSerializersHealthcareServiceAvailableTimeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/healthcare-service-not-available-component', ['exports', 'ember-fhir-adapter/serializers/healthcare-service-not-available-component'], function (exports, _emberFhirAdapterSerializersHealthcareServiceNotAvailableComponent) {
  exports['default'] = _emberFhirAdapterSerializersHealthcareServiceNotAvailableComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/healthcare-service-service-type-component', ['exports', 'ember-fhir-adapter/serializers/healthcare-service-service-type-component'], function (exports, _emberFhirAdapterSerializersHealthcareServiceServiceTypeComponent) {
  exports['default'] = _emberFhirAdapterSerializersHealthcareServiceServiceTypeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/healthcare-service', ['exports', 'ember-fhir-adapter/serializers/healthcare-service'], function (exports, _emberFhirAdapterSerializersHealthcareService) {
  exports['default'] = _emberFhirAdapterSerializersHealthcareService['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/human-name', ['exports', 'ember-fhir-adapter/serializers/human-name'], function (exports, _emberFhirAdapterSerializersHumanName) {
  exports['default'] = _emberFhirAdapterSerializersHumanName['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/identifier', ['exports', 'ember-fhir-adapter/serializers/identifier'], function (exports, _emberFhirAdapterSerializersIdentifier) {
  exports['default'] = _emberFhirAdapterSerializersIdentifier['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/imaging-object-selection-study-component', ['exports', 'ember-fhir-adapter/serializers/imaging-object-selection-study-component'], function (exports, _emberFhirAdapterSerializersImagingObjectSelectionStudyComponent) {
  exports['default'] = _emberFhirAdapterSerializersImagingObjectSelectionStudyComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/imaging-object-selection', ['exports', 'ember-fhir-adapter/serializers/imaging-object-selection'], function (exports, _emberFhirAdapterSerializersImagingObjectSelection) {
  exports['default'] = _emberFhirAdapterSerializersImagingObjectSelection['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/imaging-study-series-component', ['exports', 'ember-fhir-adapter/serializers/imaging-study-series-component'], function (exports, _emberFhirAdapterSerializersImagingStudySeriesComponent) {
  exports['default'] = _emberFhirAdapterSerializersImagingStudySeriesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/imaging-study', ['exports', 'ember-fhir-adapter/serializers/imaging-study'], function (exports, _emberFhirAdapterSerializersImagingStudy) {
  exports['default'] = _emberFhirAdapterSerializersImagingStudy['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/immunization-explanation-component', ['exports', 'ember-fhir-adapter/serializers/immunization-explanation-component'], function (exports, _emberFhirAdapterSerializersImmunizationExplanationComponent) {
  exports['default'] = _emberFhirAdapterSerializersImmunizationExplanationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/immunization-reaction-component', ['exports', 'ember-fhir-adapter/serializers/immunization-reaction-component'], function (exports, _emberFhirAdapterSerializersImmunizationReactionComponent) {
  exports['default'] = _emberFhirAdapterSerializersImmunizationReactionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/immunization-recommendation-recommendation-component', ['exports', 'ember-fhir-adapter/serializers/immunization-recommendation-recommendation-component'], function (exports, _emberFhirAdapterSerializersImmunizationRecommendationRecommendationComponent) {
  exports['default'] = _emberFhirAdapterSerializersImmunizationRecommendationRecommendationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/immunization-recommendation', ['exports', 'ember-fhir-adapter/serializers/immunization-recommendation'], function (exports, _emberFhirAdapterSerializersImmunizationRecommendation) {
  exports['default'] = _emberFhirAdapterSerializersImmunizationRecommendation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/immunization-vaccination-protocol-component', ['exports', 'ember-fhir-adapter/serializers/immunization-vaccination-protocol-component'], function (exports, _emberFhirAdapterSerializersImmunizationVaccinationProtocolComponent) {
  exports['default'] = _emberFhirAdapterSerializersImmunizationVaccinationProtocolComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/immunization', ['exports', 'ember-fhir-adapter/serializers/immunization'], function (exports, _emberFhirAdapterSerializersImmunization) {
  exports['default'] = _emberFhirAdapterSerializersImmunization['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/implementation-guide-contact-component', ['exports', 'ember-fhir-adapter/serializers/implementation-guide-contact-component'], function (exports, _emberFhirAdapterSerializersImplementationGuideContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersImplementationGuideContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/implementation-guide-dependency-component', ['exports', 'ember-fhir-adapter/serializers/implementation-guide-dependency-component'], function (exports, _emberFhirAdapterSerializersImplementationGuideDependencyComponent) {
  exports['default'] = _emberFhirAdapterSerializersImplementationGuideDependencyComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/implementation-guide-global-component', ['exports', 'ember-fhir-adapter/serializers/implementation-guide-global-component'], function (exports, _emberFhirAdapterSerializersImplementationGuideGlobalComponent) {
  exports['default'] = _emberFhirAdapterSerializersImplementationGuideGlobalComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/implementation-guide-package-component', ['exports', 'ember-fhir-adapter/serializers/implementation-guide-package-component'], function (exports, _emberFhirAdapterSerializersImplementationGuidePackageComponent) {
  exports['default'] = _emberFhirAdapterSerializersImplementationGuidePackageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/implementation-guide-page-component', ['exports', 'ember-fhir-adapter/serializers/implementation-guide-page-component'], function (exports, _emberFhirAdapterSerializersImplementationGuidePageComponent) {
  exports['default'] = _emberFhirAdapterSerializersImplementationGuidePageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/implementation-guide', ['exports', 'ember-fhir-adapter/serializers/implementation-guide'], function (exports, _emberFhirAdapterSerializersImplementationGuide) {
  exports['default'] = _emberFhirAdapterSerializersImplementationGuide['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/list-entry-component', ['exports', 'ember-fhir-adapter/serializers/list-entry-component'], function (exports, _emberFhirAdapterSerializersListEntryComponent) {
  exports['default'] = _emberFhirAdapterSerializersListEntryComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/list', ['exports', 'ember-fhir-adapter/serializers/list'], function (exports, _emberFhirAdapterSerializersList) {
  exports['default'] = _emberFhirAdapterSerializersList['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/location-position-component', ['exports', 'ember-fhir-adapter/serializers/location-position-component'], function (exports, _emberFhirAdapterSerializersLocationPositionComponent) {
  exports['default'] = _emberFhirAdapterSerializersLocationPositionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/location', ['exports', 'ember-fhir-adapter/serializers/location'], function (exports, _emberFhirAdapterSerializersLocation) {
  exports['default'] = _emberFhirAdapterSerializersLocation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/media', ['exports', 'ember-fhir-adapter/serializers/media'], function (exports, _emberFhirAdapterSerializersMedia) {
  exports['default'] = _emberFhirAdapterSerializersMedia['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-administration-dosage-component', ['exports', 'ember-fhir-adapter/serializers/medication-administration-dosage-component'], function (exports, _emberFhirAdapterSerializersMedicationAdministrationDosageComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationAdministrationDosageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-administration', ['exports', 'ember-fhir-adapter/serializers/medication-administration'], function (exports, _emberFhirAdapterSerializersMedicationAdministration) {
  exports['default'] = _emberFhirAdapterSerializersMedicationAdministration['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-dispense-dosage-instruction-component', ['exports', 'ember-fhir-adapter/serializers/medication-dispense-dosage-instruction-component'], function (exports, _emberFhirAdapterSerializersMedicationDispenseDosageInstructionComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationDispenseDosageInstructionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-dispense-substitution-component', ['exports', 'ember-fhir-adapter/serializers/medication-dispense-substitution-component'], function (exports, _emberFhirAdapterSerializersMedicationDispenseSubstitutionComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationDispenseSubstitutionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-dispense', ['exports', 'ember-fhir-adapter/serializers/medication-dispense'], function (exports, _emberFhirAdapterSerializersMedicationDispense) {
  exports['default'] = _emberFhirAdapterSerializersMedicationDispense['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-order-dispense-request-component', ['exports', 'ember-fhir-adapter/serializers/medication-order-dispense-request-component'], function (exports, _emberFhirAdapterSerializersMedicationOrderDispenseRequestComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationOrderDispenseRequestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-order-dosage-instruction-component', ['exports', 'ember-fhir-adapter/serializers/medication-order-dosage-instruction-component'], function (exports, _emberFhirAdapterSerializersMedicationOrderDosageInstructionComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationOrderDosageInstructionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-order-substitution-component', ['exports', 'ember-fhir-adapter/serializers/medication-order-substitution-component'], function (exports, _emberFhirAdapterSerializersMedicationOrderSubstitutionComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationOrderSubstitutionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-order', ['exports', 'ember-fhir-adapter/serializers/medication-order'], function (exports, _emberFhirAdapterSerializersMedicationOrder) {
  exports['default'] = _emberFhirAdapterSerializersMedicationOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-package-component', ['exports', 'ember-fhir-adapter/serializers/medication-package-component'], function (exports, _emberFhirAdapterSerializersMedicationPackageComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationPackageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-product-component', ['exports', 'ember-fhir-adapter/serializers/medication-product-component'], function (exports, _emberFhirAdapterSerializersMedicationProductComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationProductComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-statement-dosage-component', ['exports', 'ember-fhir-adapter/serializers/medication-statement-dosage-component'], function (exports, _emberFhirAdapterSerializersMedicationStatementDosageComponent) {
  exports['default'] = _emberFhirAdapterSerializersMedicationStatementDosageComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication-statement', ['exports', 'ember-fhir-adapter/serializers/medication-statement'], function (exports, _emberFhirAdapterSerializersMedicationStatement) {
  exports['default'] = _emberFhirAdapterSerializersMedicationStatement['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/medication', ['exports', 'ember-fhir-adapter/serializers/medication'], function (exports, _emberFhirAdapterSerializersMedication) {
  exports['default'] = _emberFhirAdapterSerializersMedication['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/message-header-message-destination-component', ['exports', 'ember-fhir-adapter/serializers/message-header-message-destination-component'], function (exports, _emberFhirAdapterSerializersMessageHeaderMessageDestinationComponent) {
  exports['default'] = _emberFhirAdapterSerializersMessageHeaderMessageDestinationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/message-header-message-source-component', ['exports', 'ember-fhir-adapter/serializers/message-header-message-source-component'], function (exports, _emberFhirAdapterSerializersMessageHeaderMessageSourceComponent) {
  exports['default'] = _emberFhirAdapterSerializersMessageHeaderMessageSourceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/message-header-response-component', ['exports', 'ember-fhir-adapter/serializers/message-header-response-component'], function (exports, _emberFhirAdapterSerializersMessageHeaderResponseComponent) {
  exports['default'] = _emberFhirAdapterSerializersMessageHeaderResponseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/message-header', ['exports', 'ember-fhir-adapter/serializers/message-header'], function (exports, _emberFhirAdapterSerializersMessageHeader) {
  exports['default'] = _emberFhirAdapterSerializersMessageHeader['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/meta', ['exports', 'ember-fhir-adapter/serializers/meta'], function (exports, _emberFhirAdapterSerializersMeta) {
  exports['default'] = _emberFhirAdapterSerializersMeta['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/naming-system-contact-component', ['exports', 'ember-fhir-adapter/serializers/naming-system-contact-component'], function (exports, _emberFhirAdapterSerializersNamingSystemContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersNamingSystemContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/naming-system-unique-id-component', ['exports', 'ember-fhir-adapter/serializers/naming-system-unique-id-component'], function (exports, _emberFhirAdapterSerializersNamingSystemUniqueIdComponent) {
  exports['default'] = _emberFhirAdapterSerializersNamingSystemUniqueIdComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/naming-system', ['exports', 'ember-fhir-adapter/serializers/naming-system'], function (exports, _emberFhirAdapterSerializersNamingSystem) {
  exports['default'] = _emberFhirAdapterSerializersNamingSystem['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/narrative', ['exports', 'ember-fhir-adapter/serializers/narrative'], function (exports, _emberFhirAdapterSerializersNarrative) {
  exports['default'] = _emberFhirAdapterSerializersNarrative['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/nutrition-order-enteral-formula-component', ['exports', 'ember-fhir-adapter/serializers/nutrition-order-enteral-formula-component'], function (exports, _emberFhirAdapterSerializersNutritionOrderEnteralFormulaComponent) {
  exports['default'] = _emberFhirAdapterSerializersNutritionOrderEnteralFormulaComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/nutrition-order-oral-diet-component', ['exports', 'ember-fhir-adapter/serializers/nutrition-order-oral-diet-component'], function (exports, _emberFhirAdapterSerializersNutritionOrderOralDietComponent) {
  exports['default'] = _emberFhirAdapterSerializersNutritionOrderOralDietComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/nutrition-order-supplement-component', ['exports', 'ember-fhir-adapter/serializers/nutrition-order-supplement-component'], function (exports, _emberFhirAdapterSerializersNutritionOrderSupplementComponent) {
  exports['default'] = _emberFhirAdapterSerializersNutritionOrderSupplementComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/nutrition-order', ['exports', 'ember-fhir-adapter/serializers/nutrition-order'], function (exports, _emberFhirAdapterSerializersNutritionOrder) {
  exports['default'] = _emberFhirAdapterSerializersNutritionOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/observation-component-component', ['exports', 'ember-fhir-adapter/serializers/observation-component-component'], function (exports, _emberFhirAdapterSerializersObservationComponentComponent) {
  exports['default'] = _emberFhirAdapterSerializersObservationComponentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/observation-reference-range-component', ['exports', 'ember-fhir-adapter/serializers/observation-reference-range-component'], function (exports, _emberFhirAdapterSerializersObservationReferenceRangeComponent) {
  exports['default'] = _emberFhirAdapterSerializersObservationReferenceRangeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/observation-related-component', ['exports', 'ember-fhir-adapter/serializers/observation-related-component'], function (exports, _emberFhirAdapterSerializersObservationRelatedComponent) {
  exports['default'] = _emberFhirAdapterSerializersObservationRelatedComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/observation', ['exports', 'ember-fhir-adapter/serializers/observation'], function (exports, _emberFhirAdapterSerializersObservation) {
  exports['default'] = _emberFhirAdapterSerializersObservation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/operation-definition-contact-component', ['exports', 'ember-fhir-adapter/serializers/operation-definition-contact-component'], function (exports, _emberFhirAdapterSerializersOperationDefinitionContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersOperationDefinitionContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/operation-definition-parameter-component', ['exports', 'ember-fhir-adapter/serializers/operation-definition-parameter-component'], function (exports, _emberFhirAdapterSerializersOperationDefinitionParameterComponent) {
  exports['default'] = _emberFhirAdapterSerializersOperationDefinitionParameterComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/operation-definition', ['exports', 'ember-fhir-adapter/serializers/operation-definition'], function (exports, _emberFhirAdapterSerializersOperationDefinition) {
  exports['default'] = _emberFhirAdapterSerializersOperationDefinition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/operation-outcome-issue-component', ['exports', 'ember-fhir-adapter/serializers/operation-outcome-issue-component'], function (exports, _emberFhirAdapterSerializersOperationOutcomeIssueComponent) {
  exports['default'] = _emberFhirAdapterSerializersOperationOutcomeIssueComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/operation-outcome', ['exports', 'ember-fhir-adapter/serializers/operation-outcome'], function (exports, _emberFhirAdapterSerializersOperationOutcome) {
  exports['default'] = _emberFhirAdapterSerializersOperationOutcome['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/order-response', ['exports', 'ember-fhir-adapter/serializers/order-response'], function (exports, _emberFhirAdapterSerializersOrderResponse) {
  exports['default'] = _emberFhirAdapterSerializersOrderResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/order-when-component', ['exports', 'ember-fhir-adapter/serializers/order-when-component'], function (exports, _emberFhirAdapterSerializersOrderWhenComponent) {
  exports['default'] = _emberFhirAdapterSerializersOrderWhenComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/order', ['exports', 'ember-fhir-adapter/serializers/order'], function (exports, _emberFhirAdapterSerializersOrder) {
  exports['default'] = _emberFhirAdapterSerializersOrder['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/organization-contact-component', ['exports', 'ember-fhir-adapter/serializers/organization-contact-component'], function (exports, _emberFhirAdapterSerializersOrganizationContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersOrganizationContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/organization', ['exports', 'ember-fhir-adapter/serializers/organization'], function (exports, _emberFhirAdapterSerializersOrganization) {
  exports['default'] = _emberFhirAdapterSerializersOrganization['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/patient-animal-component', ['exports', 'ember-fhir-adapter/serializers/patient-animal-component'], function (exports, _emberFhirAdapterSerializersPatientAnimalComponent) {
  exports['default'] = _emberFhirAdapterSerializersPatientAnimalComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/patient-communication-component', ['exports', 'ember-fhir-adapter/serializers/patient-communication-component'], function (exports, _emberFhirAdapterSerializersPatientCommunicationComponent) {
  exports['default'] = _emberFhirAdapterSerializersPatientCommunicationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/patient-contact-component', ['exports', 'ember-fhir-adapter/serializers/patient-contact-component'], function (exports, _emberFhirAdapterSerializersPatientContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersPatientContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/patient-link-component', ['exports', 'ember-fhir-adapter/serializers/patient-link-component'], function (exports, _emberFhirAdapterSerializersPatientLinkComponent) {
  exports['default'] = _emberFhirAdapterSerializersPatientLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/patient', ['exports', 'ember-fhir-adapter/serializers/patient'], function (exports, _emberFhirAdapterSerializersPatient) {
  exports['default'] = _emberFhirAdapterSerializersPatient['default'].extend({
    extract: function extract(store, type, payload /*, id, requestType*/) {
      store.setMetadataFor(type.modelName, { total: payload.total, link: payload.link });
      return this._super.apply(this, arguments);
    },

    // Ember Data 2+
    // normalizeResponse(store, primaryModelClass, payload) {
    //   let value = this._super(...arguments);
    //   value.meta = { total: payload.total };
    //   return value;
    // },

    normalize: function normalize(type, hash, prop) {
      var queryParam = '?patient:Patient=' + hash.id;
      (hash.content || hash).links = {
        conditions: '/Condition' + queryParam,
        observations: '/Observation' + queryParam,
        encounters: '/Encounter' + queryParam,
        medications: '/MedicationStatement' + queryParam,
        appointments: '/Appointment' + queryParam,
        risks: '/RiskAssessment?subject:Patient=' + hash.id
      };
      return this._super(type, hash, prop);
    }
  });
});
define('ember-on-fhir/serializers/payment-notice', ['exports', 'ember-fhir-adapter/serializers/payment-notice'], function (exports, _emberFhirAdapterSerializersPaymentNotice) {
  exports['default'] = _emberFhirAdapterSerializersPaymentNotice['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/payment-reconciliation-details-component', ['exports', 'ember-fhir-adapter/serializers/payment-reconciliation-details-component'], function (exports, _emberFhirAdapterSerializersPaymentReconciliationDetailsComponent) {
  exports['default'] = _emberFhirAdapterSerializersPaymentReconciliationDetailsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/payment-reconciliation-notes-component', ['exports', 'ember-fhir-adapter/serializers/payment-reconciliation-notes-component'], function (exports, _emberFhirAdapterSerializersPaymentReconciliationNotesComponent) {
  exports['default'] = _emberFhirAdapterSerializersPaymentReconciliationNotesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/payment-reconciliation', ['exports', 'ember-fhir-adapter/serializers/payment-reconciliation'], function (exports, _emberFhirAdapterSerializersPaymentReconciliation) {
  exports['default'] = _emberFhirAdapterSerializersPaymentReconciliation['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/period', ['exports', 'ember-fhir-adapter/serializers/period'], function (exports, _emberFhirAdapterSerializersPeriod) {
  exports['default'] = _emberFhirAdapterSerializersPeriod['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/person-link-component', ['exports', 'ember-fhir-adapter/serializers/person-link-component'], function (exports, _emberFhirAdapterSerializersPersonLinkComponent) {
  exports['default'] = _emberFhirAdapterSerializersPersonLinkComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/person', ['exports', 'ember-fhir-adapter/serializers/person'], function (exports, _emberFhirAdapterSerializersPerson) {
  exports['default'] = _emberFhirAdapterSerializersPerson['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/practitioner-practitioner-role-component', ['exports', 'ember-fhir-adapter/serializers/practitioner-practitioner-role-component'], function (exports, _emberFhirAdapterSerializersPractitionerPractitionerRoleComponent) {
  exports['default'] = _emberFhirAdapterSerializersPractitionerPractitionerRoleComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/practitioner-qualification-component', ['exports', 'ember-fhir-adapter/serializers/practitioner-qualification-component'], function (exports, _emberFhirAdapterSerializersPractitionerQualificationComponent) {
  exports['default'] = _emberFhirAdapterSerializersPractitionerQualificationComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/practitioner', ['exports', 'ember-fhir-adapter/serializers/practitioner'], function (exports, _emberFhirAdapterSerializersPractitioner) {
  exports['default'] = _emberFhirAdapterSerializersPractitioner['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/procedure-focal-device-component', ['exports', 'ember-fhir-adapter/serializers/procedure-focal-device-component'], function (exports, _emberFhirAdapterSerializersProcedureFocalDeviceComponent) {
  exports['default'] = _emberFhirAdapterSerializersProcedureFocalDeviceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/procedure-performer-component', ['exports', 'ember-fhir-adapter/serializers/procedure-performer-component'], function (exports, _emberFhirAdapterSerializersProcedurePerformerComponent) {
  exports['default'] = _emberFhirAdapterSerializersProcedurePerformerComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/procedure-request', ['exports', 'ember-fhir-adapter/serializers/procedure-request'], function (exports, _emberFhirAdapterSerializersProcedureRequest) {
  exports['default'] = _emberFhirAdapterSerializersProcedureRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/procedure', ['exports', 'ember-fhir-adapter/serializers/procedure'], function (exports, _emberFhirAdapterSerializersProcedure) {
  exports['default'] = _emberFhirAdapterSerializersProcedure['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/process-request-items-component', ['exports', 'ember-fhir-adapter/serializers/process-request-items-component'], function (exports, _emberFhirAdapterSerializersProcessRequestItemsComponent) {
  exports['default'] = _emberFhirAdapterSerializersProcessRequestItemsComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/process-request', ['exports', 'ember-fhir-adapter/serializers/process-request'], function (exports, _emberFhirAdapterSerializersProcessRequest) {
  exports['default'] = _emberFhirAdapterSerializersProcessRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/process-response-notes-component', ['exports', 'ember-fhir-adapter/serializers/process-response-notes-component'], function (exports, _emberFhirAdapterSerializersProcessResponseNotesComponent) {
  exports['default'] = _emberFhirAdapterSerializersProcessResponseNotesComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/process-response', ['exports', 'ember-fhir-adapter/serializers/process-response'], function (exports, _emberFhirAdapterSerializersProcessResponse) {
  exports['default'] = _emberFhirAdapterSerializersProcessResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/provenance-agent-component', ['exports', 'ember-fhir-adapter/serializers/provenance-agent-component'], function (exports, _emberFhirAdapterSerializersProvenanceAgentComponent) {
  exports['default'] = _emberFhirAdapterSerializersProvenanceAgentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/provenance-entity-component', ['exports', 'ember-fhir-adapter/serializers/provenance-entity-component'], function (exports, _emberFhirAdapterSerializersProvenanceEntityComponent) {
  exports['default'] = _emberFhirAdapterSerializersProvenanceEntityComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/provenance', ['exports', 'ember-fhir-adapter/serializers/provenance'], function (exports, _emberFhirAdapterSerializersProvenance) {
  exports['default'] = _emberFhirAdapterSerializersProvenance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/quantity', ['exports', 'ember-fhir-adapter/serializers/quantity'], function (exports, _emberFhirAdapterSerializersQuantity) {
  exports['default'] = _emberFhirAdapterSerializersQuantity['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/questionnaire-group-component', ['exports', 'ember-fhir-adapter/serializers/questionnaire-group-component'], function (exports, _emberFhirAdapterSerializersQuestionnaireGroupComponent) {
  exports['default'] = _emberFhirAdapterSerializersQuestionnaireGroupComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/questionnaire-response-group-component', ['exports', 'ember-fhir-adapter/serializers/questionnaire-response-group-component'], function (exports, _emberFhirAdapterSerializersQuestionnaireResponseGroupComponent) {
  exports['default'] = _emberFhirAdapterSerializersQuestionnaireResponseGroupComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/questionnaire-response', ['exports', 'ember-fhir-adapter/serializers/questionnaire-response'], function (exports, _emberFhirAdapterSerializersQuestionnaireResponse) {
  exports['default'] = _emberFhirAdapterSerializersQuestionnaireResponse['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/questionnaire', ['exports', 'ember-fhir-adapter/serializers/questionnaire'], function (exports, _emberFhirAdapterSerializersQuestionnaire) {
  exports['default'] = _emberFhirAdapterSerializersQuestionnaire['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/range', ['exports', 'ember-fhir-adapter/serializers/range'], function (exports, _emberFhirAdapterSerializersRange) {
  exports['default'] = _emberFhirAdapterSerializersRange['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/ratio', ['exports', 'ember-fhir-adapter/serializers/ratio'], function (exports, _emberFhirAdapterSerializersRatio) {
  exports['default'] = _emberFhirAdapterSerializersRatio['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/reference', ['exports', 'ember-fhir-adapter/serializers/reference'], function (exports, _emberFhirAdapterSerializersReference) {
  exports['default'] = _emberFhirAdapterSerializersReference['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/referral-request', ['exports', 'ember-fhir-adapter/serializers/referral-request'], function (exports, _emberFhirAdapterSerializersReferralRequest) {
  exports['default'] = _emberFhirAdapterSerializersReferralRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/related-person', ['exports', 'ember-fhir-adapter/serializers/related-person'], function (exports, _emberFhirAdapterSerializersRelatedPerson) {
  exports['default'] = _emberFhirAdapterSerializersRelatedPerson['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/risk-assessment-prediction-component', ['exports', 'ember-fhir-adapter/serializers/risk-assessment-prediction-component'], function (exports, _emberFhirAdapterSerializersRiskAssessmentPredictionComponent) {
  exports['default'] = _emberFhirAdapterSerializersRiskAssessmentPredictionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/risk-assessment', ['exports', 'ember-on-fhir/serializers/application', 'ember-metal/get'], function (exports, _emberOnFhirSerializersApplication, _emberMetalGet) {
  exports['default'] = _emberOnFhirSerializersApplication['default'].extend({
    normalize: function normalize(type, hash, prop) {
      var referenceUrl = (0, _emberMetalGet['default'])(hash, 'basis.firstObject.reference');
      if (referenceUrl) {
        var splitReferernce = referenceUrl.split('/');
        var pieId = splitReferernce[splitReferernce.length - 1];
        hash.links = {
          pie: '/Pie/' + pieId
        };
      }
      return this._super(type, hash, prop);
    }
  });
});
define('ember-on-fhir/serializers/risk', ['exports', 'ember-on-fhir/serializers/application'], function (exports, _emberOnFhirSerializersApplication) {
  exports['default'] = _emberOnFhirSerializersApplication['default'].extend({
    normalize: function normalize(type, hash, prop) {
      var newHash = {
        patient: hash.Id,
        risk: hash.Value.Risk
      };

      return this._super(type, newHash, prop);
    }
  });
});
define('ember-on-fhir/serializers/sampled-data', ['exports', 'ember-fhir-adapter/serializers/sampled-data'], function (exports, _emberFhirAdapterSerializersSampledData) {
  exports['default'] = _emberFhirAdapterSerializersSampledData['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/schedule', ['exports', 'ember-fhir-adapter/serializers/schedule'], function (exports, _emberFhirAdapterSerializersSchedule) {
  exports['default'] = _emberFhirAdapterSerializersSchedule['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/search-parameter-contact-component', ['exports', 'ember-fhir-adapter/serializers/search-parameter-contact-component'], function (exports, _emberFhirAdapterSerializersSearchParameterContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersSearchParameterContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/search-parameter', ['exports', 'ember-fhir-adapter/serializers/search-parameter'], function (exports, _emberFhirAdapterSerializersSearchParameter) {
  exports['default'] = _emberFhirAdapterSerializersSearchParameter['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/signature', ['exports', 'ember-fhir-adapter/serializers/signature'], function (exports, _emberFhirAdapterSerializersSignature) {
  exports['default'] = _emberFhirAdapterSerializersSignature['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/slot', ['exports', 'ember-fhir-adapter/serializers/slot'], function (exports, _emberFhirAdapterSerializersSlot) {
  exports['default'] = _emberFhirAdapterSerializersSlot['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/specimen-collection-component', ['exports', 'ember-fhir-adapter/serializers/specimen-collection-component'], function (exports, _emberFhirAdapterSerializersSpecimenCollectionComponent) {
  exports['default'] = _emberFhirAdapterSerializersSpecimenCollectionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/specimen-container-component', ['exports', 'ember-fhir-adapter/serializers/specimen-container-component'], function (exports, _emberFhirAdapterSerializersSpecimenContainerComponent) {
  exports['default'] = _emberFhirAdapterSerializersSpecimenContainerComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/specimen-treatment-component', ['exports', 'ember-fhir-adapter/serializers/specimen-treatment-component'], function (exports, _emberFhirAdapterSerializersSpecimenTreatmentComponent) {
  exports['default'] = _emberFhirAdapterSerializersSpecimenTreatmentComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/specimen', ['exports', 'ember-fhir-adapter/serializers/specimen'], function (exports, _emberFhirAdapterSerializersSpecimen) {
  exports['default'] = _emberFhirAdapterSerializersSpecimen['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/structure-definition-contact-component', ['exports', 'ember-fhir-adapter/serializers/structure-definition-contact-component'], function (exports, _emberFhirAdapterSerializersStructureDefinitionContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersStructureDefinitionContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/structure-definition-differential-component', ['exports', 'ember-fhir-adapter/serializers/structure-definition-differential-component'], function (exports, _emberFhirAdapterSerializersStructureDefinitionDifferentialComponent) {
  exports['default'] = _emberFhirAdapterSerializersStructureDefinitionDifferentialComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/structure-definition-mapping-component', ['exports', 'ember-fhir-adapter/serializers/structure-definition-mapping-component'], function (exports, _emberFhirAdapterSerializersStructureDefinitionMappingComponent) {
  exports['default'] = _emberFhirAdapterSerializersStructureDefinitionMappingComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/structure-definition-snapshot-component', ['exports', 'ember-fhir-adapter/serializers/structure-definition-snapshot-component'], function (exports, _emberFhirAdapterSerializersStructureDefinitionSnapshotComponent) {
  exports['default'] = _emberFhirAdapterSerializersStructureDefinitionSnapshotComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/structure-definition', ['exports', 'ember-fhir-adapter/serializers/structure-definition'], function (exports, _emberFhirAdapterSerializersStructureDefinition) {
  exports['default'] = _emberFhirAdapterSerializersStructureDefinition['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/subscription-channel-component', ['exports', 'ember-fhir-adapter/serializers/subscription-channel-component'], function (exports, _emberFhirAdapterSerializersSubscriptionChannelComponent) {
  exports['default'] = _emberFhirAdapterSerializersSubscriptionChannelComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/subscription', ['exports', 'ember-fhir-adapter/serializers/subscription'], function (exports, _emberFhirAdapterSerializersSubscription) {
  exports['default'] = _emberFhirAdapterSerializersSubscription['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/substance-ingredient-component', ['exports', 'ember-fhir-adapter/serializers/substance-ingredient-component'], function (exports, _emberFhirAdapterSerializersSubstanceIngredientComponent) {
  exports['default'] = _emberFhirAdapterSerializersSubstanceIngredientComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/substance-instance-component', ['exports', 'ember-fhir-adapter/serializers/substance-instance-component'], function (exports, _emberFhirAdapterSerializersSubstanceInstanceComponent) {
  exports['default'] = _emberFhirAdapterSerializersSubstanceInstanceComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/substance', ['exports', 'ember-fhir-adapter/serializers/substance'], function (exports, _emberFhirAdapterSerializersSubstance) {
  exports['default'] = _emberFhirAdapterSerializersSubstance['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/supply-delivery', ['exports', 'ember-fhir-adapter/serializers/supply-delivery'], function (exports, _emberFhirAdapterSerializersSupplyDelivery) {
  exports['default'] = _emberFhirAdapterSerializersSupplyDelivery['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/supply-request-when-component', ['exports', 'ember-fhir-adapter/serializers/supply-request-when-component'], function (exports, _emberFhirAdapterSerializersSupplyRequestWhenComponent) {
  exports['default'] = _emberFhirAdapterSerializersSupplyRequestWhenComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/supply-request', ['exports', 'ember-fhir-adapter/serializers/supply-request'], function (exports, _emberFhirAdapterSerializersSupplyRequest) {
  exports['default'] = _emberFhirAdapterSerializersSupplyRequest['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-contact-component', ['exports', 'ember-fhir-adapter/serializers/test-script-contact-component'], function (exports, _emberFhirAdapterSerializersTestScriptContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-fixture-component', ['exports', 'ember-fhir-adapter/serializers/test-script-fixture-component'], function (exports, _emberFhirAdapterSerializersTestScriptFixtureComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptFixtureComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-metadata-component', ['exports', 'ember-fhir-adapter/serializers/test-script-metadata-component'], function (exports, _emberFhirAdapterSerializersTestScriptMetadataComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptMetadataComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-setup-component', ['exports', 'ember-fhir-adapter/serializers/test-script-setup-component'], function (exports, _emberFhirAdapterSerializersTestScriptSetupComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptSetupComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-teardown-component', ['exports', 'ember-fhir-adapter/serializers/test-script-teardown-component'], function (exports, _emberFhirAdapterSerializersTestScriptTeardownComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptTeardownComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-test-component', ['exports', 'ember-fhir-adapter/serializers/test-script-test-component'], function (exports, _emberFhirAdapterSerializersTestScriptTestComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptTestComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script-variable-component', ['exports', 'ember-fhir-adapter/serializers/test-script-variable-component'], function (exports, _emberFhirAdapterSerializersTestScriptVariableComponent) {
  exports['default'] = _emberFhirAdapterSerializersTestScriptVariableComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/test-script', ['exports', 'ember-fhir-adapter/serializers/test-script'], function (exports, _emberFhirAdapterSerializersTestScript) {
  exports['default'] = _emberFhirAdapterSerializersTestScript['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/timing-repeat-component', ['exports', 'ember-fhir-adapter/serializers/timing-repeat-component'], function (exports, _emberFhirAdapterSerializersTimingRepeatComponent) {
  exports['default'] = _emberFhirAdapterSerializersTimingRepeatComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/timing', ['exports', 'ember-fhir-adapter/serializers/timing'], function (exports, _emberFhirAdapterSerializersTiming) {
  exports['default'] = _emberFhirAdapterSerializersTiming['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/value-set-code-system-component', ['exports', 'ember-fhir-adapter/serializers/value-set-code-system-component'], function (exports, _emberFhirAdapterSerializersValueSetCodeSystemComponent) {
  exports['default'] = _emberFhirAdapterSerializersValueSetCodeSystemComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/value-set-compose-component', ['exports', 'ember-fhir-adapter/serializers/value-set-compose-component'], function (exports, _emberFhirAdapterSerializersValueSetComposeComponent) {
  exports['default'] = _emberFhirAdapterSerializersValueSetComposeComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/value-set-contact-component', ['exports', 'ember-fhir-adapter/serializers/value-set-contact-component'], function (exports, _emberFhirAdapterSerializersValueSetContactComponent) {
  exports['default'] = _emberFhirAdapterSerializersValueSetContactComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/value-set-expansion-component', ['exports', 'ember-fhir-adapter/serializers/value-set-expansion-component'], function (exports, _emberFhirAdapterSerializersValueSetExpansionComponent) {
  exports['default'] = _emberFhirAdapterSerializersValueSetExpansionComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/value-set', ['exports', 'ember-fhir-adapter/serializers/value-set'], function (exports, _emberFhirAdapterSerializersValueSet) {
  exports['default'] = _emberFhirAdapterSerializersValueSet['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/vision-prescription-dispense-component', ['exports', 'ember-fhir-adapter/serializers/vision-prescription-dispense-component'], function (exports, _emberFhirAdapterSerializersVisionPrescriptionDispenseComponent) {
  exports['default'] = _emberFhirAdapterSerializersVisionPrescriptionDispenseComponent['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/serializers/vision-prescription', ['exports', 'ember-fhir-adapter/serializers/vision-prescription'], function (exports, _emberFhirAdapterSerializersVisionPrescription) {
  exports['default'] = _emberFhirAdapterSerializersVisionPrescription['default'];
});
//Autogenerated by ../../build_app.js
define('ember-on-fhir/services/ajax', ['exports', 'ember-ajax/services/ajax', 'ember-service/inject', 'ember-computed', 'ember-ajax/errors'], function (exports, _emberAjaxServicesAjax, _emberServiceInject, _emberComputed, _emberAjaxErrors) {
  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ApiError = (function (_AjaxError) {
    _inherits(ApiError, _AjaxError);

    function ApiError(errors, detailedMessage, payload) {
      _classCallCheck(this, ApiError);

      _get(Object.getPrototypeOf(ApiError.prototype), 'constructor', this).call(this, errors, detailedMessage);
      this.payload = payload;
    }

    return ApiError;
  })(_emberAjaxErrors.AjaxError);

  exports['default'] = _emberAjaxServicesAjax['default'].extend({
    session: (0, _emberServiceInject['default'])(),

    authorizer: 'authorizer:ie',

    headers: (0, _emberComputed['default'])({
      get: function get() {
        var headers = {};

        if (this.get('session.isAuthenticated')) {
          this.get('session').authorize(this.get('authorizer'), function (headerName, headerValue) {
            headers[headerName] = headerValue;
          });
        }

        return headers;
      }
    }).volatile(),

    handleResponse: function handleResponse(status, headers, payload /*, requestData */) {
      payload = payload || {};

      if (this.isSuccess(status, headers, payload)) {
        return payload;
      }

      var errors = this.normalizeErrorResponse(status, headers, payload);

      return new ApiError(errors, '', payload);
    }
  });
});
define('ember-on-fhir/services/display-navbar', ['exports', 'ember-service'], function (exports, _emberService) {
  exports['default'] = _emberService['default'].extend({
    displayNavbar: true,

    show: function show() {
      this.set('displayNavbar', true);
    },

    hide: function hide() {
      this.set('displayNavbar', false);
    }
  });
});
define('ember-on-fhir/services/drag-coordinator', ['exports', 'ember-drag-drop/services/drag-coordinator'], function (exports, _emberDragDropServicesDragCoordinator) {
  exports['default'] = _emberDragDropServicesDragCoordinator['default'];
});
define('ember-on-fhir/services/modal-dialog', ['exports', 'ember-modal-dialog/services/modal-dialog'], function (exports, _emberModalDialogServicesModalDialog) {
  exports['default'] = _emberModalDialogServicesModalDialog['default'];
});
define('ember-on-fhir/services/moment', ['exports', 'ember', 'ember-on-fhir/config/environment', 'ember-moment/services/moment'], function (exports, _ember, _emberOnFhirConfigEnvironment, _emberMomentServicesMoment) {
  exports['default'] = _emberMomentServicesMoment['default'].extend({
    defaultFormat: _ember['default'].get(_emberOnFhirConfigEnvironment['default'], 'moment.outputFormat')
  });
});
define('ember-on-fhir/services/session', ['exports', 'ember-simple-auth/services/session'], function (exports, _emberSimpleAuthServicesSession) {
  exports['default'] = _emberSimpleAuthServicesSession['default'];
});
define('ember-on-fhir/services/validations', ['exports', 'ember'], function (exports, _ember) {

  var set = _ember['default'].set;

  exports['default'] = _ember['default'].Service.extend({
    init: function init() {
      set(this, 'cache', {});
    }
  });
});
define('ember-on-fhir/session-stores/application', ['exports', 'ember-simple-auth/session-stores/local-storage'], function (exports, _emberSimpleAuthSessionStoresLocalStorage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberSimpleAuthSessionStoresLocalStorage['default'];
    }
  });
});
define("ember-on-fhir/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 4,
              "column": 2
            }
          },
          "moduleName": "ember-on-fhir/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "ie-navbar", ["loc", [null, [3, 4], [3, 17]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "ember-fhir");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "if", [["get", "displayNavbar", ["loc", [null, [2, 8], [2, 21]]]]], [], 0, null, ["loc", [null, [2, 2], [4, 9]]]], ["content", "outlet", ["loc", [null, [7, 6], [7, 16]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/add-intervention-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 8
              },
              "end": {
                "line": 7,
                "column": 8
              }
            },
            "moduleName": "ember-on-fhir/templates/components/add-intervention-modal.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "add-intervention-modal/intervention-detail", [], ["intervention", ["subexpr", "@mut", [["get", "interventionType", ["loc", [null, [6, 68], [6, 84]]]]], [], []], "registerDetailItem", ["subexpr", "action", ["registerDetailItem"], [], ["loc", [null, [6, 104], [6, 133]]]], "expand", ["subexpr", "action", ["expandItem"], [], ["loc", [null, [6, 141], [6, 162]]]]], ["loc", [null, [6, 10], [6, 164]]]]],
          locals: ["interventionType"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 14,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/add-intervention-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-body");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "intervention-list-group");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-footer");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3, "type", "submit");
          dom.setAttribute(el3, "class", "btn btn-primary");
          var el4 = dom.createTextNode("Save");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [3, 1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element0, 'onsubmit');
          morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 1]), 1, 1);
          morphs[2] = dom.createAttrMorph(element1, 'disabled');
          return morphs;
        },
        statements: [["attribute", "onsubmit", ["subexpr", "action", ["save"], [], ["loc", [null, [2, 17], [2, 34]]]]], ["block", "each", [["get", "interventionTypes", ["loc", [null, [5, 16], [5, 33]]]]], [], 0, null, ["loc", [null, [5, 8], [7, 17]]]], ["attribute", "disabled", ["get", "saveBtnDisabled", ["loc", [null, [11, 63], [11, 78]]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 14,
            "column": 20
          }
        },
        "moduleName": "ember-on-fhir/templates/components/add-intervention-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "bootstrap-modal", [], ["title", "Add Intervention", "onOpen", ["subexpr", "@mut", [["get", "attrs.onOpen", ["loc", [null, [1, 51], [1, 63]]]]], [], []], "onClose", ["subexpr", "@mut", [["get", "attrs.onClose", ["loc", [null, [1, 72], [1, 85]]]]], [], []]], 0, null, ["loc", [null, [1, 0], [14, 20]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/add-intervention-modal/intervention-detail", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 14,
            "column": 6
          }
        },
        "moduleName": "ember-on-fhir/templates/components/add-intervention-modal/intervention-detail.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "pull-right");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3, "class", "fa fa-fw fa-check-circle text-muted");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "intervention-icon");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "intervention-name");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "collapsible-panel");
        dom.setAttribute(el1, "style", "display:none;");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createAttrMorph(element1, 'class');
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [5]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [2]), 1, 1);
        return morphs;
      },
      statements: [["attribute", "class", ["concat", [["get", "intervention.iconClassnames", ["loc", [null, [6, 16], [6, 43]]]], " fa-fw"]]], ["content", "intervention.name", ["loc", [null, [9, 4], [9, 25]]]], ["inline", "textarea", [], ["value", ["subexpr", "@mut", [["get", "detail", ["loc", [null, [13, 19], [13, 25]]]]], [], []], "placeholder", "Optional description..."], ["loc", [null, [13, 2], [13, 65]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/add-to-huddle-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "modal-body modal-body-spinner");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
            return morphs;
          },
          statements: [["inline", "ember-spinner", [], ["config", "small"], ["loc", [null, [4, 6], [4, 38]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 7,
                  "column": 4
                },
                "end": {
                  "line": 12,
                  "column": 4
                }
              },
              "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "huddle-exists-alert alert alert-danger");
              var el2 = dom.createTextNode("\n        ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("i");
              dom.setAttribute(el2, "class", "fa fa-exclamation-circle");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n        Patient already exists in selected huddle.\n      ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() {
              return [];
            },
            statements: [],
            locals: [],
            templates: []
          };
        })();
        var child1 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 17,
                  "column": 10
                },
                "end": {
                  "line": 26,
                  "column": 10
                }
              },
              "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "row form-control-static");
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "col-sm-4");
              var el3 = dom.createTextNode("\n                ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("label");
              var el4 = dom.createTextNode("Current Date:");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n              ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "col-sm-8");
              var el3 = dom.createTextNode("\n                ");
              dom.appendChild(el2, el3);
              var el3 = dom.createComment("");
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n              ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n            ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 3]), 1, 1);
              return morphs;
            },
            statements: [["inline", "moment-format", [["get", "huddle.date", ["loc", [null, [23, 32], [23, 43]]]], "dddd, MMMM Do YYYY"], [], ["loc", [null, [23, 16], [23, 66]]]]],
            locals: [],
            templates: []
          };
        })();
        var child2 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 79,
                  "column": 8
                },
                "end": {
                  "line": 81,
                  "column": 8
                }
              },
              "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("          ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("button");
              dom.setAttribute(el1, "type", "button");
              dom.setAttribute(el1, "class", "btn btn-danger btn-ie-lg");
              var el2 = dom.createTextNode("Remove");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element0 = dom.childAt(fragment, [1]);
              var morphs = new Array(2);
              morphs[0] = dom.createAttrMorph(element0, 'disabled');
              morphs[1] = dom.createAttrMorph(element0, 'onclick');
              return morphs;
            },
            statements: [["attribute", "disabled", ["get", "removeBtnDisabled", ["loc", [null, [80, 76], [80, 93]]]]], ["attribute", "onclick", ["subexpr", "action", ["removePatientFromHuddle"], [], ["loc", [null, [80, 104], [80, 140]]]]]],
            locals: [],
            templates: []
          };
        })();
        var child3 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 83,
                  "column": 10
                },
                "end": {
                  "line": 85,
                  "column": 10
                }
              },
              "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "ember-spinner", [], ["config", "small", "color", "#fff"], ["loc", [null, [84, 12], [84, 57]]]]],
            locals: [],
            templates: []
          };
        })();
        var child4 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 85,
                  "column": 10
                },
                "end": {
                  "line": 87,
                  "column": 10
                }
              },
              "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            Save\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() {
              return [];
            },
            statements: [],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 2
              },
              "end": {
                "line": 91,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("form");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2, "class", "modal-body add-to-huddle-modal-body");
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("div");
            dom.setAttribute(el3, "id", "addToHuddlePikaday");
            dom.setAttribute(el3, "class", "form-group");
            var el4 = dom.createTextNode("\n");
            dom.appendChild(el3, el4);
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("          ");
            dom.appendChild(el3, el4);
            var el4 = dom.createElement("div");
            dom.setAttribute(el4, "class", "row");
            var el5 = dom.createTextNode("\n            ");
            dom.appendChild(el4, el5);
            var el5 = dom.createElement("div");
            dom.setAttribute(el5, "class", "col-sm-4");
            var el6 = dom.createTextNode("\n              ");
            dom.appendChild(el5, el6);
            var el6 = dom.createElement("label");
            dom.setAttribute(el6, "for", "huddleDate");
            var el7 = dom.createTextNode("Huddle Date:");
            dom.appendChild(el6, el7);
            dom.appendChild(el5, el6);
            var el6 = dom.createTextNode("\n            ");
            dom.appendChild(el5, el6);
            dom.appendChild(el4, el5);
            var el5 = dom.createTextNode("\n\n            ");
            dom.appendChild(el4, el5);
            var el5 = dom.createElement("div");
            dom.setAttribute(el5, "class", "col-sm-8");
            var el6 = dom.createTextNode("\n              ");
            dom.appendChild(el5, el6);
            var el6 = dom.createElement("div");
            dom.setAttribute(el6, "class", "input-addon left-addon");
            var el7 = dom.createTextNode("\n                ");
            dom.appendChild(el6, el7);
            var el7 = dom.createElement("i");
            dom.setAttribute(el7, "class", "fa fa-calendar-o fa-fw left-addon-icon");
            dom.appendChild(el6, el7);
            var el7 = dom.createTextNode("\n                ");
            dom.appendChild(el6, el7);
            var el7 = dom.createComment("");
            dom.appendChild(el6, el7);
            var el7 = dom.createTextNode("\n              ");
            dom.appendChild(el6, el7);
            dom.appendChild(el5, el6);
            var el6 = dom.createTextNode("\n            ");
            dom.appendChild(el5, el6);
            dom.appendChild(el4, el5);
            var el5 = dom.createTextNode("\n          ");
            dom.appendChild(el4, el5);
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n        ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("div");
            dom.setAttribute(el3, "class", "form-group");
            var el4 = dom.createTextNode("\n          ");
            dom.appendChild(el3, el4);
            var el4 = dom.createElement("div");
            dom.setAttribute(el4, "class", "row");
            var el5 = dom.createTextNode("\n            ");
            dom.appendChild(el4, el5);
            var el5 = dom.createElement("div");
            dom.setAttribute(el5, "class", "col-sm-4");
            var el6 = dom.createTextNode("\n              ");
            dom.appendChild(el5, el6);
            var el6 = dom.createElement("label");
            dom.setAttribute(el6, "for", "huddleReason");
            var el7 = dom.createTextNode("Reason:");
            dom.appendChild(el6, el7);
            dom.appendChild(el5, el6);
            var el6 = dom.createTextNode("\n            ");
            dom.appendChild(el5, el6);
            dom.appendChild(el4, el5);
            var el5 = dom.createTextNode("\n            ");
            dom.appendChild(el4, el5);
            var el5 = dom.createElement("div");
            dom.setAttribute(el5, "class", "col-sm-8");
            var el6 = dom.createTextNode("\n              ");
            dom.appendChild(el5, el6);
            var el6 = dom.createComment("");
            dom.appendChild(el5, el6);
            var el6 = dom.createTextNode("\n            ");
            dom.appendChild(el5, el6);
            dom.appendChild(el4, el5);
            var el5 = dom.createTextNode("\n          ");
            dom.appendChild(el4, el5);
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n        ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2, "class", "modal-footer");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("button");
            dom.setAttribute(el3, "type", "submit");
            dom.setAttribute(el3, "class", "btn btn-primary");
            var el4 = dom.createTextNode("\n");
            dom.appendChild(el3, el4);
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("        ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [2]);
            var element2 = dom.childAt(element1, [1]);
            var element3 = dom.childAt(element2, [1]);
            var element4 = dom.childAt(element1, [3]);
            var element5 = dom.childAt(element4, [3]);
            var morphs = new Array(8);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            morphs[1] = dom.createAttrMorph(element1, 'onsubmit');
            morphs[2] = dom.createMorphAt(element3, 1, 1);
            morphs[3] = dom.createMorphAt(dom.childAt(element3, [3, 3, 1]), 3, 3);
            morphs[4] = dom.createMorphAt(dom.childAt(element2, [4, 1, 3]), 1, 1);
            morphs[5] = dom.createMorphAt(element4, 1, 1);
            morphs[6] = dom.createAttrMorph(element5, 'disabled');
            morphs[7] = dom.createMorphAt(element5, 1, 1);
            dom.insertBoundary(fragment, 0);
            return morphs;
          },
          statements: [["block", "if", [["subexpr", "and", [["get", "patientInExistingHuddle", ["loc", [null, [7, 15], [7, 38]]]], ["subexpr", "not-eq", [["get", "huddle.id", ["loc", [null, [7, 47], [7, 56]]]], ["get", "existingHuddle.id", ["loc", [null, [7, 57], [7, 74]]]]], [], ["loc", [null, [7, 39], [7, 75]]]]], [], ["loc", [null, [7, 10], [7, 76]]]]], [], 0, null, ["loc", [null, [7, 4], [12, 11]]]], ["attribute", "onsubmit", ["subexpr", "action", ["save"], [], ["loc", [null, [14, 19], [14, 36]]]]], ["block", "if", [["get", "huddle", ["loc", [null, [17, 16], [17, 22]]]]], [], 1, null, ["loc", [null, [17, 10], [26, 17]]]], ["inline", "pikaday-input", [], ["id", "huddleDate", "class", "form-control form-input-calendar", "value", ["subexpr", "@mut", [["get", "huddleDate", ["loc", [null, [38, 24], [38, 34]]]]], [], []], "format", "dddd, MMMM Do YYYY", "theme", ["subexpr", "concat", [["get", "elementId", ["loc", [null, [40, 32], [40, 41]]]], "-pikaday"], [], ["loc", [null, [40, 24], [40, 53]]]], "firstDay", 0], ["loc", [null, [35, 16], [41, 30]]]], ["inline", "textarea", [], ["elementId", "huddleReason", "rows", 3, "value", ["subexpr", "@mut", [["get", "huddleReasonText", ["loc", [null, [72, 63], [72, 79]]]]], [], []], "disabled", ["subexpr", "@mut", [["get", "huddleReasonTextDisabled", ["loc", [null, [72, 89], [72, 113]]]]], [], []]], ["loc", [null, [72, 14], [72, 115]]]], ["block", "if", [["get", "huddle", ["loc", [null, [79, 14], [79, 20]]]]], [], 2, null, ["loc", [null, [79, 8], [81, 15]]]], ["attribute", "disabled", ["get", "saveBtnDisabled", ["loc", [null, [82, 65], [82, 80]]]]], ["block", "if", [["get", "formSaving", ["loc", [null, [83, 16], [83, 26]]]]], [], 3, 4, ["loc", [null, [83, 10], [87, 17]]]]],
          locals: [],
          templates: [child0, child1, child2, child3, child4]
        };
      })();
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["wrong-type"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 92,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "isLoading", ["loc", [null, [2, 8], [2, 17]]]]], [], 0, 1, ["loc", [null, [2, 2], [91, 9]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 93,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/add-to-huddle-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "bootstrap-modal", [], ["title", ["subexpr", "@mut", [["get", "title", ["loc", [null, [1, 25], [1, 30]]]]], [], []], "onOpen", ["subexpr", "@mut", [["get", "attrs.onOpen", ["loc", [null, [1, 38], [1, 50]]]]], [], []], "onClose", ["subexpr", "@mut", [["get", "attrs.onClose", ["loc", [null, [1, 59], [1, 72]]]]], [], []]], 0, null, ["loc", [null, [1, 0], [92, 20]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/age-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 6
            },
            "end": {
              "line": 7,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/age-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Patient age\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/age-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Patient Age\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 28,
                "column": 8
              },
              "end": {
                "line": 33,
                "column": 8
              }
            },
            "moduleName": "ember-on-fhir/templates/components/age-filter.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1, "class", "pane-inner-label");
            var el2 = dom.createTextNode("and");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1, "class", "pane-input");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("input");
            dom.setAttribute(el2, "type", "text");
            dom.setAttribute(el2, "class", "input-control age");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [3, 1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element0, 'value');
            morphs[1] = dom.createAttrMorph(element0, 'onchange');
            return morphs;
          },
          statements: [["attribute", "value", ["get", "highValue", ["loc", [null, [31, 39], [31, 48]]]]], ["attribute", "onchange", ["subexpr", "action", ["updateValue", "highValue"], [], ["loc", [null, [31, 86], [31, 122]]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 4
            },
            "end": {
              "line": 35,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/age-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "selected-filter-details");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "pane-inner-label");
          var el3 = dom.createTextNode("in years is between");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "pane-input");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("input");
          dom.setAttribute(el3, "type", "text");
          dom.setAttribute(el3, "class", "input-control age");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var element2 = dom.childAt(element1, [4, 1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element2, 'value');
          morphs[1] = dom.createAttrMorph(element2, 'onchange');
          morphs[2] = dom.createMorphAt(element1, 6, 6);
          return morphs;
        },
        statements: [["attribute", "value", ["get", "lowValue", ["loc", [null, [26, 37], [26, 45]]]]], ["attribute", "onchange", ["subexpr", "action", ["updateValue", "lowValue"], [], ["loc", [null, [26, 83], [26, 118]]]]], ["block", "if", [["get", "highValueExists", ["loc", [null, [28, 14], [28, 29]]]]], [], 0, null, ["loc", [null, [28, 8], [33, 15]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 38,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/age-filter.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "class", "form-horizontal filter-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "checkbox");
        dom.setAttribute(el3, "name", "checkbox-patient-age");
        dom.setAttribute(el3, "class", "css-checkbox");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "class", "css-label css-label-box checkbox-label");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [1]);
        if (this.cachedFragment) {
          dom.repairClonedNode(element5, [], true);
        }
        var element6 = dom.childAt(element4, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element5, 'id');
        morphs[1] = dom.createAttrMorph(element5, 'checked');
        morphs[2] = dom.createElementMorph(element5);
        morphs[3] = dom.createAttrMorph(element6, 'for');
        morphs[4] = dom.createMorphAt(element6, 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        return morphs;
      },
      statements: [["attribute", "id", ["get", "checkboxName", ["loc", [null, [3, 32], [3, 44]]]]], ["attribute", "checked", ["get", "checkboxChecked", ["loc", [null, [3, 106], [3, 121]]]]], ["element", "action", ["toggle"], ["on", "change"], ["loc", [null, [3, 124], [3, 155]]]], ["attribute", "for", ["get", "checkboxName", ["loc", [null, [4, 17], [4, 29]]]]], ["block", "if", [["get", "active", ["loc", [null, [5, 12], [5, 18]]]]], [], 0, 1, ["loc", [null, [5, 6], [9, 13]]]], ["block", "if", [["get", "active", ["loc", [null, [14, 10], [14, 16]]]]], [], 2, null, ["loc", [null, [14, 4], [35, 11]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("ember-on-fhir/templates/components/aster-plot-chart", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/aster-plot-chart.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "aster-plot");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el2 = dom.createElement("svg");
        dom.setAttribute(el2, "viewBox", "0 0 600 600");
        dom.setAttribute(el2, "width", "100%");
        dom.setAttribute(el2, "height", "100%");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/bootstrap-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 4,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element5 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element5, 'class');
            morphs[1] = dom.createElementMorph(element5);
            return morphs;
          },
          statements: [["attribute", "class", ["concat", [["get", "overlayClassNamesString", ["loc", [null, [3, 18], [3, 41]]]], " ", ["subexpr", "if", [["get", "translucentOverlay", ["loc", [null, [3, 49], [3, 67]]]], "translucent"], [], ["loc", [null, [3, 44], [3, 83]]]]]]], ["element", "action", ["close"], [], ["loc", [null, [3, 85], [3, 103]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          var child0 = (function () {
            return {
              meta: {
                "fragmentReason": false,
                "revision": "Ember@2.3.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 15,
                    "column": 12
                  },
                  "end": {
                    "line": 19,
                    "column": 12
                  }
                },
                "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("              ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("button");
                dom.setAttribute(el1, "class", "close");
                dom.setAttribute(el1, "type", "button");
                var el2 = dom.createTextNode("\n                ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("i");
                dom.setAttribute(el2, "class", "fa fa-times");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n              ");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var element0 = dom.childAt(fragment, [1]);
                var morphs = new Array(1);
                morphs[0] = dom.createElementMorph(element0);
                return morphs;
              },
              statements: [["element", "action", ["close"], [], ["loc", [null, [16, 50], [16, 68]]]]],
              locals: [],
              templates: []
            };
          })();
          var child1 = (function () {
            return {
              meta: {
                "fragmentReason": false,
                "revision": "Ember@2.3.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 23,
                    "column": 14
                  },
                  "end": {
                    "line": 25,
                    "column": 14
                  }
                },
                "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("small");
                var el2 = dom.createComment("");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
                return morphs;
              },
              statements: [["content", "subTitle", ["loc", [null, [24, 23], [24, 35]]]]],
              locals: [],
              templates: []
            };
          })();
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 13,
                  "column": 8
                },
                "end": {
                  "line": 28,
                  "column": 8
                }
              },
              "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("          ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "modal-header");
              var el2 = dom.createTextNode("\n");
              dom.appendChild(el1, el2);
              var el2 = dom.createComment("");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("h4");
              dom.setAttribute(el2, "class", "modal-title");
              var el3 = dom.createTextNode("\n              ");
              dom.appendChild(el2, el3);
              var el3 = dom.createComment("");
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n");
              dom.appendChild(el2, el3);
              var el3 = dom.createComment("");
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("            ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n          ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element1 = dom.childAt(fragment, [1]);
              var element2 = dom.childAt(element1, [3]);
              var morphs = new Array(3);
              morphs[0] = dom.createMorphAt(element1, 1, 1);
              morphs[1] = dom.createMorphAt(element2, 1, 1);
              morphs[2] = dom.createMorphAt(element2, 3, 3);
              return morphs;
            },
            statements: [["block", "if", [["get", "showCloseButton", ["loc", [null, [15, 18], [15, 33]]]]], [], 0, null, ["loc", [null, [15, 12], [19, 19]]]], ["content", "title", ["loc", [null, [22, 14], [22, 23]]]], ["block", "if", [["get", "subTitle", ["loc", [null, [23, 20], [23, 28]]]]], [], 1, null, ["loc", [null, [23, 14], [25, 21]]]]],
            locals: [],
            templates: [child0, child1]
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 2
              },
              "end": {
                "line": 33,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2, "class", "modal-content");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element3 = dom.childAt(fragment, [1]);
            var element4 = dom.childAt(element3, [1]);
            var morphs = new Array(3);
            morphs[0] = dom.createAttrMorph(element3, 'class');
            morphs[1] = dom.createMorphAt(element4, 1, 1);
            morphs[2] = dom.createMorphAt(element4, 3, 3);
            return morphs;
          },
          statements: [["attribute", "class", ["concat", ["modal-dialog ", ["get", "extraClasses", ["loc", [null, [11, 31], [11, 43]]]]]]], ["block", "unless", [["get", "hasNoTitle", ["loc", [null, [13, 18], [13, 28]]]]], [], 0, null, ["loc", [null, [13, 8], [28, 19]]]], ["content", "yield", ["loc", [null, [30, 8], [30, 17]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["wrong-type", "multiple-nodes"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 34,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "hasOverlay", ["loc", [null, [2, 8], [2, 18]]]]], [], 0, null, ["loc", [null, [2, 2], [4, 9]]]], ["block", "ember-modal-dialog-positioned-container", [], ["targetAttachment", ["subexpr", "@mut", [["get", "targetAttachment", ["loc", [null, [8, 21], [8, 37]]]]], [], []], "target", ["subexpr", "@mut", [["get", "target", ["loc", [null, [9, 11], [9, 17]]]]], [], []], "class", ["subexpr", "concat", [["subexpr", "if", [["get", "containerClassNamesString", []], ["subexpr", "-normalize-class", ["containerClassNamesString", ["get", "containerClassNamesString", []]], [], []]], [], []], " ", ["subexpr", "if", [["get", "targetAttachmentClass", []], ["subexpr", "-normalize-class", ["targetAttachmentClass", ["get", "targetAttachmentClass", []]], [], []]], [], []], " ", ["subexpr", "if", [["get", "container-class", []], ["subexpr", "-normalize-class", ["container-class", ["get", "container-class", []]], [], []]], [], []], " "], [], []]], 1, null, ["loc", [null, [6, 2], [33, 46]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 35,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/bootstrap-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "ember-wormhole", [], ["to", ["subexpr", "@mut", [["get", "destinationElementId", ["loc", [null, [1, 21], [1, 41]]]]], [], []], "renderInPlace", ["subexpr", "@mut", [["get", "renderInPlace", ["loc", [null, [1, 56], [1, 69]]]]], [], []]], 0, null, ["loc", [null, [1, 0], [34, 19]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/category-details", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 42,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/category-details.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "category-details");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "category-name");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "category-stat row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "category-stat-label col-lg-2 col-md-3 col-xs-3");
        var el4 = dom.createTextNode("\n      Risk:\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-2 col-md-3 col-xs-2 category-stat-value");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-8 hidden-md hidden-sm col-xs-7");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-sm-7 hidden-lg hidden-xs");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "category-stat row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "category-stat-label col-lg-2 col-md-3 col-xs-3");
        var el4 = dom.createTextNode("\n      Weight:\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-2 col-md-3 col-xs-2 category-stat-value");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-8 hidden-md hidden-sm col-xs-7");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-sm-6 hidden-lg hidden-xs");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [5]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element1, [5]), 1, 1);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [7]), 1, 1);
        morphs[4] = dom.createMorphAt(dom.childAt(element2, [3]), 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element2, [5]), 1, 1);
        morphs[6] = dom.createMorphAt(dom.childAt(element2, [7]), 1, 1);
        return morphs;
      },
      statements: [["content", "category.name", ["loc", [null, [3, 4], [3, 21]]]], ["content", "category.value", ["loc", [null, [12, 6], [12, 24]]]], ["inline", "horizontal-bar-chart", [], ["max", ["subexpr", "@mut", [["get", "category.maxValue", ["loc", [null, [16, 33], [16, 50]]]]], [], []], "width", 300, "height", 5, "value", ["subexpr", "@mut", [["get", "category.value", ["loc", [null, [16, 76], [16, 90]]]]], [], []]], ["loc", [null, [16, 6], [16, 92]]]], ["inline", "horizontal-bar-chart", [], ["max", ["subexpr", "@mut", [["get", "category.maxValue", ["loc", [null, [20, 33], [20, 50]]]]], [], []], "width", 150, "height", 5, "value", ["subexpr", "@mut", [["get", "category.value", ["loc", [null, [20, 76], [20, 90]]]]], [], []]], ["loc", [null, [20, 6], [20, 92]]]], ["content", "category.weight", ["loc", [null, [30, 6], [30, 25]]]], ["inline", "horizontal-bar-chart", [], ["max", ["subexpr", "@mut", [["get", "category.maxWeight", ["loc", [null, [34, 33], [34, 51]]]]], [], []], "width", 300, "height", 5, "value", ["subexpr", "@mut", [["get", "category.weight", ["loc", [null, [34, 77], [34, 92]]]]], [], []]], ["loc", [null, [34, 6], [34, 94]]]], ["inline", "horizontal-bar-chart", [], ["max", ["subexpr", "@mut", [["get", "category.maxWeight", ["loc", [null, [38, 33], [38, 51]]]]], [], []], "width", 150, "height", 5, "value", ["subexpr", "@mut", [["get", "category.weight", ["loc", [null, [38, 77], [38, 92]]]]], [], []]], ["loc", [null, [38, 6], [38, 94]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/coding-typeahead", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/coding-typeahead.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("input");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(5);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createAttrMorph(element0, 'placeholder');
        morphs[2] = dom.createAttrMorph(element0, 'value');
        morphs[3] = dom.createAttrMorph(element0, 'onchange');
        morphs[4] = dom.createAttrMorph(element0, 'onkeyup');
        return morphs;
      },
      statements: [["attribute", "class", ["concat", ["input-control ", ["get", "type", ["loc", [null, [2, 25], [2, 29]]]], " typeahead"]]], ["attribute", "placeholder", ["get", "placeholder", ["loc", [null, [3, 16], [3, 27]]]]], ["attribute", "value", ["get", "displayValue", ["loc", [null, [4, 10], [4, 22]]]]], ["attribute", "onchange", ["subexpr", "action", ["updateCode"], [], ["loc", [null, [5, 11], [5, 34]]]]], ["attribute", "onkeyup", ["subexpr", "action", ["updateCode"], [], ["loc", [null, [6, 10], [6, 33]]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/condition-code-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 6
            },
            "end": {
              "line": 7,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/condition-code-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Condition code\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/condition-code-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Condition Code\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 6
              },
              "end": {
                "line": 30,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/condition-code-filter.hbs"
          },
          isEmpty: false,
          arity: 2,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "selected-filter-details selected-filter-details-spaced");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "pane-inner-label");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("for system");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "pane-select");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "pane-inner-label");
            var el3 = dom.createTextNode("is");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            dom.setAttribute(el2, "aria-label", "Close");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("span");
            dom.setAttribute(el3, "aria-hidden", "true");
            var el4 = dom.createElement("i");
            dom.setAttribute(el4, "class", "fa fa-times");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [9]);
            var morphs = new Array(4);
            morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
            morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
            morphs[2] = dom.createMorphAt(element0, 7, 7);
            morphs[3] = dom.createAttrMorph(element1, 'onclick');
            return morphs;
          },
          statements: [["inline", "if", [["subexpr", "gt", [["get", "index", ["loc", [null, [17, 50], [17, 55]]]], 0], [], ["loc", [null, [17, 46], [17, 58]]]], "or "], [], ["loc", [null, [17, 41], [17, 66]]]], ["inline", "select-fx", [], ["options", ["subexpr", "@mut", [["get", "codingSystems", ["loc", [null, [19, 32], [19, 45]]]]], [], []], "value", "coding.system", "valuePath", "system", "onChange", ["subexpr", "action", ["selectCodingSystem", ["get", "coding", ["loc", [null, [19, 125], [19, 131]]]]], [], ["loc", [null, [19, 96], [19, 132]]]]], ["loc", [null, [19, 12], [19, 134]]]], ["inline", "coding-typeahead", [], ["coding", ["subexpr", "@mut", [["get", "coding", ["loc", [null, [23, 19], [23, 25]]]]], [], []], "type", "condition", "placeholder", "condition code"], ["loc", [null, [22, 10], [25, 42]]]], ["attribute", "onclick", ["subexpr", "action", ["removeCode", ["get", "characteristic.valueCodeableConcept", ["loc", [null, [26, 76], [26, 111]]]], ["get", "coding", ["loc", [null, [26, 112], [26, 118]]]]], [], ["loc", [null, [26, 54], [26, 120]]]]]],
          locals: ["coding", "index"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 4
            },
            "end": {
              "line": 34,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/condition-code-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "selected-filter-details");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "cursor-pointer");
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-plus-circle");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" Add new coding ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [2, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createAttrMorph(element2, 'onclick');
          dom.insertBoundary(fragment, 0);
          return morphs;
        },
        statements: [["block", "each", [["get", "characteristic.valueCodeableConcept.coding", ["loc", [null, [15, 14], [15, 56]]]]], [], 0, null, ["loc", [null, [15, 6], [30, 15]]]], ["attribute", "onclick", ["subexpr", "action", ["addCode", ["get", "characteristic.valueCodeableConcept", ["loc", [null, [32, 64], [32, 99]]]]], [], ["loc", [null, [32, 45], [32, 101]]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 37,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/condition-code-filter.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "class", "form-horizontal filter-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "checkbox");
        dom.setAttribute(el3, "name", "checkbox-condition-code");
        dom.setAttribute(el3, "class", "css-checkbox");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "class", "css-label css-label-box checkbox-label");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [1]);
        if (this.cachedFragment) {
          dom.repairClonedNode(element5, [], true);
        }
        var element6 = dom.childAt(element4, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element5, 'id');
        morphs[1] = dom.createAttrMorph(element5, 'checked');
        morphs[2] = dom.createElementMorph(element5);
        morphs[3] = dom.createAttrMorph(element6, 'for');
        morphs[4] = dom.createMorphAt(element6, 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        return morphs;
      },
      statements: [["attribute", "id", ["get", "checkboxName", ["loc", [null, [3, 32], [3, 44]]]]], ["attribute", "checked", ["get", "checkboxChecked", ["loc", [null, [3, 109], [3, 124]]]]], ["element", "action", ["toggle"], ["on", "change"], ["loc", [null, [3, 127], [3, 158]]]], ["attribute", "for", ["get", "checkboxName", ["loc", [null, [4, 17], [4, 29]]]]], ["block", "if", [["get", "active", ["loc", [null, [5, 12], [5, 18]]]]], [], 0, 1, ["loc", [null, [5, 6], [9, 13]]]], ["block", "if", [["get", "active", ["loc", [null, [14, 10], [14, 16]]]]], [], 2, null, ["loc", [null, [14, 4], [34, 11]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("ember-on-fhir/templates/components/draggable-object-target", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": {
            "name": "modifiers",
            "modifiers": ["action"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/draggable-object-target.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1, "href", "#");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0, 1, 1);
          return morphs;
        },
        statements: [["element", "action", ["acceptForDrop"], [], ["loc", [null, [2, 14], [2, 40]]]], ["content", "yield", ["loc", [null, [3, 4], [3, 13]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/draggable-object-target.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "yield", ["loc", [null, [6, 2], [6, 11]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 8,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/draggable-object-target.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "enableClicking", ["loc", [null, [1, 6], [1, 20]]]]], [], 0, 1, ["loc", [null, [1, 0], [7, 7]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/draggable-object", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": {
            "name": "modifiers",
            "modifiers": ["action"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/draggable-object.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1, "href", "#");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0, 1, 1);
          return morphs;
        },
        statements: [["element", "action", ["selectForDrag"], [], ["loc", [null, [2, 14], [2, 40]]]], ["content", "yield", ["loc", [null, [3, 4], [3, 13]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/draggable-object.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "yield", ["loc", [null, [6, 2], [6, 11]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 7
          }
        },
        "moduleName": "ember-on-fhir/templates/components/draggable-object.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "enableClicking", ["loc", [null, [1, 6], [1, 20]]]]], [], 0, 1, ["loc", [null, [1, 0], [7, 7]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/encounter-code-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 6
            },
            "end": {
              "line": 7,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/encounter-code-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Encounter code\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/encounter-code-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Encounter Code\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 6
              },
              "end": {
                "line": 30,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/encounter-code-filter.hbs"
          },
          isEmpty: false,
          arity: 2,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "selected-filter-details selected-filter-details-spaced");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "pane-inner-label");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("for system");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "pane-select");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "pane-inner-label");
            var el3 = dom.createTextNode("is");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            dom.setAttribute(el2, "aria-label", "Close");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("span");
            dom.setAttribute(el3, "aria-hidden", "true");
            var el4 = dom.createElement("i");
            dom.setAttribute(el4, "class", "fa fa-times");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [9]);
            var morphs = new Array(4);
            morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
            morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
            morphs[2] = dom.createMorphAt(element0, 7, 7);
            morphs[3] = dom.createAttrMorph(element1, 'onclick');
            return morphs;
          },
          statements: [["inline", "if", [["subexpr", "gt", [["get", "index", ["loc", [null, [17, 50], [17, 55]]]], 0], [], ["loc", [null, [17, 46], [17, 58]]]], "or "], [], ["loc", [null, [17, 41], [17, 67]]]], ["inline", "select-fx", [], ["options", ["subexpr", "@mut", [["get", "codingSystems", ["loc", [null, [19, 32], [19, 45]]]]], [], []], "value", "coding.system", "valuePath", "system", "onChange", ["subexpr", "action", ["selectCodingSystem", ["get", "coding", ["loc", [null, [19, 125], [19, 131]]]]], [], ["loc", [null, [19, 96], [19, 132]]]]], ["loc", [null, [19, 12], [19, 134]]]], ["inline", "coding-typeahead", [], ["coding", ["subexpr", "@mut", [["get", "coding", ["loc", [null, [23, 19], [23, 25]]]]], [], []], "type", "encounter", "placeholder", "encounter code"], ["loc", [null, [22, 10], [25, 42]]]], ["attribute", "onclick", ["subexpr", "action", ["removeCode", ["get", "characteristic.valueCodeableConcept", ["loc", [null, [26, 76], [26, 111]]]], ["get", "coding", ["loc", [null, [26, 112], [26, 118]]]]], [], ["loc", [null, [26, 54], [26, 120]]]]]],
          locals: ["coding", "index"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 4
            },
            "end": {
              "line": 34,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/encounter-code-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "selected-filter-details");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "cursor-pointer");
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-plus-circle");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" Add new coding ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [2, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createAttrMorph(element2, 'onclick');
          dom.insertBoundary(fragment, 0);
          return morphs;
        },
        statements: [["block", "each", [["get", "characteristic.valueCodeableConcept.coding", ["loc", [null, [15, 14], [15, 56]]]]], [], 0, null, ["loc", [null, [15, 6], [30, 15]]]], ["attribute", "onclick", ["subexpr", "action", ["addCode", ["get", "characteristic.valueCodeableConcept", ["loc", [null, [32, 64], [32, 99]]]]], [], ["loc", [null, [32, 45], [32, 101]]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 37,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/encounter-code-filter.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "class", "form-horizontal filter-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "checkbox");
        dom.setAttribute(el3, "name", "checkbox-encounter-code");
        dom.setAttribute(el3, "class", "css-checkbox");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "class", "css-label css-label-box checkbox-label");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [1]);
        if (this.cachedFragment) {
          dom.repairClonedNode(element5, [], true);
        }
        var element6 = dom.childAt(element4, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element5, 'id');
        morphs[1] = dom.createAttrMorph(element5, 'checked');
        morphs[2] = dom.createElementMorph(element5);
        morphs[3] = dom.createAttrMorph(element6, 'for');
        morphs[4] = dom.createMorphAt(element6, 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        return morphs;
      },
      statements: [["attribute", "id", ["get", "checkboxName", ["loc", [null, [3, 32], [3, 44]]]]], ["attribute", "checked", ["get", "checkboxChecked", ["loc", [null, [3, 109], [3, 124]]]]], ["element", "action", ["toggle"], ["on", "change"], ["loc", [null, [3, 127], [3, 158]]]], ["attribute", "for", ["get", "checkboxName", ["loc", [null, [4, 17], [4, 29]]]]], ["block", "if", [["get", "active", ["loc", [null, [5, 12], [5, 18]]]]], [], 0, 1, ["loc", [null, [5, 6], [9, 13]]]], ["block", "if", [["get", "active", ["loc", [null, [14, 10], [14, 16]]]]], [], 2, null, ["loc", [null, [14, 4], [34, 11]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("ember-on-fhir/templates/components/filter-builder", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 10
            },
            "end": {
              "line": 25,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-icon");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-birthday-cake fa-fw");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-name");
          var el3 = dom.createTextNode("Age");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2, "class", "fa fa-chevron-right filter-type-chevron");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element3, 'class');
          return morphs;
        },
        statements: [["attribute", "class", ["subexpr", "if", [["get", "canAddAgeFilter", ["loc", [null, [18, 28], [18, 43]]]], "filter-type", "filter-type-disabled"], [], ["loc", [null, [18, 23], [18, 82]]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 10
            },
            "end": {
              "line": 35,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-icon");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-user fa-fw");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-name");
          var el3 = dom.createTextNode("Gender");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2, "class", "fa fa-chevron-right filter-type-chevron");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element2, 'class');
          return morphs;
        },
        statements: [["attribute", "class", ["subexpr", "if", [["get", "canAddGenderFilter", ["loc", [null, [28, 28], [28, 46]]]], "filter-type", "filter-type-disabled"], [], ["loc", [null, [28, 23], [28, 85]]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 37,
              "column": 10
            },
            "end": {
              "line": 45,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "filter-type");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-icon");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "icon-med-clipboard");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-name");
          var el3 = dom.createTextNode("Condition");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2, "class", "fa fa-chevron-right filter-type-chevron");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 47,
              "column": 10
            },
            "end": {
              "line": 55,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "filter-type");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-icon");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-hospital-o fa-fw");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "filter-type-name");
          var el3 = dom.createTextNode("Encounter");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2, "class", "fa fa-chevron-right filter-type-chevron");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 71,
                  "column": 14
                },
                "end": {
                  "line": 73,
                  "column": 14
                }
              },
              "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "filter-pane", [], ["pane", ["subexpr", "@mut", [["get", "pane", ["loc", [null, [72, 35], [72, 39]]]]], [], []], "group", ["subexpr", "@mut", [["get", "group", ["loc", [null, [72, 46], [72, 51]]]]], [], []], "onChange", ["subexpr", "action", ["updateCounts"], [], ["loc", [null, [72, 61], [72, 84]]]], "removePane", ["subexpr", "action", ["removePane"], [], ["loc", [null, [72, 96], [72, 117]]]]], ["loc", [null, [72, 16], [72, 119]]]]],
            locals: ["pane"],
            templates: []
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 70,
                "column": 12
              },
              "end": {
                "line": 84,
                "column": 12
              }
            },
            "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "save-new-filter row");
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2, "class", "pane-input col-sm-8");
            var el3 = dom.createTextNode("\n                  ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2, "class", "col-sm-4");
            var el3 = dom.createTextNode("\n                  ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("button");
            dom.setAttribute(el3, "class", "btn btn-lg btn-primary pull-right");
            var el4 = dom.createTextNode("Save Filter");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [2]);
            var element1 = dom.childAt(element0, [3, 1]);
            var morphs = new Array(3);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
            morphs[2] = dom.createElementMorph(element1);
            dom.insertBoundary(fragment, 0);
            return morphs;
          },
          statements: [["block", "each", [["get", "panes", ["loc", [null, [71, 22], [71, 27]]]]], [], 0, null, ["loc", [null, [71, 14], [73, 23]]]], ["inline", "input", [], ["type", "text", "value", ["subexpr", "@mut", [["get", "filterName", ["loc", [null, [77, 44], [77, 54]]]]], [], []], "placeholder", "name of filter"], ["loc", [null, [77, 18], [77, 85]]]], ["element", "action", ["saveFilter"], [], ["loc", [null, [81, 68], [81, 91]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 84,
                "column": 12
              },
              "end": {
                "line": 88,
                "column": 12
              }
            },
            "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1, "class", "sub-text");
            var el2 = dom.createTextNode("\n                No filters. Drag filter type here.\n              ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 69,
              "column": 10
            },
            "end": {
              "line": 89,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "hasFilterPane", ["loc", [null, [70, 18], [70, 31]]]]], [], 0, 1, ["loc", [null, [70, 12], [88, 19]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 95,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/filter-builder.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "title-panel row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "title-text col-md-4 col-sm-12");
        var el4 = dom.createTextNode("Filter Builder");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-8 col-sm-12");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row filter-builder-container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-3 col-sm-5");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "panel-heading");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "panel-title");
        var el7 = dom.createTextNode("\n            Filter Type\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "panel-body filter-types");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-9 col-sm-7");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "panel-heading");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "panel-title");
        var el7 = dom.createTextNode("\n            Filter Details\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "filter-details panel-body");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element4 = dom.childAt(fragment, [0]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element5, [1, 1, 3]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element4, [1, 3]), 0, 0);
        morphs[1] = dom.createMorphAt(element6, 1, 1);
        morphs[2] = dom.createMorphAt(element6, 3, 3);
        morphs[3] = dom.createMorphAt(element6, 5, 5);
        morphs[4] = dom.createMorphAt(element6, 7, 7);
        morphs[5] = dom.createMorphAt(dom.childAt(element5, [3, 1, 3]), 1, 1);
        return morphs;
      },
      statements: [["inline", "filter-counts", [], ["group", ["subexpr", "@mut", [["get", "group", ["loc", [null, [4, 58], [4, 63]]]]], [], []]], ["loc", [null, [4, 36], [4, 65]]]], ["block", "draggable-object", [], ["content", ["subexpr", "@mut", [["get", "patientAgeObject", ["loc", [null, [17, 38], [17, 54]]]]], [], []], "isDraggable", ["subexpr", "@mut", [["get", "canAddAgeFilter", ["loc", [null, [17, 67], [17, 82]]]]], [], []]], 0, null, ["loc", [null, [17, 10], [25, 31]]]], ["block", "draggable-object", [], ["content", ["subexpr", "@mut", [["get", "patientGenderObject", ["loc", [null, [27, 38], [27, 57]]]]], [], []], "isDraggable", ["subexpr", "@mut", [["get", "canAddGenderFilter", ["loc", [null, [27, 70], [27, 88]]]]], [], []]], 1, null, ["loc", [null, [27, 10], [35, 31]]]], ["block", "draggable-object", [], ["content", ["subexpr", "@mut", [["get", "conditionObject", ["loc", [null, [37, 38], [37, 53]]]]], [], []]], 2, null, ["loc", [null, [37, 10], [45, 31]]]], ["block", "draggable-object", [], ["content", ["subexpr", "@mut", [["get", "encounterObject", ["loc", [null, [47, 38], [47, 53]]]]], [], []]], 3, null, ["loc", [null, [47, 10], [55, 31]]]], ["block", "draggable-object-target", [], ["action", "addPane", "class", "drop-area"], 4, null, ["loc", [null, [69, 10], [89, 38]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  })());
});
define("ember-on-fhir/templates/components/filter-counts", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 6
            },
            "end": {
              "line": 7,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n         \n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "ember-spinner", [], ["config", "small", "top", "30%"], ["loc", [null, [5, 8], [5, 50]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "patientCount", ["loc", [null, [8, 8], [8, 24]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 6
            },
            "end": {
              "line": 19,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n         \n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "ember-spinner", [], ["config", "small", "top", "30%"], ["loc", [null, [17, 8], [17, 50]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 6
            },
            "end": {
              "line": 21,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "conditionCount", ["loc", [null, [20, 8], [20, 26]]]]],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 28,
              "column": 6
            },
            "end": {
              "line": 31,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n         \n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "ember-spinner", [], ["config", "small", "top", "30%"], ["loc", [null, [29, 8], [29, 50]]]]],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 31,
              "column": 6
            },
            "end": {
              "line": 33,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "encounterCount", ["loc", [null, [32, 8], [32, 26]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 41,
            "column": 6
          }
        },
        "moduleName": "ember-on-fhir/templates/components/filter-counts.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "count col-sm-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "count-value");
        dom.setAttribute(el3, "id", "patient-count");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("patients");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "count col-sm-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "count-value");
        dom.setAttribute(el3, "id", "condition-count");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("conditions");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "count col-sm-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "count-value");
        dom.setAttribute(el3, "id", "encounter-count");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("encounters");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3, 1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "if", [["get", "loading", ["loc", [null, [4, 12], [4, 19]]]]], [], 0, 1, ["loc", [null, [4, 6], [9, 13]]]], ["block", "if", [["get", "loading", ["loc", [null, [16, 12], [16, 19]]]]], [], 2, 3, ["loc", [null, [16, 6], [21, 13]]]], ["block", "if", [["get", "loading", ["loc", [null, [28, 12], [28, 19]]]]], [], 4, 5, ["loc", [null, [28, 6], [33, 13]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
define("ember-on-fhir/templates/components/filter-pane", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 26,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/filter-pane.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-sm-2 pane-icon");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("i");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-xs-10 pane-content");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row pane-outline");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-xs-11");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "row");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-xs-1 pane-close");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "type", "button");
        dom.setAttribute(el4, "class", "close");
        dom.setAttribute(el4, "aria-label", "Close");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "aria-hidden", "true");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6, "class", "fa fa-times");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "pointer-bottom");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "pointer-top");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(fragment, [2, 1]);
        var element2 = dom.childAt(element1, [3, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [1, 1]), 1, 1);
        morphs[2] = dom.createAttrMorph(element2, 'onclick');
        return morphs;
      },
      statements: [["attribute", "class", ["concat", ["fa fa-fw ", ["get", "icon", ["loc", [null, [2, 23], [2, 27]]]]]]], ["inline", "component", [["get", "filterType", ["loc", [null, [9, 20], [9, 30]]]]], ["characteristic", ["subexpr", "@mut", [["get", "characteristic", ["loc", [null, [10, 25], [10, 39]]]]], [], []], "createCharacteristic", ["subexpr", "action", ["createCharacteristic"], [], ["loc", [null, [11, 31], [11, 62]]]], "destroyCharacteristic", ["subexpr", "action", ["destroyCharacteristic"], [], ["loc", [null, [12, 32], [12, 64]]]], "onChange", ["subexpr", "action", [["get", "this.attrs.onChange", ["loc", [null, [13, 27], [13, 46]]]]], [], ["loc", [null, [13, 19], [13, 47]]]]], ["loc", [null, [9, 8], [13, 49]]]], ["attribute", "onclick", ["subexpr", "action", ["removePane"], [], ["loc", [null, [18, 50], [18, 73]]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/form-validation-tooltip", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["empty-body"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/form-validation-tooltip.hbs"
      },
      isEmpty: true,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/gender-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 6
            },
            "end": {
              "line": 7,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/gender-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Patient gender is\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/gender-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        Patient Gender\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 4
            },
            "end": {
              "line": 33,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/gender-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row selected-filter-details");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-md-3");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "css-label css-label-circle radio-label");
          dom.setAttribute(el3, "for", "male");
          var el4 = dom.createTextNode("male");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-md-3");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "css-label css-label-circle radio-label");
          dom.setAttribute(el3, "for", "female");
          var el4 = dom.createTextNode("female");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-md-3");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "css-label css-label-circle radio-label");
          dom.setAttribute(el3, "for", "other");
          var el4 = dom.createTextNode("other");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-md-3");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "css-label css-label-circle radio-label");
          dom.setAttribute(el3, "for", "unknown");
          var el4 = dom.createTextNode("unknown");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(4);
          morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]), 1, 1);
          morphs[3] = dom.createMorphAt(dom.childAt(element0, [7]), 1, 1);
          return morphs;
        },
        statements: [["inline", "radio-button", [], ["radioClass", "input-control css-checkbox", "radioId", "male", "groupValue", ["subexpr", "@mut", [["get", "genderValue", ["loc", [null, [17, 91], [17, 102]]]]], [], []], "value", "male"], ["loc", [null, [17, 10], [17, 117]]]], ["inline", "radio-button", [], ["radioClass", "input-control css-checkbox", "radioId", "female", "groupValue", ["subexpr", "@mut", [["get", "genderValue", ["loc", [null, [21, 93], [21, 104]]]]], [], []], "value", "female"], ["loc", [null, [21, 10], [21, 121]]]], ["inline", "radio-button", [], ["radioClass", "input-control css-checkbox", "radioId", "other", "groupValue", ["subexpr", "@mut", [["get", "genderValue", ["loc", [null, [25, 92], [25, 103]]]]], [], []], "value", "other"], ["loc", [null, [25, 10], [25, 119]]]], ["inline", "radio-button", [], ["radioClass", "input-control css-checkbox", "radioId", "unknown", "groupValue", ["subexpr", "@mut", [["get", "genderValue", ["loc", [null, [29, 94], [29, 105]]]]], [], []], "value", "unknown"], ["loc", [null, [29, 10], [29, 123]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 36,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/gender-filter.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "class", "form-horizontal filter-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "checkbox");
        dom.setAttribute(el3, "name", "checkbox-patient-gender");
        dom.setAttribute(el3, "class", "css-checkbox");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "class", "css-label css-label-box checkbox-label");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [1]);
        if (this.cachedFragment) {
          dom.repairClonedNode(element3, [], true);
        }
        var element4 = dom.childAt(element2, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element3, 'id');
        morphs[1] = dom.createAttrMorph(element3, 'checked');
        morphs[2] = dom.createElementMorph(element3);
        morphs[3] = dom.createAttrMorph(element4, 'for');
        morphs[4] = dom.createMorphAt(element4, 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
        return morphs;
      },
      statements: [["attribute", "id", ["get", "checkboxName", ["loc", [null, [3, 32], [3, 44]]]]], ["attribute", "checked", ["get", "checkboxChecked", ["loc", [null, [3, 109], [3, 124]]]]], ["element", "action", ["toggle"], ["on", "change"], ["loc", [null, [3, 127], [3, 158]]]], ["attribute", "for", ["get", "checkboxName", ["loc", [null, [4, 17], [4, 29]]]]], ["block", "if", [["get", "active", ["loc", [null, [5, 12], [5, 18]]]]], [], 0, 1, ["loc", [null, [5, 6], [9, 13]]]], ["block", "if", [["get", "active", ["loc", [null, [14, 10], [14, 16]]]]], [], 2, null, ["loc", [null, [14, 4], [33, 11]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("ember-on-fhir/templates/components/horizontal-bar-chart", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/horizontal-bar-chart.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 0], [1, 9]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/ie-navbar", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 4
            },
            "end": {
              "line": 15,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1, "class", "logo");
          dom.setAttribute(el1, "src", "/assets/images/logo-3x.png");
          dom.setAttribute(el1, "alt", "Intervention Engine");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 20,
                "column": 29
              },
              "end": {
                "line": 20,
                "column": 87
              }
            },
            "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-user");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" Patients");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 20,
              "column": 6
            },
            "end": {
              "line": 20,
              "column": 99
            }
          },
          "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "link-to", ["patients"], [], 0, null, ["loc", [null, [20, 29], [20, 99]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 21,
                "column": 29
              },
              "end": {
                "line": 21,
                "column": 98
              }
            },
            "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-filter");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" Filter Builder");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 6
            },
            "end": {
              "line": 21,
              "column": 110
            }
          },
          "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "link-to", ["filters.new"], [], 0, null, ["loc", [null, [21, 29], [21, 110]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 0
            },
            "end": {
              "line": 29,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "logout-modal", [], ["onClose", ["subexpr", "action", [["subexpr", "mut", [["get", "showLogoutModal", ["loc", [null, [28, 38], [28, 53]]]]], [], ["loc", [null, [28, 33], [28, 54]]]], false], [], ["loc", [null, [28, 25], [28, 61]]]]], ["loc", [null, [28, 2], [28, 63]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 30,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/ie-navbar.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1, "class", "navbar navbar-inverse navbar-static-top");
        dom.setAttribute(el1, "role", "navigation");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "navbar-header");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3, "type", "button");
        dom.setAttribute(el3, "class", "navbar-toggle");
        dom.setAttribute(el3, "data-toggle", "collapse");
        dom.setAttribute(el3, "data-target", ".navbar-ex1-collapse");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "sr-only");
        var el5 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "icon-bar");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "icon-bar");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "icon-bar");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "collapse navbar-collapse navbar-ex1-collapse");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3, "class", "nav navbar-nav navbar-right");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5, "href", "#");
        dom.setAttribute(el5, "class", "navbar-right");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6, "class", "fa fa-sign-out");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Logout");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3, 1]);
        var element2 = dom.childAt(element1, [5, 0]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 3, 3);
        morphs[1] = dom.createMorphAt(element1, 1, 1);
        morphs[2] = dom.createMorphAt(element1, 3, 3);
        morphs[3] = dom.createAttrMorph(element2, 'onclick');
        morphs[4] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "link-to", ["index"], ["class", "navbar-brand"], 0, null, ["loc", [null, [13, 4], [15, 16]]]], ["block", "navbar-active-link", [], [], 1, null, ["loc", [null, [20, 6], [20, 122]]]], ["block", "navbar-active-link", [], [], 2, null, ["loc", [null, [21, 6], [21, 133]]]], ["attribute", "onclick", ["subexpr", "action", ["openLogoutModal"], [], ["loc", [null, [22, 30], [22, 58]]]]], ["block", "if", [["get", "showLogoutModal", ["loc", [null, [27, 6], [27, 21]]]]], [], 3, null, ["loc", [null, [27, 0], [29, 7]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("ember-on-fhir/templates/components/labeled-radio-button", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/labeled-radio-button.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "radio-button", [], ["radioClass", ["subexpr", "@mut", [["get", "radioClass", ["loc", [null, [2, 15], [2, 25]]]]], [], []], "radioId", ["subexpr", "@mut", [["get", "radioId", ["loc", [null, [3, 12], [3, 19]]]]], [], []], "changed", "innerRadioChanged", "disabled", ["subexpr", "@mut", [["get", "disabled", ["loc", [null, [5, 13], [5, 21]]]]], [], []], "groupValue", ["subexpr", "@mut", [["get", "groupValue", ["loc", [null, [6, 15], [6, 25]]]]], [], []], "name", ["subexpr", "@mut", [["get", "name", ["loc", [null, [7, 9], [7, 13]]]]], [], []], "required", ["subexpr", "@mut", [["get", "required", ["loc", [null, [8, 13], [8, 21]]]]], [], []], "value", ["subexpr", "@mut", [["get", "value", ["loc", [null, [9, 10], [9, 15]]]]], [], []]], ["loc", [null, [1, 0], [9, 17]]]], ["content", "yield", ["loc", [null, [11, 0], [11, 9]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/login-register", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/login-register.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container login-register");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "panel-title login-register-logo visible-sm visible-xs");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("img");
        dom.setAttribute(el6, "src", "/assets/images/logo-darkbg-lg.png");
        dom.setAttribute(el6, "alt", "Intervention Engine");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "panel-body");
        var el6 = dom.createTextNode("\n\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1, 1, 3]), 1, 1);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [10, 10], [10, 19]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/logout-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["multiple-nodes"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 10,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/logout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "modal-body logout-modal-body");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2, "class", "fa fa-exclamation-circle");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "logout-modal-body-text");
          var el3 = dom.createTextNode(" To log out, please close your browser window.");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "modal-footer");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2, "type", "button");
          dom.setAttribute(el2, "class", "btn btn-primary");
          var el3 = dom.createTextNode("OK");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [3, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element0, 'onclick');
          return morphs;
        },
        statements: [["attribute", "onclick", ["subexpr", "action", [["get", "attrs.onClose", ["loc", [null, [8, 67], [8, 80]]]]], [], ["loc", [null, [8, 58], [8, 82]]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/logout-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "bootstrap-modal", [], ["title", "Logout", "onClose", ["subexpr", "@mut", [["get", "attrs.onClose", ["loc", [null, [1, 42], [1, 55]]]]], [], []]], 0, null, ["loc", [null, [1, 0], [10, 20]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('ember-on-fhir/templates/components/modal-dialog', ['exports', 'ember-modal-dialog/templates/components/modal-dialog'], function (exports, _emberModalDialogTemplatesComponentsModalDialog) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberModalDialogTemplatesComponentsModalDialog['default'];
    }
  });
});
define("ember-on-fhir/templates/components/nested-panel", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 6
          }
        },
        "moduleName": "ember-on-fhir/templates/components/nested-panel.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel has-nested-panel");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-heading");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse-panel-title");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "data-toggle", "collapse");
        dom.setAttribute(el4, "aria-expanded", "true");
        dom.setAttribute(el4, "aria-controls", "collapseOne");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-body");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse in");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1, 1, 1]);
        var element2 = dom.childAt(element0, [3, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element1, 'href');
        morphs[1] = dom.createMorphAt(element1, 1, 1);
        morphs[2] = dom.createAttrMorph(element2, 'id');
        morphs[3] = dom.createMorphAt(element2, 1, 1);
        return morphs;
      },
      statements: [["attribute", "href", ["concat", ["#", ["get", "panelId", ["loc", [null, [4, 41], [4, 48]]]]]]], ["content", "panelName", ["loc", [null, [5, 8], [5, 21]]]], ["attribute", "id", ["get", "panelId", ["loc", [null, [11, 34], [11, 41]]]]], ["content", "yield", ["loc", [null, [12, 6], [12, 15]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/object-bin", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 5,
                  "column": 4
                },
                "end": {
                  "line": 7,
                  "column": 4
                }
              },
              "moduleName": "ember-on-fhir/templates/components/object-bin.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "yield", [["get", "obj", ["loc", [null, [6, 14], [6, 17]]]]], [], ["loc", [null, [6, 6], [6, 19]]]]],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 2
              },
              "end": {
                "line": 8,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/components/object-bin.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "draggable-object", [], ["action", "handleObjectDragged", "content", ["subexpr", "@mut", [["get", "obj", ["loc", [null, [5, 61], [5, 64]]]]], [], []]], 0, null, ["loc", [null, [5, 4], [7, 25]]]]],
          locals: ["obj"],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["multiple-nodes", "wrong-type"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 9,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/object-bin.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "object-bin-title");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(fragment, 5, 5, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["content", "name", ["loc", [null, [2, 32], [2, 40]]]], ["block", "each", [["get", "model", ["loc", [null, [4, 10], [4, 15]]]]], [], 0, null, ["loc", [null, [4, 2], [8, 11]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/object-bin.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "draggable-object-target", [], ["action", "handleObjectDropped"], 0, null, ["loc", [null, [1, 0], [9, 28]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/page-numbers", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 7,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "arrow prev enabled-arrow");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2, "href", "#");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element4 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element4);
          return morphs;
        },
        statements: [["element", "action", ["incrementPage", -1], [], ["loc", [null, [5, 20], [5, 49]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 4
            },
            "end": {
              "line": 11,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "arrow prev disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2, "href", "#");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element3);
          return morphs;
        },
        statements: [["element", "action", ["incrementPage", -1], [], ["loc", [null, [9, 20], [9, 49]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 14,
                "column": 6
              },
              "end": {
                "line": 18,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "dots disabled");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            var el3 = dom.createTextNode("...");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 19,
                "column": 6
              },
              "end": {
                "line": 23,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "active page-number");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]), 0, 0);
            return morphs;
          },
          statements: [["content", "item.page", ["loc", [null, [21, 13], [21, 26]]]]],
          locals: [],
          templates: []
        };
      })();
      var child2 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 23,
                "column": 6
              },
              "end": {
                "line": 27,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "page-number");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            dom.setAttribute(el2, "href", "#");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element2 = dom.childAt(fragment, [1, 1]);
            var morphs = new Array(2);
            morphs[0] = dom.createElementMorph(element2);
            morphs[1] = dom.createMorphAt(element2, 0, 0);
            return morphs;
          },
          statements: [["element", "action", ["pageClicked", ["get", "item.page", ["loc", [null, [25, 45], [25, 54]]]]], [], ["loc", [null, [25, 22], [25, 56]]]], ["content", "item.page", ["loc", [null, [25, 57], [25, 70]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 4
            },
            "end": {
              "line": 28,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "item.dots", ["loc", [null, [14, 12], [14, 21]]]]], [], 0, null, ["loc", [null, [14, 6], [18, 13]]]], ["block", "if", [["get", "item.current", ["loc", [null, [19, 12], [19, 24]]]]], [], 1, 2, ["loc", [null, [19, 6], [27, 13]]]]],
        locals: ["item"],
        templates: [child0, child1, child2]
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 30,
              "column": 4
            },
            "end": {
              "line": 34,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "arrow next enabled-arrow");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2, "href", "#");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [["element", "action", ["incrementPage", 1], [], ["loc", [null, [32, 20], [32, 48]]]]],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 34,
              "column": 4
            },
            "end": {
              "line": 38,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "arrow next disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2, "href", "#");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["incrementPage", 1], [], ["loc", [null, [36, 20], [36, 48]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 41,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/page-numbers.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "pagination-centered");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2, "class", "pagination");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element5 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element5, 1, 1);
        morphs[1] = dom.createMorphAt(element5, 3, 3);
        morphs[2] = dom.createMorphAt(element5, 5, 5);
        return morphs;
      },
      statements: [["block", "if", [["get", "canStepBackward", ["loc", [null, [3, 10], [3, 25]]]]], [], 0, 1, ["loc", [null, [3, 4], [11, 11]]]], ["block", "each", [["get", "pageItems", ["loc", [null, [13, 12], [13, 21]]]]], [], 2, null, ["loc", [null, [13, 4], [28, 13]]]], ["block", "if", [["get", "canStepForward", ["loc", [null, [30, 10], [30, 24]]]]], [], 3, 4, ["loc", [null, [30, 4], [38, 11]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-badge", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 10
            },
            "end": {
              "line": 14,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-badge.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "badge");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["content", "patient.notifications.count", ["loc", [null, [13, 32], [13, 63]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 39,
              "column": 10
            },
            "end": {
              "line": 45,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-badge.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "patient-next-huddle");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(element0, 1, 1);
          morphs[1] = dom.createMorphAt(element0, 3, 3);
          morphs[2] = dom.createMorphAt(element0, 5, 5);
          return morphs;
        },
        statements: [["inline", "huddle-reason-icon", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [41, 43], [41, 50]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "nextHuddle", ["loc", [null, [41, 58], [41, 68]]]]], [], []]], ["loc", [null, [41, 14], [41, 70]]]], ["inline", "moment-format", [["get", "nextHuddle.date", ["loc", [null, [42, 30], [42, 45]]]], "ll"], [], ["loc", [null, [42, 14], [42, 52]]]], ["inline", "huddle-discussed-icon", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [43, 46], [43, 53]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "nextHuddle", ["loc", [null, [43, 61], [43, 71]]]]], [], []]], ["loc", [null, [43, 14], [43, 73]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 50,
              "column": 8
            },
            "end": {
              "line": 54,
              "column": 8
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-badge.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "patient-risk-bar");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "patient-risk");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]), 0, 0);
          return morphs;
        },
        statements: [["content", "computedRisk", ["loc", [null, [52, 39], [52, 55]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 58,
            "column": 6
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-badge.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "patient-info");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "media");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "media-left media-middle");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4, "class", "fa fa-user media-object");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "media-body");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "row");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "patient-name col-xs-12");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "row");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "col-md-6");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "patient-age-gender-location");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7, "class", "patient-age");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("i");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode(" yrs\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7, "class", "patient-gender");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("i");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "col-md-6");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "patient-risk-bar-container");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0, 1, 3]);
        var element2 = dom.childAt(element1, [1, 1]);
        var element3 = dom.childAt(element1, [3]);
        var element4 = dom.childAt(element3, [1, 1]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element4, [3]);
        var element8 = dom.childAt(element7, [1]);
        var morphs = new Array(8);
        morphs[0] = dom.createMorphAt(element2, 1, 1);
        morphs[1] = dom.createMorphAt(element2, 3, 3);
        morphs[2] = dom.createAttrMorph(element6, 'class');
        morphs[3] = dom.createMorphAt(element5, 3, 3);
        morphs[4] = dom.createAttrMorph(element8, 'class');
        morphs[5] = dom.createMorphAt(element7, 3, 3);
        morphs[6] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        morphs[7] = dom.createMorphAt(dom.childAt(element1, [5]), 1, 1);
        return morphs;
      },
      statements: [["content", "patient.fullName", ["loc", [null, [10, 10], [10, 30]]]], ["block", "if", [["get", "patient.notifications.count", ["loc", [null, [12, 16], [12, 43]]]]], [], 0, null, ["loc", [null, [12, 10], [14, 17]]]], ["attribute", "class", ["get", "ageIconClassName", ["loc", [null, [22, 25], [22, 41]]]]], ["content", "patient.computedAge", ["loc", [null, [23, 14], [23, 37]]]], ["attribute", "class", ["concat", ["fa ", ["get", "genderIconClassName", ["loc", [null, [27, 29], [27, 48]]]]]]], ["content", "patient.computedGender", ["loc", [null, [28, 14], [28, 40]]]], ["block", "if", [["get", "nextHuddle", ["loc", [null, [39, 16], [39, 26]]]]], [], 1, null, ["loc", [null, [39, 10], [45, 17]]]], ["block", "if", [["get", "displayRiskScore", ["loc", [null, [50, 14], [50, 30]]]]], [], 2, null, ["loc", [null, [50, 8], [54, 15]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-print-badge", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 4,
              "column": 60
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-print-badge.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["inline", "moment-format", [["get", "nextHuddle.date", ["loc", [null, [4, 38], [4, 53]]]], "ll"], [], ["loc", [null, [4, 22], [4, 60]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 60
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-print-badge.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["content", "huddlePatient.displayReasonText", ["loc", [null, [5, 25], [5, 60]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 61
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-print-badge.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-check");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 25
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-print-badge.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" yrs");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [4]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(fragment, [6]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(fragment, [8]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(fragment, [10]), 0, 0);
        morphs[6] = dom.createMorphAt(dom.childAt(fragment, [12]), 0, 0);
        return morphs;
      },
      statements: [["content", "patient.fullName", ["loc", [null, [1, 4], [1, 24]]]], ["content", "patient.computedGender", ["loc", [null, [2, 4], [2, 30]]]], ["content", "patient.computedAge", ["loc", [null, [3, 4], [3, 27]]]], ["block", "if", [["get", "nextHuddle", ["loc", [null, [4, 10], [4, 20]]]]], [], 0, null, ["loc", [null, [4, 4], [4, 67]]]], ["block", "if", [["get", "huddlePatient", ["loc", [null, [5, 10], [5, 23]]]]], [], 1, null, ["loc", [null, [5, 4], [5, 67]]]], ["block", "if", [["get", "huddlePatient.reviewed", ["loc", [null, [6, 10], [6, 32]]]]], [], 2, null, ["loc", [null, [6, 4], [6, 68]]]], ["content", "computedRisk", ["loc", [null, [7, 4], [7, 20]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-search/huddle-list", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 25,
              "column": 12
            },
            "end": {
              "line": 27,
              "column": 12
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-search/huddle-list.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "moment-format", [["get", "selectedHuddle.date", ["loc", [null, [26, 30], [26, 49]]]], "ll"], [], ["loc", [null, [26, 14], [26, 56]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 12
            },
            "end": {
              "line": 29,
              "column": 12
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-search/huddle-list.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("em");
          var el2 = dom.createTextNode("Not Selected");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 38,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-search/huddle-list.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel populations-panel");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-heading");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse-panel-title");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "data-toggle", "collapse");
        dom.setAttribute(el4, "href", "#chooseHuddleList");
        dom.setAttribute(el4, "aria-expanded", "true");
        dom.setAttribute(el4, "aria-controls", "collapseOne");
        var el5 = dom.createTextNode("\n        Huddles\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-body");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse in");
        dom.setAttribute(el3, "id", "chooseHuddleList");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4, "class", "form-horizontal form-group-striped");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "form-group");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "id", "huddleList1");
        dom.setAttribute(el6, "type", "checkbox");
        dom.setAttribute(el6, "class", "css-checkbox");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6, "for", "huddleList1");
        dom.setAttribute(el6, "class", "css-label css-label-box checkbox-label");
        var el7 = dom.createTextNode("\n            Geriatrics Huddle\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "date-selector");
        dom.setAttribute(el6, "id", "huddleFilterSelector");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7, "class", "fa fa-chevron-down");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "hidden");
        dom.setAttribute(el7, "id", "huddleFilterInput");
        dom.setAttribute(el7, "value", "");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 1, 1, 1]);
        var element1 = dom.childAt(element0, [1]);
        if (this.cachedFragment) {
          dom.repairClonedNode(element1, [], true);
        }
        var morphs = new Array(3);
        morphs[0] = dom.createAttrMorph(element1, 'checked');
        morphs[1] = dom.createAttrMorph(element1, 'onclick');
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]), 1, 1);
        return morphs;
      },
      statements: [["attribute", "checked", ["get", "active", ["loc", [null, [19, 22], [19, 28]]]]], ["attribute", "onclick", ["subexpr", "action", ["toggle"], [], ["loc", [null, [20, 20], [20, 39]]]]], ["block", "if", [["get", "selectedHuddle", ["loc", [null, [25, 18], [25, 32]]]]], [], 0, 1, ["loc", [null, [25, 12], [29, 19]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-search/population-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 25,
                  "column": 14
                },
                "end": {
                  "line": 27,
                  "column": 14
                }
              },
              "moduleName": "ember-on-fhir/templates/components/patient-search/population-filter.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("i");
              dom.setAttribute(el1, "class", "fa fa-edit pull-right");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() {
              return [];
            },
            statements: [],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 10
              },
              "end": {
                "line": 29,
                "column": 10
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-search/population-filter.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "form-group");
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("input");
            dom.setAttribute(el2, "type", "checkbox");
            dom.setAttribute(el2, "class", "css-checkbox");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("label");
            dom.setAttribute(el2, "class", "css-label css-label-circle checkbox-label");
            var el3 = dom.createTextNode("\n                ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n              ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("            ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1]);
            if (this.cachedFragment) {
              dom.repairClonedNode(element1, [], true);
            }
            var element2 = dom.childAt(element0, [3]);
            var morphs = new Array(6);
            morphs[0] = dom.createAttrMorph(element1, 'id');
            morphs[1] = dom.createAttrMorph(element1, 'checked');
            morphs[2] = dom.createAttrMorph(element1, 'onchange');
            morphs[3] = dom.createAttrMorph(element2, 'for');
            morphs[4] = dom.createMorphAt(element2, 1, 1);
            morphs[5] = dom.createMorphAt(element0, 5, 5);
            return morphs;
          },
          statements: [["attribute", "id", ["get", "population.id", ["loc", [null, [18, 21], [18, 34]]]]], ["attribute", "checked", ["subexpr", "eq", [["get", "selectedPopulation", ["loc", [null, [19, 29], [19, 47]]]], ["get", "population", ["loc", [null, [19, 48], [19, 58]]]]], [], ["loc", [null, [19, 24], [19, 60]]]]], ["attribute", "onchange", ["subexpr", "action", ["togglePopulation", ["get", "population", ["loc", [null, [21, 53], [21, 63]]]]], [], ["loc", [null, [21, 25], [21, 65]]]]], ["attribute", "for", ["get", "population.id", ["loc", [null, [22, 27], [22, 40]]]]], ["content", "population.name", ["loc", [null, [23, 16], [23, 35]]]], ["block", "link-to", ["filters.show", ["get", "population", ["loc", [null, [25, 40], [25, 50]]]]], [], 0, null, ["loc", [null, [25, 14], [27, 26]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 8
            },
            "end": {
              "line": 30,
              "column": 8
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-search/population-filter.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "population.name", ["loc", [null, [15, 16], [15, 31]]]]], [], 0, null, ["loc", [null, [15, 10], [29, 17]]]]],
        locals: ["population"],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 32,
              "column": 10
            },
            "end": {
              "line": 32,
              "column": 77
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-search/population-filter.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-plus-circle");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" add new");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 38,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-search/population-filter.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel populations-panel");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-heading");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse-panel-title");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "data-toggle", "collapse");
        dom.setAttribute(el4, "href", "#choosePopulation");
        dom.setAttribute(el4, "aria-expanded", "true");
        dom.setAttribute(el4, "aria-controls", "collapseOne");
        var el5 = dom.createTextNode("\n        Populations\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-body");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse in");
        dom.setAttribute(el3, "id", "choosePopulation");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4, "class", "form-horizontal form-group-striped");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "add-new-filter");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [0, 3, 1, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element3, 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "populations", ["loc", [null, [14, 16], [14, 27]]]]], [], 0, null, ["loc", [null, [14, 8], [30, 17]]]], ["block", "link-to", ["filters.new"], [], 1, null, ["loc", [null, [32, 10], [32, 89]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-search/risk-assessment", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 3,
                "column": 4
              },
              "end": {
                "line": 15,
                "column": 4
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-search/risk-assessment.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "form-group");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("input");
            dom.setAttribute(el2, "type", "radio");
            dom.setAttribute(el2, "name", "risk-assessment-selection");
            dom.setAttribute(el2, "class", "css-checkbox");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("label");
            dom.setAttribute(el2, "class", "css-label css-label-circle checkbox-label");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("      ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1]);
            if (this.cachedFragment) {
              dom.repairClonedNode(element1, [], true);
            }
            var element2 = dom.childAt(element0, [3]);
            var morphs = new Array(6);
            morphs[0] = dom.createAttrMorph(element1, 'value');
            morphs[1] = dom.createAttrMorph(element1, 'id');
            morphs[2] = dom.createAttrMorph(element1, 'checked');
            morphs[3] = dom.createAttrMorph(element1, 'onchange');
            morphs[4] = dom.createAttrMorph(element2, 'for');
            morphs[5] = dom.createMorphAt(element2, 0, 0);
            return morphs;
          },
          statements: [["attribute", "value", ["get", "riskAssessment", ["loc", [null, [7, 18], [7, 32]]]]], ["attribute", "id", ["subexpr", "concat", [["get", "riskAssessment", ["loc", [null, [8, 22], [8, 36]]]], ["get", "index", ["loc", [null, [8, 37], [8, 42]]]]], [], ["loc", [null, [8, 13], [8, 44]]]]], ["attribute", "checked", ["subexpr", "eq", [["get", "currentAssessment", ["loc", [null, [10, 23], [10, 40]]]], ["get", "riskAssessment", ["loc", [null, [10, 41], [10, 55]]]]], [], ["loc", [null, [10, 18], [10, 57]]]]], ["attribute", "onchange", ["subexpr", "action", [["get", "attrs.selectRiskAssessment", ["loc", [null, [11, 28], [11, 54]]]]], ["value", "target.value"], ["loc", [null, [11, 19], [11, 77]]]]], ["attribute", "for", ["subexpr", "concat", [["get", "riskAssessment", ["loc", [null, [12, 28], [12, 42]]]], ["get", "index", ["loc", [null, [12, 43], [12, 48]]]]], [], ["loc", [null, [12, 19], [12, 50]]]]], ["content", "riskAssessment", ["loc", [null, [12, 101], [12, 119]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 16,
              "column": 2
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-search/risk-assessment.hbs"
        },
        isEmpty: false,
        arity: 2,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "riskAssessment", ["loc", [null, [3, 10], [3, 24]]]]], [], 0, null, ["loc", [null, [3, 4], [15, 11]]]]],
        locals: ["riskAssessment", "index"],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 7
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-search/risk-assessment.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "class", "form-horizontal form-group-striped");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "riskAssessments", ["loc", [null, [2, 10], [2, 25]]]]], [], 0, null, ["loc", [null, [2, 2], [16, 11]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-search/risk-score", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 19,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-search/risk-score.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel populations-panel");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-heading");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse-panel-title");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "data-toggle", "collapse");
        dom.setAttribute(el4, "href", "#chooseRiskScore");
        dom.setAttribute(el4, "aria-expanded", "true");
        dom.setAttribute(el4, "aria-controls", "collapseOne");
        var el5 = dom.createTextNode("\n        Risk Score\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel-body");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "collapse in");
        dom.setAttribute(el3, "id", "chooseRiskScore");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "low-value");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "id", "riskSlider");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "high-value");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [5]), 0, 0);
        return morphs;
      },
      statements: [["content", "minValue", ["loc", [null, [13, 29], [13, 41]]]], ["content", "maxValue", ["loc", [null, [15, 30], [15, 42]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/components/patient-search/sort-by", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 12,
                "column": 6
              },
              "end": {
                "line": 27,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-search/sort-by.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "btn-group pull-right");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1]);
            var element2 = dom.childAt(element1, [1]);
            var element3 = dom.childAt(element0, [3]);
            var element4 = dom.childAt(element3, [1]);
            var morphs = new Array(6);
            morphs[0] = dom.createAttrMorph(element1, 'class');
            morphs[1] = dom.createAttrMorph(element1, 'onclick');
            morphs[2] = dom.createAttrMorph(element2, 'class');
            morphs[3] = dom.createAttrMorph(element3, 'class');
            morphs[4] = dom.createAttrMorph(element3, 'onclick');
            morphs[5] = dom.createAttrMorph(element4, 'class');
            return morphs;
          },
          statements: [["attribute", "class", ["concat", ["btn ", ["subexpr", "if", [["subexpr", "sort-descending", [["get", "sortDescending", ["loc", [null, [16, 45], [16, 59]]]], ["get", "sortOption.invert", ["loc", [null, [16, 60], [16, 77]]]]], [], ["loc", [null, [16, 28], [16, 78]]]], "btn-default", "btn-active"], [], ["loc", [null, [16, 23], [16, 107]]]]]]], ["attribute", "onclick", ["subexpr", "action", [["get", "attrs.selectSortBy", ["loc", [null, [17, 29], [17, 47]]]], ["get", "sortOption.sortKey", ["loc", [null, [17, 48], [17, 66]]]], ["subexpr", "if", [["get", "sortOption.invert", ["loc", [null, [17, 71], [17, 88]]]], true, false], [], ["loc", [null, [17, 67], [17, 100]]]]], [], ["loc", [null, [17, 20], [17, 102]]]]], ["attribute", "class", ["concat", ["fa fa-sort-", ["get", "sortOption.sortIcon", ["loc", [null, [18, 35], [18, 54]]]], "-asc fa-fw"]]], ["attribute", "class", ["concat", ["btn ", ["subexpr", "if", [["subexpr", "sort-descending", [["get", "sortDescending", ["loc", [null, [22, 45], [22, 59]]]], ["get", "sortOption.invert", ["loc", [null, [22, 60], [22, 77]]]]], [], ["loc", [null, [22, 28], [22, 78]]]], "btn-active", "btn-default"], [], ["loc", [null, [22, 23], [22, 107]]]]]]], ["attribute", "onclick", ["subexpr", "action", [["get", "attrs.selectSortBy", ["loc", [null, [23, 29], [23, 47]]]], ["get", "sortOption.sortKey", ["loc", [null, [23, 48], [23, 66]]]], ["subexpr", "if", [["get", "sortOption.invert", ["loc", [null, [23, 71], [23, 88]]]], false, true], [], ["loc", [null, [23, 67], [23, 100]]]]], [], ["loc", [null, [23, 20], [23, 102]]]]], ["attribute", "class", ["concat", ["fa fa-sort-", ["get", "sortOption.sortIcon", ["loc", [null, [24, 35], [24, 54]]]], "-desc fa-fw"]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 4
            },
            "end": {
              "line": 29,
              "column": 2
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-search/sort-by.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "form-group");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "radio");
          dom.setAttribute(el2, "name", "risk-assessment-selection");
          dom.setAttribute(el2, "class", "css-checkbox");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("label");
          dom.setAttribute(el2, "class", "css-label css-label-circle checkbox-label");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element5 = dom.childAt(fragment, [1]);
          var element6 = dom.childAt(element5, [1]);
          if (this.cachedFragment) {
            dom.repairClonedNode(element6, [], true);
          }
          var element7 = dom.childAt(element5, [3]);
          var morphs = new Array(7);
          morphs[0] = dom.createAttrMorph(element6, 'value');
          morphs[1] = dom.createAttrMorph(element6, 'id');
          morphs[2] = dom.createAttrMorph(element6, 'checked');
          morphs[3] = dom.createAttrMorph(element6, 'onchange');
          morphs[4] = dom.createAttrMorph(element7, 'for');
          morphs[5] = dom.createMorphAt(element7, 0, 0);
          morphs[6] = dom.createMorphAt(element5, 5, 5);
          return morphs;
        },
        statements: [["attribute", "value", ["get", "sortOption.sortKey", ["loc", [null, [6, 16], [6, 34]]]]], ["attribute", "id", ["subexpr", "concat", ["patientSortBy", ["get", "sortOption.sortKey", ["loc", [null, [7, 36], [7, 54]]]]], [], ["loc", [null, [7, 11], [7, 56]]]]], ["attribute", "checked", ["subexpr", "eq", [["get", "sortBy", ["loc", [null, [9, 21], [9, 27]]]], ["get", "sortOption.sortKey", ["loc", [null, [9, 28], [9, 46]]]]], [], ["loc", [null, [9, 16], [9, 48]]]]], ["attribute", "onchange", ["subexpr", "action", [["get", "attrs.selectSortBy", ["loc", [null, [10, 26], [10, 44]]]], ["get", "sortOption.sortKey", ["loc", [null, [10, 45], [10, 63]]]], ["subexpr", "or", [["get", "sortOption.defaultSortDescending", ["loc", [null, [10, 68], [10, 100]]]], false], [], ["loc", [null, [10, 64], [10, 107]]]]], [], ["loc", [null, [10, 17], [10, 109]]]]], ["attribute", "for", ["subexpr", "concat", ["patientSortBy", ["get", "sortOption.sortKey", ["loc", [null, [11, 42], [11, 60]]]]], [], ["loc", [null, [11, 17], [11, 62]]]]], ["content", "sortOption.name", ["loc", [null, [11, 113], [11, 132]]]], ["block", "if", [["subexpr", "eq", [["get", "sortBy", ["loc", [null, [12, 16], [12, 22]]]], ["get", "sortOption.sortKey", ["loc", [null, [12, 23], [12, 41]]]]], [], ["loc", [null, [12, 12], [12, 42]]]]], [], 0, null, ["loc", [null, [12, 6], [27, 13]]]]],
        locals: ["sortOption"],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 30,
            "column": 7
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-search/sort-by.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "class", "form-horizontal form-group-striped");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "sortOptions", ["loc", [null, [2, 12], [2, 23]]]]], [], 0, null, ["loc", [null, [2, 4], [29, 11]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-stats", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 52,
                "column": 8
              },
              "end": {
                "line": 54,
                "column": 8
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-stats.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "condition.code.displayText", ["loc", [null, [53, 14], [53, 44]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 51,
              "column": 6
            },
            "end": {
              "line": 55,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-stats.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "condition.code", ["loc", [null, [52, 14], [52, 28]]]]], [], 0, null, ["loc", [null, [52, 8], [54, 15]]]]],
        locals: ["condition"],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 73,
                "column": 8
              },
              "end": {
                "line": 75,
                "column": 8
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-stats.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "medication.displayText", ["loc", [null, [74, 14], [74, 40]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 72,
              "column": 6
            },
            "end": {
              "line": 76,
              "column": 6
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-stats.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "medication.displayText", ["loc", [null, [73, 14], [73, 36]]]]], [], 0, null, ["loc", [null, [73, 8], [75, 15]]]]],
        locals: ["medication"],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 95,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-stats.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel-heading");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "collapse-panel-title");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3, "data-toggle", "collapse");
        dom.setAttribute(el3, "href", "#conditions");
        dom.setAttribute(el3, "aria-expanded", "true");
        dom.setAttribute(el3, "aria-controls", "collapseOne");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4, "class", "icon-med-clipboard");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      Conditions (");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(")\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel-body");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "collapse in");
        dom.setAttribute(el2, "id", "conditions");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel-heading");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "collapse-panel-title");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3, "data-toggle", "collapse");
        dom.setAttribute(el3, "href", "#medications");
        dom.setAttribute(el3, "aria-expanded", "true");
        dom.setAttribute(el3, "aria-controls", "collapseOne");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4, "class", "icon-medication");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      Medications (");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(")\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "panel-body");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "collapse in");
        dom.setAttribute(el2, "id", "medications");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]), 3, 3);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3, 1, 1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [5, 1, 1]), 3, 3);
        morphs[3] = dom.createMorphAt(dom.childAt(fragment, [7, 1, 1]), 1, 1);
        return morphs;
      },
      statements: [["content", "patient.uniqueActiveConditions.length", ["loc", [null, [43, 18], [43, 59]]]], ["block", "each", [["get", "patient.uniqueActiveConditions", ["loc", [null, [51, 14], [51, 44]]]]], [], 0, null, ["loc", [null, [51, 6], [55, 15]]]], ["content", "patient.uniqueActiveMedications.length", ["loc", [null, [64, 19], [64, 61]]]], ["block", "each", [["get", "patient.uniqueActiveMedications", ["loc", [null, [72, 14], [72, 45]]]]], [], 1, null, ["loc", [null, [72, 6], [76, 15]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-summary", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "patientPhoto", ["loc", [null, [4, 6], [4, 22]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 7,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-user media-object");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 10
            },
            "end": {
              "line": 16,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "badge");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["content", "patient.notifications.count", ["loc", [null, [15, 32], [15, 63]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 34,
              "column": 8
            },
            "end": {
              "line": 40,
              "column": 8
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "patient-next-huddle");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(element0, 1, 1);
          morphs[1] = dom.createMorphAt(element0, 3, 3);
          morphs[2] = dom.createMorphAt(element0, 5, 5);
          return morphs;
        },
        statements: [["inline", "huddle-reason-icon", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [36, 41], [36, 48]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "huddle", ["loc", [null, [36, 56], [36, 62]]]]], [], []]], ["loc", [null, [36, 12], [36, 64]]]], ["inline", "moment-format", [["get", "huddle.date", ["loc", [null, [37, 28], [37, 39]]]], "ll"], [], ["loc", [null, [37, 12], [37, 46]]]], ["inline", "huddle-discussed-icon", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [38, 44], [38, 51]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "huddle", ["loc", [null, [38, 59], [38, 65]]]]], [], []]], ["loc", [null, [38, 12], [38, 67]]]]],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 44,
              "column": 8
            },
            "end": {
              "line": 46,
              "column": 8
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "patient-risk-chart", [], ["chartData", ["subexpr", "@mut", [["get", "risksWithBirthdayStart", ["loc", [null, [45, 41], [45, 63]]]]], [], []], "selectedRisk", ["subexpr", "@mut", [["get", "selectedRisk", ["loc", [null, [45, 77], [45, 89]]]]], [], []], "setSelectedRisk", ["subexpr", "@mut", [["get", "attrs.setSelectedRisk", ["loc", [null, [45, 106], [45, 127]]]]], [], []]], ["loc", [null, [45, 10], [45, 129]]]]],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 50,
              "column": 8
            },
            "end": {
              "line": 54,
              "column": 8
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "patient-risk");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["content", "selectedRisk.value", ["loc", [null, [52, 12], [52, 34]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 59,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-summary.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "media");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "media-left media-middle");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "media-body media-middle");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-xs-6");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "patient-name");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "patient-age");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("i");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" yrs\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "patient-gender");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("i");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-xs-5 patient-risk-chart");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-xs-1");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [3, 1]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [3]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element3, [5]);
        var element8 = dom.childAt(element7, [1]);
        var morphs = new Array(10);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(element4, 1, 1);
        morphs[2] = dom.createMorphAt(element4, 3, 3);
        morphs[3] = dom.createAttrMorph(element6, 'class');
        morphs[4] = dom.createMorphAt(element5, 3, 3);
        morphs[5] = dom.createAttrMorph(element8, 'class');
        morphs[6] = dom.createMorphAt(element7, 3, 3);
        morphs[7] = dom.createMorphAt(element3, 8, 8);
        morphs[8] = dom.createMorphAt(dom.childAt(element2, [3]), 1, 1);
        morphs[9] = dom.createMorphAt(dom.childAt(element2, [5]), 1, 1);
        return morphs;
      },
      statements: [["block", "if", [["get", "patientPhoto", ["loc", [null, [3, 10], [3, 22]]]]], [], 0, 1, ["loc", [null, [3, 4], [7, 11]]]], ["content", "patient.fullName", ["loc", [null, [13, 10], [13, 30]]]], ["block", "if", [["get", "patient.notifications.count", ["loc", [null, [14, 16], [14, 43]]]]], [], 2, null, ["loc", [null, [14, 10], [16, 17]]]], ["attribute", "class", ["get", "ageIconClassName", ["loc", [null, [20, 21], [20, 37]]]]], ["content", "patient.computedAge", ["loc", [null, [21, 10], [21, 33]]]], ["attribute", "class", ["concat", ["fa ", ["get", "genderIconClassName", ["loc", [null, [25, 25], [25, 44]]]]]]], ["content", "patient.computedGender", ["loc", [null, [26, 10], [26, 36]]]], ["block", "if", [["get", "huddle", ["loc", [null, [34, 14], [34, 20]]]]], [], 3, null, ["loc", [null, [34, 8], [40, 15]]]], ["block", "if", [["get", "hasRisks", ["loc", [null, [44, 14], [44, 22]]]]], [], 4, null, ["loc", [null, [44, 8], [46, 15]]]], ["block", "if", [["get", "selectedRisk", ["loc", [null, [50, 14], [50, 26]]]]], [], 5, null, ["loc", [null, [50, 8], [54, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-timeline", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 4
            },
            "end": {
              "line": 19,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-timeline.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "timeline-event", [], ["event", ["subexpr", "@mut", [["get", "event", ["loc", [null, [18, 29], [18, 34]]]]], [], []]], ["loc", [null, [18, 6], [18, 36]]]]],
        locals: ["event"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 22,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-timeline.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "timeline");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "timeline-icon-search");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3, "class", "fa fa-user timeline-icon");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "search search-timeline");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "input-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "input-group-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6, "class", "btn btn-default");
        dom.setAttribute(el6, "type", "button");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "fa fa-search");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "timeline-events");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "timeline-line");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 3, 1]), 3, 3);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 3, 3);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "class", "form-control", "value", ["subexpr", "@mut", [["get", "searchTimeline", ["loc", [null, [10, 55], [10, 69]]]]], [], []], "placeholder", "Search timeline..."], ["loc", [null, [10, 8], [10, 104]]]], ["block", "each", [["get", "filteredEvents", ["loc", [null, [17, 12], [17, 26]]]]], [], 0, null, ["loc", [null, [17, 4], [19, 13]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/patient-viewer", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 22,
                "column": 14
              },
              "end": {
                "line": 34,
                "column": 14
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "form-group");
            var el2 = dom.createTextNode("\n                  ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("input");
            dom.setAttribute(el2, "type", "radio");
            dom.setAttribute(el2, "name", "risk-assessment-selection");
            dom.setAttribute(el2, "class", "css-checkbox");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                  ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("label");
            dom.setAttribute(el2, "class", "css-label css-label-circle checkbox-label");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("                ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element8 = dom.childAt(fragment, [1]);
            var element9 = dom.childAt(element8, [1]);
            if (this.cachedFragment) {
              dom.repairClonedNode(element9, [], true);
            }
            var element10 = dom.childAt(element8, [3]);
            var morphs = new Array(6);
            morphs[0] = dom.createAttrMorph(element9, 'value');
            morphs[1] = dom.createAttrMorph(element9, 'id');
            morphs[2] = dom.createAttrMorph(element9, 'checked');
            morphs[3] = dom.createAttrMorph(element9, 'onchange');
            morphs[4] = dom.createAttrMorph(element10, 'for');
            morphs[5] = dom.createMorphAt(element10, 0, 0);
            return morphs;
          },
          statements: [["attribute", "value", ["get", "riskAssessment", ["loc", [null, [26, 28], [26, 42]]]]], ["attribute", "id", ["subexpr", "concat", [["get", "riskAssessment", ["loc", [null, [27, 32], [27, 46]]]], ["get", "index", ["loc", [null, [27, 47], [27, 52]]]]], [], ["loc", [null, [27, 23], [27, 54]]]]], ["attribute", "checked", ["subexpr", "eq", [["get", "currentAssessment", ["loc", [null, [29, 33], [29, 50]]]], ["get", "riskAssessment", ["loc", [null, [29, 51], [29, 65]]]]], [], ["loc", [null, [29, 28], [29, 67]]]]], ["attribute", "onchange", ["subexpr", "action", [["get", "attrs.setRiskAssessment", ["loc", [null, [30, 38], [30, 61]]]]], ["value", "target.value"], ["loc", [null, [30, 29], [30, 84]]]]], ["attribute", "for", ["subexpr", "concat", [["get", "riskAssessment", ["loc", [null, [31, 38], [31, 52]]]], ["get", "index", ["loc", [null, [31, 53], [31, 58]]]]], [], ["loc", [null, [31, 29], [31, 60]]]]], ["content", "riskAssessment", ["loc", [null, [31, 111], [31, 129]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 12
            },
            "end": {
              "line": 35,
              "column": 12
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 2,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "riskAssessment", ["loc", [null, [22, 20], [22, 34]]]]], [], 0, null, ["loc", [null, [22, 14], [34, 21]]]]],
        locals: ["riskAssessment", "index"],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 59,
                "column": 22
              },
              "end": {
                "line": 61,
                "column": 22
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-edit");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element7 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element7, 'onclick');
            return morphs;
          },
          statements: [["attribute", "onclick", ["subexpr", "action", [["subexpr", "mut", [["get", "displayEditHuddleModal", ["loc", [null, [60, 68], [60, 90]]]]], [], ["loc", [null, [60, 63], [60, 91]]]], true], [], ["loc", [null, [60, 54], [60, 98]]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 62,
                "column": 22
              },
              "end": {
                "line": 64,
                "column": 22
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-check-square-o");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element6 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element6, 'onclick');
            return morphs;
          },
          statements: [["attribute", "onclick", ["subexpr", "action", [["get", "attrs.openReviewPatientModal", ["loc", [null, [63, 73], [63, 101]]]], ["get", "selectedScheduleHuddle", ["loc", [null, [63, 102], [63, 124]]]]], [], ["loc", [null, [63, 64], [63, 126]]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 58,
              "column": 20
            },
            "end": {
              "line": 65,
              "column": 20
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "selectedScheduleHuddlePatient.reason", ["loc", [null, [59, 32], [59, 68]]]], "MANUAL_ADDITION"], [], ["loc", [null, [59, 28], [59, 87]]]]], [], 0, null, ["loc", [null, [59, 22], [61, 29]]]], ["block", "unless", [["get", "selectedScheduleHuddlePatient.reviewed", ["loc", [null, [62, 32], [62, 70]]]]], [], 1, null, ["loc", [null, [62, 22], [64, 33]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 65,
              "column": 20
            },
            "end": {
              "line": 67,
              "column": 20
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-plus-circle");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element5 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element5, 'onclick');
          return morphs;
        },
        statements: [["attribute", "onclick", ["subexpr", "action", [["get", "attrs.openAddHuddleModal", ["loc", [null, [66, 68], [66, 92]]]], ["get", "selectedScheduleDate", ["loc", [null, [66, 93], [66, 113]]]]], [], ["loc", [null, [66, 59], [66, 115]]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 75,
                "column": 22
              },
              "end": {
                "line": 79,
                "column": 22
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("br");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n                        Discussed on ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-times");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element4 = dom.childAt(fragment, [5]);
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(fragment, 3, 3, contextualElement);
            morphs[1] = dom.createAttrMorph(element4, 'onclick');
            return morphs;
          },
          statements: [["inline", "moment-format", [["get", "selectedScheduleHuddlePatient.reviewed", ["loc", [null, [77, 53], [77, 91]]]], "MMM D, YYYY"], [], ["loc", [null, [77, 37], [77, 107]]]], ["attribute", "onclick", ["subexpr", "action", [["subexpr", "mut", [["get", "displayClearDiscussedModal", ["loc", [null, [78, 69], [78, 95]]]]], [], ["loc", [null, [78, 64], [78, 96]]]], true], [], ["loc", [null, [78, 55], [78, 103]]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 71,
              "column": 20
            },
            "end": {
              "line": 80,
              "column": 20
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                      Geriatrics Huddle");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("                      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 4, 4, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 6, 6, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["content", "selectedScheduleHuddlePatient.displayReasonText", ["loc", [null, [74, 22], [74, 73]]]], ["block", "if", [["get", "selectedScheduleHuddlePatient.reviewed", ["loc", [null, [75, 28], [75, 66]]]]], [], 0, null, ["loc", [null, [75, 22], [79, 29]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 80,
              "column": 20
            },
            "end": {
              "line": 82,
              "column": 20
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                      Not scheduled\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 105,
                "column": 10
              },
              "end": {
                "line": 107,
                "column": 10
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "ember-spinner", [], ["config", "large"], ["loc", [null, [106, 12], [106, 44]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 111,
                  "column": 12
                },
                "end": {
                  "line": 113,
                  "column": 12
                }
              },
              "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "category-details", [], ["category", ["subexpr", "@mut", [["get", "selectedCategory", ["loc", [null, [112, 42], [112, 58]]]]], [], []]], ["loc", [null, [112, 14], [112, 60]]]]],
            locals: [],
            templates: []
          };
        })();
        var child1 = (function () {
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 113,
                  "column": 12
                },
                "end": {
                  "line": 141,
                  "column": 12
                }
              },
              "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "category-details");
              var el2 = dom.createTextNode("\n                ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "category-name");
              var el3 = dom.createTextNode("\n                  ");
              dom.appendChild(el2, el3);
              var el3 = dom.createComment("");
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n                ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n\n                ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "category-stat row");
              var el3 = dom.createTextNode("\n                  ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("div");
              dom.setAttribute(el3, "class", "category-stat-label col-md-2 col-sm-3");
              var el4 = dom.createTextNode("\n                    Risk:\n                  ");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n\n                  ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("div");
              dom.setAttribute(el3, "class", "col-lg-1 col-md-2 col-sm-2 col-xs-2 category-stat-value");
              var el4 = dom.createTextNode("\n                    ");
              dom.appendChild(el3, el4);
              var el4 = dom.createComment("");
              dom.appendChild(el3, el4);
              var el4 = dom.createTextNode("\n                  ");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n\n                  ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("div");
              dom.setAttribute(el3, "class", "col-lg-7 hidden-md hidden-sm col-xs-7");
              var el4 = dom.createTextNode("\n                    ");
              dom.appendChild(el3, el4);
              var el4 = dom.createComment("");
              dom.appendChild(el3, el4);
              var el4 = dom.createTextNode("\n                  ");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n\n                  ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("div");
              dom.setAttribute(el3, "class", "col-md-5 col-sm-5 hidden-lg hidden-xs");
              var el4 = dom.createTextNode("\n                    ");
              dom.appendChild(el3, el4);
              var el4 = dom.createComment("");
              dom.appendChild(el3, el4);
              var el4 = dom.createTextNode("\n                  ");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n                ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n\n                ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "sub-text");
              var el3 = dom.createTextNode("\n                  Choose category for more detail.\n                ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element0 = dom.childAt(fragment, [1]);
              var element1 = dom.childAt(element0, [3]);
              var morphs = new Array(4);
              morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
              morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
              morphs[2] = dom.createMorphAt(dom.childAt(element1, [5]), 1, 1);
              morphs[3] = dom.createMorphAt(dom.childAt(element1, [7]), 1, 1);
              return morphs;
            },
            statements: [["content", "currentAssessment", ["loc", [null, [116, 18], [116, 39]]]], ["content", "selectedPatientRiskOrLast.value", ["loc", [null, [125, 20], [125, 55]]]], ["inline", "horizontal-bar-chart", [], ["max", 4, "width", 300, "height", 5, "value", ["subexpr", "@mut", [["get", "computedRisk", ["loc", [null, [129, 74], [129, 86]]]]], [], []]], ["loc", [null, [129, 20], [129, 88]]]], ["inline", "horizontal-bar-chart", [], ["max", 4, "width", 180, "height", 5, "value", ["subexpr", "@mut", [["get", "computedRisk", ["loc", [null, [133, 74], [133, 86]]]]], [], []]], ["loc", [null, [133, 20], [133, 88]]]]],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 107,
                "column": 10
              },
              "end": {
                "line": 142,
                "column": 10
              }
            },
            "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["inline", "aster-plot-chart", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [108, 39], [108, 46]]]]], [], []], "data", ["subexpr", "@mut", [["get", "slices", ["loc", [null, [108, 52], [108, 58]]]]], [], []], "selectedCategory", ["subexpr", "@mut", [["get", "selectedCategory", ["loc", [null, [108, 76], [108, 92]]]]], [], []], "selectCategory", ["subexpr", "action", [["get", "attrs.selectCategory", ["loc", [null, [108, 116], [108, 136]]]]], [], ["loc", [null, [108, 108], [108, 137]]]]], ["loc", [null, [108, 12], [108, 139]]]], ["block", "if", [["get", "selectedCategory", ["loc", [null, [111, 18], [111, 34]]]]], [], 0, 1, ["loc", [null, [111, 12], [141, 19]]]]],
          locals: [],
          templates: [child0, child1]
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 96,
              "column": 4
            },
            "end": {
              "line": 150,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row");
          var el2 = dom.createTextNode("\n\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "aster-plot-container col-lg-6 col-md-5");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "current-risk-date");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "patient-timeline-container col-lg-6 col-md-7 hidden-sm hidden-xs");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [1]);
          var element3 = dom.childAt(element2, [2]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(dom.childAt(element3, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(element3, 3, 3);
          morphs[2] = dom.createMorphAt(dom.childAt(element2, [5]), 1, 1);
          return morphs;
        },
        statements: [["inline", "moment-format", [["get", "selectedPatientRiskOrLast.date", ["loc", [null, [102, 28], [102, 58]]]], "ll"], [], ["loc", [null, [102, 12], [102, 65]]]], ["block", "if", [["get", "pieIsLoading", ["loc", [null, [105, 16], [105, 28]]]]], [], 0, 1, ["loc", [null, [105, 10], [142, 17]]]], ["inline", "patient-timeline", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [147, 37], [147, 44]]]]], [], []]], ["loc", [null, [147, 10], [147, 46]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child6 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 150,
              "column": 4
            },
            "end": {
              "line": 160,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "alert alert-danger alert-full");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-xs-10");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3, 1]), 1, 1);
          return morphs;
        },
        statements: [["content", "noRiskAssessmentReason", ["loc", [null, [152, 8], [152, 34]]]], ["inline", "patient-timeline", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [157, 37], [157, 44]]]]], [], []]], ["loc", [null, [157, 10], [157, 46]]]]],
        locals: [],
        templates: []
      };
    })();
    var child7 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 169,
              "column": 0
            },
            "end": {
              "line": 171,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "add-to-huddle-modal", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [170, 32], [170, 39]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "selectedScheduleHuddle", ["loc", [null, [170, 47], [170, 69]]]]], [], []], "defaultDate", ["subexpr", "@mut", [["get", "selectedScheduleHuddle.date", ["loc", [null, [170, 82], [170, 109]]]]], [], []], "patientHuddles", ["subexpr", "@mut", [["get", "huddles", ["loc", [null, [170, 125], [170, 132]]]]], [], []], "onClose", ["subexpr", "action", ["closeEditHuddleModal"], [], ["loc", [null, [170, 141], [170, 172]]]]], ["loc", [null, [170, 2], [170, 174]]]]],
        locals: [],
        templates: []
      };
    })();
    var child8 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 173,
              "column": 0
            },
            "end": {
              "line": 175,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "remove-discussed-patient-modal", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [174, 43], [174, 50]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "selectedScheduleHuddle", ["loc", [null, [174, 58], [174, 80]]]]], [], []], "onClose", ["subexpr", "action", ["closeReviewPatientModal"], [], ["loc", [null, [174, 89], [174, 123]]]]], ["loc", [null, [174, 2], [174, 125]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 175,
            "column": 7
          }
        },
        "moduleName": "ember-on-fhir/templates/components/patient-viewer.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "patient-view-stats col-md-3 col-sm-5 col-reset");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "panel");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel-heading");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "collapse-panel-title");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6, "data-toggle", "collapse");
        dom.setAttribute(el6, "href", "#chooseRiskAssessment");
        dom.setAttribute(el6, "aria-expanded", "true");
        dom.setAttribute(el6, "aria-controls", "collapseOne");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "fa fa-fw fa-pie-chart");
        dom.setAttribute(el7, "aria-hidden", "true");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            Risk Assessment\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "collapse in");
        dom.setAttribute(el5, "id", "chooseRiskAssessment");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("form");
        dom.setAttribute(el6, "class", "form-horizontal form-group-striped");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel-heading");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "collapse-panel-title");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6, "data-toggle", "collapse");
        dom.setAttribute(el6, "href", "#huddleList");
        dom.setAttribute(el6, "aria-expanded", "true");
        dom.setAttribute(el6, "aria-controls", "collapseOne");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "fa fa-users fa-fw");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            Huddles\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "fa fa-chevron-down pull-right");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "collapse in");
        dom.setAttribute(el5, "id", "huddleList");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("form");
        dom.setAttribute(el6, "class", "form-horizontal form-group-striped");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "add-new-filter-lg");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("div");
        dom.setAttribute(el8, "id", "patientViewerPikaday");
        var el9 = dom.createTextNode("\n                ");
        dom.appendChild(el8, el9);
        var el9 = dom.createElement("div");
        dom.setAttribute(el9, "id", "patientViewerPikadayCalendar");
        dom.appendChild(el8, el9);
        var el9 = dom.createTextNode("\n                ");
        dom.appendChild(el8, el9);
        var el9 = dom.createElement("div");
        dom.setAttribute(el9, "class", "patient-viewer-schedule-block");
        var el10 = dom.createTextNode("\n                  ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("div");
        dom.setAttribute(el10, "class", "action-icons");
        var el11 = dom.createTextNode("\n");
        dom.appendChild(el10, el11);
        var el11 = dom.createComment("");
        dom.appendChild(el10, el11);
        var el11 = dom.createTextNode("                  ");
        dom.appendChild(el10, el11);
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                  ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("div");
        var el11 = dom.createComment("");
        dom.appendChild(el10, el11);
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                  ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("div");
        dom.setAttribute(el10, "class", "meta");
        var el11 = dom.createTextNode("\n");
        dom.appendChild(el10, el11);
        var el11 = dom.createComment("");
        dom.appendChild(el10, el11);
        var el11 = dom.createTextNode("                  ");
        dom.appendChild(el10, el11);
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                ");
        dom.appendChild(el9, el10);
        dom.appendChild(el8, el9);
        var el9 = dom.createTextNode("\n              ");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("hr");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "patient-timeline-wide-container clearfix hidden-lg hidden-md");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element11 = dom.childAt(fragment, [2]);
        var element12 = dom.childAt(element11, [1, 1]);
        var element13 = dom.childAt(element12, [7, 1, 1, 1, 1, 3]);
        var element14 = dom.childAt(element11, [3]);
        var morphs = new Array(11);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(dom.childAt(element12, [3, 1, 1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element13, [1]), 1, 1);
        morphs[3] = dom.createMorphAt(dom.childAt(element13, [3]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element13, [5]), 1, 1);
        morphs[5] = dom.createMorphAt(element12, 9, 9);
        morphs[6] = dom.createAttrMorph(element14, 'class');
        morphs[7] = dom.createMorphAt(element14, 1, 1);
        morphs[8] = dom.createMorphAt(dom.childAt(element11, [7]), 1, 1);
        morphs[9] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[10] = dom.createMorphAt(fragment, 6, 6, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["inline", "patient-summary", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [2, 26], [2, 33]]]]], [], []], "currentAssessment", ["subexpr", "@mut", [["get", "currentAssessment", ["loc", [null, [2, 52], [2, 69]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "futureDisplayHuddle", ["loc", [null, [2, 77], [2, 96]]]]], [], []], "hasRisks", ["subexpr", "@mut", [["get", "hasRisks", ["loc", [null, [2, 106], [2, 114]]]]], [], []], "setSelectedRisk", ["subexpr", "action", ["setSelectedRisk"], [], ["loc", [null, [2, 131], [2, 157]]]], "selectedRisk", ["subexpr", "@mut", [["get", "selectedPatientRiskOrLast", ["loc", [null, [2, 171], [2, 196]]]]], [], []]], ["loc", [null, [2, 0], [2, 198]]]], ["block", "each", [["get", "riskAssessments", ["loc", [null, [21, 20], [21, 35]]]]], [], 0, null, ["loc", [null, [21, 12], [35, 21]]]], ["block", "if", [["get", "selectedScheduleHuddle", ["loc", [null, [58, 26], [58, 48]]]]], [], 1, 2, ["loc", [null, [58, 20], [67, 27]]]], ["inline", "moment-format", [["get", "selectedScheduleDate", ["loc", [null, [69, 39], [69, 59]]]], "MMM D, YYYY"], [], ["loc", [null, [69, 23], [69, 75]]]], ["block", "if", [["get", "selectedScheduleHuddle", ["loc", [null, [71, 26], [71, 48]]]]], [], 3, 4, ["loc", [null, [71, 20], [82, 27]]]], ["inline", "patient-stats", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [91, 30], [91, 37]]]]], [], []], "openAddInterventionModal", ["subexpr", "action", [["get", "attrs.openAddInterventionModal", ["loc", [null, [91, 71], [91, 101]]]]], [], ["loc", [null, [91, 63], [91, 102]]]]], ["loc", [null, [91, 6], [91, 104]]]], ["attribute", "class", ["concat", ["patient-view-display col-md-9 col-sm-7 ", ["subexpr", "unless", [["get", "hasRisks", ["loc", [null, [95, 62], [95, 70]]]], "col-no-pad"], [], ["loc", [null, [95, 53], [95, 85]]]]]]], ["block", "if", [["get", "hasRisks", ["loc", [null, [96, 10], [96, 18]]]]], [], 5, 6, ["loc", [null, [96, 4], [160, 11]]]], ["inline", "patient-timeline", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [165, 31], [165, 38]]]]], [], []]], ["loc", [null, [165, 4], [165, 40]]]], ["block", "if", [["get", "displayEditHuddleModal", ["loc", [null, [169, 6], [169, 28]]]]], [], 7, null, ["loc", [null, [169, 0], [171, 7]]]], ["block", "if", [["get", "displayClearDiscussedModal", ["loc", [null, [173, 6], [173, 32]]]]], [], 8, null, ["loc", [null, [173, 0], [175, 7]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6, child7, child8]
    };
  })());
});
define("ember-on-fhir/templates/components/radio-button", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": {
            "name": "triple-curlies"
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 15,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/radio-button.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("label");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(4);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createAttrMorph(element0, 'for');
          morphs[2] = dom.createMorphAt(element0, 1, 1);
          morphs[3] = dom.createMorphAt(element0, 3, 3);
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["ember-radio-button ", ["subexpr", "if", [["get", "checked", ["loc", [null, [2, 40], [2, 47]]]], "checked"], [], ["loc", [null, [2, 35], [2, 59]]]], " ", ["get", "joinedClassNames", ["loc", [null, [2, 62], [2, 78]]]]]]], ["attribute", "for", ["get", "radioId", ["loc", [null, [2, 88], [2, 95]]]]], ["inline", "radio-button-input", [], ["class", ["subexpr", "@mut", [["get", "radioClass", ["loc", [null, [4, 14], [4, 24]]]]], [], []], "id", ["subexpr", "@mut", [["get", "radioId", ["loc", [null, [5, 11], [5, 18]]]]], [], []], "disabled", ["subexpr", "@mut", [["get", "disabled", ["loc", [null, [6, 17], [6, 25]]]]], [], []], "name", ["subexpr", "@mut", [["get", "name", ["loc", [null, [7, 13], [7, 17]]]]], [], []], "required", ["subexpr", "@mut", [["get", "required", ["loc", [null, [8, 17], [8, 25]]]]], [], []], "groupValue", ["subexpr", "@mut", [["get", "groupValue", ["loc", [null, [9, 19], [9, 29]]]]], [], []], "value", ["subexpr", "@mut", [["get", "value", ["loc", [null, [10, 14], [10, 19]]]]], [], []], "changed", "changed"], ["loc", [null, [3, 4], [11, 27]]]], ["content", "yield", ["loc", [null, [13, 4], [13, 13]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 0
            },
            "end": {
              "line": 25,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/radio-button.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "radio-button-input", [], ["class", ["subexpr", "@mut", [["get", "radioClass", ["loc", [null, [17, 12], [17, 22]]]]], [], []], "id", ["subexpr", "@mut", [["get", "radioId", ["loc", [null, [18, 9], [18, 16]]]]], [], []], "disabled", ["subexpr", "@mut", [["get", "disabled", ["loc", [null, [19, 15], [19, 23]]]]], [], []], "name", ["subexpr", "@mut", [["get", "name", ["loc", [null, [20, 11], [20, 15]]]]], [], []], "required", ["subexpr", "@mut", [["get", "required", ["loc", [null, [21, 15], [21, 23]]]]], [], []], "groupValue", ["subexpr", "@mut", [["get", "groupValue", ["loc", [null, [22, 17], [22, 27]]]]], [], []], "value", ["subexpr", "@mut", [["get", "value", ["loc", [null, [23, 12], [23, 17]]]]], [], []], "changed", "changed"], ["loc", [null, [16, 2], [24, 25]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 26,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/radio-button.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "hasBlock", ["loc", [null, [1, 6], [1, 14]]]]], [], 0, 1, ["loc", [null, [1, 0], [25, 7]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/remove-discussed-patient-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 43,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/remove-discussed-patient-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-body review-patient-modal-body");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "form-control-static row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          var el7 = dom.createTextNode("Patient:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "form-control-static row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          var el7 = dom.createTextNode("Huddle:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            Geriatrics Huddle\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "form-control-static row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          var el7 = dom.createTextNode("Huddle Date:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-footer");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3, "type", "button");
          dom.setAttribute(el3, "class", "btn btn-default btn-ie-lg");
          var el4 = dom.createTextNode("Cancel");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3, "type", "submit");
          dom.setAttribute(el3, "class", "btn btn-danger btn-ie-lg");
          var el4 = dom.createTextNode("Remove");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3, 1]);
          var morphs = new Array(4);
          morphs[0] = dom.createAttrMorph(element0, 'onsubmit');
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [1, 1, 3]), 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element1, [5, 1, 3]), 1, 1);
          morphs[3] = dom.createAttrMorph(element2, 'onclick');
          return morphs;
        },
        statements: [["attribute", "onsubmit", ["subexpr", "action", ["save"], [], ["loc", [null, [2, 17], [2, 34]]]]], ["content", "patient.fullName", ["loc", [null, [11, 12], [11, 32]]]], ["inline", "moment-format", [["get", "huddle.date", ["loc", [null, [33, 28], [33, 39]]]], "MMM DD, YYYY"], [], ["loc", [null, [33, 12], [33, 56]]]], ["attribute", "onclick", ["subexpr", "action", [["get", "attrs.onClose", ["loc", [null, [39, 79], [39, 92]]]]], [], ["loc", [null, [39, 70], [39, 94]]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 43,
            "column": 20
          }
        },
        "moduleName": "ember-on-fhir/templates/components/remove-discussed-patient-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "bootstrap-modal", [], ["title", "Remove Patient as Discussed", "onClose", ["subexpr", "action", [["get", "attrs.onClose", ["loc", [null, [1, 71], [1, 84]]]]], [], ["loc", [null, [1, 63], [1, 85]]]]], 0, null, ["loc", [null, [1, 0], [43, 20]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/review-patient-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 74,
                "column": 6
              },
              "end": {
                "line": 76,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/review-patient-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1, "type", "button");
            dom.setAttribute(el1, "class", "btn btn-secondary");
            var el2 = dom.createTextNode("Skip");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element0, 'disabled');
            morphs[1] = dom.createAttrMorph(element0, 'onclick');
            return morphs;
          },
          statements: [["attribute", "disabled", ["get", "saveBtnDisabled", ["loc", [null, [75, 67], [75, 82]]]]], ["attribute", "onclick", ["subexpr", "action", [["get", "this.attrs.onSkip", ["loc", [null, [75, 102], [75, 119]]]]], [], ["loc", [null, [75, 93], [75, 121]]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 80,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/components/review-patient-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-body review-patient-modal-body");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "form-control-static row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          var el7 = dom.createTextNode("Patient:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "form-control-static row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          var el7 = dom.createTextNode("Huddle:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            Geriatrics Huddle\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "form-control-static row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          var el7 = dom.createTextNode("Huddle Date:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "form-group");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "row");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("label");
          dom.setAttribute(el6, "for", "reviewDate");
          var el7 = dom.createTextNode("Patient Discussed on:");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n          ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5, "class", "col-sm-6 form-value");
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("div");
          dom.setAttribute(el6, "class", "input-addon left-addon");
          var el7 = dom.createTextNode("\n              ");
          dom.appendChild(el6, el7);
          var el7 = dom.createElement("i");
          dom.setAttribute(el7, "class", "fa fa-calendar-o fa-fw left-addon-icon");
          dom.appendChild(el6, el7);
          var el7 = dom.createTextNode("\n              ");
          dom.appendChild(el6, el7);
          var el7 = dom.createComment("");
          dom.appendChild(el6, el7);
          var el7 = dom.createTextNode("\n              ");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-footer");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3, "type", "submit");
          dom.setAttribute(el3, "class", "btn btn-primary");
          var el4 = dom.createTextNode("Save");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element1, [3]);
          var element4 = dom.childAt(element3, [3]);
          var morphs = new Array(6);
          morphs[0] = dom.createAttrMorph(element1, 'onsubmit');
          morphs[1] = dom.createMorphAt(dom.childAt(element2, [1, 1, 3]), 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element2, [5, 1, 3]), 1, 1);
          morphs[3] = dom.createMorphAt(dom.childAt(element2, [8, 1, 3, 1]), 3, 3);
          morphs[4] = dom.createMorphAt(element3, 1, 1);
          morphs[5] = dom.createAttrMorph(element4, 'disabled');
          return morphs;
        },
        statements: [["attribute", "onsubmit", ["subexpr", "action", ["save"], [], ["loc", [null, [2, 17], [2, 34]]]]], ["content", "patient.fullName", ["loc", [null, [11, 12], [11, 32]]]], ["inline", "moment-format", [["get", "huddle.date", ["loc", [null, [35, 28], [35, 39]]]], "MMM DD, YYYY"], [], ["loc", [null, [35, 12], [35, 56]]]], ["inline", "pikaday-input", [], ["id", "reviewDate", "class", "form-control form-input-calendar", "value", ["subexpr", "@mut", [["get", "reviewDate", ["loc", [null, [64, 22], [64, 32]]]]], [], []], "format", "MMMM Do YYYY", "firstDay", 0], ["loc", [null, [61, 14], [66, 28]]]], ["block", "if", [["get", "skippable", ["loc", [null, [74, 12], [74, 21]]]]], [], 0, null, ["loc", [null, [74, 6], [76, 13]]]], ["attribute", "disabled", ["get", "saveBtnDisabled", ["loc", [null, [77, 63], [77, 78]]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 81,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/review-patient-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "bootstrap-modal", [], ["title", ["subexpr", "@mut", [["get", "modalTitle", ["loc", [null, [1, 25], [1, 35]]]]], [], []], "onOpen", ["subexpr", "@mut", [["get", "attrs.onOpen", ["loc", [null, [1, 43], [1, 55]]]]], [], []], "onClose", ["subexpr", "@mut", [["get", "attrs.onClose", ["loc", [null, [1, 64], [1, 77]]]]], [], []]], 0, null, ["loc", [null, [1, 0], [80, 20]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/components/select-fx", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 4,
              "column": 2
            }
          },
          "moduleName": "ember-on-fhir/templates/components/select-fx.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("option");
          dom.setAttribute(el1, "value", "");
          dom.setAttribute(el1, "disabled", "");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element1, 'selected');
          morphs[1] = dom.createMorphAt(element1, 0, 0);
          return morphs;
        },
        statements: [["attribute", "selected", ["get", "placeholderSelected", ["loc", [null, [3, 41], [3, 60]]]]], ["content", "placeholder", ["loc", [null, [3, 63], [3, 78]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 2
            },
            "end": {
              "line": 7,
              "column": 2
            }
          },
          "moduleName": "ember-on-fhir/templates/components/select-fx.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("option");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element0, 'value');
          morphs[1] = dom.createAttrMorph(element0, 'selected');
          morphs[2] = dom.createMorphAt(element0, 0, 0);
          return morphs;
        },
        statements: [["attribute", "value", ["get", "option.value", ["loc", [null, [6, 20], [6, 32]]]]], ["attribute", "selected", ["get", "option.selected", ["loc", [null, [6, 46], [6, 61]]]]], ["content", "option.value", ["loc", [null, [6, 64], [6, 80]]]]],
        locals: ["option"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 8,
            "column": 9
          }
        },
        "moduleName": "ember-on-fhir/templates/components/select-fx.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("select");
        dom.setAttribute(el1, "class", "cs-select cs-skin-border");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element2, 1, 1);
        morphs[1] = dom.createMorphAt(element2, 2, 2);
        return morphs;
      },
      statements: [["block", "if", [["get", "placeholder", ["loc", [null, [2, 8], [2, 19]]]]], [], 0, null, ["loc", [null, [2, 2], [4, 9]]]], ["block", "each", [["get", "proxiedOptions", ["loc", [null, [5, 10], [5, 24]]]]], [], 1, null, ["loc", [null, [5, 2], [7, 11]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/sortable-objects", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 9
          }
        },
        "moduleName": "ember-on-fhir/templates/components/sortable-objects.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 0], [1, 9]]]]],
      locals: [],
      templates: []
    };
  })());
});
define('ember-on-fhir/templates/components/tether-dialog', ['exports', 'ember-modal-dialog/templates/components/tether-dialog'], function (exports, _emberModalDialogTemplatesComponentsTetherDialog) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberModalDialogTemplatesComponentsTetherDialog['default'];
    }
  });
});
define("ember-on-fhir/templates/components/timeline-event", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 10,
                "column": 6
              },
              "end": {
                "line": 12,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/components/timeline-event.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        - ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "moment-format", [["get", "event.event.endDate", ["loc", [null, [11, 26], [11, 45]]]], "lll"], [], ["loc", [null, [11, 10], [11, 53]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 4
            },
            "end": {
              "line": 13,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/timeline-event.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" \n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["inline", "moment-format", [["get", "event.event.startDate", ["loc", [null, [9, 22], [9, 43]]]], "lll"], [], ["loc", [null, [9, 6], [9, 51]]]], ["block", "if", [["get", "event.isEnd", ["loc", [null, [10, 12], [10, 23]]]]], [], 0, null, ["loc", [null, [10, 6], [12, 13]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 4
            },
            "end": {
              "line": 15,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/components/timeline-event.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      Unknown Date\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 25,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/timeline-event.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "timeline-event-text");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    \n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "timeline-event-start-date");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "timeline-event-icon");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2, "class", "pointer-bottom");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2, "class", "pointer-top");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [5, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
        morphs[3] = dom.createAttrMorph(element1, 'class');
        return morphs;
      },
      statements: [["attribute", "class", ["concat", ["timeline-event ", ["get", "eventClass", ["loc", [null, [1, 29], [1, 39]]]]]]], ["content", "event.displayText", ["loc", [null, [3, 4], [3, 25]]]], ["block", "if", [["get", "event.event.startDate", ["loc", [null, [8, 10], [8, 31]]]]], [], 0, 1, ["loc", [null, [8, 4], [15, 11]]]], ["attribute", "class", ["concat", [["get", "iconClass", ["loc", [null, [19, 16], [19, 25]]]]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("ember-on-fhir/templates/components/vertical-bar-chart", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/components/vertical-bar-chart.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1, "viewBox", "0 0 600 200");
        dom.setAttribute(el1, "width", "100%");
        dom.setAttribute(el1, "height", "100%");
        dom.setAttribute(el1, "preserveAspectRatio", "none");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/filters/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 6
              },
              "end": {
                "line": 7,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/filters/index.hbs"
          },
          isEmpty: true,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          var child0 = (function () {
            return {
              meta: {
                "fragmentReason": false,
                "revision": "Ember@2.3.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 12,
                    "column": 14
                  },
                  "end": {
                    "line": 12,
                    "column": 48
                  }
                },
                "moduleName": "ember-on-fhir/templates/filters/index.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
                dom.insertBoundary(fragment, 0);
                dom.insertBoundary(fragment, null);
                return morphs;
              },
              statements: [["content", "filter.name", ["loc", [null, [12, 33], [12, 48]]]]],
              locals: [],
              templates: []
            };
          })();
          var child1 = (function () {
            return {
              meta: {
                "fragmentReason": false,
                "revision": "Ember@2.3.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 12,
                    "column": 48
                  },
                  "end": {
                    "line": 12,
                    "column": 63
                  }
                },
                "moduleName": "ember-on-fhir/templates/filters/index.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("Unnamed");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes() {
                return [];
              },
              statements: [],
              locals: [],
              templates: []
            };
          })();
          return {
            meta: {
              "fragmentReason": false,
              "revision": "Ember@2.3.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 10,
                  "column": 12
                },
                "end": {
                  "line": 13,
                  "column": 12
                }
              },
              "moduleName": "ember-on-fhir/templates/filters/index.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("i");
              dom.setAttribute(el1, "class", "fa fa-pie-chart");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 3, 3, contextualElement);
              return morphs;
            },
            statements: [["block", "if", [["get", "filter.name", ["loc", [null, [12, 20], [12, 31]]]]], [], 0, 1, ["loc", [null, [12, 14], [12, 70]]]]],
            locals: [],
            templates: [child0, child1]
          };
        })();
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 7,
                "column": 6
              },
              "end": {
                "line": 16,
                "column": 6
              }
            },
            "moduleName": "ember-on-fhir/templates/filters/index.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("h2");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]), 1, 1);
            return morphs;
          },
          statements: [["block", "link-to", ["filters.show", ["get", "filter", ["loc", [null, [10, 38], [10, 44]]]]], [], 0, null, ["loc", [null, [10, 12], [13, 24]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 17,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/filters/index.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "filter.isNew", ["loc", [null, [5, 12], [5, 24]]]]], [], 0, 1, ["loc", [null, [5, 6], [16, 13]]]]],
        locals: ["filter"],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 20,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/filters/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createTextNode("My Filters");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2, "class", "filterList");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 3]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "content", ["loc", [null, [4, 12], [4, 19]]]]], [], 0, null, ["loc", [null, [4, 4], [17, 13]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/filters/new", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 30
          }
        },
        "moduleName": "ember-on-fhir/templates/filters/new.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["inline", "filter-builder", [], ["group", ["subexpr", "@mut", [["get", "model", ["loc", [null, [1, 23], [1, 28]]]]], [], []]], ["loc", [null, [1, 0], [1, 30]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/filters/show", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/filters/show.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "filter-builder", [], ["group", ["subexpr", "@mut", [["get", "model", ["loc", [null, [1, 23], [1, 28]]]]], [], []]], ["loc", [null, [1, 0], [1, 30]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["empty-body"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/index.hbs"
      },
      isEmpty: true,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/loading", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": false,
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/loading.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Loading …");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/login", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 9,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/login.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "alert alert-danger");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createTextNode("Login failed:");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            dom.setAttribute(el2, "aria-label", "Close");
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.setAttribute(el3, "aria-hidden", "true");
            dom.setAttribute(el3, "class", "fa fa-times");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [1]);
            var element2 = dom.childAt(element1, [5]);
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(element1, 3, 3);
            morphs[1] = dom.createElementMorph(element2);
            return morphs;
          },
          statements: [["content", "errorMessage", ["loc", [null, [4, 37], [4, 53]]]], ["element", "action", ["clearErrors"], [], ["loc", [null, [5, 42], [5, 66]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 11,
                "column": 2
              },
              "end": {
                "line": 18,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/login.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "alert alert-success");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createTextNode("Registration successful:");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" Please log in\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            dom.setAttribute(el2, "aria-label", "Close");
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.setAttribute(el3, "aria-hidden", "true");
            dom.setAttribute(el3, "class", "fa fa-times");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1, 3]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element0);
            return morphs;
          },
          statements: [["element", "action", ["clearRegistered"], [], ["loc", [null, [14, 42], [14, 70]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["wrong-type", "multiple-nodes"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 63,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/login.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          dom.setAttribute(el1, "class", "form-login");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "sr-only");
          dom.setAttribute(el3, "for", "login-email");
          var el4 = dom.createTextNode("Enter login email");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "input-addon left-addon");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("i");
          dom.setAttribute(el4, "class", "fa fa-envelope fa-fw left-addon-icon");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "sr-only");
          dom.setAttribute(el3, "for", "login-password");
          var el4 = dom.createTextNode("Enter login password");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "input-addon left-addon");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("i");
          dom.setAttribute(el4, "class", "fa fa-lock fa-fw left-addon-icon");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "text-right");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3, "class", "btn btn-lg btn-primary");
          dom.setAttribute(el3, "type", "submit");
          var el4 = dom.createTextNode("Log In");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "login-register-footer");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "row");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "col-xs-6 login-register-footer-left");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4, "class", "text-left");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("a");
          dom.setAttribute(el5, "target", "_blank");
          var el6 = dom.createElement("span");
          dom.setAttribute(el6, "class", "hidden-xs");
          var el7 = dom.createTextNode("The");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode(" MITRE ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("span");
          dom.setAttribute(el6, "class", "hidden-xs");
          var el7 = dom.createTextNode("Corporation");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("br");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("a");
          dom.setAttribute(el5, "target", "_blank");
          var el6 = dom.createTextNode("v");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment(" <div class=\"col-xs-6 login-register-footer-right\">\n        <span>\n          {{#link-to \"register\"}}Register{{/link-to}}<br>{{#link-to \"forgotPassword\"}}Forgot Password{{/link-to}}\n        </span>\n      </div> ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [4]);
          var element4 = dom.childAt(element3, [1]);
          var element5 = dom.childAt(element4, [3]);
          var element6 = dom.childAt(element3, [3]);
          var element7 = dom.childAt(element6, [3]);
          var element8 = dom.childAt(element3, [5, 1]);
          var element9 = dom.childAt(fragment, [6, 1, 1, 1]);
          var element10 = dom.childAt(element9, [1]);
          var element11 = dom.childAt(element9, [5]);
          var morphs = new Array(13);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
          morphs[2] = dom.createElementMorph(element3);
          morphs[3] = dom.createAttrMorph(element4, 'class');
          morphs[4] = dom.createMorphAt(element5, 3, 3);
          morphs[5] = dom.createMorphAt(element5, 5, 5);
          morphs[6] = dom.createAttrMorph(element6, 'class');
          morphs[7] = dom.createMorphAt(element7, 3, 3);
          morphs[8] = dom.createMorphAt(element7, 5, 5);
          morphs[9] = dom.createAttrMorph(element8, 'disabled');
          morphs[10] = dom.createAttrMorph(element10, 'href');
          morphs[11] = dom.createAttrMorph(element11, 'href');
          morphs[12] = dom.createMorphAt(element11, 1, 1);
          dom.insertBoundary(fragment, 0);
          return morphs;
        },
        statements: [["block", "if", [["get", "errorMessage", ["loc", [null, [2, 8], [2, 20]]]]], [], 0, null, ["loc", [null, [2, 2], [9, 9]]]], ["block", "if", [["get", "registered", ["loc", [null, [11, 8], [11, 18]]]]], [], 1, null, ["loc", [null, [11, 2], [18, 9]]]], ["element", "action", ["authenticate"], ["on", "submit"], ["loc", [null, [20, 8], [20, 45]]]], ["attribute", "class", ["concat", ["form-group ", ["get", "identificationClassNames", ["loc", [null, [21, 29], [21, 53]]]]]]], ["inline", "input", [], ["type", "text", "value", ["subexpr", "@mut", [["get", "identification", ["loc", [null, [25, 34], [25, 48]]]]], [], []], "classNames", "form-control form-input", "placeholder", "email"], ["loc", [null, [25, 8], [25, 107]]]], ["inline", "form-validation-tooltip", [], ["errors", ["subexpr", "@mut", [["get", "errors.identification", ["loc", [null, [27, 41], [27, 62]]]]], [], []], "displayErrors", ["subexpr", "@mut", [["get", "displayErrors", ["loc", [null, [27, 77], [27, 90]]]]], [], []]], ["loc", [null, [27, 8], [27, 92]]]], ["attribute", "class", ["concat", ["form-group ", ["get", "passwordClassNames", ["loc", [null, [31, 29], [31, 47]]]]]]], ["inline", "input", [], ["type", "password", "value", ["subexpr", "@mut", [["get", "password", ["loc", [null, [35, 38], [35, 46]]]]], [], []], "autocomplete", "off", "classNames", "form-control form-input", "placeholder", "password"], ["loc", [null, [35, 8], [35, 127]]]], ["inline", "form-validation-tooltip", [], ["errors", ["subexpr", "@mut", [["get", "errors.password", ["loc", [null, [37, 41], [37, 56]]]]], [], []], "displayErrors", ["subexpr", "@mut", [["get", "displayErrors", ["loc", [null, [37, 71], [37, 84]]]]], [], []]], ["loc", [null, [37, 8], [37, 86]]]], ["attribute", "disabled", ["get", "disableLoginBtn", ["loc", [null, [42, 70], [42, 85]]]]], ["attribute", "href", ["get", "mitreURL", ["loc", [null, [50, 36], [50, 44]]]]], ["attribute", "href", ["get", "interventionEnginURL", ["loc", [null, [52, 36], [52, 56]]]]], ["content", "app-version", ["loc", [null, [52, 60], [52, 75]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 64,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/login.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "login-register", [], [], 0, null, ["loc", [null, [1, 0], [63, 19]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-on-fhir/templates/patients", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 6
          }
        },
        "moduleName": "ember-on-fhir/templates/patients.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container patients");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "title-panel print-small");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "title-text");
        var el4 = dom.createTextNode("Patients");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 3, 3);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [6, 2], [6, 12]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/patients/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "patient-search/risk-assessment", [], ["riskAssessments", ["subexpr", "@mut", [["get", "riskAssessments", ["loc", [null, [4, 55], [4, 70]]]]], [], []], "currentAssessment", ["subexpr", "@mut", [["get", "currentAssessment", ["loc", [null, [4, 89], [4, 106]]]]], [], []], "selectRiskAssessment", ["subexpr", "action", ["selectRiskAssessment"], [], ["loc", [null, [4, 128], [4, 159]]]]], ["loc", [null, [4, 6], [4, 161]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 4
            },
            "end": {
              "line": 13,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 4, 4, contextualElement);
          return morphs;
        },
        statements: [["inline", "patient-search/population-filter", [], ["populations", ["subexpr", "@mut", [["get", "populations", ["loc", [null, [8, 53], [8, 64]]]]], [], []], "selectedPopulation", ["subexpr", "@mut", [["get", "selectedPopulation", ["loc", [null, [8, 84], [8, 102]]]]], [], []], "togglePopulation", ["subexpr", "action", ["togglePopulation"], [], ["loc", [null, [8, 120], [8, 147]]]]], ["loc", [null, [8, 6], [8, 149]]]], ["inline", "patient-search/huddle-list", [], ["huddles", ["subexpr", "@mut", [["get", "model.huddles", ["loc", [null, [12, 43], [12, 56]]]]], [], []], "selectedHuddle", ["subexpr", "@mut", [["get", "selectedHuddle", ["loc", [null, [12, 72], [12, 86]]]]], [], []], "selectHuddle", ["subexpr", "action", ["selectHuddle"], [], ["loc", [null, [12, 100], [12, 123]]]]], ["loc", [null, [12, 6], [12, 125]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 4
            },
            "end": {
              "line": 17,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "patient-search/sort-by", [], ["sortBy", ["subexpr", "@mut", [["get", "sortBy", ["loc", [null, [16, 38], [16, 44]]]]], [], []], "sortDescending", ["subexpr", "@mut", [["get", "sortDescending", ["loc", [null, [16, 60], [16, 74]]]]], [], []], "selectSortBy", ["subexpr", "action", ["selectSortBy"], [], ["loc", [null, [16, 88], [16, 111]]]]], ["loc", [null, [16, 6], [16, 113]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 43,
              "column": 10
            },
            "end": {
              "line": 45,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/index.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "patient-badge", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [44, 36], [44, 43]]]]], [], []], "huddles", ["subexpr", "patient-huddles", [["get", "model.huddles", ["loc", [null, [44, 69], [44, 82]]]], ["get", "patient", ["loc", [null, [44, 83], [44, 90]]]]], [], ["loc", [null, [44, 52], [44, 91]]]], "assessment", ["subexpr", "@mut", [["get", "currentAssessment", ["loc", [null, [44, 103], [44, 120]]]]], [], []]], ["loc", [null, [44, 12], [44, 122]]]]],
        locals: ["patient"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 53,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/patients/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "col-md-3 col-sm-4 patient-list-filters");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "col-md-9 col-sm-8 patient-list-results");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "panel patient-panel");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel-heading");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "collapse-panel-title");
        var el6 = dom.createTextNode("\n          Patients (");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(")\n\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "patient-list-results-buttons pull-right");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "sliding-search-container");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("i");
        dom.setAttribute(el8, "class", "fa fa-search fa-fw");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("input");
        dom.setAttribute(el8, "type", "search");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            \n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "print-list-button fa fa-print cursor-pointer");
        dom.setAttribute(el7, "title", "Print Patient List");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "patient-list");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3, 1]);
        var element3 = dom.childAt(element2, [1, 1]);
        var element4 = dom.childAt(element3, [3]);
        var element5 = dom.childAt(element4, [1, 3]);
        var element6 = dom.childAt(element4, [3]);
        var element7 = dom.childAt(element2, [3, 1]);
        var morphs = new Array(10);
        morphs[0] = dom.createMorphAt(element1, 1, 1);
        morphs[1] = dom.createMorphAt(element1, 3, 3);
        morphs[2] = dom.createMorphAt(element1, 5, 5);
        morphs[3] = dom.createMorphAt(element3, 1, 1);
        morphs[4] = dom.createAttrMorph(element5, 'class');
        morphs[5] = dom.createAttrMorph(element5, 'onkeyup');
        morphs[6] = dom.createAttrMorph(element5, 'onchange');
        morphs[7] = dom.createAttrMorph(element6, 'onclick');
        morphs[8] = dom.createMorphAt(element7, 1, 1);
        morphs[9] = dom.createMorphAt(element7, 3, 3);
        return morphs;
      },
      statements: [["block", "nested-panel", [], ["panelName", "Risk Assessment", "panelId", "chooseRiskAssessment"], 0, null, ["loc", [null, [3, 4], [5, 21]]]], ["block", "nested-panel", [], ["panelName", "Filters", "panelId", "chooseFilters"], 1, null, ["loc", [null, [7, 4], [13, 21]]]], ["block", "nested-panel", [], ["panelName", "Sort By", "panelId", "chooseSortBy"], 2, null, ["loc", [null, [15, 4], [17, 21]]]], ["content", "totalPatients", ["loc", [null, [24, 20], [24, 37]]]], ["attribute", "class", ["concat", ["sliding-search ", ["subexpr", "if", [["get", "patientSearch", ["loc", [null, [31, 43], [31, 56]]]], "expanded"], [], ["loc", [null, [31, 38], [31, 69]]]]]]], ["attribute", "onkeyup", ["subexpr", "action", [["subexpr", "mut", [["get", "patientSearch", ["loc", [null, [32, 38], [32, 51]]]]], [], ["loc", [null, [32, 33], [32, 52]]]]], ["value", "target.value"], ["loc", [null, [32, 24], [32, 75]]]]], ["attribute", "onchange", ["subexpr", "action", [["subexpr", "mut", [["get", "patientSearch", ["loc", [null, [33, 39], [33, 52]]]]], [], ["loc", [null, [33, 34], [33, 53]]]]], ["value", "target.value"], ["loc", [null, [33, 25], [33, 76]]]]], ["attribute", "onclick", ["subexpr", "action", ["openPatientPrintList"], [], ["loc", [null, [36, 103], [36, 136]]]]], ["block", "each", [["get", "populationPatients", ["loc", [null, [43, 18], [43, 36]]]]], [], 3, null, ["loc", [null, [43, 10], [45, 19]]]], ["inline", "page-numbers", [], ["content", ["subexpr", "@mut", [["get", "content.patients", ["loc", [null, [47, 33], [47, 49]]]]], [], []], "action", ["subexpr", "action", ["setPage"], [], ["loc", [null, [47, 57], [47, 75]]]]], ["loc", [null, [47, 10], [47, 77]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("ember-on-fhir/templates/patients/loading", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 45
          }
        },
        "moduleName": "ember-on-fhir/templates/patients/loading.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "spin-box");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 0, 0);
        return morphs;
      },
      statements: [["content", "ember-spinner", ["loc", [null, [1, 22], [1, 39]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-on-fhir/templates/patients/print", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 4
            },
            "end": {
              "line": 13,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/print.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2, "class", "list-label");
          var el3 = dom.createTextNode("Population:");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 3]), 0, 0);
          return morphs;
        },
        statements: [["content", "model.group.name", ["loc", [null, [11, 12], [11, 32]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 4
            },
            "end": {
              "line": 20,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/print.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2, "class", "list-label");
          var el3 = dom.createTextNode("Huddle:");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createTextNode("Geriatrics Huddle (");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(")");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 3]), 1, 1);
          return morphs;
        },
        statements: [["inline", "moment-format", [["get", "currentHuddle.date", ["loc", [null, [18, 47], [18, 65]]]], "ll"], [], ["loc", [null, [18, 31], [18, 72]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 4
            },
            "end": {
              "line": 27,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/print.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2, "class", "list-label");
          var el3 = dom.createTextNode("Patient Name Search:");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 3]), 0, 0);
          return morphs;
        },
        statements: [["content", "name", ["loc", [null, [25, 12], [25, 20]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 66,
              "column": 4
            },
            "end": {
              "line": 68,
              "column": 4
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/print.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "patient-print-badge", [], ["patient", ["subexpr", "@mut", [["get", "patient", ["loc", [null, [67, 36], [67, 43]]]]], [], []], "huddles", ["subexpr", "patient-huddles", [["get", "model.huddles", ["loc", [null, [67, 69], [67, 82]]]], ["get", "patient", ["loc", [null, [67, 83], [67, 90]]]]], [], ["loc", [null, [67, 52], [67, 91]]]], "riskAssessment", ["subexpr", "get", [["get", "risksByPatient", ["loc", [null, [67, 112], [67, 126]]]], ["get", "patient.id", ["loc", [null, [67, 127], [67, 137]]]]], [], ["loc", [null, [67, 107], [67, 138]]]]], ["loc", [null, [67, 6], [67, 140]]]]],
        locals: ["patient"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 76,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/patients/print.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("table");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4, "class", "list-label");
        var el5 = dom.createTextNode("Risk Assessment:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4, "class", "list-label");
        var el5 = dom.createTextNode("Sort By:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4, "class", "list-label");
        var el5 = dom.createTextNode("Total Patients:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "hide-in-print text-center");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-primary");
        var el3 = dom.createTextNode("Print");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-ie-lg btn-default");
        var el3 = dom.createTextNode("Close Window");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("table");
        dom.setAttribute(el1, "class", "table table-striped");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        dom.setAttribute(el3, "class", "th-no-bottom");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        dom.setAttribute(el4, "colspan", "3");
        var el5 = dom.createTextNode(" ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        dom.setAttribute(el4, "colspan", "3");
        dom.setAttribute(el4, "class", "text-center th-border-bottom");
        var el5 = dom.createTextNode("Next Huddle");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode(" ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        dom.setAttribute(el3, "class", "th-no-top");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Patient Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Gender");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Age");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Date");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Reason");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Reviewed");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Risk");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "text-center");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "hide-in-print btn btn-primary");
        var el3 = dom.createTextNode("Print");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "hide-in-print btn btn-ie-lg btn-default");
        var el3 = dom.createTextNode("Close Window");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(fragment, [2]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element1, [3]);
        var element4 = dom.childAt(fragment, [6]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element4, [3]);
        var morphs = new Array(11);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 3]), 0, 0);
        morphs[1] = dom.createMorphAt(element0, 3, 3);
        morphs[2] = dom.createMorphAt(element0, 5, 5);
        morphs[3] = dom.createMorphAt(element0, 7, 7);
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [9, 3]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element0, [11, 3]), 0, 0);
        morphs[6] = dom.createAttrMorph(element2, 'onclick');
        morphs[7] = dom.createAttrMorph(element3, 'onclick');
        morphs[8] = dom.createMorphAt(dom.childAt(fragment, [4, 3]), 1, 1);
        morphs[9] = dom.createAttrMorph(element5, 'onclick');
        morphs[10] = dom.createAttrMorph(element6, 'onclick');
        return morphs;
      },
      statements: [["content", "assessment", ["loc", [null, [5, 10], [5, 24]]]], ["block", "if", [["get", "model.group", ["loc", [null, [8, 10], [8, 21]]]]], [], 0, null, ["loc", [null, [8, 4], [13, 11]]]], ["block", "if", [["get", "huddleId", ["loc", [null, [15, 10], [15, 18]]]]], [], 1, null, ["loc", [null, [15, 4], [20, 11]]]], ["block", "if", [["get", "name", ["loc", [null, [22, 10], [22, 14]]]]], [], 2, null, ["loc", [null, [22, 4], [27, 11]]]], ["content", "sortByDisplayText", ["loc", [null, [31, 10], [31, 31]]]], ["content", "model.patients.length", ["loc", [null, [36, 10], [36, 35]]]], ["attribute", "onclick", ["subexpr", "action", ["print"], [], ["loc", [null, [42, 42], [42, 60]]]]], ["attribute", "onclick", ["subexpr", "action", ["closeWindow"], [], ["loc", [null, [43, 52], [43, 76]]]]], ["block", "each", [["get", "model.patients", ["loc", [null, [66, 12], [66, 26]]]]], [], 3, null, ["loc", [null, [66, 4], [68, 13]]]], ["attribute", "onclick", ["subexpr", "action", ["print"], [], ["loc", [null, [73, 56], [73, 74]]]]], ["attribute", "onclick", ["subexpr", "action", ["closeWindow"], [], ["loc", [null, [74, 66], [74, 90]]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("ember-on-fhir/templates/patients/show", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 8
            },
            "end": {
              "line": 5,
              "column": 93
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/show.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-chevron-left");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("  Back to Patient List");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 10
            },
            "end": {
              "line": 13,
              "column": 10
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/show.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-chevron-left cursor-pointer");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" / ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-chevron-right cursor-pointer");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(fragment, [7]);
          var morphs = new Array(4);
          morphs[0] = dom.createAttrMorph(element0, 'onclick');
          morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          morphs[2] = dom.createMorphAt(fragment, 5, 5, contextualElement);
          morphs[3] = dom.createAttrMorph(element1, 'onclick');
          return morphs;
        },
        statements: [["attribute", "onclick", ["subexpr", "action", ["moveToPrevPatient"], [], ["loc", [null, [8, 65], [8, 95]]]]], ["content", "currentPatientIndex", ["loc", [null, [10, 12], [10, 35]]]], ["content", "huddleCount", ["loc", [null, [10, 38], [10, 53]]]], ["attribute", "onclick", ["subexpr", "action", ["moveToNextPatient", false], [], ["loc", [null, [12, 66], [12, 102]]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 37,
              "column": 0
            },
            "end": {
              "line": 39,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/show.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "add-intervention-modal", [], ["onClose", ["subexpr", "action", ["hideAddInterventionModal"], [], ["loc", [null, [38, 35], [38, 70]]]]], ["loc", [null, [38, 2], [38, 72]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 41,
              "column": 0
            },
            "end": {
              "line": 43,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/show.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "add-to-huddle-modal", [], ["patient", ["subexpr", "@mut", [["get", "model", ["loc", [null, [42, 32], [42, 37]]]]], [], []], "defaultDate", ["subexpr", "@mut", [["get", "defaultAddHuddleDate", ["loc", [null, [42, 50], [42, 70]]]]], [], []], "patientHuddles", ["subexpr", "@mut", [["get", "huddles", ["loc", [null, [42, 86], [42, 93]]]]], [], []], "onClose", ["subexpr", "action", ["hideAddHuddleModal"], [], ["loc", [null, [42, 102], [42, 131]]]]], ["loc", [null, [42, 2], [42, 133]]]]],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 45,
              "column": 0
            },
            "end": {
              "line": 52,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/patients/show.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "review-patient-modal", [], ["patient", ["subexpr", "@mut", [["get", "model", ["loc", [null, [47, 12], [47, 17]]]]], [], []], "huddle", ["subexpr", "@mut", [["get", "reviewPatientHuddle", ["loc", [null, [48, 11], [48, 30]]]]], [], []], "skippable", ["subexpr", "@mut", [["get", "reviewPatientModalSkippable", ["loc", [null, [49, 14], [49, 41]]]]], [], []], "onSkip", ["subexpr", "action", ["moveToNextPatient", true], [], ["loc", [null, [50, 11], [50, 44]]]], "onClose", ["subexpr", "action", ["hideReviewPatientModal"], [], ["loc", [null, [51, 12], [51, 45]]]]], ["loc", [null, [46, 2], [51, 47]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 53,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/patients/show.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "row patient-show");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "col-xs-12");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "patient-panel");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "patient-panel-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "pull-right");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "patient-panel-body clearfix");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0, 1, 1]);
        var element3 = dom.childAt(element2, [1]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(element3, 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [3]), 1, 1);
        morphs[3] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[4] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[5] = dom.createMorphAt(fragment, 6, 6, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "link-to", ["patients.index"], [], 0, null, ["loc", [null, [5, 8], [5, 105]]]], ["block", "if", [["get", "huddlePatients", ["loc", [null, [7, 16], [7, 30]]]]], [], 1, null, ["loc", [null, [7, 10], [13, 17]]]], ["inline", "patient-viewer", [], ["riskAssessments", ["subexpr", "@mut", [["get", "riskAssessments", ["loc", [null, [19, 26], [19, 41]]]]], [], []], "patient", ["subexpr", "@mut", [["get", "model", ["loc", [null, [20, 18], [20, 23]]]]], [], []], "currentAssessment", ["subexpr", "@mut", [["get", "currentAssessment", ["loc", [null, [21, 28], [21, 45]]]]], [], []], "selectedCategory", ["subexpr", "@mut", [["get", "selectedCategory", ["loc", [null, [22, 27], [22, 43]]]]], [], []], "huddles", ["subexpr", "@mut", [["get", "huddles", ["loc", [null, [23, 18], [23, 25]]]]], [], []], "setRiskAssessment", ["subexpr", "action", ["setRiskAssessment"], [], ["loc", [null, [24, 28], [24, 56]]]], "selectCategory", ["subexpr", "action", ["selectCategory"], [], ["loc", [null, [25, 25], [25, 50]]]], "openAddInterventionModal", ["subexpr", "action", ["openAddInterventionModal"], [], ["loc", [null, [26, 35], [26, 70]]]], "openAddHuddleModal", ["subexpr", "action", ["openAddHuddleModal"], [], ["loc", [null, [27, 29], [27, 58]]]], "openReviewPatientModal", ["subexpr", "action", ["openReviewPatientModal"], [], ["loc", [null, [28, 33], [28, 66]]]], "registerPatientViewer", ["subexpr", "action", ["registerPatientViewer"], [], ["loc", [null, [29, 32], [29, 64]]]], "unregisterPatientViewer", ["subexpr", "action", ["unregisterPatientViewer"], [], ["loc", [null, [30, 34], [30, 68]]]], "refreshHuddles", ["subexpr", "action", ["refreshHuddles"], [], ["loc", [null, [31, 25], [31, 50]]]]], ["loc", [null, [18, 8], [31, 52]]]], ["block", "if", [["get", "showAddInterventionModal", ["loc", [null, [37, 6], [37, 30]]]]], [], 2, null, ["loc", [null, [37, 0], [39, 7]]]], ["block", "if", [["get", "showAddHuddleModal", ["loc", [null, [41, 6], [41, 24]]]]], [], 3, null, ["loc", [null, [41, 0], [43, 7]]]], ["block", "if", [["get", "showReviewPatientModal", ["loc", [null, [45, 6], [45, 28]]]]], [], 4, null, ["loc", [null, [45, 0], [52, 7]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  })());
});
define("ember-on-fhir/templates/register", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 9,
                "column": 2
              }
            },
            "moduleName": "ember-on-fhir/templates/register.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "alert alert-danger");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createTextNode("Registration failed:");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            dom.setAttribute(el2, "aria-label", "Close");
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.setAttribute(el3, "aria-hidden", "true");
            dom.setAttribute(el3, "class", "fa fa-times");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [5]);
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(element0, 3, 3);
            morphs[1] = dom.createElementMorph(element1);
            return morphs;
          },
          statements: [["content", "errorMessage", ["loc", [null, [4, 44], [4, 60]]]], ["element", "action", ["clearErrors"], [], ["loc", [null, [5, 42], [5, 66]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 51,
                "column": 8
              },
              "end": {
                "line": 51,
                "column": 34
              }
            },
            "moduleName": "ember-on-fhir/templates/register.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Log in");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["wrong-type", "multiple-nodes"]
          },
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 55,
              "column": 0
            }
          },
          "moduleName": "ember-on-fhir/templates/register.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          dom.setAttribute(el1, "class", "form-register");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "sr-only");
          dom.setAttribute(el3, "for", "login-email");
          var el4 = dom.createTextNode("Enter email");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "input-addon left-addon");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("i");
          dom.setAttribute(el4, "class", "fa fa-envelope fa-fw left-addon-icon");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "sr-only");
          dom.setAttribute(el3, "for", "login-password");
          var el4 = dom.createTextNode("Enter password");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "input-addon left-addon");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("i");
          dom.setAttribute(el4, "class", "fa fa-lock fa-fw left-addon-icon");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3, "class", "sr-only");
          dom.setAttribute(el3, "for", "login-password");
          var el4 = dom.createTextNode("Enter password confirmation");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "input-addon left-addon");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("i");
          dom.setAttribute(el4, "class", "fa fa-lock fa-fw left-addon-icon");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "text-right");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3, "class", "btn btn-lg btn-primary");
          dom.setAttribute(el3, "type", "submit");
          var el4 = dom.createTextNode("Register");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "login-register-footer");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "row");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "col-xs-5 col-xs-offset-1 login-register-footer-left");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "col-xs-5 col-xs-offset-1 login-register-footer-right");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [2]);
          var element3 = dom.childAt(element2, [1]);
          var element4 = dom.childAt(element3, [3]);
          var element5 = dom.childAt(element2, [3]);
          var element6 = dom.childAt(element5, [3]);
          var element7 = dom.childAt(element2, [5]);
          var element8 = dom.childAt(element7, [3]);
          var element9 = dom.childAt(element2, [7, 1]);
          var morphs = new Array(13);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createElementMorph(element2);
          morphs[2] = dom.createAttrMorph(element3, 'class');
          morphs[3] = dom.createMorphAt(element4, 3, 3);
          morphs[4] = dom.createMorphAt(element4, 5, 5);
          morphs[5] = dom.createAttrMorph(element5, 'class');
          morphs[6] = dom.createMorphAt(element6, 3, 3);
          morphs[7] = dom.createMorphAt(element6, 5, 5);
          morphs[8] = dom.createAttrMorph(element7, 'class');
          morphs[9] = dom.createMorphAt(element8, 3, 3);
          morphs[10] = dom.createMorphAt(element8, 5, 5);
          morphs[11] = dom.createAttrMorph(element9, 'disabled');
          morphs[12] = dom.createMorphAt(dom.childAt(fragment, [4, 1, 3]), 1, 1);
          dom.insertBoundary(fragment, 0);
          return morphs;
        },
        statements: [["block", "if", [["get", "errorMessage", ["loc", [null, [2, 8], [2, 20]]]]], [], 0, null, ["loc", [null, [2, 2], [9, 9]]]], ["element", "action", ["register"], ["on", "submit"], ["loc", [null, [11, 8], [11, 41]]]], ["attribute", "class", ["concat", ["form-group ", ["get", "identificationClassNames", ["loc", [null, [12, 29], [12, 53]]]]]]], ["inline", "input", [], ["type", "text", "value", ["subexpr", "@mut", [["get", "identification", ["loc", [null, [16, 34], [16, 48]]]]], [], []], "classNames", "form-control form-input", "placeholder", "email"], ["loc", [null, [16, 8], [16, 107]]]], ["inline", "form-validation-tooltip", [], ["errors", ["subexpr", "@mut", [["get", "errors.identification", ["loc", [null, [18, 41], [18, 62]]]]], [], []], "displayErrors", ["subexpr", "@mut", [["get", "displayErrors", ["loc", [null, [18, 77], [18, 90]]]]], [], []]], ["loc", [null, [18, 8], [18, 92]]]], ["attribute", "class", ["concat", ["form-group ", ["get", "passwordClassNames", ["loc", [null, [22, 29], [22, 47]]]]]]], ["inline", "input", [], ["type", "password", "value", ["subexpr", "@mut", [["get", "password", ["loc", [null, [26, 38], [26, 46]]]]], [], []], "autocomplete", "off", "classNames", "form-control form-input", "placeholder", "password"], ["loc", [null, [26, 8], [26, 127]]]], ["inline", "form-validation-tooltip", [], ["errors", ["subexpr", "@mut", [["get", "errors.password", ["loc", [null, [28, 41], [28, 56]]]]], [], []], "displayErrors", ["subexpr", "@mut", [["get", "displayErrors", ["loc", [null, [28, 71], [28, 84]]]]], [], []]], ["loc", [null, [28, 8], [28, 86]]]], ["attribute", "class", ["concat", ["form-group ", ["get", "passwordConfirmationClassNames", ["loc", [null, [32, 29], [32, 59]]]]]]], ["inline", "input", [], ["type", "password", "value", ["subexpr", "@mut", [["get", "passwordConfirmation", ["loc", [null, [36, 38], [36, 58]]]]], [], []], "autocomplete", "off", "classNames", "form-control form-input", "placeholder", "confirm password"], ["loc", [null, [36, 8], [36, 147]]]], ["inline", "form-validation-tooltip", [], ["errors", ["subexpr", "@mut", [["get", "errors.passwordConfirmation", ["loc", [null, [38, 41], [38, 68]]]]], [], []], "displayErrors", ["subexpr", "@mut", [["get", "displayErrors", ["loc", [null, [38, 83], [38, 96]]]]], [], []]], ["loc", [null, [38, 8], [38, 98]]]], ["attribute", "disabled", ["get", "disableRegisterBtn", ["loc", [null, [43, 70], [43, 88]]]]], ["block", "link-to", ["login"], [], 1, null, ["loc", [null, [51, 8], [51, 46]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 56,
            "column": 0
          }
        },
        "moduleName": "ember-on-fhir/templates/register.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "login-register", [], [], 0, null, ["loc", [null, [1, 0], [55, 19]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('ember-on-fhir/utils/create-stylesheet', ['exports'], function (exports) {
  exports['default'] = createStylesheet;
  exports.addCSSRule = addCSSRule;

  function createStylesheet() {
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    return style;
  }

  function addCSSRule(sheet, selector, rules, index) {
    if ('addRule' in sheet) {
      sheet.addRule(selector, rules, index);
    } else if ('insertRule' in sheet) {
      sheet.insertRule(selector + ' { ' + rules + ' }', index);
    }
  }
});
define("ember-on-fhir/utils/email-validation-regex", ["exports"], function (exports) {
  var emailValidationRegex = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  exports.emailValidationRegex = emailValidationRegex;
  exports["default"] = emailValidationRegex;
});
define('ember-on-fhir/utils/fhir-paged-remote-array', ['exports', 'ember-cli-pagination/remote/paged-remote-array', 'ember-computed'], function (exports, _emberCliPaginationRemotePagedRemoteArray, _emberComputed) {
  exports['default'] = _emberCliPaginationRemotePagedRemoteArray['default'].extend({
    page: 1,
    totalPages: 0,
    sortBy: null,
    sortDescending: false,
    groupId: null,
    patientIds: [],
    patientSearch: null,
    link: null,

    getPage: function getPage() {
      return (this.get('page') - 1 || 0) * this.get('perPage');
    },

    sortParams: (0, _emberComputed['default'])('sortBy', 'sortDescending', {
      get: function get() {
        var sortBy = this.get('sortBy');
        var sortDescending = this.get('sortDescending');

        if (sortBy == null) {
          return {};
        }

        var sortDir = sortDescending ? '-' : '';
        return {
          _sort: '' + sortDir + sortBy
        };
      }
    }),

    patientIdParams: (0, _emberComputed['default'])('patientIds.[]', {
      get: function get() {
        var patientIds = this.get('patientIds');
        if (patientIds == null || patientIds.length === 0) {
          return {};
        }

        return { _id: patientIds.join(',') };
      }
    }),

    patientSearchParam: (0, _emberComputed['default'])('patientSearch', {
      get: function get() {
        var patientSearch = this.get('patientSearch');
        return patientSearch ? { name: patientSearch } : {};
      }
    }),

    otherParams: (0, _emberComputed['default'])('groupId', {
      get: function get() {
        var groupId = this.get('groupId');
        return groupId ? { '_query': 'group', groupId: groupId } : {};
      }
    }),

    searchParams: (0, _emberComputed['default'])('paramsForBackend', 'otherParams', 'patientIdParams', 'patientSearchParam', {
      get: function get() {
        return Object.assign({ _offset: this.get('paramsForBackend._offset'), _count: this.get('paramsForBackend._count') }, this.get('otherParams'), this.get('patientIdParams'), this.get('patientSearchParam'), this.get('sortParams'));
      }
    }),

    totalPagesBinding: 'total',

    rawFindFromStore: function rawFindFromStore() {
      var _this = this;

      var store = this.get('store');
      var modelName = this.get('modelName');
      var res = store.query(modelName, Object.assign({ _offset: this.get('paramsForBackend._offset'), _count: this.get('paramsForBackend._count') }, this.get('otherParams'), this.get('patientIdParams'), this.get('patientSearchParam'), this.get('sortParams')));
      var perPage = this.get('perPage');
      return res.then(function (rows) {
        _this.set('totalPages', Math.ceil(rows.meta.total / perPage));
        _this.set('link', rows.meta.link);
        return rows;
      });
    }
  });
});
define('ember-on-fhir/utils/group-characteristic-generator', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = createGCC;

  function createGCC(context, pane) {
    if (pane === 'age-filter') {
      return createAgeGCC(context);
    } else if (pane === 'gender-filter') {
      return createGenderGCC(context);
    } else if (pane === 'encounter-code-filter') {
      return createEncounterGCC(context);
    } else if (pane === 'condition-code-filter') {
      return createConditionGCC(context);
    }
  }

  function createAgeGCC(context) {
    var ageGCC = context.get('store').createRecord('group-characteristic-component', { id: _ember['default'].generateGuid({}, 'group-characteristic-component') });

    var ageRange = context.get('store').createRecord('range');
    ageRange.set('low', context.get('store').createRecord('quantity', { value: 0 }));
    ageRange.set('high', context.get('store').createRecord('quantity', { value: 65 }));
    ageGCC.set('valueRange', ageRange);

    var ageCoding = context.get('store').createRecord('coding', { code: '21612-7', system: 'http://loinc.org' });

    var ageCC = context.get('store').createRecord('codeable-concept');
    ageCC.get('coding').pushObject(ageCoding);
    ageGCC.set('code', ageCC);

    return ageGCC;
  }

  function createGenderGCC(context) {
    var genderGCC = context.get('store').createRecord('group-characteristic-component', { id: _ember['default'].generateGuid({}, 'group-characteristic-component') });

    var genderCoding = context.get('store').createRecord('coding', { code: '21840-4', system: 'http://loinc.org' });

    var genderCC = context.get('store').createRecord('codeable-concept');
    genderCC.get('coding').pushObject(genderCoding);
    genderGCC.set('code', genderCC);

    var genderFilterCoding = context.get('store').createRecord('coding', { code: 'male', system: 'http://hl7.org/fhir/administrative-gender' });

    var genderFilter = context.get('store').createRecord('codeable-concept', {
      id: _ember['default'].generateGuid({}, 'codeable-concept')
    });
    genderFilter.get('coding').pushObject(genderFilterCoding);
    genderGCC.set('valueCodeableConcept', genderFilter);

    return genderGCC;
  }

  function createEncounterGCC(context) {
    var encounterGCC = context.get('store').createRecord('group-characteristic-component', { id: _ember['default'].generateGuid({}, 'group-characteristic-component') });

    var encounterCoding = context.get('store').createRecord('coding', { code: '46240-8', system: 'http://loinc.org' });

    var encounterCC = context.get('store').createRecord('codeable-concept');
    encounterCC.get('coding').pushObject(encounterCoding);
    encounterGCC.set('code', encounterCC);

    var valueCoding = context.get('store').createRecord('coding');

    var valueCC = context.get('store').createRecord('codeable-concept');
    valueCC.get('coding').pushObject(valueCoding);
    encounterGCC.set('valueCodeableConcept', valueCC);

    return encounterGCC;
  }

  function createConditionGCC(context) {
    var conditionGCC = context.get('store').createRecord('group-characteristic-component', { id: _ember['default'].generateGuid({}, 'group-characteristic-component') });

    var conditionCoding = context.get('store').createRecord('coding', { code: '11450-4', system: 'http://loinc.org' });

    var conditionCC = context.get('store').createRecord('codeable-concept');
    conditionCC.get('coding').pushObject(conditionCoding);
    conditionGCC.set('code', conditionCC);

    var valueCoding = context.get('store').createRecord('coding');
    var valueCC = context.get('store').createRecord('codeable-concept');
    valueCC.get('coding').pushObject(valueCoding);
    conditionGCC.set('valueCodeableConcept', valueCC);

    return conditionGCC;
  }
});
define('ember-on-fhir/utils/true-null-property', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = trueNullProperty;

  function trueNullProperty(propertyName) {
    return _ember['default'].computed(propertyName, function () {
      if (this.get(propertyName)) {
        return true;
      }
      return null;
    });
  }
});
define('ember-on-fhir/utils/validation-group-classnames', ['exports', 'ember-computed'], function (exports, _emberComputed) {
  exports['default'] = validatedClassNames;

  function validatedClassNames(field) {
    return (0, _emberComputed['default'])('displayErrors', 'errors.' + field + '.length', function () {
      var classNames = [];

      if (this.get('errors.' + field + '.length') === 0) {
        classNames.push('has-success');
      } else if (this.get('displayErrors')) {
        classNames.push('has-error');
      }

      if (classNames.length) {
        classNames.push('has-feedback');
      }

      return classNames.join(' ');
    });
  }
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('ember-on-fhir/config/environment', ['ember'], function(Ember) {
  var prefix = 'ember-on-fhir';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("ember-on-fhir/app")["default"].create({"name":"ember-on-fhir","version":"0.0.0+5636e75a"});
}

/* jshint ignore:end */
//# sourceMappingURL=ember-on-fhir.map