// var app = angular.module('myApp', ['ngMaterial']);

// app.factory('fsm' ,function() {

// // https://github.com/jakesgordon/javascript-state-machine
// var fsm = StateMachine.create({
//   initial: 'pomo',
//   events:
//   [
//     { from:'pomo',       to:'pomo',       name:'stop' },
//     { from:'pomo',       to:'pomo_pause', name:'pause' },
//     { from:'pomo',       to:'break',      name:'skip' },
//     { from:'pomo',       to:'break',      name:'sesend' },
//     { from:'pomo_pause', to:'pomo',       name:'go' },
//     { from:'break',      to:'break',      name:'stop' },
//     { from:'break',      to:'break_pause',name:'pause' },
//     { from:'break',      to:'pomo',       name:'skip' },
//     { from:'break',      to:'pomo',       name:'sesend' },
//     { from:'break_pause',to:'break',      name:'go' },
//   ],
//   callbacks: {
//   onsesend: function(event, from, to) {
//     // handle the case where the transition isn't continuous
//     if (!S.settingsExplicit.continuous === true) {
//       S.toggleTimer();
//     }

//     // set the break time
//     // don't forget the long break
//     if (to === 'break') {
//       S.pomoCount++;
//       if (S.pomoCount === 4) // four is the default pomo completed until long break 
//       {
//         S.time = S.settingsExplicit.longBreakLength.minutesToMilliSeconds();
//       }
//       else {
//         S.time = S.settingsExplicit.shortBreakLength.minutesToMilliSeconds();
//       }
//     }
//     else if (to === 'pomo') {
//       // set the pomo time
//       S.pomoCount = 0;
//       S.time = S.settingsExplicit.pomoLength.minutesToMilliSeconds();
//     }
//   }
//   }
//   });


//   if (!Number.prototype.minutesToMilliSeconds) {
//     Number.prototype.minutesToMilliSeconds = function() {
//       return this * 60 * 1000;
//     }
//   }


//   return {
//     fsm: fsm
//   }
//   });