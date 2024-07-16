/*
 * pwix:field/src/common/classes/set.class.js
 *
 * Gathers an ordered set of Def's.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict; // up to nodejs v16.x

import { Def } from './def.class.js';

export class Set {

    // static data

    // static methods

    // private data

    // instanciation args
    #args = null;

    // an ordered list of Def's instances
    #set = null;

    // runtime data

    // private methods

    // extend the set with some fields
    _extend( spec ){
        assert( !spec.before || _.isString( spec.before ), 'expect a string, found '+spec.before );
        assert( spec.fields && _.isArray( spec.fields ), 'expect an array, found '+spec.fields );
        let index = -1;
        if( spec.before ){
            index = this._index( spec.before );
            assert( index >= 0, 'field not found: '+spec.before );
        }
        let added = this._fields( spec.fields );
        // inserting before a named field ?
        if( index >= 0 ){
            this.#set.splice( index, 0, ...added );
        } else {
            this.#set = this.#set.concat( added );
        }
    }

    // returns an array of new Field.Def's
    _fields( array ){
        let result = [];
        const self = this;
        if( array ){
            array.forEach(( it ) => {
                if( it ){
                    if( _.isArray( it )){
                        result = result.concat( self._fields( it ));
                    } else if( _.isObject( it )){
                        result.push( new Def( it ));
                    } else {
                        console.warn( 'expect an array of an object, found', it );
                    }
                }
            });
        }
        return result;
    }

    /*
     * @locus Everywhere
     * @param {String} name the name of the searched field
     * @returns {Integer} the index of field in the set array, or -1
     */
    _index( name ){
        let found = -1;
        for( let i=0 ; i<this.#set.length ; ++i ){
            const it = this.#set[i];
            assert( it instanceof Def, 'expects a Def instance' )
            if( it.name() === name ){
                found = i;
                break;
            }
        }
        return found;
    }

    // protected methods

    // public data

    /**
     * Constructor
     * @locus Everywhere
     * @summary Instanciates a new Set instance
     * @param {List<Object>|Array<Object>} list a list of field definitions
     *  The constructor is expected to be called as `new Field.Set( {def_1}, { def_2 }, { def_3 }, ... );`
     *  which happens to be a list of plain javascript objects whom we do not know the count of arguments.
     * @returns {Set} this instance
     */
    constructor( list ){
        assert( !list || _.isObject( list ) || _.isArray( list ), 'when set, argument must be an array or an ordered list of plain javascript Object\'s' );

        // keep instanciation args
        if( _.isArray( list )){
            this.#args = list;
        } else if( list ){
            this.#args = [ ...arguments ];
        }

        // instanciate a Def object for each field description
        // when an array is found, iterate inside this array (and recurse)
        this.#set = this._fields( this.#args );

        //console.debug( this );
        return this;
    }

    /**
     * @locus Everywhere
     * @param {String} name the name of the searched field
     * @returns {Def} the found Def field, or null
     *  Note that not all Def's have a 'name' key, so not all these fields are retrievable here
     */
    byName( name ){
        let found = null;
        this.#set.every(( it ) => {
            assert( it instanceof Def, 'expects a Def instance' )
            if( it.name() === name ){
                found = it;
            }
            return found === null;
        });
        return found;
    };

    /**
     * @locus Everywhere
     * @summary Extend the current Set with additional fields
     * @param {Object|Array} extend the fields definitions to be inserted
     */
    extend( extend ){
        // accept null or an empty object, or an empty array
        if( !extend || ( _.isObject( extend ) && Object.keys( extend ).length === 0 ) || ( _.isArray( extend ) && extend.length === 0 )){
            return;
        }
        assert( extend && ( _.isObject( extend ) || _.isArray( extend )), 'expect an object or an array of objects' );
        extend = _.isArray( extend ) ? extend : [ extend ];
        const self = this;
        extend.forEach(( it ) => {
            self._extend( it );
        });
    };

    /**
     * @locus Everywhere
     * @returns {Array} the defined names
     */
    names(){
        let names = [];
        this.#set.forEach(( it ) => {
            const name = it.name();
            if( name ){
                names.push( name );
            }
        });
        return names;
    };

    /**
     * @locus Everywhere
     * @returns {Object} a Forms specification as an object where keys are the name of the fields, and values the Forms field definition
     */
    toForm(){
        let result = {};
        this.#set.forEach(( def ) => {
            const res = def.toForm();
            if( res ){
                result[def.name()] = res;
            }
        })
        return result;
    };

    /**
     * @locus Everywhere
     * @returns {Object} an object where keys are the name of the fields, and values the help data
     */
    toHelp(){
        let result = {};
        this.#set.forEach(( def ) => {
            const res = def.toHelp();
            if( res && Object.keys( res ).length > 0 ){
                result[def.name()] = res;
            }
        })
        return result;
    };

    /**
     * @locus Everywhere
     * @returns {Object} the SimpleSchema definition as an object where keys are the name of the fields, and values the SimpleSchema definition
     */
    toSchema(){
        let result = {};
        this.#set.forEach(( def ) => {
            const res = def.toSchema();
            if( res ){
                result[def.name()] = res;
            }
        })
        return result;
    };

    /**
     * @locus Everywhere
     * @returns {Array<Object>} the array of datatable column definitions
     */
    toTabular(){
        let result = [];
        this.#set.forEach(( def ) => {
            const res = def.toTabular();
            if( res ){
                result.push( res );
            }
        });
        return result;
    };
}
