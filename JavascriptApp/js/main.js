$(function () {

// Initialize Parse.com
    Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
    // local settings (Sergii)
    Parse.initialize("hQMq9rXEIauuSFYHotuxDYdy8t1wNEKP9yK8rZoi"/*Application Id */,
        "kh6MDcrDJvBlGY5eBGP2jN7Sh8okO0b2DFDiP6ou"/*Javascript key */);

    // Daniel's settings
//    Parse.initialize("85sYerTRbJUwbivYmxfzvNxja4HvxruQWNm64Duz"/*Application Id */,
//        "8i1YRG4RGoOuuCiyjSva4xEa3Hi7wkRjgbqCZLMe"/*Javascript key */);

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
            // prevent double submit
            this.$("#signInForm button").attr("disabled", "disabled");

            var self = this;

            var username = this.$('#signin-username').val();
            var password = this.$('#signin-password').val();

            Parse.User.logIn(username, password, {
                success: function () {
                    router.navigate('groups', true);

                    self.$("#signInForm button").removeAttr('disabled');
                },

                error: function () {
                    self.$("#signInForm .error").html("Invalid username or password. Please try again.").show();
                    self.$("#signInForm button").removeAttr("disabled");
                }
            });

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
            this.render();
        },

        render: function () {
            $(this.el).html(this.template);
        },

        signUp: function () {
            // turning off button
            this.$("#signUpForm button").attr("disabled", "disabled");

            var username = this.$('#signup-username').val();
            var email = this.$('#signup-email').val();
            var password = this.$('#signup-password').val();
            var verifyPassword = this.$('#signup-password2').val();

            if (password != verifyPassword) {
                this.$('#signup-error').html("Passwords don't match. Please double check").show();
            }

            var name = this.$('#signup-name').val();
            var type = this.$('#signup-type').val();
            var value = this.$('#signup-value').val();
            var notes = this.$('#signup-notes').val();

            var self = this;

            Parse.User.signUp(username, password, {
                    'email': email,
                    'name': name,
                    'type': type,
                    'value': value,
                    'notes': notes},
                {
                    success: function () {
                        router.navigate('groups', true);
                    },

                    error: function () {
                        self.$("#signUpForm button").removeAttr("disabled");
                        self.$('#signup-error').html('Email was already taken, please try other').show();
                    }
                });
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
            }

        }
    );

    var GroupsListView = Parse.View.extend({

        el: '#content',

        events: {

            'click #logoutBtn': 'logout'
        },

        initialize: function () {
            _.bindAll(this, 'render');

            // retrieving my groups
            this.myGroups = new GroupsCollection();
            this.myGroups.bind('reset', this.render);
            this.myGroups.query = new Parse.Query(Group);

            if (Parse.User.current()) {
                this.myGroups.query.equalTo("ownerId", Parse.User.current().id);
            }

            this.myGroups.query.ascending("name");
            this.myGroups.fetch();

            // retrieving other groups
            this.otherGroups = new GroupsCollection();
            this.otherGroups.bind('reset', this.render);
            this.otherGroups.query = new Parse.Query(Group);

            if (Parse.User.current()) {
                this.otherGroups.query.notEqualTo("ownerId", Parse.User.current().id);
            }

            this.otherGroups.query.ascending("name");
            this.otherGroups.fetch();
        },

        render: function () {
            $(this.el).html(_.template($('#groupListTemplate').html(),
                {
                    'myGroups': this.myGroups.toJSON(),
                    'otherGroups': this.otherGroups.toJSON()
                }));
        },

        logout: function () {
            // logging out current user
            Parse.User.logOut();

            // getting back to login view
            router.navigate('', true);
        }

    });

    var GroupDetailsView = Parse.View.extend({

        defaults: {
            groupId: ''
        },

        el: '#content',

        events: {
            'click #backToList': 'backToGroupsList',
            'click #editGroup': 'editGroup',
            'click #equipmentListBtn': 'showEquipmentList',
            'click #inventoryListBtn': 'showInventoryList',
            'click .equipmentView': 'showEquipmentDetails',
            'click .inventoryView': 'showInventoryDetails',
            'click #createNewEquipment': 'createNewEquipment'

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
            this.equipment.bind('reset', this.render);
            if (this.groupId && this.groupId != '') {
                this.equipment.query.equalTo('groupId', this.groupId);
            }

            // retrieving computers for group
            this.inventory = new ComputersCollection();
            this.inventory.query = new Parse.Query(Computer);
            this.inventory.bind('reset', this.render);
            if (this.groupId && this.groupId != '') {
                this.inventory.query.equalTo('groupId', this.groupId);
            }

            this.group = new Group({'objectId': this.groupId});

            var self = this;

            this.group.fetch({
                success: function () {
                    self.activities.fetch();
                    self.equipment.fetch();
                    self.inventory.fetch();
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
                    'inventory': this.inventory.toJSON(),
                    'group': this.group.toJSON()
                })
            );
        },

        backToGroupsList: function () {
            router.navigate('groups', true);
        },

        showEquipmentInventory: function (whatToShow) {
            var showInventory = whatToShow == 'inventory';

            if (showInventory) {
                this.$('#inventoryListBtn').attr('disabled', 'disabled');
                this.$('#equipmentListBtn').removeAttr('disabled');

                this.$('#inventoryList').show();
                this.$('#equipmentList').hide();
            } else {
                this.$('#inventoryListBtn').removeAttr('disabled');
                this.$('#equipmentListBtn').attr('disabled', 'disabled');

                this.$('#inventoryList').hide();
                this.$('#equipmentList').show();
            }

        },

        createNewEquipment: function (event) {
            var groupId = this.$(event.currentTarget).data("id");

            router.navigate('create-equipment/' + groupId, true);
        },

        showEquipmentList: function () {
            // triggering reusable function
            this.showEquipmentInventory('equipment');
        },

        showEquipmentDetails: function (event) {
            var id = this.$(event.currentTarget).data("id");

            router.navigate('edit-equipment/' + id, true);

            // TODO use dialogs later
            /*this.$("#equipmentDialog").dialog({
             height: 300,
             width: 350,
             modal: true
             });*/

        },

        showInventoryDetails: function (event) {
            var id = $(event.currentTarget).data("id");

        },

        showInventoryList: function () {
            // triggering reusable function
            this.showEquipmentInventory('inventory');
        },

        editGroup: function () {
            router.navigate('group/edit/' + this.groupId, true);
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

            this.render();
        },

        render: function () {
            $(this.el).html(_.template($('#groupNew').html()));
        },

        saveGroup: function () {

            this.group = new Group();

            var groupName = this.$('#new-group-name').val();
            var groupDescription = this.$('#new-group-description').val();
            var groupNotes = this.$('#new-group-notes').val();
//            var groupLogo = this.$('#new-group-logo').val();

            this.group.set('name', groupName);
            this.group.set('description', groupDescription);
            this.group.set('notes', groupNotes);
//            this.model.set('logo', groupLogo);
            this.group.set('ownerId', Parse.User.current().id);

            this.group.save({
                error: function () {
                    // save-group-error
                    self.$("#create-group-error .error").html("Failed to save group. Please try again later.").show();
                },
                success: function () {
                    router.navigate("/groups", true);
                }
            });
        }

    });

    var CreateEquipmentView = Parse.View.extend({

        defaults: {
            groupId: '',
            isUpdate: false,
            equipment: null
        },

        el: '#content',

        events: {
            'click #saveEquipment': 'saveEquipment',
            'click #cancelSaveEquipment': 'backToGroup'
        },

        initialize: function (options) {

            if (options.hasOwnProperty('groupId')) {
                this.groupId = options['groupId'];
            }

            this.equipment = new Equipment();

            var self = this;

            if (options.hasOwnProperty('equipmentId')) {
                this.equipment.set('id', options['equipmentId']);
                this.equipment.fetch({
                    success: function () {
                        self.groupId = self.equipment.get('groupId');
                        self.render();
                    }
                });
            }

            _.bindAll(this, 'render');

            this.render();
        },

        render: function () {
            $(this.el).html(_.template($('#equipmentEdit').html(), {'equipment': this.equipment.toJSON()}));

        },

        saveEquipment: function () {
            var equipmentName = this.$('#new-equipment-name').val();
            var equipmentType = this.$('#new-equipment-type').val();
            var equipmentValue = this.$('#new-equipment-value').val();
            var equipmentNotes = this.$('#new-equipment-notes').val();

            this.equipment.set('name', equipmentName);
            this.equipment.set('type', equipmentType);
            this.equipment.set('notes', equipmentNotes);
            this.equipment.set('value', equipmentValue);

            if (!this.isUpdate) {
                this.equipment.set('groupId', this.groupId);
            }

            var self = this;

            this.equipment.save({
                error: function () {
                    // save-group-error
                    self.$("#new-equipment-error .error").html("Failed to save equipment. Please try again later.").show();
                },
                success: function () {
                    console.log('Success group: ' + self.groupId);
                    router.navigate("/group/" + self.groupId, true);
                }
            });
        },

        backToGroup: function () {
            router.navigate('group/' + this.groupId, true);
        }

    });

    var EditGroupView = Parse.View.extend({

        defaults: {
            groupId: ''
        },

        el: '#content',

        events: {
            'click #saveEditGroup': 'saveGroup'
        },

        initialize: function (options) {
            _.bindAll(this, 'render');

            this.group = new Group();

            if (options.hasOwnProperty('groupId')) {
                this.group.set('objectId', options['groupId']);
            } else {
                router.navigate('groups', true);
            }

            var self = this;

            this.group.fetch(
                {
                    success: function () {
                        self.render();
                    },
                    error: function () {
                        router.navigate('groups', true);
                    }
                });
        },

        render: function () {
            $(this.el).html(_.template($('#groupEdit').html(), {'group': this.group.toJSON()}));
        },

        saveGroup: function () {
            // disable to avoid double submit
            this.$('#saveEditGroup').attr('disabled', 'disabled');

            var groupName = this.$('#edit-group-name').val();
            var groupDescription = this.$('#edit-group-description').val();
            var groupNotes = this.$('#edit-group-notes').val();
//            var groupLogo = this.$('#new-group-logo').val();

            this.group.set('name', groupName);
            this.group.set('description', groupDescription);
            this.group.set('notes', groupNotes);
//            this.model.set('logo', groupLogo);
            this.group.set('ownerId', Parse.User.current().id);

            this.group.save({
                error: function () {
                    self.$("#edit-group-error .error").html("Failed to save group. Please try again later.").show();
                    self.$('#saveEditGroup').removeAttr('disabled');
                },
                success: function () {
                    router.navigate("/groups", true);
                }
            });
        }

    });

    var AppRouter = Parse.Router.extend({
            routes: {
                '': "index",
                'login': 'login',
                'forgotPassword': 'forgotPassword',
                'signup': 'signUp',
                'groups': 'groupsList',
                'group/:id': 'groupDetails',
                'create-group': 'createGroup',
                'group/edit/:id': 'editGroup',
                'create-equipment/:id': 'createEquipment',
                'edit-equipment/:id': 'editEquipment'
            },

            login: function () {
                this.loadView(new LoginView());
            },

            index: function () {
                if (this.checkAuthorized()) {
                    // groups list is our main
                    this.groupsList();
                }
            },

            forgotPassword: function () {
                this.loadView(new ForgotPasswordView());
            },

            signUp: function () {
                this.loadView(new SignUpView());
            },

            createGroup: function () {
                if (this.checkAuthorized()) {
                    this.loadView(new CreateGroupView());
                }
            },

            createEquipment: function (groupId) {
                if (this.checkAuthorized()) {
                    this.loadView(new CreateEquipmentView({'groupId': groupId}));
                }
            },

            editEquipment: function (equipmentId) {
                if (this.checkAuthorized()) {
                    this.loadView(new CreateEquipmentView({'isUpdate': true, 'equipmentId': equipmentId}));
                }
            },

            editGroup: function (groupId) {
                if (this.checkAuthorized()) {
                    this.loadView(new EditGroupView({'groupId': groupId}));
                }
            },

            groupsList: function () {
                if (this.checkAuthorized()) {
                    this.loadView(new GroupsListView());
                }
            },

            groupDetails: function (id) {
                if (this.checkAuthorized()) {
                    this.loadView(new GroupDetailsView({'groupId': id}));
                }
            },

            loadView: function (view) {
                this.view = view;
            },

            checkAuthorized: function () {
                if (Parse.User.current() == null) {
                    router.navigate('login', true);

                    return false;
                }

                return true;
            }

        }
    );

    var router = new AppRouter();

    Parse.history.start();

});
