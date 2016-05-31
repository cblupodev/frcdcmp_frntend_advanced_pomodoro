var app = angular.module('myApp', ['ngMaterial']);
app.controller('MainController', ['$scope', '$interval', 'fsm', function($scope, $interval, fsm) {

    var S = $scope;
    S.fsm = fsm.getFSM(S);
    S.time = 0; // current timer value in milliseconds
    S.timeDisplay = null; // string to display
    S.pomoCount = 0; // total pomodoros completed
    S.running = false; // flag if the timer should be running
    S.interval = null; // angular interval handler
    

    // settings selected by the users
    S.settingsExplicit = {
        pomoLength: 10,
        shortBreakLength: 2,
        longBreakLength: 15,
        continuous: false
    }

    // preferences made sticky towards the user. Like what tab they last clicked on
    S.settingsImplicit = {
        selectedTab: 0
    }

    S.time = S.settingsExplicit.pomoLength.minutesToMilliSeconds();
    S.timeDisplay = formatTimeDisplay(S.time);

    // the state machine object
    S.toggleTimer = function() {
        S.running = !S.running;
        
        if (S.running) {
            l('running');
            // start timer if it should be running
            S.interval = $interval(function() {
                if (S.time === 0) {
                    S.fsm.sesend();
                }
                else {
                    S.time -= 1000;
                    S.timeDisplay = formatTimeDisplay(S.time);
                }
            }, 10);
        } else {
            // stop timer if it should't be running
            l('no running');
            $interval.cancel(S.interval);
        }
    }
    
}]);

function formatTimeDisplay(seconds) {
    var minutes = Math.floor(seconds / 60000);
    var seconds = seconds / 1000 % 60;
    return zeroFill(minutes, 2) + "   " + zeroFill(seconds, 2);
}

app.factory('fsm' ,function() {

    // https://github.com/jakesgordon/javascript-state-machine
    var service = {};
    service.getFSM = function(S) {
        var fsm = StateMachine.create({
        initial: 'pomo',
        events: [
            { from:'pomo',       to:'pomo',       name:'stop' },
            { from:'pomo',       to:'pomo_pause', name:'pause' },
            { from:'pomo',       to:'break',      name:'skip' },
            { from:'pomo',       to:'break',      name:'sesend' },
            { from:'pomo_pause', to:'pomo',       name:'go' },
            { from:'break',      to:'break',      name:'stop' },
            { from:'break',      to:'break_pause',name:'pause' },
            { from:'break',      to:'pomo',       name:'skip' },
            { from:'break',      to:'pomo',       name:'sesend' },
            { from:'break_pause',to:'break',      name:'go' },
          ],callbacks: {
              onsesend: function(event, from, to) {
                  // handle the case where the transition isn't continuous
                  if (!S.settingsExplicit.continuous === true) {
                      S.toggleTimer();
                  }
                  // set the break time
                  // don't forget the long break
                  if (to === 'break') {
                      S.pomoCount++;
                      if (S.pomoCount === 4) // four is the default pomo completed until long break 
                      {
                          S.time = S.settingsExplicit.longBreakLength.minutesToMilliSeconds();
                      }
                      else {
                          S.time = S.settingsExplicit.shortBreakLength.minutesToMilliSeconds();
                      }
                      S.timeDisplay = formatTimeDisplay(S.time);
                  }
                  else if (to === 'pomo') {
                      // set the pomo time
                      S.pomoCount = 0;
                      S.time = S.settingsExplicit.pomoLength.minutesToMilliSeconds();
                      S.timeDisplay = formatTimeDisplay(S.time);
                  }
              }
          }
          });
      return fsm;
    }
  return service;
});
  
 

// '{0}{1}'.lp_format('asdf', 1 + 2);
if (!String.prototype.format) {
    String.prototype.lp_format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

if (!Number.prototype.minutesToMilliSeconds) {
    Number.prototype.minutesToMilliSeconds = function() {
        return this * 60 * 1000;
    }
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