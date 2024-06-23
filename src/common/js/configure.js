/*
 * pwix:field/src/common/js/configure.js
 */

import _ from 'lodash';

Field._conf = {};

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
        _.merge( Field._conf, Field._defaults, o );
        // be verbose if asked for
        if( Field._conf.verbosity & Field.C.Verbose.CONFIGURE ){
            console.log( 'pwix:field configure() with', o );
        }
    }
    // also acts as a getter
    return Field._conf;
}

_.merge( Field._conf, Field._defaults );
