// Submote by Zarlach

console.log('Submote is running');

// Global vars
var subMotes    = {};           // subMotes[emote] = source
var subEmotes   = {};           // subEmotes[emote] = id
var bttvEmotes  = {};           // bttvEmotes[emote] = source

// Add developer badge to dev channels
if(window.location.href.indexOf("zarlach") > -1) {
    $('.info .title').css({
        'text-shadow': '#6441A5 0px 0px 7px',
        'color': '#6441A5',
    });
}

// Check if emotes are already stored locally
if (localStorage.getItem("subEmotes") === null || localStorage.getItem("bttvEmotes") === null){
    reloadAllEmotes();
}else{
    reloadAllEmotes();
    //subEmotes           = JSON.parse(localStorage.getItem("subEmotes"));
    //var genDate         = Date.parse(subEmotes.generated_at);
    //var currentDate     = new Date();
    //var expirationDate  = new Date(genDate.getTime() + 3600*1000/2);  // 30 minutes

    //// Check if expired
    //if(currentDate.getTime() >= expirationDate.getTime())
    //    reloadAllEmotes();
}

/**
 * Reloads the emote lists.
 */
function reloadAllEmotes(){
    // Remove any remaining emotes
    localStorage.setItem('subEmotes', null);
    localStorage.setItem('bttvEmotes', null);

    //Load all emotes
    loadSubEmotes();
    loadBetterTTVemotes();
    loadCustomEmotes();
}


/**
 * Observe for new messages
 */
$(document).ready(function(evt){

    // An attempt to find a new and better way to detect new messages
    var target = document;

    // Observer intsance
    var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation){
            if(mutation.addedNodes){

                // Check for queued messages
                if(mutation.addedNodes.length > 1){
                    for(var i = 0; i < mutation.addedNodes.length; i++){

                        // Make it readable to newMessage()
                        var message = [mutation.addedNodes[i]];

                        newMessage(message);
                    }
                }else{
                    newMessage(mutation.addedNodes);
                }
            }
        });
    });

    // Mutation config
    var config = {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
     };

    // Start the observer
    //while(!target || target === null)
    //    target = document.querySelector('.chat-lines');

    observer.observe(target, config);
});

/**
 * Handle new messages
 */
function newMessage(message){
    var line = false;
    var bttv = true;        // Assume true

    // Check if using vanilla or FrankerFaceZ
    if($(message[1]).find('.chat-line').length){
        line    = $(message[1]).find('li.chat-line');
        bttv    = false;
    }

    // Check if using BetterTTV
    if(bttv && !line && $(message[0]).length){
        line    = $(message[0]);
    }

    // No message line detection? Abort
    if(!line) return false;

    // Fetch message metadata
    // var room    = line.attr('data-room');
    var sender  = line.attr('data-sender');
    var sender  = line.find('.from').html();
    var badges  = line.find('.badges');
    var text    = line.find('.message');

    // No message text? Abort
    if(!text.length) return false;

    // If room and sender is undefined, the user is using vanilla Twitch
    if(sender === undefined && line.find('.from').length){
        sender = line.find('.from').html().toLowerCase();
    }

    // Parse message text
    parseMessage(text, subEmotes);
    parseMessage(text, bttvEmotes);

    // Developers
    if(sender.toLowerCase() === 'zarlach' && !badges.find('.submote-dev').length){
        // Glow
        line.find('.from').css('text-shadow', '0 0 20px rgb(82, 142, 205)');

        // Badge
        $(badges).append('<div class="badge float-left tooltip submote-dev" original-title="Submote Dev"></div>');
        $(badges).find('.submote-dev').css({
            'width': '18px',
            'height': '18px',
            'background-image': 'url(https://cdn.rawgit.com/Zarlach/Submote/master/images/dev-badge.png)',
            'background-repat': 'no-repeat',
            'background-size': '18px 18px'
        });
    }

    return true;
}

