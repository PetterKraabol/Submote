$(document).ready(function()
{
	//Emote object
	var emotes = {};

	localStorage.removeItem("emotes");
	//Check if emotes are already stored locally
	//if (localStorage.getItem("emotes") === null)
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
			console.log('Successfuly loaded all emotes!');
			//localStorage.setItem("emotes", JSON.stringify(emotes));

			//var ele = $('.chat-line').find('.message');
			//convert(ele, emotes);
		});
	}
	else
	{
		//Load emotes from local storage
		emotes = JSON.parse(localStorage.getItem("emotes"));
		//var ele = $('.chat-line').find('.message');
		//convert(ele, emotes);
	}


	/**
	 * Check for new chat messages
	 */
	$('.chat-lines').on('DOMNodeInserted', function(e)
	{
		if ($(e.target).is('.chat-line'))
		{
			var ele = $(this).find('.message').last();
			convert(ele, emotes);
		}
	});


	/**
	 * Use regex to find text emotes in a message element.
	 * Text emotes will be replaced with actual emotes.
	 * 
	 * @param  {element} ele Message element
	 */
	function convert(ele, list){
		var msg = ele.html();
		var regex;
		var emote;

		//Search for emotes
		for (var emote in list)
		{
			id = list[emote];
			regex = new RegExp('\\b'+emote+'\\b(?=[^"]*(?:"[^"]*"[^"]*)*$)', 'g');
			msg = msg.replace(regex, generateEmoteImage(emote, id));
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