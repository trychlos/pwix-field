/*
 * pwix:field/src/common/classes/set.class.js
 *
 * Gathers an ordered set of Def's.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict; // up to nodejs v16.x

import SimpleSchema from 'meteor/aldeed:simple-schema';

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

    // protected methods

    // public data

    /**
     * Constructor
     * @locus Everywhere
     * @summary Instanciates a new Set instance
     * @param {List<Object>} list a list of field definitions
     *  The constructor is expected to be called as `new Field.Set( {def_1}, { def_2 }, { def_3 }, ... );`
     *  which happens to be a list of plain javascript objects whom we do not know the count of arguments.
     * @returns {Set} this instance
     */
    constructor( list ){
        assert( list && _.isObject( list ), 'argument must be an ordered list of plain javascript Object\'s' );

        // keep instanciation args
        this.#args = [ ...arguments ];

        // instanciate a Def object for each field description
        this.#set = [];
        const self = this;
        this.#args.forEach(( it ) => {
            self.#set.push( new Def( it ));
        })

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
