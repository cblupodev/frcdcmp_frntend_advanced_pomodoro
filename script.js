var app = angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('grey')
    .dark();
});
app.controller('MainController', ['$scope', '$interval', 'fsm', function($scope, $interval, fsm) {
    var S = $scope; // shosrtcut to scope

    S.fsm = fsm.getFSM($scope); // the fsm service
    S.time = 0; // current timer value in milliseconds
    S.timeDisplay = null; // string to display to the user
    S.pomoCount = 0; // total pomodoros completed in the current cycle
    S.running = false; // flag if the timer should be running
    S.interval = null; // angular interval handler
    S.state = 'pomodoro session'; // string state displayed t othe user
    S.endTime = 0; // the time at which the timer in the current fsm state should stop

    // use the default settings the first time the app is loaded (nothing is in local storage)
    var store = JSON.parse(localStorage.getItem('settings'));
    if (store === null) {
        // default settings
        S.settings = {
            pomoLength: 25,
            shortBreakLength: 5,
            longBreakLength: 15,
            continuous: true
        }
    } else {
        S.settings = store;
    }

    // update ui elements when the time changes
    $scope.$watch('time', function() {
        S.time = Math.max(S.time, 0);
        S.timeDisplay = formatTimeDisplay(S.time);
        S.progressValue = (S.endTime - S.time) / S.endTime * 100 || 0;
    });

    // update local storage when settings change
    $scope.$watchCollection('settings', function(newSettings) {
       localStorage.setItem('settings', JSON.stringify(newSettings));
    });


    S.time = S.settings.pomoLength.minutesToMilliSeconds();
    S.endTime = S.time;
    S.timeDisplay = formatTimeDisplay(S.time);

    // start and stop the timer
    S.toggleTimer = function() {
        S.running = !S.running; // toggle the timer

        if (S.running) {
            // start timer if it should be running
            S.interval = $interval(function() {
                if (S.time === 0) {
                    // session ended
                    S.fsm.sesend();
                }
                else {
                    // subtract time by one second
                    S.time -= 1000;
                }
            }, 100);
        } else {
            // stop timer if it should't be running
            $interval.cancel(S.interval);
        }
    }

}]);

// format the millisecond time into '<minutes>  <seconds>' (zero fill of two)
function formatTimeDisplay(seconds) {
    var minutes = Math.floor(seconds / 60000);
    var seconds = seconds / 1000 % 60;
    return zeroFill(minutes, 2) + "   " + zeroFill(seconds, 2);
}

// finite state machine for the app
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
                  if (!S.settings.continuous === true) {
                      S.toggleTimer();
                  }

                  setUpTimes(to);
              },
              onskip: function(event, from, to) {
                  setUpTimes(to);
              },
              onstop: function(event, from, to) {
                  if (S.running) {
                      S.toggleTimer();
                  }
                  if (S.pomoCount === 4) {
                      // in long break
                      S.time = S.settings.longBreakLength.minutesToMilliSeconds();
                  } else if (to === 'break') {

                      // in short break
                      S.time = S.settings.shortBreakLength.minutesToMilliSeconds();
                  } else if (to === 'pomo') {
                      S.time = S.settings.pomoLength.minutesToMilliSeconds();
                  }
              }
          }
          });

        function setUpTimes(to) {
          // set the break time
          // don't forget the long break
          S.endTime = null;
          if (to === 'break') {
              S.pomoCount++;
              if (S.pomoCount === 4) // four is the default pomo completed until long break
              {
                  S.state = 'long break'
                  S.endTime = S.settings.longBreakLength.minutesToMilliSeconds();
                  S.pomoCount = 0;
              }
              else {
                  S.state = 'short break'
                  S.endTime = S.settings.shortBreakLength.minutesToMilliSeconds();
              }
          }
          else if (to === 'pomo') {
              // set the pomo time
              S.state = 'pomodoro session'
              S.endTime = S.settings.pomoLength.minutesToMilliSeconds();
          }

          // tell the progress bar what's 100%
          S.time = S.endTime;
        }
      return fsm;
    }
  return service;
});

// HELPERS ↓

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