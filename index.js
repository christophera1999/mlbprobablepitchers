'use strict';

const Xray = require('x-ray');

var json2xls = require('json2xls');

const internals = {};


module.exports = internals.Probables = {};


internals.Probables.get = function (day, callback) {

    const url = `http://mlb.mlb.com/news/probable_pitchers/index.jsp?c_id=mlb&date=${day}`;
    const scope = 'div#mc';
    const selector = + {
        pitchers: ['div.pitcher@pid'],
        names: ['div.pitcher h5 a'],
        throws: ['div.pitcher h5 span'],
        teams: ['div.pitcher@tid'],
        games: ['div.pitcher@gid'],
        startTimes: ['div.pitcher@local_time'],
        easternTimes: ['div.pitcher@eastern_time'],
        timezones: ['div.pitcher@local_time_zone']
    };

    const x = Xray();
    x(url, scope, selector)((err, result) => {

        if (err) {
            return callback(err);
        }

        const matchups = internals.convertResult(result);


        return callback(null, matchups);
    

}
    )};


internals.convertResult = function (result) {

    const matchups = [];

    const pitchers = result.pitchers;
    const teams = result.teams;
    const names = result.names;
    const throws = result.throws;

    for (let i = 0; i < pitchers.length; i += 2) {
        const j = i + 1;
        const matchup = {
            id: result.games[i],
            startTime: result.startTimes[i],
            easternTime: result.easternTimes[i],
            timezone: result.timezones[i],
            teams: {
                away: teams[i],
                home: teams[j]
            },
            pitchers: {
                away: {
                    id: pitchers[i],
                    name: names[i],
                    throws: throws[i]
                },
                home: {
                    id: pitchers[j],
                    name: names[j],
                    throws: throws[j]
                }
            }
        }

        matchups.push(matchup);
    }

    return matchups;
};


const Probables = require('mlbprobablepitchers');

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
} 

if(mm<10) {
    mm = '0'+mm
} 

today = yyyy + '/' + mm + '/' + dd;
const day = today;
var util = require('util');
var fs = require('fs');

    Probables.get(day, (err, matchups) => {
     const pitcherDataSetAway = [];
       for (var i = 0; i < matchups.length; i++) {
        pitcherDataSetAway.push(matchups[i].pitchers.away);
        }
        const pitcherDataSetHome = [];
        for (var x = 0; x < matchups.length; x++) {
         pitcherDataSetHome.push(matchups[x].pitchers.home);
         }
         const pitcherDataSet = [];
         for (var y = 0; y < matchups.length; y++) {
          pitcherDataSet.push(matchups[y].pitchers.away);
          pitcherDataSet.push(matchups[y].pitchers.home);
          }
        console.log(pitcherDataSet);
       fs.writeFile('output.json', JSON.stringify(matchups));
       fs.writeFile('outputPitcher.json', JSON.stringify(pitcherDataSet));
       
       
       var xls = json2xls((pitcherDataSet),{field: ['name','throws']});
        fs.writeFileSync('ProbablePitchers.xlsx', xls, 'binary');
    });