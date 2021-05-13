function stringCheck(string) {
    return typeof string === 'string' && string.trim().length !== 0;
}

(function ($) {
    let postForm = $('#postForm');
    let postTitle = $('#postTitle');
    let postContent = $('#postContent');
    let postTags = $('#postTags');
    let error = $('#error');

    postForm.submit(function (event) {
        event.preventDefault();
        error.hide();
        var post_title = postTitle.val();
        var post_content = postContent.val();
        var post_tags = postTags.val();
        if (
            stringCheck(postTitle) &&
            stringCheck(post_content) &&
            stringCheck(postTags)
        ) {
            var requestConfig = {
                method: 'POST',
                url: 'http://localhost:3000/posts/',
                data: {
                    title: post_title,
                    postContent: post_content,
                    tags: post_tags
                }
            };
            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage);
            });
        } else {
            error.show();
        }
    });
})(window.jQuery);
