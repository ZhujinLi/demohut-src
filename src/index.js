import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function setupContentBindings() {
    function onNavItemClicked(event, item, html) {
        event.preventDefault();

        item.parent().addClass('active');
        item.parent().siblings().removeClass('active');

        $(content).load(html);
    }

    $(document).ready(function () {
        console.log('ready');
        $('#item-quaternions').click((event) => { onNavItemClicked(event, $(this), 'subj-quaternions.html'); })
    });
}

export { setupContentBindings };