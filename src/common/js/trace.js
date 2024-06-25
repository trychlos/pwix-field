/*
 * pwix:field/src/common/js/trace.js
 */

_verbose = function( level ){
    if( Field.configure().verbosity & level ){
        let args = [ ...arguments ];
        args.shift();
        console.debug( ...args );
    }
};

_trace = function( functionName ){
    _verbose( Field.C.Verbose.FUNCTIONS, ...arguments );
};
