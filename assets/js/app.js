$(function() {

    /*	Setup authentication app_id and app_code 
     *	WARNING: this is a demo-only key
     *	please register for an Evaluation, Base or Commercial key for use in your app.
     *	Just visit http://developer.here.com/get-started for more details. Thank you!
     */
    nokia.Settings.set("app_id", "aBS1z8nMesIa9nbhWk0X");
    nokia.Settings.set("app_code", "QLEA8S6XumyLO-OpAK2YiQ");
// Use staging environment (remove the line for production environment)
    nokia.Settings.set("serviceMode", "cit");

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection.bandwidth) {

        /*
         * OPEN AND CLOSE ADD TRACK WINDOW
         */
        $('#addTrack').click(function() {
            $('#newTracking').fadeIn();
            $('#addTrack, #ShowAllTracks').hide();
            $('body').addClass('cleanBG');
            return false;
        });

        $('#btnCancel').click(function() {
            $('#newTracking').fadeOut();
            $('#addTrack, #ShowAllTracks').show();
            $('body').removeClass('cleanBG');
            return false;
        });

        $('#ShowAllTracks').click(function() {
            var html = "";
            if (localStorage.length > 1) {
                for (var ls = 0; ls < localStorage.length; ls++) {
                    if (localStorage.key(ls) !== "nokia.places.suggestions") {
                        var item = JSON.parse(localStorage.getItem(localStorage.key(ls)));

                        html += "<li class='itemTrack'> <p class = 'descItem'> <span>" + item.trackcode + "</span><br/>" + item.description + "</p><a href='javascript:void(0)' class='delItem'>Excluir</a><input type='hidden' value='" + item.trackcode + "' class='inputTrack'/></li>";
                    }
                }
                $('#listTracking ul').html(html);

                $('.itemTrack p').bind("click", function() {
                    var track = $(this).parent().find("input").val();
                    var data = JSON.stringify({trackcode: track});
                    verifyPackage(data);
                    $('#listTracking').hide();
                    $('#addTrack, #ShowAllTracks').show();
                    $('body').removeClass('cleanBG');
                });
                $('.itemTrack a').bind("click", function() {
                    var track = $(this).parent().find("input").val();
                    localStorage.removeItem(track);
                    alert('Pacote excluído com sucesso.');
                    $('#ShowAllTracks').trigger('click');
                });
            } else{
                
                $('#listTracking ul').html("<li><p class='descItem'>Nenhum pacote cadastrado.</p></li>");
            }

            $('#listTracking').fadeIn();
            $('#addTrack, #ShowAllTracks').hide();
            $('body').addClass('cleanBG');
            return false;
        });

        $(".closeList").click(function() {
            $('#listTracking').fadeOut();
            $('#addTrack, #ShowAllTracks').show();
            $('body').removeClass('cleanBG');
            return false;
        });



        /*
         * CAdastrando o pacote
         */
        $("#btnSave").click(function() {
            var dataToStore = JSON.stringify({trackcode: $("#fieldTrackCode").val(), description: $("#fieldDescription").val()});
            localStorage.setItem($("#fieldTrackCode").val(), dataToStore);
            $("#fieldDescription").val("");
            $("#fieldTrackCode").val("");
            $('#newTracking').fadeOut();
            $('#addTrack, #ShowAllTracks').show();
            $('body').removeClass('cleanBG');
            $('#ShowAllTracks').trigger('click');
            //return false;
        });

    } else {
        alert("Não há conexão com a internet.");
        window.close;
    }

    /*
     * TOUCH EVENTS     
     */

});

/*
 * PACOTES
 */
function verifyPackage(dados) {
    var result = JSON.parse(dados);
    var url = "http://www.jlamim.com.br/firefoxosapps/tachegando/curl.php?id=" + result.trackcode;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        beforeSend: function() {
            console.log('aguardando...')
        },
        success: function(data, textStatus, xhr) {

            trackingMap(data);
        },
        error: function(xhr, textStatus, errorThrown) {
            alert("Não foi possível processar a solicitação.");
        }
    });
}

/* NOKIA MAPS */
function trackingMap(trackingData) {
    var str = "";
    //var trkData = JSON.parse(trackingData);
    var trkData = trackingData;
    var track = trkData['data'];
    var waypoints = [];
    $("#mapBox").html("");

    if (track.length > 0) {
// Get the DOM node to which we will append the map
        var mapContainer = document.getElementById("mapBox");

// We create a new instance of InfoBubbles bound to a variable so we can call it later on
        var infoBubbles = new nokia.maps.map.component.InfoBubbles();

// Create a map inside the map container DOM node
        var map = new nokia.maps.map.Display(mapContainer, {
            // initial center and zoom level of the map
            //center: [-14.2400732, -53.1805018],
            zoomLevel: -1,
            components: [
                // We add the behavior component to allow panning / zooming of the map
                new nokia.maps.map.component.Behavior(),
                infoBubbles
            ]
        });



        for (var i = 0; i < track.length; i++) {
            //var prev = parseInt(i-1);
            var obj = track[i];
            if (obj.city && obj.state) {
                waypoints.push(obj.city + "," + obj.state);
            }
        }
        //str = str.substring(0, str.length - 1);
        //var addrs = str.toUpperCase();
        console.log(waypoints);
        var addresses = waypoints,
                // We will put our address markers into this container zo we can zoom in to the markers
                addressesContainer = new nokia.maps.map.Container(),
                marker,
                searchCenter = new nokia.maps.geo.Coordinate(52.51, 13.4),
                searchManager = nokia.places.search.manager,
                i = 0,
                len = addresses.length,
                requests = addresses.length;

        map.objects.add(addressesContainer);

        var processResults = function(data, requestStatus, requestId) {
            // Data is instance of nokia.places.objects.Place 
            var location = data.location;

            // Ensure that we our request came back with valid result
            if (requestStatus == "OK") {
                // Create a new marker on the found location
                marker = new nokia.maps.map.StandardMarker(location.position);
                // Add marker to its container so it will be render
                addressesContainer.objects.add(marker);

                /* We store the address from the location and name of the
                 * Place object in the marker so we can create an infoBubble 
                 * with this information on click.
                 */
                marker.$address = location.address;
                marker.$label = data.name;
            }
        };


        /* Once the map is initialized and ready (an event that is fired only once),
         * trigger a geocoding request.
         */
        map.addListener("displayready", function() {
            /* We use nokia.places.search.manager.geCode to translate
             * the given address to a nokia.places.objects.Place which
             * contains the longitude and latitude
             */
            for (; i < len; i++) {
                searchManager.geoCode({
                    searchTerm: addresses[i],
                    onComplete: function(data, requestStatus, requestId) {
                        processResults(data, requestStatus, requestId);
                        requests--;
                        if (requests == 0) {
                            map.zoomTo(addressesContainer.getBoundingBox());
                        }
                    }
                });
            }
        });
        var last = (track.length) - 1;
        var obj = track[last];
        var splitDate = obj.date.split(" ");
        $('#statusBox .status').html("<span>Status</span>" + obj.description);
        $('#statusBox .time').html("<span>" + splitDate[2] + "/" + splitDate[1] + "</span>" + splitDate[3]);
        $('#statusBox').fadeIn();

    } else {
        $("#mapBox").html("");
        $("#statusBox").fadeOut();
        alert("Pacote sem informações de rastreamento.");
    }
}
