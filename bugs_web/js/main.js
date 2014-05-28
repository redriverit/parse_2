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

var user = Parse.Object.extend("User");

var UserCollection = Parse.Collection.extend(
    {
        model:user
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

// system
var system = Parse.Object.extend('SYSTEM');

var SystemCollection = Parse.Collection.extend(
    {
        model:system
    }
);

// service
var service = Parse.Object.extend('SERVICE');

var ServiceCollection = Parse.Collection.extend(
    {
        model:service
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
        'click #btn_addCustomer':'addCustomer',
        'click #btn_addSystem':'addSystem',
        'click #btn_addChemical':'addChemical',
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

            // retrieving groups users
            this.users = new UserCollection();
            this.users.bind('reset', this.render);
            this.users.query = new Parse.Query(user);

            if (this.groupId && this.groupId != '') {
                //this.users.query.equalTo("groupId", this.groupId);
            }

            // retrieving groups chemicals
            this.chemicals = new ChemicalCollection();
            this.chemicals.bind('reset', this.render);
            this.chemicals.query = new Parse.Query(chemical);

            if (this.groupId && this.groupId != '') {
                this.chemicals.query.equalTo("groupId", this.groupId);
            }

            // retrieving groups systems
            this.systems = new SystemCollection();
            this.systems.bind('reset', this.render);
            this.systems.query = new Parse.Query(system);

            if (this.groupId && this.groupId != '') {
                this.systems.query.equalTo("groupId", this.groupId);
            }

            // retrieving groups services
            this.services = new ServiceCollection();
            this.services.bind('reset', this.render);
            this.services.query = new Parse.Query(service);

            if (this.groupId && this.groupId != '') {
                this.services.query.equalTo("groupId", this.groupId);
                //this.services.query.descending("SYSTEM_NEXTSERVICE");
            }

            this.group = new group({'objectId':this.groupId});

            var self = this;
            var currentuser = Parse.User.current();

            this.group.fetch({
                success:function () {
                    self.activities.fetch();
                    self.customers.fetch();
                    self.chemicals.fetch();
                    self.users.fetch();
                    self.systems.fetch();
                    self.services.fetch();
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
                    'chemicals':this.chemicals.toJSON(),
                    'systems':this.systems.toJSON(),
                    'services':this.services.toJSON(),
                    'users':this.users.toJSON(),
                    'group':this.group.toJSON(),
                    

                    //'currentuser':this.currentuser,   **** How would i pull a current users attributes in index.html?

                })
            );
        },

        addCustomer:function () {

        //Information for Current User Adding a new Customer
        var customer_user = Parse.User.current();
          
        var firstname = this.$('#customer_fname').val();
        var lastname = this.$('#customer_lname').val();
        var email = this.$('#customer_email').val();
        var cell = this.$('#customer_cell').val();
        var home = this.$('#customer_home').val();
        var address = this.$('#customer_address').val();
        var city = this.$('#customer_city').val();
        var state = this.$('#customer_state').val();
        var zip = this.$('#customer_zip').val();
        var fullname = (firstname + " " + lastname);

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
        this.customer.set('CUST_AddedBy', customer_user);

        var groupnum = this.groupId;

        this.customer.save({

            success:function () {
                alert("Successfully created new customer");

                var customer_user = Parse.User.current();
                var createdbyusername = customer_user.get("username");


                this.activity = new activity();

                this.activity.set('TYPE', "NEW CUSTOMER ADDED");
                this.activity.set('CreatedBy', customer_user);
                this.activity.set('CreatedBy_Username', customer_user.get("username"));
                this.activity.set('DETAIL', fullname);
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

        addSystem:function () {


          
        var customer_pointer_id = this.$('#system_customer_pointer').val();
        
        var customer_relation = new customer();
            customer_relation.id = customer_pointer_id;


        var system_type = this.$('#system_type').val();
        var system_install = this.$('#system_install').val();
        var system_address = this.$('#system_address').val();
        var system_city = this.$('#system_city').val();        
        var system_state = this.$('#system_state').val();
        var system_zip = this.$('#system_zip').val();

        var system_nozzle_count = this.$('#system_nozzle_count').val();
        var system_service_frequency = this.$('#system_service_freq').val();
        var system_notes = this.$('#system_notes').val();
        var system_spray_times = this.$('#system_spray_times').val();        
        var system_referral_name = this.$('#system_referral_name').val();
        var system_referral_type = this.$('#system_referral_type').val();
        

        var next_service = new Date( system_install );
        var intvalue = Math.round( system_service_frequency );
        next_service.setDate(next_service.getDate() + intvalue);

        alert(next_service);


        var self = this;

         // disable to avoid double submit
         //this.$('#btn_saveGroup').attr('disabled', 'disabled');

        this.system = new system();

        this.system.set('SYSTEM_TYPE', system_type);
        this.system.set('SYSTEM_CUSTOMER', customer_relation);
        this.system.set('SYSTEM_ADDRESS', system_address);
        this.system.set('SYSTEM_CITY', system_city);
        this.system.set('SYSTEM_STATE', system_state);
        this.system.set('SYSTEM_ZIP', system_zip);


        this.system.set('SYSTEM_STATUS', "ACTIVE");
        this.system.set('SYSTEM_NEXTSERVICE', next_service);
        this.system.set('groupId', this.groupId);
        this.system.set('SYSTEM_AddedBy', Parse.User.current());

        var groupnum = this.groupId;
        alert(groupnum);

        this.system.save({

            success:function () {
                alert("Successfully created new system");
                var customer_user = Parse.User.current();
                var createdbyusername = customer_user.get("username");

                this.activity = new activity();

                this.activity.set('TYPE', "NEW SYSTEM ADDED");
                this.activity.set('CreatedBy', Parse.User.current());
                this.activity.set('DETAIL', system_type);
                this.activity.set('groupId', groupnum);
                this.activity.set('CreatedBy_Username', customer_user.get("username"));

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


        addChemical:function () {


        var chemical_name = this.$('#chemical_name').val();
        var chemical_type = this.$('#chemical_type').val();
        var chemical_epa = this.$('#chemical_epa').val();
        var chemical_cost = this.$('#chemical_cost').val();
        var chemical_price = this.$('#chemical_price').val();
        var chemical_brand = this.$('#chemical_brand').val();
        var chemical_volume= this.$('#chemical_volume').val();
        var chemical_notes = this.$('#chemical_notes').val();


        var self = this;

        this.chemical = new chemical();

        this.chemical.set('CHEMICAL_TYPE', chemical_type);
        this.chemical.set('CHEMICAL_NAME', chemical_name);
        this.chemical.set('CHEMICAL_EPA', chemical_epa);
        this.chemical.set('CHEMICAL_COST', chemical_cost);
        this.chemical.set('CHEMICAL_PRICE', chemical_price);
        this.chemical.set('SYSTEM_BRAND', chemical_brand);
        this.chemical.set('CHEMICAL_VOLUME', chemical_volume);
        this.chemical.set('SYSTEM_NOTES', chemical_notes);

        this.chemical.set('CHEMICAL_STATUS', "ACTIVE");
        this.chemical.set('groupId', this.groupId);
        this.chemical.set('CHEMICAL_AddedBy', Parse.User.current());

        var groupnum = this.groupId;
        alert(groupnum);

        this.chemical.save({

            success:function () {
                alert("Successfully created new chemical");

                var customer_user = Parse.User.current();
                var createdbyusername = customer_user.get("username");

                this.activity = new activity();

                this.activity.set('TYPE', "NEW CHEMICAL ADDED");
                this.activity.set('DETAIL', chemical_name);
                this.activity.set('CreatedBy', Parse.User.current());
                this.activity.set('groupId', groupnum);
                this.activity.set('CreatedBy_Username', customer_user.get("username"));

                this.activity.save({
                    success:function () {
                        alert("CHEMICAL Saved");
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
            'create-recipe':"newrecipe",
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

            if(this.view) {
                this.view.undelegateEvents();
            }
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
