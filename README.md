# pwix:field

## What is it ?

A package to manage field definitions in Meteor. You define here at once all specifications needed for both:

- SimpleSchema definition, with `aldeed:simple-schema`

- Datatables display, with `aldeed:tabular`

- forms input, with `pwix:forms`

- getter, setter and both client and server sides checks.

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
- to the `Forms.Checker` class provided by `pwix:forms`.

A `Field.Def` is instanciated with an object with some specific keys:

- `name`

    optional, the name of the field.

    When set, defines a field in the collection schema, a column in the tabular display, an input element in the edition panel.

    If not set, then there will NOT be any field defined in the Mongo collection.

- `dt_tabular`

    optional, whether to have this field in the columns of a tabular display, defaulting to `true`.

    The whole field definition is ignored from tabular point of view when `dt_tabular` is false.

- `dt_data`

    optional, whether to have this field as a data subscription in a tabular display, defaulting to `true` if a `name` is set.

    A named field defaults to be subscribed to by a tabular display. This option prevents to have a useless data subscription.

All `SimpleSchema` keys can be set in this field definition, and will be passed to the `SimpleSchema()` instanciation.

All `Datatables` column options are to be be passed with a `dt_` prefix.

All `Forms.Checker` keys must be passed with a `form_` prefix.

###### Methods

- `Field.Def.toForm()`

    Returns a columns specification suitable to [Forms](https://github.com/trychlos/pwix-forms/) setup.

- `Field.Def.toTabular()`

    Returns a column definition suitable to [Datatable](https://datatables.net/) initialization.

- `Field.Def.toSchema()`

    Returns a field definition suitable to instanciate a [SimpleSchema](https://github.com/Meteor-Community-Packages/meteor-simple-schema) .

##### `Field.Set`

An ordered collection of `Field.Def` objects.

It should be instanciated by the caller with a list of fields definitions as plain javascript objects.

```js
    app.fieldsSet = new Field.Set(
        {
            name: '_id',
            type: String,
            dt_tabular: false
        },
        {
            name: 'emails',
            type: Array,
            optional: true,
            dt_visible: false
        },
        {
            name: 'emails.$',
            type: Object,
            optional: true,
            dt_tabular: false
        },
        {
            name: 'emails.$.address',
            type: String,
            regEx: SimpleSchema.RegEx.Email,
            dt_data: false,
            dt_title: pwixI18n.label( I18N, 'list.email_address_th' ),
            dt_template: Meteor.isClient && Template.email_address,
            form_check: AccountsManager.check?.emailAddress,
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

- `Field.Set.toForm()`

    Returns an ordered list of columns definitions suitable to [Forms](https://github.com/trychlos/pwix-forms/) setup.

- `Field.Set.toTabular()`

    Returns an ordered list of columns definitions suitable to [Datatable](https://datatables.net/) initialization.

- `Field.Set.toSchema()`

    Returns a field definition suitable to instanciate a [SimpleSchema](https://github.com/Meteor-Community-Packages/meteor-simple-schema) .

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

## NPM peer dependencies

Starting with v 0.3.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.0.0:

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
- Last updated on 2024, Jun. 23rd
