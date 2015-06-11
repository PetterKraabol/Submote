//Developed by Zarlach
$(document).ready(function()
{
	var emotes = {};


	//Check if emotes are already stored locally
	if (localStorage.getItem("emotes") === null)
	{
		console.log('not local');
		//Load emotes from external json file.
		var loadEmotes = $.getJSON("https://twitchemotes.com/api_cache/v2/subscriber.json", function(data)
		{
			$.each(data['channels'], function(channel, properties)
			{
				$.each(properties['emotes'], function(list, emote){
					emotes[emote['image_id']] = emote['code'];
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
			
		});
	}
	else
	{
		console.log('local');
		emotes = JSON.parse(localStorage.getItem("emotes"));

		generate(emotes);
	}
	console.log(emotes[6586]);
	function generate(list){
		var random;
		var count = Object.keys(list);


		for(var i = 0; i <= 2650; i++){
			var number = Math.floor((Math.random() * 10000) + 1);
			$('body').append(generateEmoteImage(number));
		}

	}

	function generateEmoteImage(id)
	{
		return '<img class="emote" src="http://static-cdn.jtvnw.net/emoticons/v1/'+id+'/2.0" width="25" height="25">';
	}
});