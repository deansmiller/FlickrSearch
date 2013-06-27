var FlickrSearch = (function($){

	function FlickrSearch(apiKey){
		if(apiKey){
			this.config = {
				api_key: apiKey,
				format: "json"
			};
			this.currentPage = 1;
			this.minPage = 1; // least amount of page links
			this.maxPages = 10; // max amount of page links 
			this.firstPage = 1;
			this.lastPage = this.maxPages;

		} else throw new Error("No API key provided");
	}

	FlickrSearch.prototype = {

		setPhotoContainer: function(containerId){
			this.photoContainer = $("#" + containerId);
		},

		setPaginationContainer: function(containerId){
			this.paginationContainer = $("#" + containerId);
			this.attachPaginationEventListeners(); //use LIVE
		},

		search: function(query, perPage, pageNo){
			this.config["per_page"] = this.perPage = perPage || 8;
			this.config["page"] = this.pageNo = pageNo || 1;
			this.config["text"] = this.currentQuery = query;
			this.currentPage = pageNo || 1;
			$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&jsoncallback=?", this.config, this.handleResults.bind(this));
		},

		handleResults: function(results){
			if(results.stat === "ok"){
				var photos = results.photos;
				if(photos.photo.length > 0){
					this.createImageElements(photos.photo);
					this.createPagination();
					this.totalPages = photos.pages;
					console.log(photos);
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
		},

		createPagination: function(){
			if(this.paginationContainer){
				var container = this.paginationContainer,
					firstPage = this.firstPage,
					lastPage = this.lastPage;

				// create ul element for pagaintion if it does not exist
				if(container.children("ul.pagination").length == 0){
					$("<ul/>", {
						class: "pagination"
					}).appendTo(container);
				} else {
					// remove pagination as it will be re-calculated and rendered
					$("ul.pagination").children().remove();
				}

				// add previous link
				this.createPageElement({
					html: "<p>Prev</p>",
					class: "links",
					move: "prev"
				});				

				// page links
				for(var i = firstPage, max = lastPage; i <= max; i++){
					this.createPageElement({
						html: "<p>" + i + "</p>",
						class: "page-element",
						page: i
					});
				}

				this.highlightPage(this.currentPage);

				// add next link	
				this.createPageElement({
					html: "<p>Next</p>",
					class: "links",
					move: "next"
				});
				
			} else throw new Error("No pagination container set.");
		},

		createPageElement: function(config){
			$("<li/>", config).appendTo($("ul.pagination"));				
		},

		attachPaginationEventListeners: function(){
			var self = this;

			$(document).on("click", "ul.pagination li.page-element", function(e){
				self.displayPages($(this));
			});

			$(document).on("click", "ul.pagination li.links", function(e){
				self.moveToPage($(this).attr("move"));
			});
		},

		highlightPage: function(page){
			$(".pagination .page-element[page='" + page + "']").addClass("active");
		},

		//next or previous page links clicked
		moveToPage: function(move){
			var nextPage = 0,
				currentPage = this.currentPage;

			if(move === "next" && currentPage < this.totalPages){ 
				nextPage = currentPage + 1; 
				if(nextPage == this.lastPage){
					this.displayPages($("ul.pagination li.page-element[page='" + nextPage + "']"));
				}
			} else if(move === "prev" && currentPage > this.minPage) { 
				nextPage = currentPage - 1; 
				if(nextPage == this.firstPage){
					this.displayPages($("ul.pagination li.page-element[page='" + nextPage + "']"));
				}
			}

			this.search(this.currentQuery, this.perPage, nextPage);
		},

		// calculates which pages to display
		displayPages: function(pageElement){
			this.currentPage = parseInt(pageElement.attr("page"));
			var currentPage = this.currentPage,
				firstPage = this.firstPage,
				lastPage = this.lastPage,
				maxPages = this.maxPages;

			if(currentPage === lastPage){
				this.firstPage = (lastPage - Math.floor(maxPages / 2)) + 1;
				this.lastPage = lastPage + Math.floor(maxPages / 2);	
			} else if(currentPage === firstPage  && currentPage !== this.minPage){
				this.lastPage = firstPage + Math.floor(maxPages / 2) - 1;
				this.firstPage = firstPage - Math.floor(maxPages / 2);	
			}

			this.search(this.currentQuery, this.perPage, currentPage);
		}


	};


	return FlickrSearch;

})(jQuery);

