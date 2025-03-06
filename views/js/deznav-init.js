(function($) {
	function getUrlParams() {
		var params = {};
		var queryString = window.location.search.substring(1);
		if (queryString) {
			queryString.split("&").forEach(function(part) {
				var pair = part.split("=");
				params[decodeURIComponent(pair[0])] = pair[1] ? decodeURIComponent(pair[1]) : true;
			});
		}
		return params;
	}

	// Get the current route (pathname)
	var currentRoute = window.location.pathname;

	// Get all query parameters as an object
	var queryParams = getUrlParams();

	// Log them for debugging
	console.log("Current Route:", currentRoute);
	console.log("Query Parameters:", queryParams);

	var direction = queryParams['dir'] || 'ltr';

	var dezSettingsOptions = {
		typography: "poppins",
		version: "light",
		layout: "Vertical",
		headerBg: "color_1",
		navheaderBg: "color_1",
		sidebarBg: "color_1",
		sidebarStyle: "compact",
		sidebarPosition: "fixed",
		headerPosition: "fixed",
		containerLayout: "full",
		direction: direction,
		route: currentRoute,
		queryParams: queryParams  // Store query params if needed elsewhere
	};

	new dezSettings(dezSettingsOptions);

	jQuery(window).on('resize', function() {
		new dezSettings(dezSettingsOptions);
	});

})(jQuery);
