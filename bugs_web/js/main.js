//$(function () {

// Initialize Parse.com
Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
// Dan's keys
Parse.initialize("ncOS8ssGQ6KIyXx6HJAHZeaQ0op4uOT52Jww1ELz"/*Application Id */,
    "hKKTbgbz0ArLwwqIecmxkHAHoCtc3k8621OZvuJp"/*Javascript key */);

// Sergii keys
//    Parse.initialize("hQMq9rXEIauuSFYHotuxDYdy8t1wNEKP9yK8rZoi"/*Application Id */,
//        "kh6MDcrDJvBlGY5eBGP2jN7Sh8okO0b2DFDiP6ou"/*Javascript key */);


// This is the transient application state, not persisted on Parse
var AppState = Parse.Object.extend("AppState", {
    defaults:{
        view:"index"
    }
});

///// models or classes

var MyData = Parse.Object.extend("MyData");

//category

var group = Parse.Object.extend("GROUP");

var GroupCollection = Parse.Collection.extend(

    {
        model:group
    }

);

var customer = Parse.Object.extend("CUSTOMER");

var CustomerCollection = Parse.Collection.extend(
    {
        model:customer
    }

);

//ingredients

    var system = Parse.Object.extend("SYSTEM");

    var SystemCollection = Parse.Collection.extend(
    {
        model:system
    }
    );

//steps

    var service = Parse.Object.extend("SERVICE");

    var ServiceCollection = Parse.Collection.extend(
    {
        model:service
    }
    );

// activity
var activity = Parse.Object.extend('ACTIVITY');

var ActivityCollection = Parse.Collection.extend({
   
    model:activity
});

// chemical
var chemical = Parse.Object.extend('CHEMICAL');

var ChemicalCollection = Parse.Collection.extend(
    {
        model:chemical
    }
);

// referral
var referral = Parse.Object.extend('REFERRAL');

var ReferralCollection = Parse.Collection.extend(
    {
        model:referral
    }
);

// views

//********************************************************************************************   LOGIN VIEW
var LoginView = Parse.View.extend({

    el:'#content',

    template:_.template($('#loginTemplate').html()),

    events:{
        "click #signIn":"signIn"
    },

    initialize:function () {
        this.render();
    },

    signIn:function () {
        // prevent double submit
        this.$("#signInForm button").attr("disabled", "disabled");

        var self = this;

        var username = this.$('#signin-username').val();
        var password = this.$('#signin-password').val();

        Parse.User.logIn(username, password, {
            success:function () {
                router.navigate('groups', true);

                self.$("#signInForm button").removeAttr('disabled');
            },

            error:function () {
                self.$("#signInForm .error").html("Invalid username or password. Please try again.").show();
                self.$("#signInForm button").removeAttr("disabled");
            }
        });

    },

    render:function () {
        $(this.el).html(this.template);

        return this;
    }

});

//********************************************************************************************   SIGNUP
var SignUpView = Parse.View.extend({

    el:'#content',

    template:_.template($('#signUpTemplate').html()),

    events:{
        "click #btn_signUp":"signUp"
    },

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template);
    },

    signUp:function () {
        // turning off button
        this.$("#signUpForm button").attr("disabled", "disabled");

        var username = this.$('#signup-email').val();
        var email = this.$('#signup-email2').val();
        var password = this.$('#signup-password').val();
        var verifyPassword = this.$('#signup-password2').val();

        if (email != username) {
            this.$('#signup-error').html("Emails don't match. Please double check").show();
        }

        if (password != verifyPassword) {
            this.$('#signup-error').html("Passwords don't match. Please double check").show();
        }

        var firstname = this.$('#signup-firstname').val();
        var lastname = this.$('#signup-lastname').val();
        var phone = this.$('#signup-phone').val();

        var self = this;

        Parse.User.signUp(username, password, {
                'email':email,
                'FIRST_NAME':firstname,
                'LAST_NAME':lastname,
                'STATUS':"ACTIVE",
                'PHONE':phone},

            {
                success:function () {
                    router.navigate('groups', true);
                },

                error:function () {
                    self.$("#signUpForm button").removeAttr("disabled");
                    self.$('#signup-error').html('Email was already taken, please try other').show();
                }
            });
    }

});

//********************************************************************************************   FORGOT PASSWORD

