/*
 * pwix:field/src/common/js/configure.js
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';

let _conf = {};
Field._conf = new ReactiveVar( _conf );

Field._defaults = {
    prefixes: [],
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
        // check that keys exist
        let built_conf = {};
        Object.keys( o ).forEach(( it ) => {
            if( Object.keys( Field._defaults ).includes( it )){
                built_conf[it] = o[it];
            } else {
                console.warn( 'pwix:field configure() ignore unmanaged key \''+it+'\'' );
            }
        });
        if( Object.keys( built_conf ).length ){
            _conf = _.merge( Field._defaults, _conf, built_conf );
            Field._conf.set( _conf );
            _verbose( Field.C.Verbose.CONFIGURE, 'pwix:field configure() with', built_conf );
        }
    }
    // also acts as a getter
    return Field._conf.get();
}

_conf = _.merge( {}, Field._defaults );
Field._conf.set( _conf );
