var getRepo = function(element, user, repo) {
    var commits_url = 'https://api.github.com/repos/' + user + '/' + repo + '/commits?callback=?'
    $.getJSON(commits_url, function(data) {
        var tree_url = data.data[0]['commit']['tree']['url'] + '?callback=?'
        getTree(element,tree_url)
    })
}

var getTree = function(element, url) {
    $.getJSON(url, function(data) {
        $child_element = $('<ul></ul>').appendTo($(element))
        $.each(data.data.tree, function(key, value) {
            if (value.type == 'blob'){
              var class_name='file';
            } else {
              var class_name='folder'
            }
            $('<li><span class="'+class_name+'">'+value.path+'</span></li>').bind('click', function(event) {
                if ($(this).data('populated')){
                    $(this).children('ul').toggle()
                } else {
                    if (value.type == 'blob') {
                        getFile($(this), value.url);
                    } else {
                        var tree_url = value.url+'?callback=?'
                        getTree($(this),tree_url)
                    }
                    $(this).data('populated',true);
                    }
                return false;
            }).appendTo($child_element);
        })
    })
}


var getFile = function(element, url) {
    var file_url = url + '?callback=?'
    console.log(file_url)
    $.getJSON(file_url, function(data) {
        var base64_content = data.data.content
        var content = $.base64.decode(data.data.content)
        $('#githubnav .ghn-content').html('<pre><code>'+content+'</code></pre>')
    })
    $('pre code').each(function(i,e){ hljs.highlightBlock(e,'    ')});
}

var getRepos = function(user) {
    $.getJSON('https://api.github.com/users/'+user+'/repos?callback=?',function(data) {
        $.each(data.data, function(key, value) {
            if (!value.fork) {
                var url = value.url
                $('<li><span class="folder">'+value.name+'</span></li>').bind('click', function(event) {
                    if ($(this).data('populated')){
                        $(this).children('ul').toggle()
                    } else {
                        getRepo(this, user, value.name);
                        $(this).data('populated',true);
                        return false;
                    }
                }).prependTo('#githubnav .ghn-nav')
            }
        });
        $('#githubnav .ghn-nav').prepend(data);
        $('#githubnav').treeview({
            animated: "fast",
            collapsed: true,
            unique: true,
            toggle: function() {
                window.console && console.log("%o was toggled", this);
            }
        })
    });
}

$(document).ready(function(){
    $('<ul class="ghn-nav"></ul>').appendTo('#githubnav').treeview({
        animated: "fast",
        collapsed: true,
        unique: true,
        toggle: function() {
            window.console && console.log("%o was toggled", this);
        }
    })
    $('<div class="ghn-content"></div>').appendTo('#githubnav')
});
