/**
Custom module for you to write your own javascript functions
**/
//$(function () {

// Initialize Parse.com
Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
// Dan's keys
Parse.initialize("43Ts5aEIVt2icWwgKK9KotJnlHX1ikg8Q4PI1DmS"/*Application Id */,
    "FT93nK7JyRluP5nU9hoZfxf4EnXtFywoFXotF2oC"/*Javascript key */);

alert("test custom");

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

var category = Parse.Object.extend("CATEGORY");

var CategoryCollection = Parse.Collection.extend(

    {
        model:category
    }

);

var recipe = Parse.Object.extend("RECIPE");

var RecipeCollection = Parse.Collection.extend(
    {
        model:recipe
    }

);

//ingredients

    var ingredients = Parse.Object.extend("INGREDIENT");

    var IngredientsCollection = Parse.Collection.extend(
    {
        model:ingredients
    }
    );

//steps

    var steps = Parse.Object.extend("STEPS");

    var StepsCollection = Parse.Collection.extend(
    {
        model:steps
    }
    );

// activity
var Activity = Parse.Object.extend('Activity');

var ActivitiesCollection = Parse.Collection.extend({
    model:Activity
});

// computer
var Computer = Parse.Object.extend('Computer');

var ComputersCollection = Parse.Collection.extend(
    {
        model:Computer
    }
);

// equipment
var Equipment = Parse.Object.extend('Equipment');

var EquipmentCollection = Parse.Collection.extend(
    {
        model:Equipment
    }
);

// views

//********************************************************************************************   LOGIN VIEW
var LoginView = Parse.View.extend({

    el:'#content',

    template: "#layout_blank_page",




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
                router.navigate('categories', true);

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


//********************************************************************************************   SIGNUP
var SignUpView = Parse.View.extend({

    el:'#content',

    template:_.template($('#filesTemplate').html()),

    events:{
        "click #signUp":"signUp"
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
                'email':email,
                'name':name,
                'type':type,
                'value':value,
                'notes':notes},
            {
                success:function () {
                    router.navigate('categories', true);
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
        }

    }
);


//********************************************************************************************   CATEGORY LIST

var CategoriesListView = Parse.View.extend({

    el:'#content',

    events:{

        'click #logoutBtn':'logout'
    },

    initialize:function () {
        _.bindAll(this, 'render');

        // retrieving my groups
        this.categories = new CategoryCollection();
        this.categories.bind('reset', this.render);
        this.categories.query = new Parse.Query(category);

        this.categories.query.ascending("CAT_NAME");
        this.categories.fetch();
    },

    render:function () {
        // defining property 'photo' with image urls
        this.categories.each(function (category) {
            if (category.get('image') != null) {
                console.log(category.get('image').url());
                category.set({'photo':category.get('image').url()});
            }
        });

        $(this.el).html(_.template($('#categoryListTemplate').html(),
            {
                'categories':this.categories.toJSON()
            }));
    },

    logout:function () {
        // logging out current user
        Parse.User.logOut();

        // getting back to login view
        router.navigate('', true);
    }

});

//********************************************************************************************   RECIPE LIST IN CATEGORY
var RecipeListView = Parse.View.extend({

    defaults:{
        categoryId:''
    },

    el:'#content',

    events:{

        'click #logoutBtn':'logout'
    },

    initialize:function (options) {
        _.bindAll(this, 'render');

        if (options.hasOwnProperty('categoryId')) {
            this.categoryId = options['categoryId'];
        }

        // retrieving my groups
        this.recipes = new RecipeCollection();
        this.recipes.bind('reset', this.render);
        this.recipes.query = new Parse.Query(recipe);

        if (this.categoryId && this.categoryId != '') {
            this.recipes.query.equalTo("categoryId", this.categoryId);
        }

        this.recipes.query.ascending("NAME");
        this.recipes.fetch();
    },

    render:function () {
        this.recipes.each(function (recipe) {
            if (recipe.get('imageFile') != null) {
                recipe.set({'photo':recipe.get('imageFile').url()});
            }
        });    

        $(this.el).html(_.template($('#recipeListTemplate').html(),
            {
                'recipes':this.recipes.toJSON()
            }));
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


//********ADD A NEW CATEGORY***********
var CreateCategoryView = Parse.View.extend({

    defaults:{
        groupId:''
    },

    el:'#content',

    events:{
        'click #saveCategory':'saveCategory'
    },

    initialize:function () {
        _.bindAll(this, 'render');

        this.render();
    },

    render:function () {
        $(this.el).html(_.template($('#categoryNew').html()));
    },

    saveCategory:function () {

        this.category = new category();

        var categoryname = this.$('#new-group-name').val();

        this.category.set('CAT_NAME', categoryname);
        this.category.set('ownerId', Parse.User.current().id);

        this.category.save({
            error:function () {
                // save-group-error
                self.$("#create-category-error .error").html("Failed to save group. Please try again later.").show();
            },
            success:function () {
                router.navigate("/groups", true);
            }
        });
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
            'categories':'categoriesList',
            'create-category':'createCategory',
            'category/edit/:id':'editCategory',
            'category/:id':"recipeList",
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

        newrecipe:function () {
            alert("Coming Soon");
        },

        handleFiles:function () {
            this.loadView(new FilesView());
        },

        index:function () {
            if (this.checkAuthorized()) {
                // groups list is our main
                this.categoriesList();
            }
        },

        forgotPassword:function () {
            this.loadView(new ForgotPasswordView());
        },

        signUp:function () {
            this.loadView(new SignUpView());
        },

        createCategory:function () {
            if (this.checkAuthorized()) {
                this.loadView(new CreateCategoryView());
            }
        },

        editCategory:function (categoryId) {
            if (this.checkAuthorized()) {
                this.loadView(new EditCategoryView({'categoryId':categoryId}));
            }
        },

        categoriesList:function () {
            if (this.checkAuthorized()) {
                this.loadView(new CategoriesListView());
            }
        },

        recipeList:function (categoryId) {

            if (this.checkAuthorized()) {
                this.loadView(new RecipeListView({'categoryId':categoryId}));
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

/***
Usage
***/
//Custom.init();
//Custom.doSomeStuff();