/**
 * Load subscriber emotes from web
 */
function loadSubEmotes()
{
    $.getJSON('https://twitchemotes.com/api_cache/v2/subscriber.json', function(data)
    {
        $.each(data.channels, function(channel, properties)
        {
            $.each(properties.emotes, function(list, emote){
                subEmotes[emote.code] = emote.image_id;
            });
        });

        $.each(data.meta, function(key, val){
            subEmotes[key] = val;
        });
    })
    .done(function()
    {
        subEmotes.provider = 'twitch';
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
            bttvEmotes[value.regex.replace('\\', '')] = value.url.replace('//', 'https://');
        });
    })
    .done(function(){
        bttvEmotes.provider = 'betterttv';
        bttvEmotes.generated_at = new Date();

        localStorage.setItem("bttvEmotes", JSON.stringify(bttvEmotes));
    })
    .fail(function(){
        console.log('Submote could not load BetterTTV emotes');
    });
}

/**
 * Load Custom Emotes
 */
function loadCustomEmotes()
{
    // To-do: generalize bttvEmotes into customEmotes

    bttvEmotes.aaaDuhface    = 'https://static-cdn.jtvnw.net/emoticons/v1/6988/1.0';

    bttvEmotes.PepePls       = 'https://cdn.betterttv.net/emote/55898e122612142e6aaa935b/1x';
    bttvEmotes.DogePls       = 'https://cdn.betterttv.net/emote/55c7eb723d8fd22f20ac9cc1/1x';
    bttvEmotes.sodaGpls      = 'https://cdn.betterttv.net/emote/55c7d01ae9d8d91f2087ee34/1x';
    bttvEmotes.SnoopPls      = 'https://cdn.betterttv.net/emote/55a05e85cc07004a41f8b1d7/1x';
    bttvEmotes.Ditto         = 'https://cdn.betterttv.net/emote/554da1a289d53f2d12781907/1x';
    bttvEmotes.FeelsOhWait   = 'https://cdn.betterttv.net/emote/55ab96ce9406e5482db53424/1x';
    bttvEmotes.ShakeItOff    = 'https://cdn.betterttv.net/emote/55a9875be80089ed0bf297a0/1x';

    // FrankerFaceZ
    bttvEmotes.CatBag        = 'https://cdn.frankerfacez.com/emoticon/25927/1';
    bttvEmotes.CoolCatBag    = 'https://cdn.frankerfacez.com/emoticon/41091/1';
    bttvEmotes.LilZ          = 'https://cdn.frankerfacez.com/emoticon/28136/1';
    bttvEmotes.ZreknarF      = 'https://cdn.frankerfacez.com/emoticon/1/1';
    bttvEmotes.BeanieHipster = 'https://cdn.frankerfacez.com/emoticon/3/1';
    bttvEmotes.ManChicken    = 'https://cdn.frankerfacez.com/emoticon/4/1';
    bttvEmotes.YellowFever   = 'https://cdn.frankerfacez.com/emoticon/5/1';
    bttvEmotes.YooHoo        = 'https://cdn.frankerfacez.com/emoticon/6/1';

    // Twitch Turbo
    bttvEmotes.duDudu        = 'https://static-cdn.jtvnw.net/emoticons/v1/23139/1.0';
    bttvEmotes.KappaHD       = 'https://static-cdn.jtvnw.net/emoticons/v1/3286/1.0';
    bttvEmotes.MiniK         = 'https://static-cdn.jtvnw.net/emoticons/v1/3287/1.0';
    bttvEmotes.riPepperonis  = 'https://static-cdn.jtvnw.net/emoticons/v1/23141/1.0';

    localStorage.setItem("bttvEmotes", JSON.stringify(bttvEmotes));
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
    var provider    = list.provider;
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
        case 'betterttv':
            return '<img class="emoticon tooltip" src="'+source+'" data-regex="'+emote+'" original-title="'+emote+'">';
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