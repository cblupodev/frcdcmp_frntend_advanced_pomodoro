var app = angular.module('myApp', ['ngMaterial']);
app.controller('MainController', ['$scope', function($scope) {

    // settings selected by the users
    $scope.settingsExplicit = {
        pomoLength: 25,
        shortBreakLength: 5,
        longBreakLength: 15,
        continuous: false
    }

    // preferences made sticky towards the user. Like what tab they last clicked on
    $scope.settingsImplicit = {
        selectedTab: 0
    }

    // the state machine object
    $scope.Pomodoro = function() {
        var currentState = new Start(this);

        this.change = function(state) {
            currentState = state;
            currentState.go();
        }

        this.start = function() {
            currentState.go();
        }
    }

    var Start = function(pomodoro) {
        this.pomodoro = pomodoro;

        this.go = function() {
            l("start go");
            pomodoro.change()
        }
    }

}]);

// '{0}{1}'.lp_format('asdf', 1 + 2);
if (!String.prototype.format) {
    String.prototype.lp_format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

function l(message) {
    console.log(message);
}

function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}