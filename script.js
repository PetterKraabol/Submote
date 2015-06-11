//Developed by Zarlach
$(document).ready(function()
{	
	//Global vars
	var emotes = {};


	//Check if emotes are already stored locally
	if (localStorage.getItem("emotes") === null)
	{
		//Load emotes from external json file.
		var loadEmotes = $.getJSON("https://twitchemotes.com/api_cache/v2/subscriber.json", function(data)
		{
			$.each(data['channels'], function(channel, properties)
			{
				$.each(properties['emotes'], function(list, emote){
					emotes[emote['code']] = emote['image_id'];
				});
			});
		})
		.done(function()
		{
			//Store emotes locally
			localStorage.setItem("emotes", JSON.stringify(emotes));
		})
		.fail(function()
		{
			//Failed to load from web, let the user know!
			$('body').append('<ul id="noty_bottomCenter_layout_container" class="i-am-new" style="bottom: 20px; position: fixed; width: 320px; height: auto; margin: 0px; padding: 0px; list-style-type: none; z-index: 10000; left: 800px;"><li class="noty_bar alert" style="width: 320px;"><div class="noty_bar noty_type_alert" id="noty_152298130185963840"><div class="noty_message"><div class="text-container"><div class="glitch"></div><div class="noty_text"><p>Could not load subscriber emotes :/<br><a href="javascript:history.go(0);">Please refresh</a></p></div></div><div class="noty_close"></div></div></div></li></ul>');
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

			var line 	= $(this).find('.chat-line').last();
			var message = line.find('.message');
			var badges	= line.find('.badges');
			var from	= line.data('sender');

			if(from !== 'jtv')
				convert(message, emotes);

			//Append turbo
			if(from === 'zarlach')
			{
				$(badges).append('<div class="zar badge" original-title="Developer"></div>');

				var badge = $(badges).find('.zar');
				badge.css({
					'background': 'url("http://static-cdn.jtvnw.net/emoticons/v1/28073/1.0")',
					'background-size': '18px 18px'
				});
			}
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
		var word;

		for (var i = 0; i <= split.length; i++) {
			word = split[i];

			if(list[word] !== undefined
			   && word[0] === word[0].toLowerCase()
			   && word !== 'double')
			{
				regex = new RegExp('\\b'+word+'\\b(?=[^"]*(?:"[^"]*"[^"]*)*$)', 'g');
				msg = msg.replace(regex, generateEmoteImage(word, list[word]));
			}
		}

		//Update message
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