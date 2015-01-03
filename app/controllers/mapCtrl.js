(function(){
  
  angular.module('controllers', []).controller('MapCtrl', ['$scope', '$http', function ($scope, $http) {
      
    var _val = '';

    $scope.search = {
      val: function(newSubject){
        if(angular.isDefined(newSubject)) {
          _val = newSubject;
        }
        return _val;
      }
    }

    // D3 =========================
    // we define d3 us-map here
    var width = 1300,
        height = 580,
        active = d3.select(null);

    var projection = d3.geo.albersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);
    var svg = d3.select('body').append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

    var g = svg.append("g")
        .style("stroke-width", "1.5px");

    d3.json("/states.json", function(error, us) {
      g.selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
          .enter().append("path")
          .attr("d", path)
          .attr("class", "feature")
          .on("click", clicked);
          //console.log(us.objects.states.geometries[0]);

      g.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("class", "mesh")
          .attr("d", path);
    });

    function clicked(d) {

      $('form').fadeIn();
      $('button').on('click', function(){
        $('form').fadeOut();
        fetchGeoData();
      });
      
      if (active.node() === this) return reset();
      // ========= The link between the client and the server ===============

      var fetchGeoData =  function() {
//
        d3.json('/geo.json', function(err, data) {
          // activate the loading icon
          $('.spinner').show();
          $('svg').css('opacity', '0.2');
          var geoLocation = (data[d.id].geo);
          console.log(geoLocation);
          //sending data (geo location and the end user search criteria) to server
          //a post request with data to twitter
          $http.post('/map', {geo: geoLocation, subject: $scope.search.val })
             .success(function(data){
              // disable the loading icon
              $('.spinner').hide();
              // in case no enough data found raise an error
              if (data.hasOwnProperty("error")) {
                console.log(data["error"]);
                sweetAlert({ title: "Watson says:",   text: "Oh, dear. It looks like there aren't enough tweets to conduct an analysis. Kindly send me another search query." });
                return;
              } else {
                // on success, the `data` is the data from Watson
                // the data is the big 5 for a collection of tweets
                //debugger
                graphIt(data);
                $('.output').fadeIn();
              }
             });
        });
    }
// =======
//       d3.json('/geo.json', function(err, data) {
//         var geoLocation = (data[d.id].geo);
//         console.log(geoLocation);
//        // graphIt({"openess": 90, "value": 50, "outgoing": 10, "funny":60});
//         // sending data (geo location and the end user search criteria) to server
//         // a post request with data to twitter
//         $http.post('/map', {geo: geoLocation, subject: $scope.search.val })
//            .success(function(data){
//             graphIt(data);
//             // no enough data found!
//             if (data.hasOwnProperty("error")) {
//               console.log(data["error"]);
//             } else {
//               // on success, the `data` is the data from Watson
//               // the data is the big 5 for a collection of tweets
//               console.log(data);
//             }
//            });
//        });
// >>>>>>> Stashed changes
      
      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      var bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = .9 / Math.max(dx / width, dy / height),
          translate = [width / 2 - scale * x, height / 2 - scale * y];

      g.transition()
          .duration(750)
          .style("stroke-width", 1.5 / scale + "px")
          .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }

    function reset() {
      $('form').hide();
      $('.output').fadeOut();
      $('svg').css('opacity', '1');
      active.classed("active", false);
      active = d3.select(null);
      g.transition()
          .duration(750)
          .style("stroke-width", "1.5px")
          .attr("transform", "");
    }
    // ========= end of D3 US-map ======================

  }]);
})();