var ForgotPasswordView = Parse.View.extend(
    {

        el:'#content',

        template:_.template($('#forgotPasswordTemplate').html()),

        events:{
            "click #forgotPassword":"restorePassword"
        },

        initialize:function () {
            this.render();
        },

        render:function () {
            $(this.el).html(this.template);
        },

        restorePassword:function () {

            var email = this.$('#emailreset').val();
            alert(email);

            Parse.User.requestPasswordReset(email, {
                success: function() {
                    // Password reset request was sent successfully
                    alert("Password Reset Instructions successfully sent to your email address");
                    router.navigate('login', true);
                 },
                error: function(error) {
                    // Show the error message somewhere
                alert("Error: " + error.code + " " + error.message);
  }
});
        }

    }
);
//********************************************************************************************   GROUP LIST

var GroupsListView = Parse.View.extend({

    el:'#content',

    events:{

        'click #logoutBtn':'logout'
    },

    initialize:function () {
        _.bindAll(this, 'render');

        // retrieving my groups
        this.groups = new GroupCollection();
        this.groups.bind('reset', this.render);
        this.groups.query = new Parse.Query(group);

        this.groups.query.ascending("GROUP_NAME");
        this.groups.query.equalTo("GROUP_STATUS", "ACTIVE");
        this.groups.fetch();
    },

    render:function () {


        $(this.el).html(_.template($('#groupListTemplate').html(),
            {
                'groups':this.groups.toJSON()
            }));
    },

    logout:function () {
        // logging out current user
        Parse.User.logOut();

        // getting back to login view
        router.navigate('login', true);
    }

});

//********************************************************************************************   Add New Group
var CreateGroupView = Parse.View.extend({

    defaults:{
        groupId:''
    },

    el:'#content',

    events:{
        'click #btn_saveGroup':'saveGroup'
    },

    initialize:function () {
        _.bindAll(this, 'render');

        this.render();
    },

    render:function () {
        $(this.el).html(_.template($('#groupNew').html()));
    },

    saveGroup:function () {

                // disable to avoid double submit
        this.$('#btn_saveGroup').attr('disabled', 'disabled');

        this.group = new group();

        var groupname = this.$('#new-group-name').val();

        this.group.set('GROUP_NAME', groupname);
        this.group.set('GROUP_CREATOR', Parse.User.current());
        this.group.set('GROUP_STATUS', "ACTIVE");
        alert(groupname);

        this.group.save({

            success:function () {
                alert("SUCCESS");
                router.navigate('groups', true);
                alert("completed");
            },
            
            error:function () {
                // save-group-error
                self.$("#create-category-error .error").html("Failed to save group. Please try again later.").show();
            },
            
        });
    }

});




//********************************************************************************************   ADD FILES

var FilesView = Parse.View.extend({
    el:'#content',

    template:_.template($('#filesTemplate').html()),

    events:{
        'click #uploadFile':'uploadImageFile'
    },

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template);
    },

    uploadImageFile:function () {
        var fileControl = $('#imageFile')[0];

        if (fileControl.files.length == 0) {
            this.$('#upload-file-error').html("Please select file to upload").show();
            return;
        }

        var selectedFile = fileControl.files[0];

        if ($.inArray(selectedFile.type, ['image/jpeg', 'image/png']) > 0) {
            this.$('#upload-file-error').html("Please select image file (png, jpg)").show();
            return;
        }

        // everything is fine, beginning upload process
        this.$("#uploadFile").attr("disabled", "disabled");

        var self = this;

        var parseImageFile = new Parse.File(selectedFile.name, selectedFile);

        parseImageFile.save().then(function () {
            console.log('File was uploaded successfully: ' + parseImageFile);
            var newDataInfo = new MyData({
                image:parseImageFile
            });

            newDataInfo.save({
                success:function () {
                    console.log('My Data saved successfully');
                }
            });

        }, function (error) {
            self.$("#uploadFile").removeAttr('disabled');
            self.$('#upload-file-error').html("Failed to upload file").show();
        });

    }

});





