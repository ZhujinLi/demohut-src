import './jquery.min.js';
import './bootstrap.min.js';

function onNavItemClicked(event, item, html) {
    event.preventDefault();

    item.parent().addClass('active');
    item.parent().siblings().removeClass('active');

    $(content).load(html);
}

$(document).ready(function () {
    $('#item-slerp').click((event) => { onNavItemClicked(event, $(this), 'demo_slerp.html'); })
});
