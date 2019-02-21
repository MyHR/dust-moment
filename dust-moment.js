var moment = require('moment');

var formats = [
  moment.ISO_8601, 
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD', 
  'DD-MMM-YYYY',
  'ddd MMM DD YYYY HH:mm:ss Z'
];

module.exports = function( dust ) {

  if (!dust) {
    throw new Error('Parameter "dust" is not defined.');
  }

  dust.helpers = dust.helpers || {};

  dust.helpers.formatDate = function(chunk, context, bodies, params) {
    var date = dust.helpers.tap(params.date, chunk, context);
    var defaultValue = '';
    if (!date) {
      return chunk.write(defaultValue);
    }
    var format = dust.helpers.tap(params.format || "MMM Do YYYY", chunk, context);
    var noTimeWrapper = dust.helpers.tap(params.noTimeWrapper || false, chunk, context);
    var lan = params.lan || 'en-nz';

    moment.locale(lan);

    var m = moment(date, formats);
    if (!m.isValid()) {
      if (typeof console === 'object' && typeof console.log) {
        console.log("dust-moment.formatDate: !m.isValid(): date, accepted formats: ", date, formats);
      }
      return chunk.write(defaultValue);
    }

    var output = m.format(format);
    if (!noTimeWrapper) {
      output = '<time datetime="'+m.toISOString()+'">'+output+'</time>';
    }

    return chunk.write(output);
  };

  dust.helpers.fromNow = function(chunk, context, bodies, params) {
    var date = dust.helpers.tap(params.from || params.date || new Date(), chunk, context);
    var defaultValue = '';
    if (!date) {
      return chunk.write(defaultValue);
    }
    var removeSuffix = dust.helpers.tap(params.removeSuffix === 'true', chunk, context);
    var futurePrefix = dust.helpers.tap(params.futurePrefix || "", chunk, context);

    var lan = params.lan || 'en-nz';

    moment.locale(lan);

    var m = moment(date, formats);
    if (!m.isValid()) {
      if (typeof console === 'object' && typeof console.log) {
        console.log("dust-moment.fromNow: !m.isValid(): date, accepted formats: ", date, formats);
      }
      if (typeof Rollbar === 'object' && typeof Rollbar.warning === 'function') {
        Rollbar.warning("dust-moment.fromNow: !m.isValid()");
      }
      return chunk.write(defaultValue);
    }

    if (m.isAfter(moment())) {
      var output = futurePrefix+m.fromNow(removeSuffix);
      output = '<time datetime="'+m.toISOString()+'">'+output+'</time>';
      return chunk.write(output);
    }

    return chunk.write('<time datetime="'+m.toISOString()+'">'+m.fromNow(removeSuffix)+'</time>');
  };

};
