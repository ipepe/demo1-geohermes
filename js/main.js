GHApp = {
	calcDistance: function(lat1,lat2,lon1,lon2) {
		//calculate distance in Meters between two coordinates
		var deg2rad = function (deg) {
			return deg * (Math.PI/180);
		};
		var R = 6371000;
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1);
		var a =
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		return d;//Value is in meters
	},
	buildMap : function(){
		console.log('buildingmap');
		if ( typeof GHApp.LeafletMap !== 'undefined' ) return;
		GHApp.MapTileLayer = L.tileLayer( 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
		{
			// attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
			maxZoom: 18,
			subdomains: '1234'
		});
		GHApp.LeafletMap = L.map('LeafletMapDiv', {
			layers: GHApp.MapTileLayer,
			center: [ 52.23040172207885, 21.01238250732422 ],
			zoom: 12
		});
		// L.easyButton('fa-street-view', GHApp.myLocationOnMap).addTo(GHApp.LeafletMap);
		// GHApp.checkMypositionStorage();
	},
	checkMypositionStorage: function(){
		var myposition = localStorage.getItem('myposition');
		if( myposition !== null ){
			var param = JSON.parse(myposition);
			if(param && param.latitude && param.longitude){
				GHApp.myLocationOnMap(param);
			}
		}
	},
	myLocationOnMap: function(myposition){
		var myLocationOnMap_text = 'Twoja pozycja';
		var inner = function(position){
			var lat = position.coords.latitude;
			var log = position.coords.longitude;
			if(position.coords.accuracy){
				myLocationOnMap_text += ' z dokładnością: ' + position.coords.accuracy + ' m. - (dokładność to kwestia Twojej przeglądarki internetowej)';
			}
			var marker = GHApp.buildLeafletMarker(lat, log, 'red', myLocationOnMap_text)
			marker.addTo(GHApp.LeafletMap);
			marker.openPopup();
			GHApp.LeafletMap.panTo(new L.LatLng(lat, log));
			GHApp.LeafletMap.setZoom( 15,{animate:true} );
			//TODO GHApp.updateBrowseGeolocations()
		}
		// console.log(myposition);
		if(myposition && myposition.latitude && myposition.longitude){
			myLocationOnMap_text = 'Twoja pozycja z pamieci przegladarki';
			inner({coords:myposition});
		}else {
			GHApp.findGeolocation(inner);
		}
	},
	moveSingletonMarker: function(latitude, longitude){
		GHApp.SingletonMarker.setLatLng(L.latLng(latitude, longitude));
	},
	setSingletonMarker: function(latitude, longitude, draggable){
		if ( typeof GHApp.LeafletMap === 'undefined' ){
			GHApp.buildMap();
			console.log('building map');
		}
		if( typeof GHApp.SingletonMarker === 'undefined'){
			console.log('building marker');
			GHApp.LeafletMap.panTo(new L.LatLng(latitude, longitude));

			var color = (draggable || false)? 'green':'blue';
			var icon = GHApp.buildLeafletMarkerIcon(color);
			GHApp.SingletonMarker = L.marker([latitude, longitude],{ draggable: (draggable || false), icon: icon });
			GHApp.SingletonMarker.addTo(GHApp.LeafletMap);
			// if(options && options.title){
			// 	GHApp.SingletonMarker.bindPopup(options.title).openPopup();
			// }
			if(draggable || false){
				GHApp.SingletonMarker.on('dragend', function(event){
					var position = event.target.getLatLng();
					GHApp.updateFormLatitudeLongitude(position.lat, position.lng);
				});
			}
		}else{
			console.log('building marker else');
			GHApp.moveSingletonMarker(latitude, longitude);
		}
	},
	setSingletonMarkerPopup: function(body){
		try {
			GHApp.SingletonMarker.bindPopup(body).openPopup();
		}
		catch(err) {
			console.error(err);
		}
	},
	setSingletonMarkerZoom: function(zoom_level){
		try {
			GHApp.LeafletMap.setZoom( (zoom_level || 17),{animate:true} );
		}
		catch(err) {
			console.error(err);
		}
	},
	bodyOnLoad: function(){
		GHApp.updateSelectLanguage();
		GHApp.checkCookiesPopup();
	},
	checkCookiesPopup: function(){
		if( localStorage.getItem('cookies') !== "true" ){
			dpd.users.me(function(result){
					if(!result){//jezeli users.me istnieje to nie ma sensu pokazywac komunikatu cookie
						swal({
							title: "Akceptujesz ciasteczka?",
							text: ('<a href="/info/regulations">Korzystając ze strony wyrażasz zgodę na używanie plików "cookie". Możesz dowiedzieć się więcej klikając w Regulamin</a></p>'),
							showCancelButton: true,
							html: true,
							confirmButtonText: "Akceptuje",
							cancelButtonText: "Nie akceptuje i wychodzę.",
							closeOnConfirm: true,
							closeOnCancel: true
						},function(isConfirm){
							if (isConfirm) {
								localStorage.setItem('cookies', true);
							}else{
								location='about:blank';
							}
						});
					}else{
						localStorage.setItem('cookies', true);
					}
			});
		}
	},
	updateSelectLanguage: function(){
		GHApp.updateSelectLanguageFor(document.getElementById('headerLangSelect'));
	},
	updateSelectLanguageFor: function(selectObj){
		var lang_sel = selectObj.options;
		for( var i = 0; i< lang_sel.length; i++){
			if( lang_sel[i].value === GHAppLang ){
				lang_sel.selectedIndex = i;
			}
		}
	},
	getLangFromSelect: function(selectObj){
		var lang_sel = selectObj.options;
		return lang_sel[lang_sel.selectedIndex].value;
	},
	changeLanguage: function(){
		var lang_sel = document.getElementById('headerLangSelect');
		var lang = GHApp.getLangFromSelect(lang_sel);
		lang_sel = lang_sel.options;
		document.cookie="lang=" + lang;
		swal("Zmieniono język",'Nowy język to: '+lang_sel[lang_sel.selectedIndex].text+'\nProszę odświerz stronę aby dokończyć zmiane języka.','success');
	},
	addAttractionBodyOnLoad: function(){
		GHApp.attractionDetailsEditForm = document.getElementById('attractionDetailsEditForm');
		GHApp.attractionDetailsEditForm.onsubmit = GHApp.attractionDetailsEditFormPost;

		GHApp.buildMap();

		GHApp.currentAttractionId = null;
		GHApp.currentAttraction = null;

		GHApp.detailsEditorLoadData();

		GHApp.mode = 'add_attraction';
		GHApp.updateSelectLanguageFor(document.getElementById('detailsEditorLangSelect'));

		GHApp.QuillEditor = new Quill('#editor-container', {
			modules: {
				'toolbar': { container: '#formatting-container' },
				'link-tooltip': true,
				'image-tooltip': true
			}
		});
		GHApp.loadAttractionMarkers(function(layer){
			var overlay_layers = {};
			overlay_layers["GeoHermes.com - Miejsca historii"] = layer;
			GHApp.loadWawAPIMarkers(function(layer2){
				overlay_layers["um.Warszawa.pl - Charakterystyczne miejsca 1939"] = layer2;
				L.control.layers(null, overlay_layers,{collapsed:false}).addTo(GHApp.LeafletMap);
			});
		});
	},
	mediasInAttractionDetailsEditorFormPost: function(){
		var form = GHApp.mediasInAttractionDetailsEditorForm;
		dpd.medias.post({ url: form.url.value, description: form.description.value, recordId: GHApp.currentAttractionId }, function(result, error){
			if(result){
				swal('Sukcess','','success');
			}else if (error){
				GHApp.alertErrors(error);
			}
		});
		return false;
	},
	detailsEditorLoadData: function(language){
		var lang = language || GHAppLang;
		var form = GHApp.attractionDetailsEditForm;
		var place = GHApp.currentAttraction;
		if(place){
			form.name.value = place.name[lang] || "";
			form.city.value = place.city;
			form.country.value = place.country;
			form.street.value = place.street;
			form.latitude.value = place.latitude;
			form.longitude.value = place.longitude;
			GHApp.QuillEditor.setHTML(place.description[lang] || "");
			var images = document.getElementById('imagesInAttractionDetailsEditorTBody');
			console.log(place.imagesOnGet, place.imagesOnGet.length)
			if(place.imagesOnGet && place.imagesOnGet.length){
				images.innerHTML = "";
				for(var i=0; i<place.imagesOnGet.length; i++){
					images.innerHTML += '<tr><td><a href="'+GHApp.getImageUrl(place.imagesOnGet[i])+'"><img class="s128-img" src="'+GHApp.getImageUrl(place.imagesOnGet[i])+'"/></a></td><td>BRAK UPRAWNIEŃ</td></tr>';
				}
			}else{
				images.innerHTML = '<tr><td colspan="2" class="centered"><b>BRAK</b></td></tr>';
			}
			var medias = document.getElementById('mediasInAttractionDetailsEditorTBody');
			if(place.mediasOnGet && place.mediasOnGet.length){
				medias.innerHTML = "";
				for(var j=0; j<place.mediasOnGet.length; j++){
					medias.innerHTML += '<tr><td><a href="'+place.mediasOnGet[j].url+'">'+place.mediasOnGet[j].url+'</a></td><td>'+place.mediasOnGet[j].description+'</td><td>BRAK UPRAWNIEŃ</td></tr>';
				}
			}else{
				images.innerHTML = '<tr><td colspan="3" class="centered"><b>BRAK</b></td></tr>';
			}
			if(place.latitude && place.longitude){
				GHApp.setSingletonMarker(place.latitude, place.longitude, true);
			}
		}else{
			form.country.value = 'Polska';
			form.city.value = 'Warszawa';
		}
	},
	getImageUrl:function(image){
		if(true || image.type==='attraction'){
			return "/attraction_images/" + image.subdir + "/" + image.filename;
		}else{
			return "/img/static-user.png";
		}
	},
	detailsEditorLangChanged: function(){
		var select = document.getElementById('detailsEditorLangSelect');
		var lang = GHApp.getLangFromSelect(select);
		GHApp.detailsEditorLoadData(lang);
		console.log('detailsEditorLangChanged', lang);
	},
	mergeObjectsProperties: function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
	},
	attractionDetailsEditFormPost: function(){
		var form = GHApp.attractionDetailsEditForm;
		var place = GHApp.currentAttraction || {name: {}, description: {}};
		var is_new = !GHApp.currentAttraction;
		var description = (GHApp.QuillEditor.getHTML() === "<div><br></div>")? '' : GHApp.QuillEditor.getHTML();
		var lang = GHApp.getLangFromSelect(document.getElementById('detailsEditorLangSelect'));
		var changes = {};
		if( form.name.value !== '' && form.name.value !== place.name[lang]){
			//changes.name = place.name;
			changes.name = {}
			changes.name[lang] = form.name.value;
		}
		if( description !== '' && description !== place.description[lang]){
			//changes.description = place.description;
			changes.description = {}
			changes.description[lang] = description;
		}
		if( form.street.value !== '' && form.street.value !== place.street){
			changes.street = form.street.value;
		}
		if( form.city.value !== '' && form.city.value !== place.city){
			changes.city = form.city.value;
		}
		if( form.country.value !== '' && form.country.value !== place.country){
			changes.country = form.country.value;
		}
		if(is_new){
			changes.latitude = form.latitude.value;
			changes.longitude = form.longitude.value;
			changes.viewscount = 0;
			if(!changes.description){
				swal('Błąd','Wypełnij opis atrakcji','error');
				return false;
			}
		}else{
			if(form.latitude.value !== '' && form.latitude.value !== place.latitude.toString() ){
				changes.latitude = form.latitude.value;
			}
			if(form.longitude.value !== '' && form.longitude.value !== place.longitude.toString() ){
				changes.longitude = form.longitude.value;
			}
		}
		if(Object.keys(changes).length === 0){
			swal('Nic nie zmieniles','','info');
		}else{
			var save_method = (is_new)? dpd.attractions.post : dpd.attractions.put;
			var already_opened = false;
			var changes_list = Object.keys(changes)
			if ( ! is_new){
				changes.id = GHApp.currentAttractionId;
				if(changes.name){
					changes.name = GHApp.mergeObjectsProperties(place.name, changes.name);
				}
				if(changes.description){
					changes.description = GHApp.mergeObjectsProperties(place.description, changes.description);
				}
			}
			swal({
				title: "Czy potwierdzasz zapis?",
				text: "Zmieniles nastepujace pola: " + changes_list.join(', '),
				type: "warning",
				showCancelButton: true,
				confirmButtonText: "Tak",
				cancelButtonText: "Nie",
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm){
				console.log(isConfirm, already_opened)
				if (isConfirm && !already_opened) {
					already_opened = true;
					save_method(changes, function(result,error){
						if(result){
							console.log("save result:", result)
							swal({
								title: "Zapisano miejsce",
								text: '<a href="/attraction/details/'+ result.id +'">'+GHApp.getAttractionLocaleName(result, GHAppLang)+'<br>Miejsce id:' + result.id + '<br>Przejdź do jego strony klikąc tutaj</a>',
								html: true,
								type: 'success'
							});
						}else{
							GHApp.alertErrors(error);
						}
					});
				}
			});
		}
		console.log("changes:", changes, Object.keys(changes));
		return false;
	},
	reloadAttractionById: function(id, callback){
		dpd.attractions.get({id:id, include:'relationships'}, function(result,error){
			if(result){
				GHApp.currentAttraction = result;
			}
			if( typeof callback === 'function'){
				callback(result,error);
			}
		});
	},
	detailsEditorBodyOnLoad: function(attraction_id){
		GHApp.buildMap();
		GHApp.currentAttractionId = attraction_id;
		GHApp.reloadAttractionById(attraction_id, function(){
			console.log('GHApp.detailsEditorLoadData()')
			GHApp.detailsEditorLoadData();
		});
		GHApp.mode = 'details_editor';
		GHApp.updateSelectLanguageFor(document.getElementById('detailsEditorLangSelect'));

		GHApp.attractionDetailsEditForm = document.getElementById('attractionDetailsEditForm');
		GHApp.attractionDetailsEditForm.onsubmit = GHApp.attractionDetailsEditFormPost;

		GHApp.mediasInAttractionDetailsEditorForm = document.getElementById('mediasInAttractionDetailsEditorForm');
		GHApp.mediasInAttractionDetailsEditorForm.onsubmit = GHApp.mediasInAttractionDetailsEditorFormPost;

		GHApp.QuillEditor = new Quill('#editor-container', {
			modules: {
				'toolbar': { container: '#formatting-container' },
				'link-tooltip': true,
				'image-tooltip': true
			}
		});
	},
	detailsBodyOnLoad: function(attraction_id){
		GHApp.buildMap();
		GHApp.currentAttractionId = attraction_id;

		GHApp.mode = 'details';


		GHApp.setSingletonMarkerZoom(16);
		GHApp.setSingletonMarker(52.244725, 21.009475, false);
		GHApp.setSingletonMarkerPopup("Pałac jabłonowskich");

	},
	attractionCommentsPost: function(){
		var body = GHApp.attractionCommentsForm;
		dpd.users.me(function(me){
			dpd.comments.post({ body: body.body.value, creatorId: me.id, language: body.language.value, recordId: GHApp.currentAttractionId }, function(result, error){
				if(result){
					//swal('Sukcess','Odswierz strone aby zobaczyc rezultat','success');
					location.reload();
				}else if (error){
					GHApp.alertErrors(error);
				}
			});
		});
		return false;
	},
	alertErrors: function(errors){
		console.log(errors);
		sweetAlert('Błąd', JSON.stringify(errors),'error');
	},
	indexBodyOnLoad: function(){

		// GHApp.buildMap();
		GHApp.mode = 'index';
		// GHApp.loadAttractionMarkers();
	},
	browseBodyOnLoad: function(){
		GHApp.buildMap();
		GHApp.mode = 'browse';

		//
		GHApp.loadAttractionMarkers(function(layer){
			var overlay_layers = {};
			overlay_layers["GeoHermes.com - Miejsca historii"] = layer;
			GHApp.loadWawAPIMarkers(function(layer2){
				overlay_layers["um.Warszawa.pl - Charakterystyczne miejsca 1939"] = layer2;
				L.control.layers(null, overlay_layers,{collapsed:false}).addTo(GHApp.LeafletMap);
			});
		});

	},
	getAttractionLocaleName: function(attr, language){
		var lang = language || 'en';
		if( attr.name[lang] ){
			return attr.name[lang];
		}else{
			return attr.name[ Object.keys(attr.name)[0] ];
		}
	},
	loadAttractionMarkers: function(callback){
		var ajax_request = 'https://waw.geohermes.com/attractions';
		GHApp.urlGetJson(ajax_request, function(result){
			if(result && result.length){
				var markers = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false });

				for(var i=0; i< result.length; i++){
					// var r_marker = L.marker([result[i].latitude, result[i].longitude]);
					var r_marker = GHApp.buildLeafletMarker(result[i].latitude, result[i].longitude, 'orange');
					r_marker.bindPopup('Miejsca historii - ' + GHApp.getAttractionLocaleName(result[i],GHAppLang) + ' - GeoHermes.com');
					markers.addLayer( r_marker );
				}
				GHApp.LeafletMap.addLayer(markers);
				callback(markers);
			}
		});
	},
	buildLeafletMarkerIcon: function(color){
		var icon = L.icon({
			iconUrl: '/img/marker-icon-'+color+'.png',
			shadowUrl: '/img/marker-shadow.png',
			iconSize:     [25, 41], // size of the icon
			shadowSize:   [41, 41], // size of the shadow
			iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
			shadowAnchor: [12, 40],  // the same for the shadow
			popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
		});
		// console.log(icon);
		return icon;
	},
	buildLeafletMarker: function(lati, long, icon_color, popup_text, should_open_popup){
		var icon = GHApp.buildLeafletMarkerIcon(icon_color || 'red');
		var m = L.marker([lati, long], {icon: icon});
		if(popup_text){
			var p = m.bindPopup(popup_text);
			if(should_open_popup){
				p.openPopup();
			}
		}
		return m;
	},
	loadWawAPIMarkers: function(callback){
		// TODO zrobić to lepiej
		var ajax_request = 'https://waw.geohermes.com/places_1939.json';
		GHApp.urlGetJson(ajax_request, function(result){
			if(result && result.length){
				var markers = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false });

				for(var i=0; i< result.length; i++){
					// var r_marker = L.marker([result[i].position[0], result[i].position[1]]);
					var r_marker = GHApp.buildLeafletMarker(result[i].position[0], result[i].position[1], 'purple');
					r_marker.bindPopup('<a href="http://mapa.um.warszawa.pl/">Charakterystyczne miejsce w roku 1939 - '+result[i].name+' - dane z mapa.um.warszawa.pl</a>');
					markers.addLayer( r_marker );
				}
				GHApp.LeafletMap.addLayer(markers);
				callback(markers);
			}else{
				console.log(result);
			}
		});
	},
	findStreet: function(){
		var form = document.getElementById('attractionDetailsEditForm');
		var address = [form.street.value, form.city.value, form.country.value].join(', ');
		var ajax_request = 'https://nominatim.openstreetmap.org/search?format=json';
		ajax_request += '&q=' + address;
		ajax_request += '&limit=' + 1;

		GHApp.urlGetJson(ajax_request, GHApp.updateMapPosition);
	},
	updateMapPosition: function(positions){
		var pos = positions[0];
		console.log(pos);
		if(!pos){
			swal('Błąd przy wyszukiwaniu', 'Nie odnaleziono adresu' + positions, 'error');
		}else{
			GHApp.LeafletMap.panTo(new L.LatLng(pos.lat, pos.lon));
			GHApp.LeafletMap.setZoom( 17,{animate:true} );
			GHApp.setSingletonMarker(pos.lat, pos.lon, true);
			GHApp.updateFormLatitudeLongitude(pos.lat, pos.lon);
			GHApp.SingletonMarker.bindPopup('Możesz mnie przesuwać').openPopup()

		}
	},
	updateFormLocation: function(position){
		var lat = position.coords.latitude;
		var log = position.coords.longitude;

		GHApp.updateMapPosition([{lat: lat, lon: log}]);

		GHApp.updateFormLatitudeLongitude(lat, log);
		GHApp.attractionDetailsEditForm.street.value = "SZUKAM...";
		GHApp.reverseGeocode(lat, log, GHApp.updateFormAddress);
	},
	findGeolocation: function(callback){
		if (navigator.geolocation) {
			var foundLocationMethod = GHApp.updateFormLocation;
			if(typeof callback === 'function'){
				foundLocationMethod = callback
			}

			navigator.geolocation.getCurrentPosition(function(position){
				localStorage.setItem('myposition', JSON.stringify({latitude: position.coords.latitude, longitude: position.coords.longitude}));
				foundLocationMethod(position);
			}, GHApp.showGeoError);
		} else {
			sweetAlert(
				'Geolokacja nie jest wspierana przez twoją przeglądarkę.',
				'Niestety nie możesz korzystać z geolokacji opartej najnowszych technologiach przeglądarek internetowych. Jedyna alternatywa to podaj adres atrakcji ręcznie',
				'error'
			);
		}
	},
	updateFormLatitudeLongitude: function(latitude, longitude){
		GHApp.attractionDetailsEditForm.latitude.value = latitude;
		GHApp.attractionDetailsEditForm.longitude.value = longitude;
	},
	updateFormAddress: function(request_result){
		var form = GHApp.attractionDetailsEditForm;

		form.city.value = request_result.address.city;
		form.country.value = request_result.address.country;
		form.street.value = ( request_result.address.road || ' ' )+' '+( request_result.address.house_number || ' ' );

	},
	showGeoError: function(error) {
		resetFormStyle();

		switch(error.code) {
			case error.PERMISSION_DENIED:
			swal('Geolocation Error','User denied the request for Geolocation.','error');
			break;

			case error.POSITION_UNAVAILABLE:
			swal('Geolocation Error','Location information is unavailable.','error');
			break;

			case error.TIMEOUT:
			swal('Geolocation Error','The request to get user location timed out.','error');
			break;

			case error.UNKNOWN_ERROR:
			swal('Geolocation Error','An unknown error occurred.','error');
			break;
		}
	},
	urlGetJson: function(url, callback){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				callback(JSON.parse(xmlhttp.responseText));
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	},
	reverseGeocode: function(latitude, longitude, callback){
		var ajax_request = 'https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1';
		ajax_request += '&email=' + GHApp.usingOpenStreetMapEmail;
		ajax_request += '&lat='+latitude;
		ajax_request += '&lon='+longitude;

		GHApp.urlGetJson(ajax_request, callback);
	},

	usingOpenStreetMapEmail: ('usingopenstreetmap@geohermes.com'),

};//End of GHApp
