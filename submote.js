// Submote by Zarlach

// Global vars
var subMotes    = {};           // subMotes[emote] = source
var subEmotes   = {};           // subEmotes[emote] = id
var bttvEmotes  = {};           // bttvEmotes[emote] = source


// Check if emotes are already stored locally
if (localStorage.getItem("subEmotes") === null)
    loadSubEmotes();
else
{
    subEmotes           = JSON.parse(localStorage.getItem("subEmotes"));
    var genDate         = Date.parse(subEmotes['generated_at']);
    var currentDate     = new Date();
    var expirationDate  = genDate+3600*1000/2;  //30 minutes

    //Check if expired
    if(currentDate.getTime() >= expirationDate)
        loadSubEmotes();
}

if (localStorage.getItem("bttvEmotes") === null)
    loadBetterTTVemotes();
else{
    bttvEmotes = JSON.parse(localStorage.getItem("bttvEmotes"));

    // Custom BetterTTV Emotes
    bttvEmotes['PepePls'] = 'https://cdn.betterttv.net/emote/55898e122612142e6aaa935b/1x';
    bttvEmotes['(ditto)'] = 'https://cdn.betterttv.net/emote/554da1a289d53f2d12781907/1x';
}


/**
 * Check for new chat messages
 */
$(document).read(function(){
    $('.chat-lines').on('DOMNodeInserted', function(e)
    {
        var element = e.target;
        var line    = $(element).last();

        // Extensions
        var ffz  = false;
        var bttv = false;

        // Usually, chat messages are called 'chat-line' (class)
        if($('li.chat-line').length){
            line = $('.chat-line').last();
            console.log(line.attr('data-sender'));
        }

        //Check if it's a message
        if (line.last().length
            && line.find('.message').last().html() !== undefined
            && line.not('.admin'))
        {
            var message = line.find('.message').last();
            var badges  = line.find('.badges');
            var from    = line.find('.from').html().toLowerCase();
            

            //Parse message
            if(from !== 'jtv') {
                parseMessage(message, subEmotes);
                parseMessage(message, bttvEmotes);
            }

            //Append turbo
            if(from === 'zarlach' && badges.last().find('.submote-dev').length === 0) {
                $(badges).last().append('<div class="badge float-left tooltip submote-dev" original-title="Submote Dev"></div>');
                $(badges).last().find('.submote-dev').css({
                    'width': '18px',
                    'height': '18px',
                    'background-image': 'url(https://cdn.rawgit.com/Zarlach/Submote/master/images/dev-badge.png)',
                    'background-repat': 'no-repeat',
                    'background-size': '18px 18px'
                });
            }
        }
    });
})

/**
 * Load subscriber emotes from web
 */
function loadSubEmotes()
{
    $.getJSON('https:twitchemotes.com/api_cache/v2/subscriber.json', function(data)
    {
        $.each(data['channels'], function(channel, properties)
        {
            $.each(properties['emotes'], function(list, emote){
                subEmotes[emote['code']] = emote['image_id'];
            });
        });

        $.each(data['meta'], function(key, val){
            subEmotes[key] = val;
        });
    })
    .done(function()
    {
        subEmotes['provider'] = 'twitch';
        localStorage.setItem("subEmotes", JSON.stringify(subEmotes));
    })
    .fail(function()
    {
        //sendError('Submote could not load sub emotes');
        console.log('Could not load sub emotes');
    });
}


/**
 * Load BetterTTV emotes from web
 */
function loadBetterTTVemotes()
{
    $.getJSON('https://cdn.betterttv.net/emotes/emotes.json', function(data){
        $.each(data, function(key, value){
            bttvEmotes[value['regex'].replace('\\', '')] = value['url'].replace('//', 'https://');
        });
    })
    .done(function(){
        bttvEmotes['provider'] = 'betterttv';
        localStorage.setItem("bttvEmotes", JSON.stringify(bttvEmotes));
    })
    .fail(function(){
        console.log('Submote could not load BetterTTV emotes');
    });
}


/**
 * Scan message and replace words with emotes!
 * 
 * @param  {element} ele        Message element
 * @param  {object} list        List of emotes
 * @param  {string} provider    Emote provider
 */
function parseMessage(ele, list)
{
    var msg         = ele.html();
    var split       = msg.replace(/(<([^>]+)>)/ig,'').trim().split(' ');
        split       = $.grep(split,function(n){ return(n) });
    var words       = [];
    var provider    = list['provider'];
    var regex;
    var word;

    //Remove duplicates
    $.each(split, function(i, el){
        if($.inArray(el, words) === -1) words.push(el);
    });

    //
    for (var i = 0; i <= words.length; i++) {
        word = words[i];

        if(validateFilter(word, list, provider))
        {
            regex = new RegExp('\\b'+word+'\\b(?=[^"]*(?:"[^"]*"[^"]*)*$)', 'g');
            msg = msg.replace(regex, generateEmoteImage(word, list[word], provider));
        }
    }

    ele.html(msg.trim());
}


/**
 * Generate emote image HTML tag.
 * 
 * @param  {int} id Emote ID
 * @return {string}    HTML img tag
 */
function generateEmoteImage(emote, source, provider)
{
    switch(provider){
        case 'twitch':
            return '<img class="emoticon ttv-emo-'+source+'" src="http://static-cdn.jtvnw.net/emoticons/v1/'+source+'/1.0" srcset="http://static-cdn.jtvnw.net/emoticons/v1/'+source+'/2.0 2x" data-id="'+source+'" data-regex="'+emote+'" alt="'+emote+'" original-title>';
            break;
        case 'betterttv':
            return '<img class="emoticon tooltip" src="'+source+'" data-regex="'+emote+'" original-title="'+emote+'">';
            break;
    }
}


/**
 * Run selected word through a filter
 * 
 * @param  {string}     word     Selected word
 * @param  {object}     list     Emote list
 * @param  {string}     provider Emote provider
 * @return {boolean}    Returns whether or not the word passed the filter
 */
function validateFilter(word, list, provider)
{
    var regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z]).+$');

    //General filter
    if(list[word] === undefined
        || !regex.test(word)
        || word === 'provider'
        || word === 'generated_at'
        || word.length === 0)
        return false;

    //Provider specific filter
    switch(provider){
        case 'twitch':
            if (word[0] !== word[0].toLowerCase()
                || word === 'double'
                || word === 'triple'
                || word === 'quadra'
                || word === 'penta'
                || word === 'kill'
                || word === 'snap')
                return false;

            break;
        case 'betterttv':

            break;
    }

    return true;
}

/**
 * In case something fails, let the user know!
 * 
 * @param  {string} message Error description
 */
function sendError(message)
{
    $('body').append('<ul id="noty_bottomCenter_layout_container" class="i-am-new" style="bottom: 20px; position: fixed; width: 320px; height: auto; margin: 0px; padding: 0px; list-style-type: none; z-index: 10000; left: 800px;"><li class="noty_bar alert" style="width: 320px;"><div class="noty_bar noty_type_alert" id="noty_152298130185963840"><div class="noty_message"><div class="text-container"><div class="glitch"></div><div class="noty_text"><p>'+message+'<br><a href="javascript:history.go(0);">Please refresh</a></p></div></div><div class="noty_close"></div></div></div></li></ul>');
}