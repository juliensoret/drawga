'use strict';

var myApp = angular.module('myApp',[]);

myApp.controller('myCtrl', ['$scope', function($scope){

    $scope.filters = {};

    $scope.showContent = function($fileContent){
        $scope.completeList = [];
        var allLines = CSVToArray($fileContent, ',');

        for(var i=0; i<allLines.length; ++i){
            var data = allLines[i];
            // First line : column's names
            if(i==0){
                var parameters = {
                    "ref" : -1,
                    "sprint" : -1,
                    "subject" : -1,
                    "points" : -1,
                    "user_story" : -1
                };
                for(var j=0; j<data.length; ++j){
                    if(data[j] === 'ref') parameters.ref = j;
                    if(data[j] === 'sprint') parameters.sprint = j;
                    if(data[j] === 'subject') parameters.subject = j;
                    if(data[j] === 'total-points') parameters.points = j;
                    if(data[j] === 'user_story') parameters.user_story = j;
                }
                $scope.isUserStories = (parameters.user_story === -1) && (parameters.points !== -1);
            }
            // Content
            else {
                if (data.length > 3) {
                    $scope.completeList.push({
                        "ref": findNumbers(data[parameters.ref]),
                        "sprint": findNumbers(data[parameters.sprint]),
                        "enTantQue": findEnTantQue(data[parameters.subject]),
                        "subject": data[parameters.subject],
                        "points": data[parameters.points],
                        "user_story": data[parameters.user_story]
                    });
                }
            }
        }
        $scope.filterList();
    };

    $scope.filterList = function() {
        $scope.content = [];
        if($scope.completeList) {
            for (var k = 0; k < $scope.completeList.length; ++k) {
                // Filter : sprint (US - Task)
                if ($scope.filters.sprint != undefined)
                    if ($scope.filters.sprint !== $scope.completeList[k]['sprint'])
                        continue;
                // Filter : ref (US)
                if (
                    !$scope.isUserStories
                    || !$scope.filters.ref
                    || (!$scope.filters.ref.a && !$scope.filters.ref.b && !$scope.filters.ref.c && !$scope.filters.ref.d)
                    || ($scope.filters.ref.a && $scope.filters.ref.a === ($scope.completeList[k]['ref']))
                    || ($scope.filters.ref.b && $scope.filters.ref.b === ($scope.completeList[k]['ref']))
                    || ($scope.filters.ref.c && $scope.filters.ref.c === ($scope.completeList[k]['ref']))
                    || ($scope.filters.ref.d && $scope.filters.ref.d === ($scope.completeList[k]['ref']))
                )
                    $scope.content.push($scope.completeList[k]);
            }
        }
    };

    $scope.fillBlank = function(isUserStories) {
        $scope.isUserStories = isUserStories;
        if(isUserStories)
            $scope.content = [{},{},{},{}];
        else
            $scope.content = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]
    }

}]);

function findEnTantQue(string) {
    var result = '';
    var match = string.match(/(En tant qu.).*(?= je)/);
    if (match != null) {
        result = match[0].substring(11, match[0].length).trim();
        if(result.slice(-1) === ',')
            result = result.substring(0, result.length - 1);
    }
    else {
        match = string.match(/\[.*]/);
        if (match != null) {
            result = match[0].substring(1, match[0].length - 1);
        }
    }
    return result;
}

function findNumbers(string) {
    var int = parseInt(string.replace(/\D/g,''));
    if (!isNaN(int)) return int;
    return '';
}

/*
 * The following part is Copyright (c) 2015 Alejandro Such Berenguer
 */
myApp.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function(onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function(onLoadEvent) {
                    scope.$apply(function() {
                        fn(scope, {$fileContent:onLoadEvent.target.result});
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
});

function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp((
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }
        if (arrMatches[2]) {
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
        } else {
            var strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
}