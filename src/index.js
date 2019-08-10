import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function onNavItemClicked(event, item, html) {
    event.preventDefault();

    item.parent().addClass('active');
    item.parent().siblings().removeClass('active');

    $(content).load(html);
}

$(document).ready(function () {
    console.log('ready');

    $('#item-slerp').click((event) => { onNavItemClicked(event, $(this), 'demo_slerp.html'); })
    return;

    $('#content-slerp').load('demo_slerp.html');
    $('#content-slerp').hide();

    return;
    $('.nav ul li:first').addClass('active');
    $('.tab-content:not(:first)').hide();
    $('.nav ul li a').click(function (event) {
        event.preventDefault();
        var content = $(this).attr('href');
        $(this).parent().addClass('active');
        $(this).parent().siblings().removeClass('active');
        $(content).show();
        $(content).siblings('.tab-content').hide();
    });
});
