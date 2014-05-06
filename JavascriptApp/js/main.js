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
            myGroups: Group
        }
    );

// activity
    var Activity = Parse.Object.extend('Activity');

    var ActivitiesCollection = Parse.Collection.extend({
        myGroups: Activity
    });

// computer
    var Computer = Parse.Object.extend('Computer');

    var ComputersCollection = Parse.Collection.extend(
        {
            myGroups: Computer
        }
    );

// equipment
    var Equipment = Parse.Object.extend('Equipment');

    var EquipmentCollection = Parse.Collection.extend(
        {
            myGroups: Equipment
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

            // retrieving my groups
            this.myGroups = new GroupsCollection();
            this.myGroups.bind('reset', this.render);
            this.myGroups.query = new Parse.Query(Group);
            this.myGroups.query.equalTo("ownerId", Parse.User.current().id);
            this.myGroups.query.ascending("name");
            this.myGroups.fetch();

            // retrieving other groups
            this.otherGroups = new GroupsCollection();
            this.otherGroups.bind('reset', this.render);
            this.otherGroups.query = new Parse.Query(Group);
            this.otherGroups.query.notEqualTo("ownerId", Parse.User.current().id);
            this.otherGroups.query.ascending("name");
            this.otherGroups.fetch({
                success: function(){
                    console.log('Other groups retrieved');
                }
            });
        },

        render: function () {
            $(this.el).html(_.template($('#groupListTemplate').html(),
                {
                    'myGroups': this.myGroups.toJSON(),
                    'otherGroups': this.otherGroups.toJSON()
                }));
        }

    });

    var GroupDetailsView = Parse.View.extend({

        defaults: {
            groupId: ''
        },

        el: '#content',

        events: {
            'click #backToList': 'backToGroupsList'
        },

        initialize: function (options) {
            _.bindAll(this, 'render');

            if (options.hasOwnProperty('groupId')) {
                this.groupId = options['groupId'];
            }

            // retrieving activities for group
            this.activities = new ActivitiesCollection();
            this.activities.bind('reset', this.render);
            this.activities.query = new Parse.Query(Activity);

            if (this.groupId && this.groupId != '') {
                this.activities.query.equalTo("groupId", this.groupId);
            }

            // retrieving equipment for group
            this.equipment = new EquipmentCollection();
            this.equipment.query = new Parse.Query(Equipment);
            if (this.groupId && this.groupId != '') {
                this.equipment.query.equalTo('groupId', this.groupId);
            }

            this.group = new Group({'objectId': this.groupId});

            var self = this;

            this.group.fetch({
                success: function () {
                    self.activities.fetch();
                    self.equipment.fetch();
                },

                error: function () {
                    router.navigate('groups', true);
                }
            });

        },

        render: function () {
            $(this.el).html(_.template($('#groupDetailsTemplate').html(),
                {
                    'activities': this.activities.toJSON(),
                    'equipment': this.equipment.toJSON(),
                    'group': this.group.toJSON()
                })
            );
        },

        backToGroupsList: function () {
            router.navigate('groups', true);
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

            this.group = new Group();

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

            this.myGroups.set('name', groupName);
            this.myGroups.set('description', groupDescription);
            this.myGroups.set('notes', groupNotes);
//            this.model.set('logo', groupLogo);
            this.myGroups.set('ownerId', Parse.User.current().id);

            this.myGroups.save({
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

            this.myGroups = new Group();
            this.myGroups.bind('reset', this.render);

            //TODO retrieve group that has ID, or we just redirect back to list of groups
        },

        render: function () {
            $(this.el).html(_.template($('#groupEdit').html()/*, {'group': this.model.toJSON()}*/));
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
