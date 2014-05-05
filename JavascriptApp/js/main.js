$(function () {

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

///// models

// group
var Group = Parse.Object.extend('Group',
    {
        defaults: {
            "name": "",
            "dateCreated": ""
        }
    }
);

var GroupsCollection = Parse.Collection.extend(
    {
        model: Group
    }
);

// activity
var Activity = Parse.Object.extend('Activity');

var ActivitiesCollection = Parse.Collection.extend({
    model: Activity
});

// computer
var Computer = Parse.Object.extend('Computer');

var ComputersCollection = Parse.Collection.extend(
    {
        model: Computer
    }
);

// equipment
var Equipment = Parse.Object.extend('Equipment');

var EquipmentCollection = Parse.Collection.extend(
    {
        model: Equipment
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

        Parse.User.logIn(username, password, {
            success: function (user) {
                console.log('Login successful');

                self.undelegateEvents();
                delete self;
            },

            error: function (user, error) {
                console.log('login failed');
                self.$("#signInForm .error").html("Invalid username or password. Please try again.").show();
                self.$("#signInForm button").removeAttr("disabled");
            }
        });

        this.$("#signInForm button").attr("disabled", "disabled");
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

    events: {
    },

    initialize: function () {
        _.bindAll(this, 'render');

        this.model = new GroupsCollection();

        this.model.bind('reset', this.render);

        this.model.query = new Parse.Query(Group);

        this.model.fetch();
    },

    render: function () {
        $(this.el).html(_.template($('#groupListTemplate').html(), {'groups': this.model.toJSON()}));
    }

});

var GroupDetailsView = Parse.View.extend({

    defaults: {
        groupId: ''
    },

    el: '#content',

    events: {

    },

    initialize: function (options) {
        _.bindAll(this, 'render');

        if (options.hasOwnProperty('groupId')) {
            this.groupId = options['groupId'];
        }

        this.model = new ActivitiesCollection();
        this.model.bind('reset', this.render);

        this.model.query = new Parse.Query(Activity);

        if (this.groupId && this.groupId != '') {
            this.model.query.equalTo("groupId", this.groupId);
        }

        this.model.fetch();
    },

    render: function () {
        $(this.el).html(_.template($('#groupDetailsTemplate').html(), {'items': this.model.toJSON()}));
    }

});

var CreateGroupView = Parse.View.extend({

    defaults: {
        groupId: ''
    },

    el: '#content',

    events: {
        'click #saveGroup': 'saveGroup'
    },

    initialize: function () {
        _.bindAll(this, 'render');

        this.model = new Group();
        this.model.bind('change', this.render);

        this.render();
    },

    render: function () {
        $(this.el).html(_.template($('#groupNew').html()));
    },

    saveGroup: function () {
        var groupName = this.$('#new-group-name').val();
        var groupDescription = this.$('#new-group-description').val();
        var groupNotes = this.$('#new-group-notes').val();
//            var groupLogo = this.$('#new-group-logo').val();

        this.model.set('name', groupName);
        this.model.set('description', groupDescription);
        this.model.set('notes', groupNotes);
//            this.model.set('logo', groupLogo);
        this.model.set('ownerId', Parse.User.current().id);

        this.model.save({
            error: function () {
                console.log('Saving failed');
            },
            success: function () {
                console.log('Saving was successful');
                router.navigate("/groups", true);
            }
        });
    }

});

var EditGroupView = Parse.View.extend({

    defaults: {
        groupId: ''
    },

    el: '#content',

    events: {

    },

    initialize: function (options) {
        _.bindAll(this, 'render');

        if (options.hasOwnProperty('groupId')) {
            this.groupId = options['groupId'];
        }

        this.model = new Group();
        this.model.bind('reset', this.render);

    },

    render: function () {
        $(this.el).html(_.template($('#groupNewEdit').html()/*, {'group': this.model.toJSON()}*/));
    }

});

var AppRouter = Parse.Router.extend({
        routes: {
            '': "index",
            'forgotPassword': 'forgotPassword',
            'signup': 'signUp',
            'groups': 'groupsList',
            'group/:id': 'groupDetails',
            'create-group': 'createGroup',
            'group/edit/:id': 'editGroup'
        },

        initialize: function (options) {
        },

        login: function () {
            this.loadView(new LoginView(), true/*skip authorization*/);
        },

        index: function () {
            // groups list is our main
            this.groupsList();
        },

        forgotPassword: function () {
            this.loadView(new ForgotPasswordView(), true/*skip authorization*/);
        },

        signUp: function () {
            this.loadView(new SignUpView(), true/*skip authorization*/);
        },

        createGroup: function () {
            this.loadView(new CreateGroupView());
        },

        editGroup: function (groupId) {
            this.loadView(new EditGroupView({'groupId': groupId}));
        },

        groupsList: function () {
            this.loadView(new GroupsListView());
        },

        groupDetails: function (id) {
            this.loadView(new GroupDetailsView({'groupId': id}));
        },

        loadView: function (view, skipAuthorization) {
            // credentials check
            if (!Parse.User.current() && !skipAuthorization) {
                this.view = new LoginView();
            } else {
                this.view = view;
            }
        }

    }
);

var router = new AppRouter();

Parse.history.start();

});
