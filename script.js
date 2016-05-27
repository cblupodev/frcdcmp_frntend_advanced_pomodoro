var app = angular.module('myApp', ['ngMaterial']);
app.controller('MainController', ['$scope', function($scope) {
    
    $scope.breaklengthString = "05";
    $scope.pomolengthString  = "10";
    $scope.pomolength        = 10;
    $scope.breaklength       = 5;
    $scope.time              = $scope.pomolength * 60 * 1000;
            // time: $scope.time,
            // state: $scope.state,
            // pomoString: $scope.pomolengthString,
            // breakString: $scope.breaklengthString,
            // pomolength: $scope.pomolength,
            // breaklength: $scope.breaklength
    
    var dataStore = JSON.parse(localStorage.getItem('dataStore'));
    if (dataStore !== null) {
        $scope.breaklengthString = dataStore.breakString;
        $scope.pomolengthString  = dataStore.pomoString;
        $scope.pomolength        = dataStore.pomolength;
        $scope.breaklength       = dataStore.breaklength;
        $scope.time              = dataStore.time;
    }
    
    setInterval(transition,1);
    
    updateTimeDisplay();
    
    $scope.States = {
        start       :0,
        pomoDec     :1,
        pomoInc     :10,
        breakDec    :9,
        breakInc    :8,
        runningPomo :2,
        runningBreak:3,
        pausedBreak :4,
        pausedPomo  :5,
        breakEnded  :6,
        pomoEnded   :7
    }
    var previousState = $scope.States.start;
    $scope.state = $scope.States.start;
    
    function transition() {
        switch($scope.state) {
            case $scope.States.start:
                updateTimeDisplay();
                break;
            case $scope.States.pomoInc:
                $scope.pomolength++;
                // only change the time if the pomo timer is active
                if (previousState === $scope.States.runningPomo || 
                    previousState === $scope.States.breakEnded ||
                    previousState === $scope.States.pausedPomo ||
                    previousState === $scope.States.start) { // don't update the display if the pomo was running
                    $scope.time += 1000 * 60;
                }
                $scope.pomolengthString = zeroFill($scope.pomolength,2);
                
                // get back to the timer if it was in the middle of running
                if (previousState.runningBreak) {
                    $scope.state = $scope.States.runningBreak;
                } else if (previousState.runningPomo) {
                    $scope.state = $scope.States.runningPomo;
                }
                $scope.state = previousState; // go back to the previous state
                break;
            case $scope.States.pomoDec:
                $scope.pomolength--;
                if ($scope.pomolength < 0) { $scope.pomolength = 0; }
                // only change the time if the pomo timer is active
                if (previousState === $scope.States.runningPomo || 
                    previousState === $scope.States.breakEnded ||
                    previousState === $scope.States.pausedPomo ||
                    previousState === $scope.States.start) { // don't update the display if the pomo was running
                    $scope.time -= 1000 * 60;
                }
                $scope.pomolengthString = zeroFill($scope.pomolength,2);
                
                // get back to the timer if it was in the middle of running
                if (previousState.runningBreak) {
                    $scope.state = $scope.States.runningBreak;
                } else if (previousState.runningPomo) {
                    $scope.state = $scope.States.runningPomo;
                }
                $scope.state = previousState; // go back to the previous state
                break;
            case $scope.States.breakInc:
                $scope.breaklength++;
                if (previousState === $scope.States.runningBreak ||
                    previousState === $scope.States.pomoEnded ||
                    previousState === $scope.States.pausedBreak) {
                        $scope.time += 1000 * 60;
                }
                $scope.breaklengthString = zeroFill($scope.breaklength,2);
                
                // get back to the timer if it was in the middle of running
                if (previousState.runningBreak) {
                    $scope.state = $scope.States.runningBreak;
                } else if (previousState.runningPomo) {
                    $scope.state = $scope.States.runningPomo;
                }
                $scope.state = previousState; // go back to the previous state
                break;
            case $scope.States.breakDec:
                $scope.breaklength--;
                if ($scope.breaklength < 0) { $scope.breaklength = 0; }
                if (previousState === $scope.States.runningBreak ||
                    previousState === $scope.States.pomoEnded ||
                    previousState === $scope.States.pausedBreak) {
                        $scope.time -= 1000 * 60;
                }
                $scope.breaklengthString = zeroFill($scope.breaklength,2);
                
                // get back to the timer if it was in the middle of running
                if (previousState.runningBreak) {
                    $scope.state = $scope.States.runningBreak;
                } else if (previousState.runningPomo) {
                    $scope.state = $scope.States.runningPomo;
                }
                $scope.state = previousState; // go back to the previous state
                break;
            case $scope.States.runningPomo:
                $scope.time -= 1000; // decrement the timer by one second
                // update the timer display
                updateTimeDisplay()
                if ($scope.time <= 0) {
                    $scope.state = $scope.States.pomoEnded;
                }
                previousState = $scope.state;
                break;
            case $scope.States.runningBreak:
                $scope.time -= 1000; // decrement the timer by one second
                // update the timer display
                updateTimeDisplay();
                if ($scope.time <= 0) {
                    $scope.state = $scope.States.breakEnded;
                }
                previousState = $scope.state;
                break;
            case $scope.States.pausedBreak:
                break;
            case $scope.States.pausedPomo:
                break;
            case $scope.States.breakEnded:
                $scope.time = $scope.pomolength * 1000 * 60; // set timer to pomo lenth when break ends
                updateTimeDisplay()
                previousState = $scope.state;
                document.querySelectorAll('#time')[0].style.backgroundColor = 'yellow';
                break;
            case $scope.States.pomoEnded:
                $scope.time = $scope.breaklength * 1000 * 60; // set timer to rbeak lenth when pomo ends
                updateTimeDisplay();
                previousState = $scope.state;
                document.querySelectorAll('#time')[0].style.backgroundColor = 'red';
                break;
        }
        $scope.$apply();
        // l("time {0}   state {1}   pomoString {2}   breakString {3}   pomolength {4}   breaklength {5}".lp_format
        // ($scope.time, $scope.state, $scope.pomolengthString, $scope.breaklengthString, $scope.pomolength, $scope.breaklength))  ;
        var ds = JSON.stringify({
            time: $scope.time,
            state: $scope.state,
            pomoString: $scope.pomolengthString,
            breakString: $scope.breaklengthString,
            pomolength: $scope.pomolength,
            breaklength: $scope.breaklength
        });
        localStorage.setItem('dataStore',ds);
    }
    
    function updateTimeDisplay() {
        var minutes = zeroFill(Math.floor($scope.time / 60000),2);
        var seconds = zeroFill(Math.floor($scope.time / 1000) - minutes * 60,2);
        $scope.timeDisplay = '{0}:{1}'.lp_format(minutes, seconds);
    }
    
    function clickHandle() {
        if ($scope.state === $scope.States.start ||
            $scope.state === $scope.States.pausedPomo ||
            $scope.state === $scope.States.breakEnded
            ) {
            $scope.time = $scope.pomolength * 1000 * 60;
            $scope.state = $scope.States.runningPomo;
        } else if ($scope.state === $scope.States.pomoEnded ||
                   $scope.state === $scope.States.pausedBreak) {
            $scope.time = $scope.breaklength * 1000 * 60;
            $scope.state = $scope.States.runningBreak;
        } else if ($scope.state === $scope.States.runningPomo) {
            $scope.state = $scope.States.pausedPomo;
        } else if ($scope.state === $scope.States.runningBreak) {
            $scope.state = $scope.States.pausedBreak;
        }
    }
    
    $scope.click = function() {
        clickHandle();
    }
    
    $scope.skip = function() {
        if ($scope.state === $scope.States.runningPomo ||
            $scope.state === $scope.States.breakEnded ||
            $scope.state === $scope.States.pausedPomo ||
            $scope.state === $scope.States.start) {
                $scope.state = $scope.States.pomoEnded;
            }
        else if ($scope.state === $scope.States.runningBreak ||
                 $scope.state === $scope.States.pomoEnded ||
                 $scope.state === $scope.States.pausedBreak) {
                     $scope.state = $scope.States.breakEnded;
                 }
    }
}]);

// '{0}{1}'.lp_format('asdf', 1 + 2);
if (!String.prototype.format) {
  String.prototype.lp_format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function l (message) {
  console.log(message);
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}