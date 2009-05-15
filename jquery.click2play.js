// Vimeo library object
var Vimeo = {
	GetId : function(id) {
		return (/vimeo/.test(id)) ? (/clip_id/.test(id) ? id.replace(/^(.*)(clip_id\=)(\d+)(.*)$/, '$3') : id.replace(/^(.*)\/(\d*)$/, '$2')) : id;
	},
	GetThumbnail : function(id, callback) {
		id = this.GetId(id);
		var js = document.createElement('script');
		var url = 'http://vimeo.com/api/clip/'+id+'.json?callback='+ (callback && callback != '' ? callback : 'Vimeo.ShowThumbnail');
		js.setAttribute('type', 'text/javascript');
		js.setAttribute('src', url);
		document.getElementsByTagName('head').item(0).appendChild(js);
	},
	ShowThumbnail : function(json) {
		var src = (this.Use == 'small' ? json[0].thumbnail_small : json[0].thumbnail_large.replace(/\_160/, '_640'));
		$('img.vimeo_'+ json[0].clip_id).attr('src', src).parent().parent().removeClass("hidden");
	}
};

// YouTube library object
var YouTube = {
  GetId : function(id) {
    return id.replace(/^(.*)(youtube\.com\/)(v\/|watch\?v\=)([a-z0-9\-\_]{5,12})(.*)$/i, '$4');
  },
  GetThumbnail : function(id) {
    return 'http://i4.ytimg.com/vi/'+ (/youtube/.test(id) ? this.GetId(id) : id) +'/'+ (this.Use == 'small' ? '1' : '0') +'.jpg';
  }
};


// jQuery click2play function
// Options include skipFirst (leaves first video as embed, and facebox (use jQuery.facebox to open video)
$.fn.click2play = function(skipFirst, facebox) {
	var ids = new Array();
	return this.each(function(i) {
		var e = $(this).find('embed').each(function() {
			var j = ids.length, embed, element, url, width, height, klass = '', klass2 = '';
			if (YouTube && this.src.match(/youtube.com/)) {
				ids[j] = YouTube.GetId(this.src);
				klass = 'youtube_'+ids[j];
				var img = YouTube.GetThumbnail(ids[j]);
				embed = $(this).parent().parent().html().replace(/\n/ig, '').replace(/^(.*)(\<object)(.*)(\<\/object\>)(.*)$/ig, '$2$3$4').replace(new RegExp(ids[j], 'g'), ids[j]+'&amp;autoplay=1');
				url = 'http://www.youtube.com/watch?v='+ ids[j]; width = 320; height = 240;
				element = 'click2play_'+ ids[j] +'_'+ i;

      // Matching for Vimeo (
			} else if (Vimeo && this.src.match(/vimeo.com/)) {
				ids[j] = Vimeo.GetId(this.src);
				klass = 'vimeo_'+ids[j]; klass2 = 'hidden'; img = 'images/blank.png';
				embed = $(this).parent().parent().html().replace(/\n/ig, '').replace(/^(.*)(\<object)(.*)(\<\/object\>)(.*)$/ig, '$2$3$4').replace(new RegExp(ids[j], 'g'), ids[j]+'&amp;autoplay=1');
				url = 'http://www.vimeo.com/'+ ids[j]; width = 320; height = 180;
				element = 'click2play_'+ ids[j] +'_'+ i;
				Vimeo.GetThumbnail(ids[j]);
			}

      // Create click2play element
			if (((skipFirst && ids.length > 1) || !skipFirst) && embed && element) {
				$(this).parent().before('<div class="click2play '+ klass2 +'" id="'+ element +'"><a href="'+ url +'"><img class="play" src="/images/blank.png" border="0" title="Click to play this video." /><img src="'+ img +'" width="'+ width +'" height="'+ height +'" border="0" title="Click to play this video." class="'+klass+'" /></a></div>');
        if (facebox) {
  				$('#'+ element +' a').click(function() {$.facebox(embed); return false;});
        } else {
  				$('#'+ element +' a').click(function() {$(this).parent().after(embed); $(this).remove(); return false;});
  			}
				$(this).parent().remove();
			}
		});
	});
};