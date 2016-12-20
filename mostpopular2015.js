$wn(document).ready(function(){
	if(!MPslideshowURL || MPslideshowURL === ""){
		MPslideshowURL = '/slideshow';
	}
	if(MostPopularNumberOfItems == "" || !MostPopularNumberOfItems){
		MostPopularNumberOfItems = 10;
	}
	MostPopularNumberOfItems = parseInt(MostPopularNumberOfItems);
	var mpStoriesURL = "http://api.worldnow.com/feed/v2.0/categories/"+ MostPopularStoriesCategoryNumber +"/stories?alt=xml";
	var mpVideosURL = "http://api.worldnow.com/feed/v2.0/categories/"+ MostPopularVideosCategoryNumber +"/clips?alt=xml";
	
	var itemsArray = new Array();
	var totalItems;
	
	function monthToDigit(m){
		var month = new Array();
		month["January"] = "01";
		month["February"] = "02";
		month["March"] = "03";
		month["April"] = "04";
		month["May"] = "05";
		month["June"] = "06";
		month["July"] = "07";
		month["August"] = "08";
		month["September"] = "09";
		month["October"] = "10";
		month["November"] = "11";
		month["December"] = "12";
		
		return month[m];
	}

	var $mpTab = $wn("#wnMostPopularTabbed");
	function WNGetMostPopular(numItems, rssUrl){
		function mpInitContent(){
			mpParseXML(this);
		}
			
		function mpErrorFunction(e){
			//alert(e.message);
		}
		
		function requestMP(url){
			WNHttpRequestManager.makeRequest(url, { onSuccess: mpInitContent, onError: mpErrorFunction});
		};
		
		requestMP(rssUrl);
	
		function itemSort(data_A,data_B){
			data_A = parseInt(data_A);
			data_B = parseInt(data_B);
			if ( data_A < data_B )
				return -1;
			if ( data_A > data_B )
				return 1;
			return 0;
		}
		
		function doSort(ds, fullFeed, type){
			totalItems = $wn(fullFeed).find(type + "[displaysize='"+ ds +"']").length;
			itemsArray = new Array();
			for(var ii = 0; ii < totalItems; ii++){
				itemsArray[ii] = new Array(parseInt($wn(fullFeed).find(type + "[displaysize='"+ ds +"']:eq("+ ii +")").attr("displayorder")), $wn(fullFeed).find(type + "[displaysize='"+ ds +"']:eq("+ ii +")"));
			}
			itemsArray.sort(itemSort);
		}

		function mpParseXML(xml){
			var fullFeed = xml.response.responseXML;
			var $container = $wn("#wnMostPopularTabbed .mpGroup");

			if(!$wn(fullFeed).find("story").length && !$wn(fullFeed).find("clip").length){
				$mpTab.find(".mpLoading").html("Please check again later.");
				return false;
			}
			var nDate = new Date();
			if(totalItems < MostPopularNumberOfItems){
				MostPopularNumberOfItems = totalItems;
			}
			if(rssUrl.indexOf("stories") != -1){
				var sds = "-10";
				if($wn(fullFeed).find("story[displaysize='"+ sds +"']").length == 0){
					sds = "-7";
				}
				doSort(sds, fullFeed, "story");
			}
			else if(rssUrl.indexOf("clips") != -1) {
				if (FeaturedVideoFormat == false){
					var vds = "-1";
				} else {
					var vds = "20";
				}
				if($wn(fullFeed).find("clip[displaysize='"+ vds +"']").length == 0){
					vds = $wn(fullFeed).find("clip:first").attr("displaysize");
				}
				doSort(vds, fullFeed, "clip");
			}

			for(var ii = 0; ii < MostPopularNumberOfItems; ii++){

				if(rssUrl.indexOf("stories") != -1){
					//STORIES
					var relType = "s";
					if(typeof itemsArray[ii] === 'undefined'){
						break;
					}
					var $element = itemsArray[ii][1];
					var iTitle = $element.find("headline:first").text();
					var iSummary = $element.find("abstract:first").text() + " ";
					if($element.find("includedate").text() == "True"){
						var y = $element.find("creationdate").find("year").text();
						var m = monthToDigit($element.find("creationdate").find("month").text());
						var d = $element.find("creationdate").find("date").text();
						var pageURL = y + "/" + m + "/" + d + "/" + $element.find("pageurl:first").text();
					}
					else {
						var pageURL = $element.find("pageurl:first").text();
					}
					var iHREF = "/story/" + $element.find("id:first").text() + "/" + pageURL;
					var iImg = $element.find("abstractimage:first filename").text() || 'http://WBBH.images.worldnow.com/images/10871178_G.jpg';
					var vinc = ($element.find("surfaceable:last feature id").text() != "") ? "<span title='Video included' class='wn-icon wn-icon-video-included'></span>" : "";
					
					var iDate = new Date($element.find("month:last").text() + " " + $element.find("date:last").text() + ", " + $element.find("year:last").text() + " " +$element.find("time:last").text() + " " + $element.find("timezone:last").text());
					if($element.find("timezone:last").text() == "EDT"){
						iDate = iDate.setHours(iDate.getHours() + 1);
					}
				} else if(rssUrl.indexOf("clips") != -1){
					//CLIPS
					var relType = "v";
					if(typeof itemsArray[ii] === 'undefined'){
						break;
					}
					var $element = itemsArray[ii][1];
					var iTitle = $element.find("headline:first").text();
					var vTitle = $element.find("pageurl:first").text();
					/*while(vTitle.indexOf("'") != -1){
						vTitle = vTitle.replace("'", "");
					}*/
					var iSummary = $element.find("abstract:first").text() + " ";
					//if(VideoLandingPage == ""){
					//	var iHREF = encodeURI("javascr"+"ipt:playVideo("+ $element.find("id:first").text() +", '"+ vTitle +"', 'v', 'News', '418133', 'News', 'fvCatNo=&backgroundImageURL=', '"+ wng_pageInfo.baseUrl +"', 'flv');");
					//} else {
					if (VideoLandingPage){
						var iHREF = VideoLandingPage + '?clipId=' + $element.find("id:first").text() + '&autoStart=true';
					} else {
						var iHREF = '/clip/' + $element.find("id:first").text() + '/' + vTitle;
					}
					var iImg = $element.find("abstractimage:first filename").text() || 'http://WBBH.images.worldnow.com/images/10871178_G.jpg';
					var iDate = new Date($element.find("rfc822lastediteddate").text());
					var vinc = "<span title='Video included' class='wn-icon wn-icon-video-included'></span>";
					if($element.find("rfc822lastediteddate").text().indexOf("EDT") != -1){
						iDate = iDate.setHours(iDate.getHours() + 1);
					}
				}				
				try{
					iDate = wnRenderDate(iDate, '', true, true);
				}
				catch (e){
					iDate = getLEDate(iDate);
				}
				var nextItem = "<li class='feature mpItem mpItem-" + relType + "-" + (ii+1) + " mpItem-" + (ii+1) + " priority-" + (ii+1) + " displaySizeId-7 odd-7' rel='"+ relType +"'>";
				nextItem += "<div class='wnContent summaryImage abridged'><a href='"+ iHREF +"'><img border='0' data-path='" + iImg + "' src='" + iImg + "' class='' ></a></div>";
				nextItem += "<h4 class='wnContent headline abridged'><a href='"+ iHREF +"'><span class='text'>" + iTitle +"</span></a>"+ vinc +"</h4>";				
				nextItem += "</li>";

				$container.append(nextItem);
				
				if (relType == "v"){
					$wn(".mpItem[rel='v']:last a").attr("href", iHREF);
				}				
			}
		
			$wn(".mpItem[rel='v']:last, .mpItem[rel='v']:last").addClass("last");
			$mpTab.find(".mpLoading").closest('.feature').hide();
		}

	}
	
	function mpSwap(t){
		$mpTab.find(".wnTabOn").removeClass("wnTabOn");
		$mpTab.find(".wnTab[rel='"+ t +"']").addClass("wnTabOn");
		$mpTab.find(".mpGroup .mpItem").hide();
		$mpTab.find(".mpGroup .mpClear").hide();
		$mpTab.find(".mpLoading").show();
		if($mpTab.find(".mpGroup li[rel='"+ t +"']").length > 0){
			$mpTab.find(".mpGroup li[rel='"+ t +"']").show();
			$mpTab.find(".mpLoading").closest('.feature').hide();
		} else {
			if(t == "s"){
				WNGetMostPopular(MostPopularNumberOfItems, mpStoriesURL);
			} else if (t == "v") {
				WNGetMostPopular(MostPopularNumberOfItems, mpVideosURL);
			}
		}
		if(t === "s"){
			$wn("#wnMostPopularTabbed .cdev-more-link .more").attr('href', '/category/' + MostPopularStoriesCategoryNumber + '/most-popular-story');
		} else {
			$wn("#wnMostPopularTabbed .cdev-more-link .more").attr('href', '/category/' + MostPopularVideosCategoryNumber + '/most-popular-video');
		}
		
		$mpTab.find(".mpGroup").fadeIn();
	
	}
	
	$mpTab.find(".wnTabNoAction").click(function(e){
		window.location.href = MPslideshowURL;
	});
	
	for(var ii = 0; ii < $mpTab.find(".wnTab").length; ii++){
		$mpTab.find(".wnTab:eq("+ ii +")").click(function(){
			mpSwap($wn(this).attr("rel"));
		});
	}
	

	mpSwap("s");

});