//********************************************************************************************   DASHBOARD VIEW
var DashboardView = Parse.View.extend({

    defaults:{
        groupId:''
    },

    el:'#content',

    events:{

        'click #logoutBtn':'logout',
        'click #btn_addCustomer':'addCustomer'
    },

    

        initialize:function (options) {
            _.bindAll(this, 'render');

        if (options.hasOwnProperty('groupId')) {
            this.groupId = options['groupId'];
        }
            // retrieving groups activities
            this.activities = new ActivityCollection();
            this.activities.bind('reset', this.render);
            this.activities.query = new Parse.Query(activity);

            if (this.groupId && this.groupId != '') {
                this.activities.query.equalTo("groupId", this.groupId);
                this.activities.query.descending("createdAt");
            }

            // retrieving groups customers
            this.customers = new CustomerCollection();
            this.customers.bind('reset', this.render);
            this.customers.query = new Parse.Query(customer);

            if (this.groupId && this.groupId != '') {
                this.customers.query.equalTo("groupId", this.groupId);
            }

            //Need help implementing this so I can show some statistics on dashboard *****************//////////************** ??????????????
            var activitycount = this.activities.query.count;



            this.group = new group({'objectId':this.groupId});

            var self = this;

            this.group.fetch({
                success:function () {
                    self.activities.fetch();
                    self.customers.fetch();
                },

                error:function () {
                    router.navigate('groups', true);
                }
            });

        },

        render:function () {
            $(this.el).html(_.template($('#dashboardTemplate').html(),
                {
                    'activities':this.activities.toJSON(),
                    'customers':this.customers.toJSON(),
                    'group':this.group.toJSON(),

                })
            );
        },

        addCustomer:function () {


          
        var firstname = this.$('#customer_fname').val();
        var lastname = this.$('#customer_lname').val();
        var email = this.$('#customer_email').val();
        var cell = this.$('#customer_cell').val();
        var home = this.$('#customer_home').val();
        var address = this.$('#customer_address').val();
        var city = this.$('#customer_city').val();
        var state = this.$('#customer_state').val();
        var zip = this.$('#customer_zip').val();

        var self = this;

         // disable to avoid double submit
         //this.$('#btn_saveGroup').attr('disabled', 'disabled');

        this.customer = new customer();

        this.customer.set('CUST_FNAME', firstname);
        this.customer.set('CUST_LNAME', lastname);
        this.customer.set('CUST_CELL', cell);
        this.customer.set('CUST_HOME', home);
        this.customer.set('CUST_EMAIL', email);
        this.customer.set('CUST_ADDRESS', address);
        this.customer.set('CUST_CITY', city);
        this.customer.set('CUST_STATE', state);
        this.customer.set('CUST_ZIP', zip);
        this.customer.set('CUST_STATUS', "ACTIVE");
        this.customer.set('groupId', this.groupId);
        this.customer.set('CUST_AddedBy', Parse.User.current());

        var groupnum = this.groupId;
        alert(groupnum);

        this.customer.save({

            success:function () {
                alert("Successfully created new customer");

                this.activity = new activity();

                this.activity.set('TYPE', "NEW CUSTOMER ADDED");
                this.activity.set('CreatedBy', Parse.User.current());
                this.activity.set('groupId', groupnum);

                this.activity.save({
                    success:function () {
                        alert("Activity Saved");
                    },
                    error:function () {
                        alert("error:activity not saved");
                    },
                })

                //router.navigate('#/group', true);
            },
            
            error:function () {
                // save-group-error
                self.$("#create-category-error .error").html("Failed to save group. Please try again later.").show();
            },
            
        }
        );

        },

        logout:function () {
                // logging out current user
                Parse.User.logOut();

                // getting back to login view
                router.navigate('', true);
    }

});

//**************************************************************************************** RECIPE DETAIL

    var RecipeDetailView = Parse.View.extend({

        defaults:{
            recipeId:''
        },

        el:'#content',

        events:{

        },

        initialize:function (options) {
            _.bindAll(this, 'render');

            if (options.hasOwnProperty('recipeId')) {
                this.recipeId = options['recipeId'];
            }

            // retrieving ingredients for recipe
            this.ingredients = new IngredientsCollection();
            this.ingredients.bind('reset', this.render);
            this.ingredients.query = new Parse.Query(ingredients);

            if (this.recipeId && this.recipeId != '') {
                this.ingredients.query.equalTo("recipeId", this.recipeId);
            }

            // retrieving steps for recipe
            this.steps = new StepsCollection();
            this.steps.query = new Parse.Query(steps);
            this.steps.bind('reset', this.render);
            if (this.recipeId && this.recipeId != '') {
                this.steps.query.equalTo("recipeId", this.recipeId);
                this.steps.query.ascending("STEP");
            }

            this.recipe = new recipe({'objectId':this.recipeId});

            var self = this;

            this.recipe.fetch({
                success:function () {
                    self.ingredients.fetch();
                    self.steps.fetch();
                },

                error:function () {
                    router.navigate('groups', true);
                }
            });

        },

        render:function () {
            $(this.el).html(_.template($('#recipeDetailTemplate').html(),
                {
                    'ingredients':this.ingredients.toJSON(),
                    'steps':this.steps.toJSON(),
                    'recipe':this.recipe.toJSON()
                })
            );
        },

        logout:function () {
            // logging out current user
            Parse.User.logOut();

            // getting back to login view
            router.navigate('', true);
        }

    });

