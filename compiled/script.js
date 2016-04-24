$(function(){
  // cacheDom 
  var $typesbtn = $("#types-btn");
  
  // variables  
  var markers = [];
  var map;
  var type = [];
  var colors = ["05668D", "555B6E", "456990", "F45B69", "444B6E", "708B75", "9AB87A", "E63946", "457B9D", "1D3557", "EC9F05", "8EA604", "3C6E71", "284B63", "293241", "EE6C4D"];
  
  // event listeners
  $("#search-click").on("click", geocodingApiCall);
  $("#type-list li").on("click", typeFunc);
  
  // function that runs when choosing the type (when you click on an li)
  function typeFunc() {
    var $thistext = $(this).text();
    $typesbtn.text($thistext);
  }
  
  function initMap(lat, lng) {
    reset(); // clear current places and markers
      
    // getting all the information added by the user.
    var randNum = Math.floor(Math.random() * colors.length);
    var $typesbtntext = $typesbtn.text();
    var radius = $("#radius input").val(); 
  
    // variables manipulated, the first is used to check for a condition and the second is passed for the types key in request, in correct format.
    var radiusInt = parseInt(radius);
    var googleReadyType = $typesbtntext.toLowerCase().replace(/\s/g, "_"); // lowercase and replace whitespace.
   
    // location coords
    var location = new google.maps.LatLng(lat, lng);
    
    if ($typesbtntext == "Types of Places") {
      alert("What type of place are you looking for?");
      return;
    } else {
      type.push($typesbtntext.toLowerCase().replace(/\s/g, "_")); // lowercase and replace whitespaces, so that the request can read it.
    }

    if (radiusInt < 500 || radiusInt > 10000 || radius == "") {
      alert("Invalid radius (min 500, max 10000)");
      return;
    }

    // map creation
    map = new google.maps.Map($("#map")[0], {
      center: location,
      zoom: 15,
      scrollwheel: false
    });

    // location, radius and place types
    var request = {
      location: location,
      radius: radius,
      types: type
    };

    // Create the PlaceService and send the request.
    // Handle the callback with an anonymous function.
    var service = new google.maps.places.PlacesService(map);

    // If the request succeeds, draw the place location on
    // the map as a marker, and register an event to handle a
    // click on the marker.
    service.nearbySearch(request, function(results, status) {    
      if (status == google.maps.places.PlacesServiceStatus.OK) { 
        for (i = 0; i < results.length; i++) {
          var place = results[i];
          var rating = results[i].rating;
          var icon = results[i].icon;
          var name = results[i].name;
          var vicinity = results[i].vicinity;
          var openNow;

          if (results[i].opening_hours === undefined) { // checks to see if it's undefined, because the script wouldn't work if it is.
            openNow = "<p> Open Now: <span class='text-info'>Unknown Schedule<span></p>";
          } else {
            if (results[i].opening_hours.open_now === true) {
              openNow = "<p> Open Now: <span class='text-success'>Yes</span></p>"
            } else {
              openNow = "<p> Open Now: <span class='text-danger'>No</span></p>"
            }
          }

          if (rating === undefined) {
            rating = "N/A"
          }

          var info = "<div class='place'>" + "<img src='" + icon + "' alt='Type'>" + "<p class='text-warning'> " + name + "</p><br><img src='http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/map-marker-icon.png' alt='Location''>" + "<p> "+ vicinity + "</p><br><img src='https://cdn2.iconfinder.com/data/icons/metro-uinvert-dock/256/Clock.png' alt='Open/Closed'>" + openNow + "<br><img src='http://icons.iconarchive.com/icons/icons8/christmas-flat-color/512/star-icon.png' alt=''>" + "<p> Rating: " + rating + "</p></div>" // figure out how to write this in another way.

          var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
          }); // adds a new marker on the map for the current position.

          markers.push(marker);

          $("#locations").append(info);
        }

        // h1 new text and background change
        $("h1").text("Satisfied? Try again if not.");
        $("body").css("background", "#" + colors[randNum]);

        markerFunc();    
      }

    });
  } 
  
  function setMapOnAll(map) { // used to clear markers 
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }
  
  function markerFunc() {
    $(".place").on("click", markerAdd) // couldn't put this directly in dom.ready because elements are generated after and needs to be updated everytime a new location is generated.
  }
  
  function markerAdd () {
    var $this = $(this);
    var $placeindex = $this.index();
    var thisMarker = markers[$placeindex];
    var latLng = thisMarker.getPosition(); // get coords (lat, lng)
    var $windowwidth = $(window).width();
    
    if ($windowwidth > 850){ // zoom in conditions
      map.setZoom(17);
    } else if ($windowwidth > 460) {
      map.setZoom(15);   
    } else {
      map.setZoom(14);
    }
    
    map.setCenter(latLng) // center the map based on the chosen marker

    setMapOnAll(null) // clear lastMarker

    thisMarker.setMap(map); // set up new marker

    $("body").animate({ scrollTop: 0 }, "slow"); // scroll to the top

    // highlight the current element
    $this.addClass("active-style"); 
    $this.siblings().removeClass("active-style");
  }
  
  function reset() {
    $(".place").remove(); // clear up previous places
    markers = [];
    type = [];
  }
  
  function geocodingApiCall() {
    var $searchbarinput = $("#search-bar input").val();
    var link = "https://maps.googleapis.com/maps/api/geocode/json?address=" + $searchbarinput + "&key=AIzaSyBU2VCzwSYpv7zNAShmFAMHO64CMcqjLIk";

    $.getJSON(link)
      .done(generate)
      .fail(error)
  }  

  function generate(data) {
    var latitude = data.results[0].geometry.location.lat;
    var longitude = data.results[0].geometry.location.lng;

    initMap(latitude, longitude);
  }

  function error() {
    alert("Couldn't retrieve data!");
  }
})()