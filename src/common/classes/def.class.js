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
 * - tabular: when false, let this field be fully ignored in the tabular display
 *   defauts to true
 *
 * - dt_template: stands for `aldeed:tabular` tmpl
 *   a name can be provided at definition time, will be replaced by the Blaze Template instance at instanciation time
 *   so both name (as a string) and actual Template.my_template forms are accepted
 *
 * - dt_templateContext: stands for `aldeed:tabular` tmplContext
 *
 * 'form_'-prefixed keys target the input panel (and more specifically `pwix:forms` package).
 *
 * 'help_'-prefixed keys may host help data for the field, e.g. a short help text, or a full help description.
 *
 * 'add_'-prefixed keys target additional features.
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

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
        if( !this._formParticipate()){
            logger.error( '_formDefinition() field is not defined to participate to a Form, and you should have checked that before', 'throwing...' );
            throw new Error( 'Missing check' );
        }
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
        if( !this._helpParticipate()){
            logger.error( '_helpDefinition() field is not defined to participate to help data, and you should have checked that before', 'throwing...' );
            throw new Error( 'Missing check' );
        }
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
        if( !this._schemaParticipate()){
            logger.error( '_schemaDefinition() field is not defined to participate to a schema, and you should have checked that before', 'throwing...' );
            throw new Error( 'Missing check' );
        }
        const def = this._defn();
        let res = {};
        Object.keys( def ).forEach(( key ) => {
            // have to remove keys which are unknowned from SimpleSchema as this later doesn't accept them
            if( key !== 'name' &&
                key !== 'schema' &&
                key !== 'tabular' && !key.startsWith( 'dt_' ) &&
                key !== 'form' && !key.startsWith( 'form_' ) &&
                                !key.startsWith( 'add_' ) &&
                key !== 'help' && !key.startsWith( 'help_' ) &&
                !Field.fn.haveConfiguredPrefix( key )){
                
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
     *  - data subscription is named along the 'dt_data' key or the 'name' key, unless dt_data=false
     *  - all 'dt_' keys are provided (minus this prefix)
     *  - if a field is 'dt_hidden', then we set 'dt_visible=false'
     */
    _tabularDefinition(){
        if( !this._tabularParticipate()){
            logger.error( '_tabularDefinition() field is not defined to participate to a DataTables tabular display, and you should have checked that before', 'throwing...' );
            throw new Error( 'Missing check' );
        }
        const def = this._defn();
        let res = {};
        // we have a 'data' key if we have a field name and not dt_data=false
        //  but a provided dt_data takes the priority
        if( def.dt_data !== false ){
            res.data = def.dt_data ? def.dt_data : def.name;
        }
        // send the dt_ keys to the definition
        Object.keys( def ).forEach(( key ) => {
            if( key !== 'dt_data' ){
                if( key === 'name' ){
                    res.name = def.name;
                }
                if( key.startsWith( 'dt_' )){
                    let dtkey = key.substring( 3 );
                    if( dtkey === 'template' ){
                        dtkey = 'tmpl';
                    }
                    if( dtkey === 'templateContext' ){
                        dtkey = 'tmplContext';
                    }
                    res[dtkey] = def[key];
                    // if hidden, then not visible
                    if( dtkey === 'hidden' && def[key]){
                        res.visible = false;
                    }
                }
            }
        });
        // when provided, complete the datacontext with this Field.Def definition
        if( res.tmpl || res.tmplContext ){
            const fn = res.tmplContext;
            const self = this;
            res.tmplContext = function( rowData ){
                const o = fn ? fn( rowData ) : { item: rowData };
                o.field = self;
                return o;
            };
        }
        // provide the field type (Boolean, etc.) to the definition unless we have found a dt_type
        if( !res.type ){
            res.type = def.type;
        }
        return res;
    }

    /*
     * @returns {Boolean} whether the field definition has any 'dt_' key
     */
    _tabularHaveDtKey( def ){
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
     *  - must not have a 'tabular=false' key
     *  - must have:
     *      > either a terminal 'name', which will be transformed to a 'data' which is used to subscribe to the collection,
     *      > either a 'name', which will be transformed to a 'data' which is used to subscribe to the collection, and which must not be an object (doesn't end in '.$')
     *      > or any 'dt_'-prefixed key
     */
    _tabularParticipate( names ){
        const def = this._defn();
        const name = this.name();
        if( def.tabular === false ){
            return false;
        }
        if( this._tabularHaveDtKey( def )){
            return true;
        }
        if( !name ){
            return false;
        }
        // do we have a terminal name ? no if any other name starts with '<name>.'
        const str = name + '.';
        for( const it of names ){
            if( it.startsWith( str )){
                return false;
            }
        }
        return true;
    }

    // public data

    /**
     * @constructor
     * @locus Everywhere
     * @param {Object} o the field definition provided by the application
     * @returns {Field} this instance
     */
    constructor( o ){
        if( o && !_.isObject( o )){
            logger.error( 'Def.Def() expects an object when set, got', o, 'throwing...' );
            throw new Error( 'Bad argument: o' );
        }
        o = o || {};

        // keep instanciation args
        this.#args = { ...o };

        return this;
    }

    /**
     * @locus Everywhere
     * @param {String} prefix the searched for prefix, defaulting to empty which means all
     * @returns {Object} the full definition if it contains a key which starts with this prefix, or null
     */
    byPrefix( prefix='' ){
        let found = null;
        const def = this._defn();
        Object.keys( def ).every(( it ) => {
            if( !prefix || it.startsWith( prefix )){
                found = def;
            }
            return !found;
        });
        return found;
    }

    /**
     * @locus Everywhere
     * @param {Object} item
     * @returns {Object} a EJSON-comparable version of item
     */
    comparable( item ){
        const name = this.name();
        //if( name === 'keygrips.$' ) logger.debug( name, 'entering' );
        // if no 'add_ejson()' function, then ignore
        const defn = this._defn();
        if( !defn.add_ejson ){
            return item;
        }
        if( !_.isFunction( defn.add_ejson )){
            logger.warning( 'comparable()', name, 'add_ejson() is not a function, got', defn.add_ejson );
            return item;
        }
        // if the name dot-separated, then these are sub-documents
        // if the name has one or more '.$.', then these are arrays
        //  e.g. something like 'jwks.$.pair.key.$.algorithm'
        const parts = name.split( '.' );
        const _fnIter = function( local_item, local_parts ){
            if( !local_item ){
                return;
            }
            //if( name === 'keygrips.$' ) logger.debug( name, local_item, local_parts );
            if( local_parts.length ){
                const part = local_parts.shift();
                if( local_parts.length ){
                    if( part === '$' ){
                        if( _.isArray( local_item )){
                            const start_parts = _.cloneDeep( local_parts );
                            for( let i=0 ; i<local_item.length ; ++i ){
                                local_parts = _.cloneDeep( start_parts );
                                _fnIter( local_item[i], local_parts );
                            }
                        } else {
                            logger.warning( 'comparable() expects an array, got', local_item );
                        }
                    } else {
                        _fnIter( local_item[part], local_parts );
                    }
                } else if( part === '$' ){
                    // if a function is attached to '$' last part, then it applies to each and every item
                    //local_item = defn.add_ejson( local_item );
                    for( let i=0 ; i<( local_item || [] ).length ; ++i ){
                        local_item[i] = defn.add_ejson( local_item[i] );
                    }
                } else {
                    local_item[part] = defn.add_ejson( local_item[part] );
                }
            }
        };
        _fnIter( item, parts );
        //if( name === 'keygrips.$' ) logger.debug( name, 'returning', item );
        return item;
    }

    /**
     * @locus Everywhere
     * @returns {Object} the initial definition as an object
     */
    def(){
        return this._defn();
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
     * @param { Object } set keys and their values to set on the definition
     */
    set( set ){
        _.merge( this.#args, set );
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
    }

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
    }

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
    }

    /**
     * @locus Everywhere
     * @param {Array} names an optional list of the set names
     * @returns {Object} the datatable column definition, or null
     */
    toTabular( names ){
        let res = null;
        if( this._tabularParticipate( names )){
            res = this._tabularDefinition();
        }
        return res;
    }
}