var GroupDetailsView = Parse.View.extend({

    defaults:{
        groupId:''
    },

    el:'#content',

    events:{
        'click #backToList':'backToGroupsList',
        'click #editGroup':'editGroup',
        'click #equipmentListBtn':'showEquipmentList',
        'click #inventoryListBtn':'showInventoryList',
        'click .equipmentView':'showEquipmentDetails',
        'click .inventoryView':'showInventoryDetails'
    },

    initialize:function (options) {
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

        this.group = new Group({'objectId':this.groupId});

        var self = this;

        this.group.fetch({
            success:function () {
                self.activities.fetch();
                self.equipment.fetch();
                self.inventory.fetch();
            },

            error:function () {
                router.navigate('groups', true);
            }
        });

    },

    render:function () {
        $(this.el).html(_.template($('#groupDetailsTemplate').html(),
            {
                'activities':this.activities.toJSON(),
                'equipment':this.equipment.toJSON(),
                'inventory':this.inventory.toJSON(),
                'group':this.group.toJSON()
            })
        );
    },

    backToGroupsList:function () {
        router.navigate('groups', true);
    },

    showEquipmentInventory:function (whatToShow) {
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

    showEquipmentList:function () {
        // triggering reusable function
        this.showEquipmentInventory('equipment');
    },

    showEquipmentDetails:function (event) {
        var id = this.$(event.currentTarget).data("id");

        this.$("#equipmentDialog").dialog({
            height:300,
            width:350,
            modal:true
        });

    },

    showInventoryDetails:function (event) {
        var id = $(event.currentTarget).data("id");

    },

    showInventoryList:function () {
        // triggering reusable function
        this.showEquipmentInventory('inventory');
    },

    editGroup:function () {
        router.navigate('group/edit/' + this.groupId, true);
    }

});




var EditCategoryView = Parse.View.extend({

    defaults:{
        groupId:''
    },

    el:'#content',

    events:{
        'click #saveEditGroup':'saveGroup'
    },

    initialize:function (options) {
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
                success:function () {
                    self.render();
                },
                error:function () {
                    router.navigate('groups', true);
                }
            });
    },

    render:function () {
        $(this.el).html(_.template($('#groupEdit').html(), {'group':this.group.toJSON()}));
    },

    saveGroup:function () {
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
            error:function () {
                self.$("#edit-group-error .error").html("Failed to save group. Please try again later.").show();
                self.$('#saveEditGroup').removeAttr('disabled');
            },
            success:function () {
                router.navigate("/groups", true);
            }
        });
    }

});

var AppRouter = Parse.Router.extend({
        routes:{
            '':"index",
            'login':'login',
            'forgotPassword':'forgotPassword',
            'signup':'signUp',
            'groups':'groupsList',
            'create-group':'createGroup',
            'category/edit/:id':'editCategory',
            'group/:id':"dashboard",
            'files':'handleFiles',
            'recipe/:id':"recipeView",
            'create-recipe':"newrecipe"
        },

//recipe view
            recipeView:function (recipeId) {

                if (this.checkAuthorized()) {
                    this.loadView(new RecipeDetailView({'recipeId':recipeId}));
                }
            },

        login:function () {
            this.loadView(new LoginView());
        },


        handleFiles:function () {
            this.loadView(new FilesView());
        },

        index:function () {
            if (this.checkAuthorized()) {
                // groups list is our main
                this.groupsList();
            }
        },

        forgotPassword:function () {
            this.loadView(new ForgotPasswordView());
        },

        signUp:function () {
            this.loadView(new SignUpView());
        },

        createGroup:function () {
            if (this.checkAuthorized()) {
                this.loadView(new CreateGroupView());

            }
        },

        editCategory:function (categoryId) {
            if (this.checkAuthorized()) {
                this.loadView(new EditCategoryView({'categoryId':categoryId}));
            }
        },

        groupsList:function () {
            if (this.checkAuthorized()) {
                this.loadView(new GroupsListView());
            }
        },

        dashboard:function (groupId) {

            if (this.checkAuthorized()) {
                this.loadView(new DashboardView({'groupId':groupId}));
            }
        },

        loadView:function (view) {
            this.view = view;
        },

        checkAuthorized:function () {
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

//});
