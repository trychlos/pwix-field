/*
 * pwix:field/src/common/js/functions.js
 */

Field.fn = {
    /**
     * @param {String} key
     * @returns {Boolean} whether the key starts with one of the configured prefixes
     */
    haveConfiguredPrefix( key ){
        const prefixes = Field.configure().prefixes;
        let found = false;
        prefixes.every(( it ) => {
            if( key.startsWith( it )){
                found = true;
            }
            return !found;
        });
        return found;
    }
};
