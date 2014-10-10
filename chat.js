(function() {

  // Containers
  var $usersContainer = $('#users-container');
  var $messagesContainer = $('#messages-container');
  var $messageInput = $('#message-input');

  // Templates
  var messageTpl = $('#message-template').text();
  var linkTpl = $('#link-template').text();

  Snap.ready(onReady);

  // Bootstrap application
  function onReady(err, services) {
    Snap.on('message', onMessage);
    $messageInput.on('keyup', onMessageInputKeyUp.bind(services));
  }

  // React to incoming messages
  function onMessage(message) {
    var payload = message.getPayload();
    if(payload && payload.type === 'chat-message') {
      addMessage(message.get('sender'), payload.text);
    }
  }

  // React to entered key in message input
  function onMessageInputKeyUp(evt) {
    if(evt.keyCode === 13 && !evt.shiftKey) {
      var message = {
        type: 'chat-message',
        text: $messageInput.val()
      };
      this.messages.broadcast(message);
      addMessage('Vous', message.text);
      $messageInput.val('');
    }
  }

  // Add a message to messages container
  function addMessage(senderId, text) {
    var now = new Date();
    var time = pad2(now.getHours()) +
      ':' + pad2(now.getMinutes()) +
      ':' + pad2(now.getSeconds())
    ;
    var entry = renderTemplate(messageTpl, {
      text: transformUrlsToLinks(escapeHtml(text)),
      time: time,
      sender: senderId,
      senderColor: 'blue'
    });
    $messagesContainer.append(entry);
    autoScrollMessages();
  }

  // Scroll messages container to bottom
  function autoScrollMessages() {
    $messagesContainer.animate({
      scrollTop: $messagesContainer.prop("scrollHeight") - $messagesContainer.height()
    }, 250);
  }

  // Helpers

  // Render template string with provided data
  function renderTemplate(tpl, data) {
    var data = data || {};
    return Object.keys(data)
      .reduce(function(tpl, key) {
        var value = data[key];
        var regexp = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
        return tpl.replace(regexp, value);
      }, tpl);
  }

  // Pad string with 0
  function pad2(number) {
    if (number<=9) { number = ("0"+number).slice(-2); }
    return number;
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    '\n': '<br/>'
  };

  // Escape HTML string
  function escapeHtml(htmlStr) {
    return String(htmlStr).replace(/[&<>"'\/\n]/gm, function (s) {
      return entityMap[s];
    });
  }

  // Transform URLs in string to valid html links
  var urlRegex = /(http(s)?:(&#x2F;)(&#x2F;).)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  function transformUrlsToLinks(str) {
    str = str || '';
    var urls = str.match(urlRegex);
    if(!urls) return str;
    return urls.reduce(function(str, url) {
      var link = renderTemplate(linkTpl, {url: url});
      return str.replace(url, link);
    }, str);
  }

}());
