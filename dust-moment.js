var moment = require('moment');

var formats = [
  moment.ISO_8601, 
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD', 
  'DD-MMM-YYYY'
];

module.exports = function( dust ) {

  if (!dust) {
    throw new Error('Parameter "dust" is not defined.');
  }

  dust.helpers = dust.helpers || {};

  dust.helpers.formatDate = function(chunk, context, bodies, params) {
    var date = dust.helpers.tap(params.date, chunk, context);
    // Do not pass false to moment constructor to avoid deprecation warning
    if (!date) {
      date = null;
    }
    var format = dust.helpers.tap(params.format || "MMM Do YYYY", chunk, context);
    var noTimeWrapper = dust.helpers.tap(params.noTimeWrapper || false, chunk, context);
    var lan = params.lan || 'en-nz';

    moment.locale(lan);

    if (!date) {
      return chunk.write('');
    }
    var m = moment(date, formats);
    if (!m.isValid()) {
      return chunk.write('');
    }

    var output = m.format(format);
    if (!noTimeWrapper) {
      output = '<time datetime="'+m.toISOString()+'">'+output+'</time>';
    }

    return chunk.write(output);
  };

  dust.helpers.fromNow = function(chunk, context, bodies, params) {
    var date = dust.helpers.tap(params.from || params.date || new Date(), chunk, context);
    var removeSuffix = dust.helpers.tap(params.removeSuffix === 'true', chunk, context);
    var futurePrefix = dust.helpers.tap(params.futurePrefix || "", chunk, context);

    var lan = params.lan || 'en-nz';

    moment.locale(lan);

    var m = moment(date, formats);
    if (!m.isValid()) {
      return chunk.write('');
    }

    if (m.isAfter(moment())) {
      var output = futurePrefix+m.fromNow(removeSuffix);
      output = '<time datetime="'+m.toISOString()+'">'+output+'</time>';
      return chunk.write(output);
    }

    return chunk.write('<time datetime="'+m.toISOString()+'">'+m.fromNow(removeSuffix)+'</time>');
  };

};
