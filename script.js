$(document).ready(function()
{
	//Emote object
	var emotes = {};

	//Check if emotes are already stored locally
	if (localStorage.getItem("emotes") === null)
	{
		//Load emotes from external json file.
		var loadEmotes = $.getJSON("https://twitchemotes.com/api_cache/v2/subscriber.json", function(data)
		{
			$.each(data['channels'], function(channel, properties)
			{
				$.each(properties['emotes'], function(list, emote)
				{
					emotes[emote['code']] = emote['image_id'];
				});
			});
		}).done(function()
		{
			localStorage.setItem("emotes", JSON.stringify(emotes));
		});
	}
	else
	{
		//Load emotes from local storage
		emotes = JSON.parse(localStorage.getItem("emotes"));
	}


	/**
	 * Check for new chat messages
	 */
	$('.chat-lines').on('DOMNodeInserted', function(e)
	{
		if ($(e.target).is('.chat-line'))
		{
			var message = $(this).find('.message').last();
			convert(message, emotes);
		}
	});


	/**
	 * Convert message and replace words with emotes!
	 * 
	 * @param  {element} ele  Message element
	 * @param  {object} list List of emotes
	 */

	function convert(ele, list){
		var msg = ele.html();
		var split = msg.split(" ");
		var regex;

		for (var i = 0; i <= split.length; i++) {
			if(list[split[i]] !== undefined && split[i].length >= 3)
			{
				regex = new RegExp('\\b'+split[i]+'\\b(?=[^"]*(?:"[^"]*"[^"]*)*$)', 'g');
				msg = msg.replace(regex, generateEmoteImage(split[i], list[split[i]]));
			}
		}

		ele.html(msg);
	}

	/**
	 * Generate emote image HTML tag.
	 * 
	 * @param  {int} id Emote ID
	 * @return {string}    HTML img tag
	 */
	function generateEmoteImage(emote, id)
	{
		return '<img class="emoticon ttv-emo-'+id+'" src="http://static-cdn.jtvnw.net/emoticons/v1/'+id+'/1.0" srcset="http://static-cdn.jtvnw.net/emoticons/v1/'+id+'/2.0 2x" data-id="'+id+'" data-regex="'+emote+'" original-title="">';
	}

});