// Initialize Parse.com

Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
Parse.initialize("hQMq9rXEIauuSFYHotuxDYdy8t1wNEKP9yK8rZoi"/*Application Id */,
    "kh6MDcrDJvBlGY5eBGP2jN7Sh8okO0b2DFDiP6ou"/*Javascript key */);


// This is the transient application state, not persisted on Parse
var AppState = Parse.Object.extend("AppState", {
    defaults: {
        view: "index"
    }
});

// models
var LoginModel = Parse.Object.extend("Login",
    {
        defaults: {
            "email": "",
            "password": ""
        }
    }
);

var SignUpModel = Parse.Object.extend('SignUp',
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

var RestorePasswordModel = Parse.Object.extend('RestorePassword',
    {
        defaults: {
            "email": ""
        }
    }
);

var GroupsCollection = Parse.Collection.extend(
    {

    }
);

var Group = Parse.Object.extend('Group',
    {
        defaults: {
            "name": "",
            "dateCreated": ""
        }
    }
);

// views

var LoginView = Parse.View.extend({

    el: '#content',

    template: _.template($('#loginTemplate').html()),

    events: {
        "click #signIn": "signIn"
    },

    initialize: function () {
        this.render();
    },

    signIn: function () {
        var self = this;

        var username = this.$('#signin-username').val();
        var password = this.$('#signin-password').val();

        //TODO enable later when we need integrated use
        // start hack
        new GroupsListView();
        // end of hack

        /*
         Parse.User.logIn(username, password, {
         success: function (user) {
         new GroupsListView();

         self.undelegateEvents();
         delete self;
         },

         error: function (user, error) {
         self.$("#signInForm .error").html("Invalid username or password. Please try again.").show();
         this.$("#signInForm button").removeAttr("disabled");
         }
         });

         this.$("#signInForm button").attr("disabled", "disabled"); */
    },

    render: function () {
        $(this.el).html(this.template);

        return this;
    }

});

var SignUpView = Parse.View.extend({

    el: '#content',

    template: _.template($('#signUpTemplate').html()),

    events: {
        "click #signUp": "signUp"
    },

    initialize: function () {
        console.log('Sign up initialized');
        this.render();
    },

    render: function () {
        $(this.el).html(this.template);
        console.log('Sign up rendered');
    },

    signUp: function () {
        console.log("Doing sign up operation");
    }

});

var ForgotPasswordView = Parse.View.extend(
    {

        el: '#content',

        template: _.template($('#forgotPasswordTemplate').html()),

        events: {
            "click #forgotPassword": "restorePassword"
        },

        initialize: function () {
            this.render();
        },

        render: function () {
            $(this.el).html(this.template);
        },

        restorePassword: function () {
            console.log('Restoring password');
        }

    }
);

var GroupsListView = Parse.View.extend({

    el: '#content',

    template: _.template($('#groupListTemplate').html()),

    events: {

    },

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template);
    }

});

var GroupDetailsView = Parse.View.extend({

    el: '#content',

    template: _.template($('#groupDetailsTemplate').html()),

    events: {

    },

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template);
    }

});

var AppRouter = Parse.Router.extend({
        routes: {
            '': "index",
            'forgotPassword': 'forgotPassword',
            'signup': 'signUp',
            'groups': 'groupsList',
            'group/:id': 'groupDetails'
        },

        initialize: function (options) {
        },

        index: function () {
            this.loadView(new LoginView());
        },

        forgotPassword: function () {
            this.loadView(new ForgotPasswordView());
        },

        signUp: function () {
            console.log('Signup route');
            this.loadView(new SignUpView());
        },

        groupsList: function () {
            this.loadView(new GroupsListView());
        },

        groupDetails: function (id) {
            console.log("Getting group details with id: " + id);
            this.loadView(new GroupDetailsView());
        },

        loadView: function (view) {
            this.view = view;
        }

    }
);

new AppRouter();

Parse.history.start();