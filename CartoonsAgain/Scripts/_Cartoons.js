var myApp = angular.module("myApp", ['ngRoute']);
myApp.config(function ($routeProvider) {
    $routeProvider
        .when("/",
        {
            templateUrl: "Views/Home.html",
            controller: "HomeController"
        }
        )
        .when("/Home",
        {
            templateUrl: "Views/Home.html",
            controller: "HomeController"
        }
        )
        .when("/Add",
        {
            templateUrl: "Views/Add.html",
            controller: "AddController"
        }
        )
        .when("/Cartoon/:cartoon",
        {
            templateUrl: "Views/Details.html",
            controller: "DetailController"
        }
        )
    .when("/:search",
    {
        templateUrl: "Views/Home.html",
        controller: "HomeController"
    }
    ).otherwise(
    {
        redirectTo: function () {
            return "/";
        }
    }
    )
});
myApp.factory("Cartoons", function () {
    return [];
});
myApp.filter("Snippet", function () {
    return function (text) {
       return text.slice(0, 15)+"...";
    }
});

myApp.controller("HomeController", function ($scope, $routeParams, Cartoons, $http, $location) {
    $scope.Cartoons = Cartoons;
    $http.get("https://domo.firebaseio.com/cartoons.json")
        .success(
        function (data) {
            for (var x in data) {
                data[x].id = x;
                var output = [];
                for (var i = 0; i < Cartoons.length; i++) {
                    output.push(Cartoons[i].id);
                }
                var f = output.indexOf(x);
                if (f === -1) {
                    Cartoons.push(data[x]);
                }

                //if (Cartoons.map(function (c) { return c.id }).indexOf(x) === -1) {
                //    //console.log(Cartoons.indexOf(data[x]));
                //    Cartoons.push(data[x]);
                //}
                //else {
                //    console.log(JSON.stringify(data[x]));
                //}
            }
        });
    if ($routeParams.search) {
        $scope.message = "You have searched for " + $routeParams.search;
        $scope.query = $routeParams.search;
    }
    else {
        $scope.message = "Welcome to the Cartoon Home Page!";
    }
    $scope.showDetails = function (cartoon) {
        $location.path("/Cartoon/" + Cartoons.indexOf(cartoon));
    };
    //$scope.Snippet = function (text) {
    //    return text.splice(0, 15);
    //}
    $scope.search = function (item) {
        if (!$scope.query) {
            return true;
        }
        if (item.name.toLowerCase().indexOf($scope.query.toLowerCase()) !== -1 ||
            item.description.toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) {
            return true;
        }
       else{
       return false;
       }
    }
});

myApp.controller("AddController", function ($scope, Cartoons, $http, $location) {

    $scope.addCartoon = function (name, year, description, picture) {

        var cartoon = { name: name, year: year, description: description, picture: picture };

        $scope.loading = true;

        $http.post("https://domo.firebaseio.com/cartoons.json", cartoon)
            .success(function (data) {
                cartoon.id = data.name;
                Cartoons.push(cartoon);
                $location.path("/");
            })
    }
});
myApp.controller("DetailController", function ($scope, $routeParams, Cartoons, $location, $http) {
    //AJAX Here
    if (Cartoons[$routeParams.cartoon]) {
        $scope.Cartoon = Cartoons[$routeParams.cartoon];
        $scope.Edit = {
            name: $scope.Cartoon.name,
            picture: $scope.Cartoon.picture,
            description: $scope.Cartoon.description,
            year: $scope.Cartoon.year
        };
    }
    else {
        $location.path("/");
    }
    $scope.Delete = function () {
        $http.delete("https://domo.firebaseio.com/cartoons/" + $scope.Cartoon.id + ".json")
            .success(function () {
                Cartoons.splice($routeParams.cartoon, 1);
                $location.path("/");
            });
    };
    $scope.Update = function () {
        $scope.editing = false;
        $http({
            method: "PATCH",
            url: "https://domo.firebaseio.com/cartoons/" + $scope.Cartoon.id + ".json",
            data: $scope.Edit
        })
            .success(function () {
            Cartoons[$routeParams.cartoon].name = $scope.Edit.name;
            Cartoons[$routeParams.cartoon].year = $scope.Edit.year;
            Cartoons[$routeParams.cartoon].picture = $scope.Edit.picture;
            Cartoons[$routeParams.cartoon].description = $scope.Edit.description;

        })
    }
   
});
myApp.controller("SearchController", function ($scope, $routeParams, $location) {
    $scope.search = function (query) {
        $scope.query = "";
        $location.path("/" + query);
       
    };
});
