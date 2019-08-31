import '/jquery/dist/jquery.js';
import '/bootstrap/dist/js/bootstrap.min.js';

function onNavItemClicked(event, item, html) {
    event.preventDefault();

    item.parent().addClass('active');
    item.parent().siblings().removeClass('active');

    $('#content').load(html);
}

$(document).ready(function () {
    $('#item-quaternions').click((event) => { onNavItemClicked(event, $(this), 'subj-quaternions.html'); })
});
