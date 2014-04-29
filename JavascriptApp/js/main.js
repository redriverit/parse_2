// models
var LoginModel = Backbone.model.extend(
    {
        defaults: {
            "email": "",
            "password": ""
        }
    }
);

var SignUpModel = Backbone.model.extend(
    {
        defaults: {
            "email": "",
            "password": "",
            "repeatPassword": "",
            "firstName": "",
            "lastName": "",
            "phone": ""
        }
    }
);

var RestorePasswordModel = Backbone.model.extend(
    {
        defaults: {
            "email": ""
        }
    }
);

var GroupsCollection = Backbone.collection.extend(
    {

    }
);

var Group = Backbone.model.extend(
    {
        defaults: {
            "name": "",
            "dateCreated": ""
        }
    }
);

// views

var LoginView = Backbone.view.extend({

    tagName: "div",

    template: _.template($('#loginTemplate').html()),

    events: {
        "click #signIn": "signIn"
    },

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },

    signIn: function () {
        console.log("Doing sign in");
    }

});

var SignUpView = Backbone.view.extend({

    tagName: "div",

    template: _.template($('#signUpTemplate').html()),

    events: {
        "click #signUp": "signUp"
    },

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },

    signUp: function () {
        console.log("Doing sign up operation");
    }

});

var ForgotPasswordView = Backbone.view.extend(
    {

        tagName: "div",

        template: _.template($('#forgotPasswordTemplate').html()),

        events: {
            "click #forgotPassword": "restorePassword"
        },

        initialize: function () {
            this.listenTo(this.model, "change", this.render);
        },

        restorePassword: function () {
            console.log('Restoring password');
        }

    }
);

var GroupsListView = Backbone.view.extend({

    tagName: "div",

    template: _.template($('#groupListTemplate').html()),

    events: {

    },

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    }

});

var GroupDetailsView = Backbone.view.extend({

    tagName: "div",

    template: _.template($('#groupDetailsTemplate').html()),

    events: {

    },

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    }

});