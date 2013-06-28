var FlickrSearch = (function($){

	function FlickrSearch(apiKey, perPage){
		if(apiKey){
			this.config = {
				api_key: apiKey,
				format: "json",
				per_page: perPage
			};
			this.perPage = perPage;
			this.currentQuery = ""; //keep track of query
		} else throw new Error("No API key provided");
	}

	FlickrSearch.prototype = {

		setPhotoContainer: function(containerId){
			this.photoContainer = $("#" + containerId);
		},

		setPaginator: function(paginator){
			this.paginator = paginator;
		},

		search: function(query){
			if($.type(query) === "object"){ //must be a pagination object
				this.config["per_page"] = query.perPage;
				this.config["page"] = query.pageNo;
				this.config["text"] = this.currentQuery
			} else this.config["text"] = this.currentQuery = query;

			$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&jsoncallback=?", this.config, this.handleResults.bind(this));
		},

		handleResults: function(results){
			if(results.stat === "ok"){
				var photos = results.photos;
				if(photos.photo.length > 0){ //if we have resuls
					this.createImageElements(photos.photo);
					if(this.paginator){ // if we have a paginator
						this.paginator.setTotalPages(photos.pages);
						this.paginator.createPagination(photos);
					}
				} else console.log("No results..");
			} else if(results.stat === "fail"){
				throw new Error(results.message);
			}
		},

		createImageElements: function(photos){
			var container = this.photoContainer;
			//remove old ones
			container.children(".photos").remove();
			$.each(photos, function(index, photo){
				$("<img/>", {
					src: "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg",
					title: photo.title,
					class: "photos"
				}).appendTo(container);
			});
		}
	};


	return FlickrSearch;

})(jQuery);

