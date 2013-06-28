var Paginator = (function($){

	function Paginator(container, perPage){
		this.currentPage = 1;
		this.minPage = 1; // least amount of page links
		this.maxPages = 10; // max amount of page links 
		this.firstPage = 1;
		this.lastPage = this.maxPages;
		this.callback = null; //called after each page click
		this.perPage = perPage || 4;
		this.paginationContainer = $("#" + container);
		this.attachPaginationEventListeners();
	}

	Paginator.prototype = {

		setTotalPages: function(totalPages){
			this.totalPages = totalPages;
		},

		setPerPage: function(perPage){
			this.perPage = perPage;
		},

		//create pagination elements, create next/previous page links and numbered links in between
		createPagination: function(){
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
				id: "prevPageLink",
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

			this.highlightPageLink(this.currentPage);

			// add next link	
			this.createPageElement({
				html: "<p>Next</p>",
				class: "links",
				id: "nextPageLink",
				move: "next"
			});
				
		},

		// called on page element click
		onPageClick: function(callback){
			this.callback = callback;
		},

		createPageElement: function(config){
			$("<li/>", config).appendTo($("ul.pagination"));				
		},

		attachPaginationEventListeners: function(){
			var self = this;

			$(document).on("click", "ul.pagination li.page-element", function(e){
				var paginationConfig = self.displayPages($(this));
				self.callback(paginationConfig);
			});

			$(document).on("click", "ul.pagination li.links", function(e){
				var paginationConfig = self.moveToPage($(this).attr("move"));
				self.callback(paginationConfig);
			});
		},

		// highlight active page
		highlightPageLink: function(page){
			$(".pagination .page-element[page='" + page + "']").addClass("active");
			if(page == this.minPage){
				$(".pagination li#prevPageLink").attr("disabled", true);
			} else $(".pagination li#prevPageLink").attr("disabled", false);
				if(page == this.totalPages){
				$(".pagination li#nextPageLink").attr("disabled", true);
			} else $(".pagination li#nextPageLink").attr("disabled", false);
		},

		//next or previous page links clicked, move to the next or previous page
		moveToPage: function(move){
			var nextPage = 0,
				currentPage = this.currentPage;

			if(move === "next" && currentPage < this.totalPages){ //stay in bounds
				nextPage = currentPage + 1; 
				if(nextPage == this.lastPage){
					this.displayPages($("ul.pagination li.page-element[page='" + nextPage + "']"));
				}

				if(nextPage != this.totalPages){
					this.currentPage = nextPage;
				}

			} else if(move === "prev" && currentPage > this.minPage) { 
				nextPage = currentPage - 1;
				if(nextPage == this.firstPage){
					this.displayPages($("ul.pagination li.page-element[page='" + nextPage + "']"));
				}

				if(nextPage != this.minPage){
					this.currentPage = nextPage;
				}
			}
			
			return {
				perPage: this.perPage,
				pageNo: nextPage
			}
		},

		// calculates which pages to display, when first or last page link clicked
		// works out where the middle is and what the first and last page links should be
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

			return {
				perPage: this.perPage,
				pageNo: currentPage
			}
		}

	};

	return Paginator;

})(jQuery);