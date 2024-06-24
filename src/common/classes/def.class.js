/*
 * pwix:field/src/common/classes/def.class.js
 *
 * A class which addresses each data usage, from the collection schema to a tabular display or individual field input and check.
 * Each field definition is to be provided by the application through a FieldSpec instance.
 *
 * Field definition is mainly an extension of a SimpleSchema definition with some modifications:
 *
 * - name: optional, the name of the field in the collection
 *   when unset, the field is not defined in the collection (though can appear in a tabular display or be managed inside of an input panel)
 *
 * - schema: when false, let this field be fully ignored by the collection schema
 *   defauts to true
 *
 * 'dt_'-prefixed keys target the tabular display, and accept any [Datatable column definition](https://datatables.net/reference/option/columns), plus:
 *
 * - dt_tabular: when false, let this field be fully ignored in the tabular display
 *   defauts to true
 *
 * - dt_template: stands for `aldeed:tabular` tmpl
 *
 * - dt_templateContext: stands for `aldeed:tabular` tmplContext
 *
 * 'form_'-prefixed keys target the input panel (and more specifically `pwix:field` package).
 *
 * 'help_'-prefixed keys may host help data for the field, e.g. a short help text, or a full help description.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict; // up to nodejs v16.x

export class Def {

    // static data

    // static methods

    // private data

    // instanciation args
    #args = null;

    // runtime data

    // private methods

    /*
     * @locus Everywhere
     * @returns {Object} the Def definition
     * @rationale
     *  We do not care to interpret/reclass each and every possible key/value pair at instanciation time.
     *  Instead we rely of the kept instanciation args to remind the initial definition
     *  Users of this class call methods, and each method can ask for the initial definition here
     */
    _defn(){
        return this.#args;
    }

    /*
     * @returns {Object} the Form definition
     * @rules
     *  - must have a name
     *  - do not have form=false
     */
    _formDefinition(){
        assert( this._formParticipate(), 'field is not defined to participate to a Form' );
        const def = this._defn();
        let res = {};
        Object.keys( def ).forEach(( key ) => {
            if( key !== 'name' && key !== 'form' ){
                if( key.startsWith( 'form_' )){
                    let formkey = key.substring( 5 );
                    res[formkey] = def[key];
                }
            }
        });
        return res;
    }

    /*
     * @returns {Boolean} whether this field definition participates to a Form
     * @rules
     *  - must have a set 'name'
     *  - must not have a 'form=false' key
     */
    _formParticipate(){
        const def = this._defn();
        return this.name() && def.form !== false;
    }

    /*
     * @returns {Object} the help data, which may be empty
     */
    _helpDefinition(){
        assert( this._helpParticipate(), 'field is not defined to participate to help data' );
        const def = this._defn();
        let res = {};
        Object.keys( def ).forEach(( key ) => {
            if( key !== 'name' && key !== 'help' ){
                if( key.startsWith( 'help_' )){
                    let helpkey = key.substring( 5 );
                    res[helpkey] = def[key];
                }
            }
        });
        return res;
    }

    /*
     * @returns {Boolean} whether this field definition participates to any sort of help data
     * @rules
     *  - must have a set 'name'
     *  - must not have a 'help=false' key
     */
    _helpParticipate(){
        const def = this._defn();
        return this.name() && def.help !== false;
    }

    /*
     * @returns {Object} the SimpleSchema definition
     * @rules
     *  - must participate to the schema
     *  - all SimpleSchema keys are accepted
     *  - only SimpleSchema must be accepted as SimpleSchema doesn't accept unknown keys
     */
    _schemaDefinition(){
        assert( this._schemaParticipate(), 'field is not defined to participate to a schema' );
        const def = this._defn();
        let res = {};
        Object.keys( def ).forEach(( key ) => {
            // have to remove keys which are unknowned from SimpleSchema as this later doesn't accept them
            if( key !== 'name' && key !== 'schema' && !key.startsWith( 'dt_' ) && !key.startsWith( 'form_' ) && !key.startsWith( 'help_' )){
                res[key] = def[key];
            }
        });
        return res;
    }

    /*
     * @returns {Boolean} whether this field definition participates to a SimpleSchema
     * @rules
     *  - must have a set 'name'
     *  - must not have a 'schema=false' key
     */
    _schemaParticipate(){
        const def = this._defn();
        return this.name() && def.schema !== false;
    }

    /*
     * @returns {Object} the datatable column definition
     * @rules
     *  - must participate to the schema
     *  - data subscription is named along the 'field' key, unless dt_data=false
     *  - all 'dt_' keys are provided (minus this prefix)
     */
    _tabularDefinition(){
        assert( this._tabularParticipate(), 'field is not defined to participate to a datatable tabular display' );
        const def = this._defn();
        let res = {};
        // we have a 'data' key if we have a field name and not dt_data=false
        if( this.name() && def.dt_data !== false ){
            res.data = def.name;
        }
        Object.keys( def ).forEach(( key ) => {
            if( key !== 'name' && key !== 'dt_data' ){
                if( key.startsWith( 'dt_' )){
                    let dtkey = key.substring( 3 );
                    if( dtkey === 'template' ){
                        dtkey = 'tmpl';
                    }
                    if( dtkey === 'templateContext' ){
                        dtkey = 'tmplContext';
                    }
                    res[dtkey] = def[key];
                }
            }
        });
        return res;
    }

    /*
     * @returns {Boolean} whether the field definition has any 'dt_' key
     */
    _tabularHaveKey( def ){
        let have_dtkey = false;
        Object.keys( def ).every(( key ) => {
            have_dtkey = key.startsWith( 'dt_' );
            return !have_dtkey;
        });
        return have_dtkey;
    }

    /*
     * @returns {Boolean} whether this field definition participates to a tabular display
     * @rules
     *  - must not have a 'dt_tabular=false' key
     *  - must have either a set 'name' which will be transformed to a 'data' which is used to subscribe to the collection
     *    or any 'dt_'-prefixed key
     */
    _tabularParticipate(){
        const def = this._defn();
        return def.dt_tabular !== false && ( this.name() || this._tabularHaveKey( def ));
    }

    // public data

    /**
     * Constructor
     * @locus Everywhere
     * @param {Object} o the field definition provided by the application
     * @returns {Field} this instance
     */
    constructor( o ){
        assert( o && _.isObject( o ), 'definition must be a plain javascript Object' );

        // keep instanciation args
        this.#args = { ...o };

        return this;
    }

    /**
     * @locus Everywhere
     * @returns {String} the 'name' value, or null if it is not set
     */
    name(){
        return this._defn().name || null;
    }

    /**
     * @locus Everywhere
     * @returns {Object} a Forms specification as an object where keys are the name of the fields, and values the Forms field definition
     */
    toForm(){
        let res = null;
        if( this._formParticipate()){
            res = this._formDefinition();
        }
        return res;
    };

    /**
     * @locus Everywhere
     * @returns {Object} The 'help_' relative keys and values, which may be empty
     */
    toHelp(){
        let res = null;
        if( this._helpParticipate()){
            res = this._helpDefinition();
        }
        return res;
    };

    /**
     * @locus Everywhere
     * @returns {Object} suitable for a SimpleSchema definition
     */
    toSchema(){
        let res = null;
        if( this._schemaParticipate()){
            res = this._schemaDefinition();
        }
        return res;
    };

    /**
     * @locus Everywhere
     * @returns {Object} the datatable column definition, or null
     */
    toTabular(){
        let res = null;
        if( this._tabularParticipate()){
            res = this._tabularDefinition();
            if( res.tmplContext ){
                const fn = res.tmplContext;
                const self = this;
                res.tmplContext = function( rowData ){
                    const o = fn( rowData );
                    o.field = self;
                    return o;
                };
            }
        }
        return res;
    };
}
