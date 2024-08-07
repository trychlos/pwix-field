/*
 * pwix:field/src/common/js/configure.js
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';

let _conf = {};

Field._conf = new ReactiveVar( _conf );

Field._defaults = {
    verbosity: Field.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
Field.configure = function( o ){
    if( o && _.isObject( o )){
        _.merge( _conf, Field._defaults, o );
        Field._conf.set( _conf );
        _verbose( Field.C.Verbose.CONFIGURE, 'pwix:field configure() with', o );
    }
    // also acts as a getter
    return Field._conf.get();
}

_.merge( _conf, Field._defaults );
Field._conf.set( _conf );
