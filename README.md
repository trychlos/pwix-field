# pwix:field

## What is it ?

A package to manage field definitions in Meteor. You define here at once all specifications needed for both:

- SimpleSchema definition, with `aldeed:simple-schema`

- Datatables display, with `aldeed:tabular`

- forms input, with `pwix:forms`

- getter, setter and both client and server sides checks

- help lines.

## Installation

This Meteor package is installable with the usual command:

```sh
    meteor add pwix:field
```

## Usage

```js
    import { Field } from 'meteor/pwix:field';

    // define your fields specifications, both suitable for schema collection, tabular display and form edition
    // this is mainly a SimpleSchema extenstion
    const fieldSet = new Field.Set(
        {
            name: 'name'
            type: String
        },
        {
            name: 'surname',
            type: String,
            optional: true
        }
    );
```

This package is not tied to a client or server side. We strongly suggest to use it in common code.

## Provides

### `Field`

The exported `Field` global object provides following items:

#### Functions

##### `Field.configure()`

    See [below](#configuration).

#### Classes

###### `Field.Def`

A class which provides the ad-hoc definitions for (almost) every use of a field in an application, and in particular:

- to a `SimpleSchema` collection schema through the `Field.ISchema` interface
- to a [`Datatable`](https://datatables.net) tabular display
- to the `Forms.Checker` class provided by `pwix:forms`
- as a help memento with `help_`-prefixed keys.

A `Field.Def` is instanciated with an object with some specific keys, depending of the target usage:

- Mongo schema

    All `SimpleSchema` keys can be set in this field definition, and will be passed to the `SimpleSchema()` instanciation.

    Some particular keys are defined and are considered here:

    - `name`

        Optional, the name of the field.

        Though this field is optional at the `Field.Def` level, it is mandatory to trigger a schema definition. In other words, `Field.Def` definitions are just ignored from schema point of view if no `name` is set.

    - `schema`

        When `false`, ignore this `Field.Def` definition from schema point of view **even if a `name` is set**.

- Tabular display

    Tabular display is managed through [`Datatable`](https://datatables.net).

    The `Field.Def` definitions are used to build the `columns` definition argument at `Tabular.Table` instanciation time. All arguments accepted in this `columns` definition can be provided here, with a `dt_` prefix, plus following keys:

    - `dt_tabular`

        Optional, whether to have this field in the columns of a tabular display, defaulting to `true`.

        The whole field definition is ignored from tabular point of view when `dt_tabular` is false.

    - `dt_data`

        Optional, whether to have this field as a data subscription in a tabular display, defaulting to `true` if a `name` is set.

        A named field defaults to be subscribed to by a tabular display. This option prevents to have a useless data subscription.

    - `dt_template`

    - `dt_templateContext`

        Replace the `tmpl` and `tmplContext` defined by `aldeed:tabular` with same mean and usage.

- Forms usage

    All `Forms.Checker` keys must be passed with a `form_` prefix. All fields are considered unless a `form = false` is specified.

    See `pwix:forms` documentation for the list of available keys.

###### Methods

- `Field.Def.toForm()`

    Returns a columns specification suitable to [Forms](https://github.com/trychlos/pwix-forms/) setup.

    A field which have a `form = false` key/value pair is ignored when building the fields definition.

    All `Field.Def` definitions are considered when building the forms definition, unless:

    - no `name` is set

    - or a `form = false` key/value pair is specified.

    If none of the two above conditions are met, then the method returns at least an empty object.

- `Field.Def.toHelp()`

    Extract and returns the help data, which may be an empty object.

    All `Field.Def` definitions are considered when building the help data, unless:

    - no `name` is set

    - or a `help = false` key/value pair is specified.

    If none of the two above conditions are met, then the method returns at least an empty object.

- `Field.Def.toTabular()`

    Returns a column definition suitable to [Datatable](https://datatables.net/) initialization.

    A field which have a `dt_tabular = false` key/value pair is ignored when building the tabular definition.

- `Field.Def.toSchema()`

    Returns an object with fields definitions suitable to instanciate a [SimpleSchema](https://github.com/Meteor-Community-Packages/meteor-simple-schema).

    All `Field.Def` definitions are considered when building a schema, unless:

    - no `name` is set

    - or a `schema = false` key/value pair is specified.

##### `Field.Set`

An ordered collection of `Field.Def` objects.

It should be instanciated by the caller with a list or an array of fields definitions as plain javascript objects.

```js
    app.fieldsSet = new Field.Set(
        {
            name: '_id',
            type: String,
            // not considered in the tabular displays
            dt_tabular: false
        },
        {
            name: 'emails',
            type: Array,
            optional: true,
            // not visible in the tabular displays
            dt_visible: false
        },
        {
            name: 'emails.$',
            type: Object,
            optional: true,
            // not considered in the tabular displays
            //  really useless as emails is subscribed to anyway
            dt_tabular: false
        },
        {
            name: 'emails.$.address',
            type: String,
            regEx: SimpleSchema.RegEx.Email,
            dt_data: false,
            // the title of the header
            dt_title: pwixI18n.label( I18N, 'list.email_address_th' ),
            dt_template: Meteor.isClient && Template.email_address,
            // check function
            form_check: AccountsManager.check?.emailAddress,
            // if the email address is optional ?
            form_checkType: 'optional'
        },
        {
            name: 'emails.$.verified',
            type: Boolean,
            dt_data: false,
            dt_title: pwixI18n.label( I18N, 'list.email_verified_th' ),
            dt_template: Meteor.isClient && Template.email_verified,
            form_check: AccountsManager.check?.emailVerified
        },
        {
            dt_template: Meteor.isClient && Template.email_more
        },
        {
            name: 'username',
            type: String,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.username_th' ),
            form_check: AccountsManager.check?.username
        },
        {
            name: 'profile',
            type: Object,
            optional: true,
            blackbox: true,
            dt_tabular: false
        },
        Notes.field({
            name: 'userNotes',
            dt_title: pwixI18n.label( I18N, 'list.user_notes_th' ),
            //dt_template: Meteor.isClient && Notes.template
        })
    );
```

Both all fields of a Mongo document, all columns of a tabular display based on this collection, and all fields managed in an editing panel must be defined here. Hence the different definitions.

###### Methods

- `Field.Set.byName( name )`

    Returns the named `Field.Def` object, or null.

    Because the `name` key is optional when defining a field, then not all field's are retrievable by this method.

- `Field.Set.extend( <Array|Object> )`

    Extends the `Field.Set` set with the provided fields definitions, as an object, or an array of objects, where each object has following keys:

    - `where`: where to insert the specifications, can be:

        - `Field.C.Insert.AFTER`
        - `Field.C.Insert.BEFORE`

    - `name`: the column reference name to be inserted after or before, must be already defined.

    - `fields`: an array of field definitions.

- `Field.Set.names()`

    Returns the array of defined `name`'s.

- `Field.Set.toForm()`

    Returns an ordered list of columns definitions suitable to [Forms](https://github.com/trychlos/pwix-forms/) setup.

- `Field.Set.toHelp()`

    Extract and returns a keyed object with the help data.

- `Field.Set.toTabular()`

    Returns an ordered list of columns definitions suitable to [Datatable](https://datatables.net/) initialization.

- `Field.Set.toSchema()`

    Returns a field definition suitable to instanciate a [SimpleSchema](https://github.com/Meteor-Community-Packages/meteor-simple-schema).

## Configuration

The package's behavior can be configured through a call to the `Field.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `verbosity`

    Define the expected verbosity level.

    The accepted value can be any or-ed combination of following:

    - `Field.C.Verbose.NONE`

        Do not display any trace log to the console

    - `Field.C.Verbose.CONFIGURE`

        Trace `Field.configure()` calls and their result

Please note that `Field.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `Field.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

`Field.configure()` is a reactive data source.

## NPM peer dependencies

Starting with v 0.3.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.1.0:

```js
    'lodash': '^4.17.0'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

None at the moment.

## Cookies and comparable technologies

None at the moment.

## Issues & help

In case of support or error, please report your issue request to our [Issues tracker](https://github.com/trychlos/pwix-field/issues).

---
P. Wieser
- Last updated on 2024, Jun. 24th
